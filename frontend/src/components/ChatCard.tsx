import { Link } from "react-router-dom";
import { ChatBasicDataType } from "../../../backend/src/types/types";
import { handleDate } from "../lib/handleDate";
import ImageComponent from "./Image";

const ChatCard = ({ data: chat }: { data: ChatBasicDataType }) => {
    return (
        <Link
            to={`/chats/chat/${chat._id}`}
            className="flex justify-start items-center gap-2 p-2 relative"
        >
            <ImageComponent
                src={chat.userData.profilePictureUrl}
                className="size-[50px] object-cover rounded-full"
                alt={chat.userData.username}
            />
            <div className="flex flex-col w-[calc(100%-58px)]">
                <span>{chat.userData.name}</span>

                <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-whiteAlpha1">
                        {chat.userData.username}
                    </span>
                    {chat.newMessage && (
                        <span className="p-1.5 rounded-full bg-blue-400"></span>
                    )}
                </div>

                <div className="flex justify-between items-center gap-2">
                    <span className="text-xs line-clamp-1 text-white2 max-w-[80%]">
                        {chat.lastMessage}
                    </span>
                    <span className="text-xs font-poppins-bold text-whiteAlpha1">
                        {handleDate(new Date(chat.lastMessageOn))}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ChatCard;
