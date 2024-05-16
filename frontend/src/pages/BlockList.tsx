import { IoMdArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";

const BlockList = () => {
    return (
        <div className="flex flex-col gap-2 h-screen p-2 overflow-hidden">
            <div className="flex items-center gap-2 py-2 border-b border-whiteAlpha2">
                <Link to={"/chats"}>
                    <IoMdArrowRoundBack className="size-7" />
                </Link>
                <h3 className="text-lg">Block list</h3>
            </div>

            
        </div>
    );
};

export default BlockList;
