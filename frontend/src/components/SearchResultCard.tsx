// types
import { Link } from "react-router-dom";
import { UserDataBasicType } from "../../../backend/src/types/types";

// image
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";

interface SearchResultCardProps {
    searchResult: UserDataBasicType;
}

const SearchResultCard = ({ searchResult }: SearchResultCardProps) => {
    return (
        <>
            <div className="flex items-center gap-3 w-fit hover:scale-110 hover:translate-x-[10px] transition-transform delay-50 duration-500">
                <Link to={`/profile/${searchResult.userId}`}>
                    <img
                        src={
                            searchResult.profilePictureUrl === ""
                                ? defaultProfilePicture
                                : searchResult?.profilePictureUrl
                        }
                        className="w-[50px] h-[50px] object-cover rounded-full"
                    />
                </Link>
                <Link to={`/profile/${searchResult.userId}`}>
                    <div>
                        <h2 className="text-lg mb-[-4px]">
                            {searchResult.name}
                        </h2>
                        <h4 className="text-md text-neutral-400">
                            {searchResult.username}
                        </h4>
                    </div>
                </Link>
            </div>
        </>
    );
};

export default SearchResultCard;
