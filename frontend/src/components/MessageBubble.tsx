import { FaCheck } from "react-icons/fa";
import { MessageType } from "../../../backend/src/types/types";
import { useAppContext } from "../contexts/AppContext";
import PictureInFullScreen from "./PictureInFullScreen";
import { useState } from "react";

const MessageBubble = ({ data }: { data: MessageType }) => {
    const { currUserId } = useAppContext();

    const [showInFullScreen, setShowInFullScreen] = useState<string>();

    const handleCloseShowInFullScreen = () => setShowInFullScreen(undefined);

    return (
        <>
            {showInFullScreen && (
                <PictureInFullScreen
                    url={showInFullScreen}
                    onClose={handleCloseShowInFullScreen}
                />
            )}
            
            <div
                className={`flex items-center ${
                    currUserId === data.sender.toString()
                        ? "justify-end"
                        : "justify-start"
                }`}
            >
                <div
                    className={`relative min-w-[100px] max-w-64 md:max-w-96 w-fit pt-1.5 pb-5 px-3 rounded-lg ${
                        currUserId === data.sender.toString()
                            ? "text-end bg-blue-500/80 rounded-br-none"
                            : "text-start bg-black2 rounded-bl-none"
                    } `}
                >
                    {data.attachments && data.attachments.length > 0 && (
                        <div className="flex flex-col gap-3 my-2">
                            {data.attachments.map((imageUrl, index) => {
                                return (
                                    <img
                                        src={imageUrl}
                                        alt={data.senderUserData.username}
                                        key={index}
                                        className="w-full min-h-20 max-h-60 md:max-h-80 object-cover rounded-md cursor-pointer"
                                        onClick={(e) =>
                                            setShowInFullScreen(
                                                e.currentTarget.src
                                            )
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                    <span className="">{data.content}</span>
                    <div
                        className={`absolute text-xs font-poppins-bold bottom-1 text-white/55 flex items-center gap-2 mx-2 ${
                            currUserId === data.sender.toString()
                                ? "right-0"
                                : "left-0"
                        }`}
                    >
                        <span>
                            {new Date(data.sentAt).toLocaleTimeString("en-US", {
                                hour12: true,
                                timeStyle: "short",
                            })}
                        </span>
                        {currUserId === data.sender.toString() && (
                            <span
                                className={
                                    data.readStatus
                                        ? "text-white2"
                                        : "text-white/20"
                                }
                            >
                                <FaCheck className="size-3" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessageBubble;
