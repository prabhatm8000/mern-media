import { AiOutlineClose } from "react-icons/ai";
import { BiSolidSend } from "react-icons/bi";
import { useMutation } from "react-query";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as apiClient from "../apiClient";
import { useAppContext } from "../contexts/AppContext";
import CommentCard from "./CommentCard";
import LoadingCircleSvg from "./LoadingCircleSvg";
import CommentCardLoading from "./skeletonLoadings/CommentCardLoading";
import { PostCommentUserDataType } from "../../../backend/src/types/types";

interface CommentBoxProps {
    postId: string;
    onClose: () => void;
    setCommentCount: React.Dispatch<React.SetStateAction<number>>;
}

export type PostCommentFormType = {
    postId: string;
    comment: string;
};

const MAX_LENGTH_OF_COMMENT = 500;
const COMMMENT_LIMIT = 5;

const CommentBox = ({ postId, onClose, setCommentCount }: CommentBoxProps) => {
    const { showToast } = useAppContext();
    2;
    const [comments, setComments] = useState<PostCommentUserDataType[]>([]);

    // adding comment
    // #region
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PostCommentFormType>();

    const { mutate, isLoading } = useMutation(apiClient.addComment, {
        onSuccess: () => {
            showToast({ message: "Comment posted!", type: "SUCCESS" });
            setCommentCount((prev) => prev + 1);
            handleCloseBtn();
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "ERROR" });
        },
    });

    const onSubmit = handleSubmit((formData) => {
        formData.postId = postId;
        mutate(formData);
    });
    // #endregion

    // fetching comments
    // #region
    const [fetchMyComments, setfetchMyComments] = useState<boolean>(false);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);
    const [commentPage, setCommentPage] = useState<number>(1);
    const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);

    const fetchComments = (page: number = commentPage) => {
        if (!fetchMyComments)
            return apiClient.fetchCommentsByPostId(
                postId,
                page,
                COMMMENT_LIMIT
            );
        else
            return apiClient.fetchMyCommentsByPostId(
                postId,
                page,
                COMMMENT_LIMIT
            );
    };

    const commentObserver = useRef<IntersectionObserver | null>();

    const lastCommentRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingComments) return;

            if (commentObserver.current) commentObserver.current.disconnect();

            commentObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreComments) {
                    setCommentPage((prev) => prev + 1);
                }
            });

            if (element) commentObserver.current?.observe(element);
        },
        [loadingComments, hasMoreComments]
    );

    useEffect(() => {
        setLoadingComments(true);
        fetchComments().then((result) => {
            setLoadingComments(false);
            if (result && result?.length > 0) {
                setComments((prev) => [...prev, ...result]);
                if (result.length < COMMMENT_LIMIT) setHasMoreComments(false);
            } else setHasMoreComments(false);
        });
    }, [commentPage, fetchMyComments]);
    // #endregion

    // delete comment
    const handleDeleteBtn = async (commentId: string) => {
        try {
            await apiClient.deleteComment(commentId);
            setComments((prev) =>
                prev.filter((item) => item._id.toString() !== commentId)
            );
            setCommentCount((prev) => prev - 1);
            showToast({ type: "SUCCESS", message: "Comment deleted!" });
        } catch (error) {
            showToast({ type: "ERROR", message: error as string });
        }
    };

    const handleShowMyCommentsBtn = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setfetchMyComments((prev) => !prev);
    };

    // reset comments
    useEffect(() => {
        setComments([]);
        setCommentPage(1);
        setHasMoreComments(true);
    }, [fetchMyComments, postId]);

    function handleCloseBtn() {
        onClose();
        // setCommentPage(1);
        // setComments([]);
    }

    // length check-
    // #region
    // for comment
    const [numOfLettersInComment, setNumOfLettersInComment] =
        useState<number>(0);
    useEffect(() => {
        const len = watch("comment").length;
        setNumOfLettersInComment(len);
        if (watch("comment")) {
        }
    }, [watch("comment")]);
    // #endregion

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mx-2">
                <h2 className="text-xl font-poppins-bold">
                    {fetchMyComments ? "Your comments" : "Comments"}
                </h2>
                <span className="cursor-pointer" onClick={handleCloseBtn}>
                    <AiOutlineClose />
                </span>
            </div>

            {/* comments */}
            {comments && (
                <div className="overflow-auto px-3 flex flex-col divide-y-[1px] divide-whiteAlpha2">
                    {comments.length === 0 && !loadingComments && (
                        <div>No Comments</div>
                    )}
                    {comments.map((data, i) => {
                        if (i === comments.length - 1) {
                            return (
                                <div
                                    ref={lastCommentRef}
                                    key={i}
                                    className="w-full"
                                >
                                    <CommentCard
                                        handleDeleteBtn={handleDeleteBtn}
                                        comment={data}
                                    />
                                </div>
                            );
                        }
                        return (
                            <div key={i} className="w-full">
                                <CommentCard
                                    handleDeleteBtn={handleDeleteBtn}
                                    comment={data}
                                />
                            </div>
                        );
                    })}
                    {loadingComments && (
                        <>
                            <div className="w-full">
                                <CommentCardLoading />
                            </div>
                            <div className="w-full">
                                <CommentCardLoading />
                            </div>
                            <div className="w-full">
                                <CommentCardLoading />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* form for adding comment */}
            <form
                className="flex items-end justify-center gap-2"
                onSubmit={onSubmit}
            >
                <div className="relative flex-1">
                    <button
                        onClick={handleShowMyCommentsBtn}
                        className="text-blue-400"
                    >
                        Your comments
                    </button>
                    <textarea
                        placeholder="Comment"
                        rows={3}
                        maxLength={MAX_LENGTH_OF_COMMENT}
                        className="resize-none bg-black1 border rounded border-whiteAlpha2 w-full py-1 px-2 focus:outline-none"
                        {...register("comment", {
                            required: "Comment field is empty!",
                        })}
                    />
                    {errors.comment && (
                        <span className="absolute bottom-0 left-0 ms-2 mb-2 text-red-500 font-normal">
                            {errors.comment.message}
                        </span>
                    )}
                    <div className="absolute bottom-0 right-0 me-2 mb-2 text-stone-500">
                        <span id="current">{numOfLettersInComment}</span>
                        <span id="maximum">/{MAX_LENGTH_OF_COMMENT}</span>
                    </div>
                </div>

                {/* submit button */}
                <span className="flex flex-col items-center justify-between mb-2">
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="p-2 bg-black1 border border-whiteAlpha2 rounded-full transition ease-in-out delay-100 hover:bg-blue-500 disabled:bg-blue-700 duration-300"
                    >
                        {isLoading ? (
                            <span className="size-6">
                                <LoadingCircleSvg />
                            </span>
                        ) : (
                            <BiSolidSend className="size-6" />
                        )}
                    </button>
                </span>
            </form>
        </>
    );
};

export default CommentBox;
