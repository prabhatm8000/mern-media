import Skeleton from "react-loading-skeleton";

const PostCardLoading = () => {
    return (
        <div className="flex gap-2">
            {/* profilePicture */}
            <div className="size-[40px] rounded-full">
                <Skeleton className="size-[40px]" circle={true} />
            </div>

            <div className="flex flex-col gap-1 overflow-hidden">
                {/* post userData */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        {/* name */}
                        <Skeleton className="px-32" count={1} />
                        {/* username */}
                        <Skeleton className="px-20" count={1} />
                    </div>
                </div>

                {/* post */}
                <div className="flex flex-col gap-2 p-2 pt-3 w-post lg:w-postLg bg-black rounded-lg border border-whiteAlpha2">
                    {/* post texts */}
                    <div className="px-2 flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1 text-3xl">
                            <Skeleton count={1} />
                            <Skeleton width={"25rem"} count={1} />
                            <Skeleton width={"20rem"} count={1} />
                        </div>
                        <Skeleton className="px-20" count={5} />
                    </div>

                    {/* images */}
                    <div className="h-[300px] mb-2">
                        <Skeleton height={300} borderRadius={8} />
                    </div>

                    {/* button */}
                    <div className="flex justify-around text-2xl pt-4 pb-2 border-t border-whiteAlpha2">
                        <Skeleton className="size-4 p-4" />
                        <Skeleton className="size-4 p-4" />
                        <Skeleton className="size-4 p-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCardLoading;
