import { Link } from "react-router-dom";

import { GroupChatBasicDataType } from "../../../backend/src/types/types";
import { handleDate } from "../lib/handleDate";
import ImageComponent from "./Image";

const GroupChatCard = ({ data: chat }: { data: GroupChatBasicDataType }) => {
    return (
        <Link
            to={`/chats/group-chat/${chat._id}`}
            className="flex justify-start items-center gap-2 p-2 relative"
        >
            <ImageComponent
                src={chat.groupPictureUrl}
                className="size-[50px] object-cover rounded-full"
                alt={chat.name}
            />
            <div className="flex flex-col w-[calc(100%-58px)]">
                <div className="flex justify-between items-center gap-2">
                    <span>{chat.name}</span>
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

export default GroupChatCard;
