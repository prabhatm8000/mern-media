import { AiOutlineClose } from "react-icons/ai";
import { BiSolidSend } from "react-icons/bi";
import { useMutation } from "react-query";

import * as apiClient from "../apiClient";
import { useForm } from "react-hook-form";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import CommentCard from "./CommentCard";
import Loading from "./Loading";
import { useCommentsContext } from "../contexts/CommentContext";

interface CommentBoxProps {
    postId: string;
    handleCloseBtn: () => void;
    setCommentCount: React.Dispatch<React.SetStateAction<number>>;
}

export type PostCommentFormType = {
    postId: string;
    comment: string;
};

const MAX_LENGTH_OF_COMMENT = 500;
const COMMMENT_LIMIT = 5;

const CommentBox = ({
    postId,
    handleCloseBtn,
    setCommentCount,
}: CommentBoxProps) => {
    const { showToast } = useAppContext();
    const { state: comments, dispatch: dispatchComments } =
        useCommentsContext();

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
            showToast({ message: "Posted", type: "SUCCESS" });
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
        if (commentPage > 1) {
            setLoadingComments(true);
            fetchComments().then((result) => {
                setLoadingComments(false);
                if (result && result?.length > 0) {
                    dispatchComments({
                        type: "ADD_COMMENTS",
                        payload: result,
                    });
                    if (result.length < COMMMENT_LIMIT)
                        setHasMoreComments(false);
                } else setHasMoreComments(false);
            });
        }
    }, [commentPage]);
    // #endregion

    // delete comment
    const handleDeleteBtn = async (commentId: string) => {
        try {
            await apiClient.deleteComment(commentId);
            dispatchComments({
                type: "SET_COMMENTS",
                payload: comments.filter((item) => item._id !== commentId),
            });
            setCommentCount((prev) => prev - 1);
            showToast({ type: "SUCCESS", message: "Comment deleted" });
        } catch (error) {
            showToast({ type: "ERROR", message: error as string });
        }
    };

    const handleShowMyCommentsBtn = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setfetchMyComments((prev) => !prev);
    };

    // reset comments when postId changes
    useEffect(() => {
        dispatchComments({ type: "RESET" });
        setHasMoreComments(true);
        setCommentPage(1);

        // init fetch
        setLoadingComments(true);
        fetchComments(1).then((result) => {
            setLoadingComments(false);
            if (result && result?.length > 0) {
                dispatchComments({
                    type: "SET_COMMENTS",
                    payload: result,
                });
                if (result.length < COMMMENT_LIMIT) setHasMoreComments(false);
            } else setHasMoreComments(false);
        });
    }, [postId, fetchMyComments]);

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
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Comments</h2>
                <span className="cursor-pointer" onClick={handleCloseBtn}>
                    <AiOutlineClose />
                </span>
            </div>

            {/* comments */}
            {comments && (
                <div className="overflow-auto flex flex-col gap-2 py-4">
                    {comments.length === 0 && !loadingComments && (
                        <div>No Comments</div>
                    )}
                    {comments.map((data, i) => {
                        if (comments.length === i + 1) {
                            return (
                                <div
                                    ref={lastCommentRef}
                                    key={i}
                                    className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]"
                                >
                                    <CommentCard
                                        handleDeleteBtn={handleDeleteBtn}
                                        comment={data}
                                    />
                                </div>
                            );
                        }
                        return (
                            <div
                                key={i}
                                className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px] border-b border-b-stone-600"
                            >
                                <CommentCard
                                    handleDeleteBtn={handleDeleteBtn}
                                    comment={data}
                                />
                            </div>
                        );
                    })}
                    {loadingComments && <Loading />}
                </div>
            )}

            {/* form for adding comment */}
            <form
                className="flex items-end justify-center gap-2"
                onSubmit={onSubmit}
            >
                <label className="relative text-neutral-200 text-sm font-bold flex-1">
                    Add Comment
                    <textarea
                        rows={3}
                        maxLength={MAX_LENGTH_OF_COMMENT}
                        className="resize-none bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-1 px-2 font-normal focus:outline-none"
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
                </label>

                {/* submit button */}
                <span className="flex flex-col items-center justify-between mb-2">
                    <button onClick={handleShowMyCommentsBtn}>
                        My-comments
                    </button>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="flex items-center gap-1 p-3 bg-neutral-800 border border-neutral-600 text-white font-bold text-2xl rounded-full transition ease-in-out delay-150 hover:bg-amber-600 disabled:bg-amber-600 duration-300"
                    >
                        {isLoading ? (
                            <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-10"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <BiSolidSend />
                        )}
                    </button>
                </span>
            </form>
        </>
    );
};

export default CommentBox;
