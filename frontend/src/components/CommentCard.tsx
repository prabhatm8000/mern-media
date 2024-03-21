import { Link } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import { AiFillDelete } from "react-icons/ai";

// type
import { PostCommentUserDataType } from "../../../backend/src/types/types";

// date-fns
import { formatDistanceToNow } from "date-fns";

// image
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";

// context
import { useAppContext } from "../contexts/AppContext";

interface CommentCardProps {
    comment: PostCommentUserDataType;
    handleDeleteBtn: (commentId: string) => void;
}

const CommentCard = ({ comment, handleDeleteBtn }: CommentCardProps) => {
    const { currUserId } = useAppContext();

    return (
        <div className="flex items-start gap-2 pb-2">
            {/* profilePicture with delete btn */}
            <div className="flex flex-col items-center gap-1">
                <Link to={`/profile/${comment.userId}`}>
                    <img
                        src={
                            comment.profilePictureUrl.length > 0
                                ? comment.profilePictureUrl
                                : defaultProfilePicture
                        }
                        alt={comment.username}
                        className="w-[30px] h-[30px] object-cover rounded-full"
                    />
                </Link>
                {currUserId === comment.userId && (
                    <button
                        className="text-xl text-red-500"
                        onClick={() => handleDeleteBtn(comment._id)}
                    >
                        <AiFillDelete />
                    </button>
                )}
            </div>

            {/* comment data */}
            <div className="flex flex-col gap-0">
                {/* meta data */}
                <div className="flex items-center justify-start gap-0 text-sm text-stone-400">
                    <Link to={`/profile/${comment.userId}`}>
                        <span className="font-semibold">
                            {comment.username}
                        </span>
                    </Link>
                    <GoDotFill className="text-sm" />
                    <span className="">
                        {formatDistanceToNow(new Date(comment.commentedOn))} ago
                    </span>
                </div>

                {/* comment */}
                <span className="text-lg text-stone-200 font-semibold">
                    {comment.comment}
                </span>
            </div>
        </div>
    );
};

export default CommentCard;
