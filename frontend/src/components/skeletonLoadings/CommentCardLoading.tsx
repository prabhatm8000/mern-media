import Skeleton from "react-loading-skeleton";

const CommentCardLoading = () => {
    return (
        <div className="grid grid-cols-[25px_1fr] items-start justify-start gap-2 m-2 relative">
            {/* profilePicture */}
            <div className="size-[25px] rounded-full">
                <Skeleton className="size-[25px]" circle={true} />
            </div>

            {/* comment data */}
            <div className="flex flex-col gap-0">
                {/* userdata */}
                <div className="text-sm text-white3">
                    <Skeleton width={"25rem"} className="text-sm" />
                </div>

                {/* comment */}
                <span className="text-lg text-stone-200 font-semibold">
                    <Skeleton width={"30rem"} />
                </span>
            </div>
        </div>
    );
};

export default CommentCardLoading;
