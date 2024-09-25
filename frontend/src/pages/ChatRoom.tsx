import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsFillPersonFill } from "react-icons/bs";
import { ImBlocked } from "react-icons/im";
import { IoIosAttach, IoMdArrowRoundBack } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { SlOptions } from "react-icons/sl";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    MessageType,
    type ChatBasicDataType,
} from "../../../backend/src/types/types";
import * as apiClient from "../apiClient";
import ChatMessageDateBubble from "../components/ChatMessageDateBubble";
import ImageComponent from "../components/Image";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import MessageBubble from "../components/MessageBubble";
import MessageBubbleLoading from "../components/skeletonLoadings/MessageBubbleLoading";
import RoomChatDataLoading from "../components/skeletonLoadings/RoomChatDataLoading";
import { useAppContext } from "../contexts/AppContext";
import { useChatsContext } from "../contexts/ChatsContext";
import { useMessageContext } from "../contexts/MessageContext";
import { useSocketContext } from "../contexts/SocketContext";
import { compressImages } from "../lib/compressImages";

const CHAT_LIMIT = 12;
const MAX_ATTACHMENT_LIMIT = 5;

const ChatRoom = () => {
    const { chatId } = useParams();
    const { showToast } = useAppContext();
    const socket = useSocketContext();
    const navigation = useNavigate();

    const { state: messageMap, dispatch: messageDispatch } =
        useMessageContext();
    const { state: chatState, dispatch: chatsDispatch } = useChatsContext();

    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [fetchMessages, setFetchMessages] = useState<boolean>(false);
    const [messages, setMessages] = useState<MessageType[] | undefined>(
        messageMap.get(chatId as string)
    );
    const [hasMoreChats, setHasMoreChats] = useState<boolean>(true);

    const messageContentInputRef = useRef<HTMLInputElement | null>(null);
    const imageFilesInputRef = useRef<HTMLInputElement | null>(null);

    // reset
    useEffect(() => {
        if (!chatId) {
            return;
        }
        const messagesFromMap = messageMap.get(chatId as string);
        if (messagesFromMap) {
            setFetchMessages(false);
        } else {
            setFetchMessages(true);
        }
        setHasMoreChats(true);
    }, [chatId]);

    useEffect(() => {
        setMessages(messageMap.get(chatId as string));
    }, [messageMap.get(chatId as string), messageMap, messageMap.values()]);

    // joining chat room socket events
    useEffect(() => {
        if (chatId === undefined) return;

        socket.emit("join-chat-room", { chatId });
        return () => {
            socket.emit("leave-chat-room", { chatId });
        };
    }, [chatId]);

    // getting chat data
    const [chatData, setChatData] = useState<ChatBasicDataType>();

    useEffect(() => {
        let flag = false;

        chatState.forEach((data) => {
            if (data._id.toString() === chatId) {
                setChatData(data);
                flag = true;
                return;
            }
        });

        if (!flag) {
            navigation("/chats");
        }
    }, [chatId]);

    // prev messages
    // #region
    const { refetch: fetchPrevMessages, isFetching: loadingMessages } =
        useQuery(
            "fetchingPrevMessages",
            () => {
                const messages = messageMap.get(chatId as string);
                return apiClient.fetchPrevMessages(
                    chatId as string,
                    messages ? messages.length : 0,
                    CHAT_LIMIT
                );
            },
            {
                enabled: false,
                refetchOnWindowFocus: false,
            }
        );

    const chatObserver = useRef<IntersectionObserver | null>();

    const oldestMessageRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingMessages) return;

            if (chatObserver.current) chatObserver.current.disconnect();

            chatObserver.current = new IntersectionObserver((entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMoreChats &&
                    !fetchMessages
                ) {
                    setFetchMessages(true);
                }
            });

            if (element) chatObserver.current?.observe(element);
        },
        [loadingMessages, hasMoreChats, fetchMessages]
    );

    useEffect(() => {
        if (!fetchMessages) return;

        fetchPrevMessages().then((result) => {
            if (result.data && result.data?.length > 0) {
                messageDispatch({
                    type: "ADD_MESSAGES",
                    payload: {
                        chatId: chatId as string,
                        messages: result.data,
                    },
                });

                if (result.data.length < CHAT_LIMIT) setHasMoreChats(false);
            } else setHasMoreChats(false);
        });
        setFetchMessages(false);
    }, [fetchMessages]);
    // #endregion

    // image preview
    // #region
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
    useEffect(() => {
        if (!imageFiles) {
            return;
        }

        if (imageFiles.length > MAX_ATTACHMENT_LIMIT) {
            const imageFilesInputElemnt = imageFilesInputRef.current;
            if (imageFilesInputElemnt) imageFilesInputElemnt.value = "";
            showToast({
                type: "ERROR",
                message: `Max of ${MAX_ATTACHMENT_LIMIT} files are allowed!`,
            });
            return;
        }

        if (imageFiles.length > 0) {
            setImageDataUrls([]);
            for (let index = 0; index < imageFiles.length; index++) {
                const reader = new FileReader();
                reader.readAsDataURL(imageFiles[index]);
                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        setImageDataUrls((prev) => [
                            ...prev,
                            reader.result as string,
                        ]);
                    }
                };
            }
        }
    }, [imageFiles]);

    const handleResetAttachments = () => {
        const imageFilesInputElemnt = imageFilesInputRef.current;
        if (imageFilesInputElemnt) imageFilesInputElemnt.value = "";
        setImageFiles(null);
        setImageDataUrls([]);
    };
    // #endregion

    // sending message
    const [sendingMessage, setSendingMessage] = useState<boolean>(false);
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const imageFilesInputElemnt = imageFilesInputRef.current;
        const messageContentInputElemnt = messageContentInputRef.current;
        if (!messageContentInputElemnt) return;

        const messageContent = messageContentInputElemnt.value.trim();
        if (messageContent.length === 0) return;

        setSendingMessage(true);

        let imageUrls: string[] | undefined;
        if (imageFiles && imageFiles) {
            if (imageFiles.length > MAX_ATTACHMENT_LIMIT) {
                showToast({
                    type: "ERROR",
                    message: `Max of ${MAX_ATTACHMENT_LIMIT} files are allowed!`,
                });
                if (imageFilesInputElemnt) imageFilesInputElemnt.value = "";
                setSendingMessage(false);
                return;
            }

            const form = new FormData();

            // image Compression
            const compressedImageFiles = await compressImages(imageFiles);

            // FileList not allows forEach,
            // so, making array out of FileList
            Array.from(compressedImageFiles).forEach((item) => {
                form.append(`imageFiles`, item);
            });

            try {
                const res = await apiClient.uploadAttachments(
                    chatId as string,
                    form
                );
                imageUrls = res.imageUrls;
            } catch (error: any) {
                showToast({
                    type: "ERROR",
                    message: error.message,
                });
                setSendingMessage(false);
                return;
            }
        }

        socket.emit("send-message", {
            content: messageContent,
            chatId: chatId,
            attachments: imageUrls,
        });

        messageContentInputElemnt.value = "";
        if (imageFiles) {
            setImageFiles(null);
            setImageDataUrls([]);
        }
        setSendingMessage(false);
    };

    // deleting chat
    const { isFetching: isDeletingChat, refetch: deleteChat } = useQuery(
        "deletingChat",
        () => {
            apiClient.deleteChat(chatId as string);
        },
        {
            enabled: false,
            refetchOnWindowFocus: false,
            onSuccess: () => {
                showToast({ type: "SUCCESS", message: "Chat Deleted!" });
                navigation("/chats");
                chatsDispatch({
                    type: "DELETE_CHAT",
                    payload: {
                        chatId: chatId as string,
                    },
                });
                messageDispatch({
                    type: "DELETE_CHAT_ID",
                    payload: { chatId: chatId as string },
                });
            },
            onError: (error: Error) => {
                showToast({ type: "ERROR", message: error.message });
            },
        }
    );

    const handleDeleteChatBtn = () => {
        deleteChat();
    };

    // block user
    const { isFetching: isBlockingChat, refetch: blockUser } = useQuery(
        "blockuser",
        () => {
            apiClient.blockUnblockUser(chatData?.userData.userId as string);
        },
        {
            enabled: false,
            refetchOnWindowFocus: false,
            onSuccess: () => {
                showToast({
                    type: "SUCCESS",
                    message: `${chatData?.userData.username} Blocked!`,
                });

                navigation("/chats");

                chatsDispatch({
                    type: "DELETE_CHAT",
                    payload: {
                        chatId: chatId as string,
                    },
                });

                messageDispatch({
                    type: "DELETE_CHAT_ID",
                    payload: { chatId: chatId as string },
                });
            },
            onError: (error: Error) => {
                showToast({ type: "ERROR", message: error.message });
            },
        }
    );

    const handleBlockUserBtn = () => {
        blockUser();
    };

    return (
        <div
            className={`grid ${
                imageDataUrls.length > 0
                    ? "grid-rows-[70px_calc(100vh-70px-126px-16px)_126px]"
                    : "grid-rows-[70px_calc(100vh-70px-60px-16px)_60px]"
            } gap-2 h-screen`}
        >
            {/* header */}
            <div className="relative flex justify-start items-center gap-3 pb-2 border-b border-whiteAlpha2">
                <Link to={"/chats"}>
                    <IoMdArrowRoundBack className="size-7" />
                </Link>
                {chatData !== undefined ? (
                    <>
                        <Link to={`/profile/${chatData.userData.userId}`}>
                            <ImageComponent
                                src={chatData.userData.profilePictureUrl}
                                className="size-[50px] object-cover rounded-full"
                                alt={chatData.userData.username}
                            />
                        </Link>

                        <div className="w-[calc(100%-50px-28px-24px)] flex justify-between items-center">
                            <Link
                                to={`/profile/${chatData.userData.userId}`}
                                className="flex flex-col justify-center"
                            >
                                <h1 className="text-xl">
                                    {chatData.userData.name}
                                </h1>
                                <h3 className="text-white3">
                                    {chatData.userData.username}
                                </h3>
                            </Link>
                            <button
                                className="focus:outline-none p-2 m-2"
                                onClick={() => setShowOptions((prev) => !prev)}
                            >
                                {" "}
                                {showOptions ? (
                                    <AiOutlineClose className="text-whiteAlpha1 size-4" />
                                ) : (
                                    <SlOptions className="text-whiteAlpha1 size-4" />
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <RoomChatDataLoading />
                )}

                {/* options */}
                <div
                    className={`absolute z-20 p-2 m-3 right-0 top-1/2 ${
                        showOptions
                            ? "scale-100 translate-x-0 translate-y-0"
                            : "scale-0 translate-x-[50%] translate-y-[-50%]"
                    } transition-transform ease-in-out duration-300 bg-black1 flex flex-col justify-center items-start gap-3 rounded-md border border-whiteAlpha2`}
                >
                    <Link
                        to={`/profile/${
                            chatData && "userData" in chatData
                                ? chatData.userData.userId
                                : ""
                        }`}
                        className="flex items-center gap-2.5"
                    >
                        <BsFillPersonFill className="size-6" />
                        <span>Profile</span>
                    </Link>
                    <button
                        className="flex items-center gap-2.5 text-red-500"
                        onClick={handleDeleteChatBtn}
                        disabled={isDeletingChat}
                    >
                        {isDeletingChat ? (
                            <LoadingCircleSvg />
                        ) : (
                            <MdDelete className="size-6" />
                        )}
                        <span>Delete Chat</span>
                    </button>
                    <button
                        className="flex items-center gap-2.5 text-red-500"
                        onClick={handleBlockUserBtn}
                        disabled={isBlockingChat}
                    >
                        <ImBlocked className="size-6" />
                        <span>Block User</span>
                    </button>
                </div>
            </div>

            {/* messages */}
            <div className="flex flex-col-reverse gap-2 overflow-y-auto px-2">
                {messages?.map((data, index) => {
                    if (messages && index === messages.length - 1) {
                        return (
                            <div ref={oldestMessageRef} key={index}>
                                <>
                                    {index > 0 && (
                                        <ChatMessageDateBubble
                                            dateA={messages[index].sentAt}
                                            dateB={messages[index - 1].sentAt}
                                            isLast={true}
                                        />
                                    )}
                                    <MessageBubble data={data} />
                                </>
                            </div>
                        );
                    }
                    return (
                        <div key={index}>
                            <>
                                <MessageBubble data={data} />
                                {index > 0 && (
                                    <ChatMessageDateBubble
                                        dateA={messages[index].sentAt}
                                        dateB={messages[index - 1].sentAt}
                                        isLast={false}
                                    />
                                )}
                            </>
                        </div>
                    );
                })}
                {loadingMessages && <MessageBubbleLoading />}
            </div>

            <div className="flex flex-col">
                {/* image preview */}
                {imageDataUrls.length > 0 && (
                    <div className="flex items-center gap-2 mx-4 p-2 bg-black1/45 rounded-lg border border-whiteAlpha2">
                        {imageDataUrls.map((data, index) => (
                            <div className="size-[60px]" key={index}>
                                <ImageComponent
                                    src={data}
                                    alt="attachments"
                                    className="size-[60px] object-cover rounded-md"
                                />
                            </div>
                        ))}

                        {imageFiles &&
                            imageDataUrls.length !== imageFiles.length && (
                                <span className="size-6">
                                    <LoadingCircleSvg />
                                </span>
                            )}
                        <button
                            className="focus:outline-none rounded-full bg-black1 p-1"
                            onClick={handleResetAttachments}
                        >
                            <AiOutlineClose className="text-whiteAlpha1 size-4" />
                        </button>
                    </div>
                )}

                {/* message form */}
                <form
                    className="flex items-center gap-2 px-3 py-1.5"
                    onSubmit={onSubmit}
                    autoFocus
                    autoComplete="off"
                    encType="multipart/form-data"
                >
                    {/* fields */}
                    <div className="flex items-center bg-black2/50 rounded-full border border-whiteAlpha2 px-3 py-2 w-full">
                        <input
                            className="bg-transparent w-full focus:outline-none placeholder:text-whiteAlpha1"
                            type="text"
                            required
                            placeholder="Message"
                            name="messageContent"
                            ref={messageContentInputRef}
                            autoFocus
                            autoComplete="off"
                        />
                        <label
                            className={`cursor-pointer`}
                            htmlFor="attachments"
                        >
                            <IoIosAttach className="size-6 text-blue-600 font-poppins-bold" />
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            id="attachments"
                            className="hidden"
                            ref={imageFilesInputRef}
                            onChange={(e) =>
                                setImageFiles(e.currentTarget.files)
                            }
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={sendingMessage}
                        className="focus:outline-none rounded-full bg-blue-500 p-2 disabled:bg-blue-900"
                    >
                        {sendingMessage ? (
                            <LoadingCircleSvg className="size-6" />
                        ) : (
                            <IoSend className="size-6" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;
