import { useCallback, useEffect, useRef, useState } from "react";
import { TbMessage2Plus } from "react-icons/tb";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../apiClient";
import { useChatsContext } from "../contexts/ChatsContext";
import { useGroupChatsContext } from "../contexts/GroupChatsContext";
import ChatCard from "./ChatCard";
import GroupChatCard from "./GroupChatCard";
import { AiOutlineClose } from "react-icons/ai";
import { ImBlocked } from "react-icons/im";
import ChatCardLoading from "./skeletonLoadings/ChatCardLoading";

const LIMIT = 7;

const SideBarChat = () => {
    const [window, setWindow] = useState<"CHATS" | "GROUPS">("CHATS");

    const [searchQuery, setSearchQuery] = useState<string>("");

    // chats
    // #region
    const [chatPage, setChatPage] = useState<number>(1);
    const { state: chatsState, dispatch: chatsDispatch } = useChatsContext();
    const [hasMoreChat, setHasMoreChats] = useState<boolean>(true);

    const [chats, setChats] = useState(chatsState);

    useEffect(() => {
        setChats(chatsState);
    }, [chatsState]);

    const { refetch: fetchChats, isFetching: loadingChats } = useQuery(
        "gettingChats",
        () => apiClient.fetchChats(chatPage, LIMIT),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            keepPreviousData: true,
        }
    );

    const chatsObserver = useRef<IntersectionObserver | null>();

    const lastChatCardRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingChats) return;

            if (chatsObserver.current) chatsObserver.current.disconnect();

            chatsObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreChat) {
                    setChatPage((prev) => prev + 1);
                }
            });

            if (element) chatsObserver.current?.observe(element);
        },
        [loadingChats]
    );

    useEffect(() => {
        if (chatPage > 0 && hasMoreChat) {
            fetchChats().then((result) => {
                if (result.data && result.data?.length > 0) {
                    chatsDispatch({
                        type: "SET",
                        payload:
                            chatPage === 1
                                ? [...result.data]
                                : [...chats, ...result.data],
                    });
                    if (result.data.length < LIMIT) setHasMoreChats(false);
                } else setHasMoreChats(false);
            });
        }
    }, [chatPage, hasMoreChat]);
    // #endregion

    // groups
    // #region
    const [groupChatPage, setGroupChatPage] = useState<number>(1);
    const { state: groupChatsState, dispatch: groupChatsDispatch } =
        useGroupChatsContext();
    const [hasMoreGroupChats, setHasMoreGroupChats] = useState<boolean>(true);

    const [groupChats, setGroupChats] = useState(groupChatsState);

    useEffect(() => {
        setGroupChats(groupChatsState);
    }, [groupChatsState]);

    const { refetch: fetchGroupChats, isFetching: loadingGroupChats } =
        useQuery(
            "gettingGroupChats",
            () => apiClient.fetchGroupChats(groupChatPage, LIMIT),
            {
                enabled: false,
                refetchOnWindowFocus: false,
                keepPreviousData: true,
            }
        );

    const observer = useRef<IntersectionObserver | null>();

    const lastGroupChatCardRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingGroupChats) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreGroupChats) {
                    setGroupChatPage((prev) => prev + 1);
                }
            });

            if (element) observer.current?.observe(element);
        },
        [loadingGroupChats]
    );

    useEffect(() => {
        if (groupChatPage > 0 && hasMoreGroupChats) {
            fetchGroupChats().then((result) => {
                if (result.data && result.data?.length > 0) {
                    groupChatsDispatch({
                        type: "SET",
                        payload:
                            groupChatPage === 1
                                ? [...result.data]
                                : [...groupChats, ...result.data],
                    });
                    if (result.data.length < LIMIT) setHasMoreGroupChats(false);
                } else setHasMoreGroupChats(false);
            });
        }
    }, [groupChatPage, hasMoreGroupChats]);
    // #endregion

    // search
    // #region
    const { refetch: searchChats, isFetching: searchingChats } = useQuery(
        "searchChats",
        () => apiClient.searchChat(1, LIMIT, searchQuery),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            keepPreviousData: true,
        }
    );

    const { refetch: searchGroupChats, isFetching: searchingGroupChats } =
        useQuery(
            "searchGroupChats",
            () => apiClient.searchGroupChat(1, LIMIT, searchQuery),
            {
                enabled: false,
                refetchOnWindowFocus: false,
                keepPreviousData: true,
            }
        );

    useEffect(() => {
        const search = () => {
            searchChats().then((result) => {
                if (result.data) setChats([...result.data]);
            });
            searchGroupChats().then((result) => {
                if (result.data) setGroupChats([...result.data]);
            });
        };

        let timeoutId: number | undefined;

        if (searchQuery.length < 2) {
            setChats(chatsState);
            setGroupChats(groupChatsState);
        } else {
            timeoutId = setTimeout(search, 1500);
        }

        return () => {
            clearInterval(timeoutId);
        };
    }, [searchQuery]);
    // #endregion

    return (
        <div className="relative grid grid-rows-[130px_1fr] gap-3 pt-6 bg-black border-e border-whiteAlpha2 h-screen overflow-hidden">
            {/* chats: header */}
            <div className="flex items-start flex-col justify-start gap-3">
                <div className="flex items-center justify-between w-full px-3">
                    <Link
                        className="text-5xl text-white font-bloodySunday"
                        to={"/home"}
                    >
                        MernMedia
                    </Link>
                    <Link
                        to={"/chats/block-list"}
                        className="focus:outline-none p-2 rounded-full text-whiteAlpha1 hover:text-red-800 hover:bg-black2 transition-colors duration-300 ease-in"
                        title="Block list"
                    >
                        <ImBlocked className="size-6" />
                    </Link>
                </div>
                <div className="flex justify-between bg-black2 mx-3 w-[calc(100%-24px)] px-4 py-2 rounded-full">
                    <input
                        type="text"
                        autoComplete="off"
                        placeholder="Search"
                        className="focus:outline-none bg-transparent placeholder:text-whiteAlpha1 w-full"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                    />
                    {searchQuery.length !== 0 && (
                        <button
                            className="focus:outline-none"
                            onClick={() => setSearchQuery("")}
                        >
                            <AiOutlineClose className="size-6 text-white3" />
                        </button>
                    )}
                </div>
                <div className="flex justify-around items-center gap-0 w-full ">
                    <button
                        onClick={() => setWindow("CHATS")}
                        className={`${
                            window === "CHATS"
                                ? "font-poppins-bold text-cyan-500"
                                : ""
                        }`}
                    >
                        Chats
                    </button>
                    <button
                        onClick={() => setWindow("GROUPS")}
                        className={`${
                            window === "GROUPS"
                                ? "font-poppins-bold text-cyan-500"
                                : ""
                        }`}
                    >
                        Groups
                    </button>
                </div>
            </div>

            <div className="m-2 p-2 rounded-xl border border-whiteAlpha2 my-0 pb-0 border-b-0 rounded-b-none bg-black2/30">
                {/* chats */}
                {window === "CHATS" && (
                    <>
                        <div className="overflow-auto px-2">
                            {chats.map((chat, index) => {
                                if (index >= chats.length - 1) {
                                    return (
                                        <div key={index} ref={lastChatCardRef}>
                                            <ChatCard data={chat} />
                                        </div>
                                    );
                                }
                                return (
                                    <div
                                        key={index}
                                        className="border-b border-whiteAlpha2"
                                    >
                                        <ChatCard data={chat} />
                                    </div>
                                );
                            })}
                            {(loadingChats || searchingChats) && (
                                <ChatCardLoading />
                            )}
                        </div>

                        {!loadingChats &&
                            !searchingChats &&
                            chats.length === 0 && (
                                <div className="text-whiteAlpha1 w-full h-full flex justify-center items-center">
                                    No Chats
                                </div>
                            )}
                    </>
                )}

                {/* groups */}
                {window === "GROUPS" && (
                    <>
                        <div className="overflow-auto px-2">
                            {groupChats.map((chat, index) => {
                                if (index >= groupChats.length - 1) {
                                    return (
                                        <div
                                            key={index}
                                            ref={lastGroupChatCardRef}
                                        >
                                            <GroupChatCard data={chat} />
                                        </div>
                                    );
                                }
                                return (
                                    <div
                                        key={index}
                                        className="border-b border-whiteAlpha2"
                                    >
                                        <GroupChatCard data={chat} />
                                    </div>
                                );
                            })}
                            {(loadingGroupChats || searchingGroupChats) && (
                                <ChatCardLoading />
                            )}
                        </div>

                        {!loadingGroupChats &&
                            !searchingGroupChats &&
                            groupChats.length === 0 && (
                                <div className="text-whiteAlpha1 w-full h-full flex justify-center items-center">
                                    No Group Chats
                                </div>
                            )}
                    </>
                )}
            </div>
            <div className="absolute p-2 rounded-full bg-cyan-800 bottom-5 right-5">
                <Link to={"/chats/create-chat"}>
                    <TbMessage2Plus className="size-8" />
                </Link>
            </div>
        </div>
    );
};

export default SideBarChat;
