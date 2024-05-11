import { AiFillDelete } from "react-icons/ai";
import { GoDotFill } from "react-icons/go";
import { Link } from "react-router-dom";

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
        <div className="grid grid-cols-[25px_1fr] items-start justify-start gap-2 m-2 relative">
            {/* profilePicture */}
            <Link to={`/profile/${comment.userId}`}>
                <img
                    src={
                        comment.profilePictureUrl.length > 0
                            ? comment.profilePictureUrl
                            : defaultProfilePicture
                    }
                    alt={comment.username}
                    className="size-[25px] object-cover rounded-full"
                />
            </Link>

            {/* comment data */}
            <div className="flex flex-col gap-0">
                {/* userdata */}
                <div className="text-sm text-white3">
                    <div className="flex items-center justify-start gap-0">
                        <Link to={`/profile/${comment.userId}`}>
                            <span className="font-semibold">
                                {comment.username}
                            </span>
                        </Link>
                        <GoDotFill className="text-sm" />
                        <span className="">
                            {formatDistanceToNow(
                                new Date(comment.commentedAt),
                                {
                                    addSuffix: true,
                                }
                            )}
                        </span>
                    </div>
                    {currUserId === comment.userId.toString() && (
                        <button
                            className=" absolute top-0 right-0 mx-2"
                            onClick={() =>
                                handleDeleteBtn(comment._id.toString())
                            }
                        >
                            <AiFillDelete className="size-5 text-red-500" />
                        </button>
                    )}
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
