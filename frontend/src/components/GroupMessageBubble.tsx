import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageType } from "../../../backend/src/types/types";
import { useAppContext } from "../contexts/AppContext";
import ImageComponent from "./Image";
import PictureInFullScreen from "./PictureInFullScreen";

const GroupMessageBubble = ({ data }: { data: MessageType }) => {
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
                className={`flex items-start gap-2 ${
                    currUserId === data.sender.toString()
                        ? "justify-end"
                        : "justify-start"
                }`}
            >
                {currUserId !== data.sender.toString() && (
                    <Link to={`/profile/${data.senderUserData.userId}`}>
                        <ImageComponent
                            src={data.senderUserData.profilePictureUrl}
                            className="size-[20px] object-cover rounded-full translate-y-1"
                            alt={data.senderUserData.username}
                        />
                    </Link>
                )}
                <div>
                    {currUserId !== data.sender.toString() && (
                        <span className="font-poppins-light text-white3 text-sm">
                            {data.senderUserData.username}
                        </span>
                    )}
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
                                        <ImageComponent
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
                                {new Date(data.sentAt).toLocaleTimeString(
                                    "en-US",
                                    {
                                        hour12: true,
                                        timeStyle: "short",
                                    }
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GroupMessageBubble;
