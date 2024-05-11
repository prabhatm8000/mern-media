import { Link } from "react-router-dom";
import { MessageType } from "../../../backend/src/types/types";
import { useAppContext } from "../contexts/AppContext";
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";
import { useState } from "react";
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
                        <img
                            src={
                                data.senderUserData.profilePictureUrl.length > 0
                                    ? data.senderUserData.profilePictureUrl
                                    : defaultProfilePicture
                            }
                            className="size-[20px] object-cover rounded-full translate-y-1"
                            alt={data.senderUserData.username}
                        />
                    </Link>
                )}
                <div>
                    {currUserId !== data.sender.toString() && (
                        <span className="font-poppins-bold text-sm">
                            {data.senderUserData.username}
                        </span>
                    )}
                <div
                    className={`relative min-w-24 max-w-64 md:max-w-96 w-fit pt-1.5 pb-5 px-3 rounded-lg ${
                        currUserId === data.sender.toString()
                            ? "text-end bg-blue-500/80 rounded-br-none"
                            : "text-start bg-black2 rounded-bl-none"
                    } `}
                >
                        {data.attachments && (
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
                            className={`absolute text-xs font-poppins-bold bottom-1 text-white/55 flex items-center gap-2 mx-3 ${
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
