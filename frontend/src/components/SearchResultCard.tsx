import { Link } from "react-router-dom";
// types
import { UserDataBasicType } from "../../../backend/src/types/types";

// image
import Image from "./Image";

interface SearchResultCardProps {
    searchResult: UserDataBasicType;
}

const SearchResultCard = ({ searchResult }: SearchResultCardProps) => {
    return (
        <div className="grid grid-cols-[50px_1fr] items-center gap-3 w-full hover:bg-white/10 rounded-md px-2 py-2 transition-transform delay-50 duration-500">
            <Link to={`/profile/${searchResult.userId}`}>
                <Image
                    src={searchResult?.profilePictureUrl}
                    className="w-[50px] h-[50px] object-cover rounded-full"
                />
            </Link>
            <Link to={`/profile/${searchResult.userId}`}>
                <div className="">
                    <h2 className="text-lg mb-[-4px]">{searchResult.name}</h2>
                    <h4 className="text-md text-neutral-400">
                        {searchResult.username}
                    </h4>
                </div>
            </Link>
        </div>
    );
};

export default SearchResultCard;
