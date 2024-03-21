import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { formatDistanceToNow } from "date-fns";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { BiSolidComment } from "react-icons/bi";
import { SlOptions } from "react-icons/sl";
import { IoIosShareAlt } from "react-icons/io";
import { MdDelete } from "react-icons/md";

// contexts
import { useAppContext } from "../contexts/AppContext";

// types
import { PostType } from "../../../backend/src/types/types";

// api
import * as apiClient from "../apiClient";

// libs
import { useHorizontalScroll } from "../lib/horizontalScroll";
import { GoDotFill } from "react-icons/go";
import CommentBox from "./CommentBox";
import { useCommentsContext } from "../contexts/CommentContext";

interface PostCardProps {
    postData: PostType;
    handleDeleteBtn: (postId: string) => void;
}

const PostCard = ({ postData, handleDeleteBtn }: PostCardProps) => {
    const scrollRef = useHorizontalScroll();

    const { currUserId, showToast } = useAppContext();

    // likes
    // #region
    const { refetch: likeUnlikePost } = useQuery(
        "likeUnlikePost",
        () => apiClient.likeUnlikePost(postData._id),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            onError: () => {
                // showToast({ message: "", type: "ERROR" });
            },
            onSuccess: () => {
                // showToast({ message: "Post deleted", type: "SUCCESS" });
            },
        }
    );

    const [doILike, setDoILike] = useState<boolean | undefined>(
        postData.doILike
    );
    const [likeCount, setLikeCount] = useState<number>(postData.likeCount);

    const handleLikeBtn = async () => {
        await likeUnlikePost();
        setDoILike((prev) => !prev);

        if (!doILike) {
            setLikeCount((prev) => prev + 1);
        } else {
            setLikeCount((prev) => prev - 1);
        }
    };
    // #endregion

    const [commentCount, setCommentCount] = useState<number>(
        postData.commentCount
    );

    // options
    // #region
    const [showOptions, setShowOptions] = useState<boolean>(false);

    const handleShareBtn = async () => {
        const link = `${window.location.origin}/post/${postData._id}`;
        await navigator.clipboard.writeText(link);
        showToast({ type: "SUCCESS", message: "Post link copied!" });
    };

    useEffect(() => {
        if (showOptions) {
            const handler = setInterval(() => setShowOptions(false), 5000);
            return () => clearInterval(handler);
        }
    }, [showOptions]);
    // #endregion

    const [showComments, setShowComments] = useState<boolean>(false);
    const { dispatch: dispatchComments } = useCommentsContext();

    return (
        <div className="flex gap-2">
            {/* profilePicture */}
            <Link
                className="w-[30px] h-[30px]"
                to={`/profile/${postData.userId}`}
            >
                <img
                    className="w-[30px] h-[30px] rounded-full"
                    src={postData.profilePictureUrl}
                    alt={postData.username}
                    title={postData.username}
                />
            </Link>
            <div className="flex flex-col gap-1 w-full overflow-hidden">
                {/* post userData */}
                <div className="flex flex-col">
                    <Link
                        to={`/profile/${postData.userId}`}
                        className="text-md text-neutral-200 w-fit"
                    >
                        {postData.name}
                    </Link>
                    <div className="text-md text-neutral-400 flex flex-1 items-center gap-0">
                        <Link to={`/profile/${postData.userId}`}>
                            {postData.username}
                        </Link>
                        <GoDotFill className="text-sm" />
                        <div className="">
                            {formatDistanceToNow(new Date(postData.postedAt))}{" "}
                            ago
                        </div>
                    </div>
                </div>

                {/* post */}
                <div className="flex flex-col gap-2 p-2 pt-1 border border-neutral-800 rounded-lg bg-neutral-900">
                    {/* post texts */}
                    {(postData.title || postData.caption) && (
                        <div className="px-2 flex flex-col gap-2">
                            {postData.title && (
                                <h3 className="text-2xl font-bold leading-[1.1]">
                                    {postData.title}
                                </h3>
                            )}
                            {postData.caption && (
                                <h5 className="text-md text-neutral-300 leading-[1.1]">
                                    {postData.caption}
                                </h5>
                            )}
                        </div>
                    )}

                    {/* post images */}
                    {postData.imageUrls.length > 0 && (
                        <div
                            ref={scrollRef}
                            className={`p-2 flex gap-6 ${
                                postData.imageUrls.length > 0
                                    ? "max-h-[300px]"
                                    : "h-0"
                            } overflow-auto overflow-x-auto`}
                        >
                            {postData.imageUrls.map((url, i) => {
                                return (
                                    <img
                                        key={i}
                                        src={url}
                                        alt={postData.username}
                                        className="rounded-lg object-cover max-w-[600px]"
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* button group */}
                    <div className="flex justify-around text-2xl pt-2 border-t border-neutral-600">
                        <button
                            onClick={handleLikeBtn}
                            className="flex items-center justify-center flex-col gap-1 w-full"
                        >
                            {doILike ? <AiFillLike /> : <AiOutlineLike />}
                            <span className="text-sm">{likeCount} likes</span>
                        </button>
                        <button
                            onClick={() => setShowComments(true)}
                            className="flex items-center justify-center flex-col gap-1 w-full"
                        >
                            <BiSolidComment />
                            <span className="text-sm">
                                {commentCount} comments
                            </span>
                        </button>

                        {/* options */}
                        <div className="relative flex flex-col items-center w-full">
                            <button
                                className="flex items-center justify-center flex-col gap-1 w-full hover:text-cyan-600"
                                onClick={() => setShowOptions((prev) => !prev)}
                            >
                                <SlOptions />
                                <span className="text-sm">options</span>
                            </button>

                            <div
                                className={`${
                                    !showOptions ? "hidden" : "flex"
                                } absolute bottom-6 flex-col px-2 bg-neutral-800 rounded-md text-base`}
                            >
                                {currUserId === postData.userId && (
                                    <button
                                        onClick={() => handleDeleteBtn(postData._id)}
                                        className="flex items-center gap-1 py-2 text-red-500 border-b border-neutral-700"
                                    >
                                        <MdDelete className="text-2xl" />
                                        Delete
                                    </button>
                                )}
                                <button
                                    onClick={handleShareBtn}
                                    className="flex items-center gap-1 py-2"
                                >
                                    <IoIosShareAlt className="text-2xl" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* commentBox */}
                    <div
                        className={`fixed ${
                            showComments ? "z-[10] inset-0" : ""
                        } flex items-end justify-center`}
                    >
                        <div
                            className={`container relative mx-2 px-4 bottom-0 left-0 grid grid-rows-[1fr_10fr_2fr] grid-flow-row ${
                                showComments ? "h-[65%] py-3" : "h-0"
                            } rounded-t-lg bg-neutral-700 transition-all delay-100 duration-300`}
                        >
                            {showComments && (
                                <CommentBox
                                    postId={postData._id}
                                    handleCloseBtn={() => {
                                        setShowComments(false);
                                        dispatchComments({ type: "RESET" });
                                    }}
                                    setCommentCount={setCommentCount}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
