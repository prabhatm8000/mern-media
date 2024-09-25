import { formatDistanceToNow } from "date-fns";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

// componenets
import Carousel from "./Carousel";
import CommentBox from "./CommentBox";

// contexts
import { useAppContext } from "../contexts/AppContext";

// types
import { PostType } from "../../../backend/src/types/types";

// api
import * as apiClient from "../apiClient";

import { BiLike, BiSolidLike } from "react-icons/bi";
import { BsFillPersonFill } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import { MdDelete, MdOutlineModeComment } from "react-icons/md";
import { RxShare2 } from "react-icons/rx";
import { SlOptions } from "react-icons/sl";
import FadeBG from "./FadeBG";
import ImageComponent from "./Image";

interface PostCardProps {
    postData: PostType;
    handleDeleteBtn: (postId: string) => void;
}

const PostCard = ({ postData, handleDeleteBtn }: PostCardProps) => {
    const commentsDivRef = useRef<HTMLDivElement>(null);

    const { currUserId, showToast } = useAppContext();

    // likes
    // #region
    const { refetch: likeUnlikePost } = useQuery(
        "likeUnlikePost",
        () => apiClient.likeUnlikePost(postData._id.toString()),
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
    const [isFetchingDoIlike, setIsFetchingDoILike] = useState<boolean>(false);

    const handleLikeBtn = async () => {
        setIsFetchingDoILike(true);
        await likeUnlikePost();
        setDoILike((prev) => !prev);

        if (!doILike) {
            setLikeCount((prev) => prev + 1);
        } else {
            setLikeCount((prev) => prev - 1);
        }
        setIsFetchingDoILike(false);
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

    // gsap animation for comments box
    useEffect(() => {
        if (showComments) {
            gsap.to(commentsDivRef.current || {}, {
                duration: 0.1,
                ease: "power.inOut",
                display: "grid",
                padding: "6px",
                height: "60vh",
                y: "0px",
            });
        } else {
            gsap.to(commentsDivRef.current || {}, {
                duration: 0.1,
                ease: "power.inOut",
                display: "hidden",
                padding: "0px",
                height: "0px",
                y: "600px",
            });
        }
    }, [showComments]);

    return (
        <div className="flex gap-2">
            {/* profilePicture */}
            <Link className="size-[40px]" to={`/profile/${postData.userId}`}>
                <ImageComponent
                    src={postData.profilePictureUrl}
                    alt={postData.username}
                    title={postData.username}
                    className="size-[40px] object-cover rounded-full"
                />
            </Link>
            <div className="flex flex-col gap-1 overflow-hidden">
                {/* post userData */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <Link
                            to={`/profile/${postData.userId}`}
                            className="text-md text-white1 font-semibold w-fit"
                        >
                            {postData.name}
                        </Link>
                        <div className="text-md text-white3 flex flex-1 items-center gap-0">
                            <Link to={`/profile/${postData.userId}`}>
                                {postData.username}
                            </Link>
                            <GoDotFill className="text-sm" />
                            <div className="">
                                {formatDistanceToNow(
                                    new Date(postData.postedAt),
                                    { addSuffix: true, includeSeconds: true }
                                )}
                            </div>
                        </div>
                    </div>

                    {/* options button */}
                    <button
                        className="size-4"
                        onClick={() => setShowOptions((prev) => !prev)}
                    >
                        <SlOptions className="text-whiteAlpha1 size-4" />
                    </button>
                </div>

                {/* post */}
                <div className="flex flex-col gap-2 p-2 pt-1 w-post lg:w-postLg bg-black rounded-lg border border-whiteAlpha2">
                    {/* options */}
                    <div className="relative">
                        <div
                            className={`${
                                !showOptions ? "hidden" : "flex"
                            } absolute top-0 right-0 z-20 flex-col px-2 m-1 bg-black rounded-md divide-y-[1px] divide-whiteAlpha2`}
                        >
                            {currUserId === postData.userId.toString() && (
                                <button
                                    onClick={() =>
                                        handleDeleteBtn(postData._id.toString())
                                    }
                                    className="flex items-center gap-2 py-2 text-red-500"
                                >
                                    <MdDelete className="text-2xl" />
                                    Delete Post
                                </button>
                            )}

                            <Link
                                to={`/profile/${postData.userId}`}
                                className="flex items-center gap-2 py-2 text-white"
                            >
                                <BsFillPersonFill className="text-2xl" />
                                {postData.username}
                            </Link>
                        </div>
                    </div>

                    {/* post texts */}
                    {(postData.title || postData.caption) && (
                        <div className="px-2 flex flex-col gap-2">
                            {postData.title && (
                                <h3 className="text-2xl font-poppins-bold leading-[1.1]">
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
                        <div className="">
                            <Carousel urls={postData.imageUrls} />
                        </div>
                    )}

                    {/* button group */}
                    <div className="flex text-2xl pt-4 pb-2 border-t border-whiteAlpha2">
                        <button
                            onClick={handleLikeBtn}
                            disabled={isFetchingDoIlike}
                            className="flex items-center justify-center gap-1 w-full"
                        >
                            {doILike ? (
                                <BiSolidLike className="text-blue-500 size-5" />
                            ) : (
                                <BiLike className="text-whiteAlpha1 size-5" />
                            )}
                            <span
                                className={`text-sm ${
                                    doILike
                                        ? "text-blue-500"
                                        : "text-whiteAlpha1"
                                }`}
                            >
                                {likeCount}
                            </span>
                        </button>

                        <button
                            onClick={() => setShowComments(true)}
                            className="flex items-center justify-center gap-1 w-full"
                        >
                            <MdOutlineModeComment className="text-whiteAlpha1 size-5" />
                            <span className="text-sm text-whiteAlpha1">
                                {commentCount}
                            </span>
                        </button>

                        <button
                            onClick={handleShareBtn}
                            className="flex items-center justify-center gap-1 w-full"
                        >
                            <RxShare2 className="text-whiteAlpha1 size-5" />
                        </button>
                    </div>

                    {/* commentBox */}
                    {showComments && (
                        <FadeBG onClick={() => setShowComments(false)} />
                    )}
                    <div
                        className={`fixed h-0 sm:ms-6 md:ms-48 lg:ms-40 z-[20] bottom-0 left-0 right-0 flex items-end justify-center`}
                    >
                        <div
                            ref={commentsDivRef}
                            className={`relative w-[350px] md:w-[500px] lg:w-[700px] bottom-0 left-0 grid-rows-[10%_70%_20%] grid-flow-row transition-all ease-in-out delay-75 duration-300 rounded-t-lg bg-black2`}
                            style={{ display: "none" }}
                        >
                            {showComments && (
                                <CommentBox
                                    postId={postData._id.toString()}
                                    onClose={() => {
                                        setShowComments(false);
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
