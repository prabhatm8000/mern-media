import Skeleton from "react-loading-skeleton";

const GroupDetailsLoading = () => {
    return (
        <>
            <div
                className={`flex flex-col gap-2 pb-2 transition delay-100 duration-300 border-b border-whiteAlpha2`}
            >
                <div className="size-[150px] rounded-full">
                    <Skeleton className="size-[150px]" circle={true} />
                </div>
                <div className="flex flex-col gap-2">
                    {/* name */}
                    <Skeleton width={"25rem"} className="text-xl p-1" />

                    {/* desc */}
                    <div>
                        <Skeleton width={"30rem"} />
                        <Skeleton width={"27rem"} />
                        <Skeleton width={"25rem"} />
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    <div className="size-[60px] rounded-full">
                        <Skeleton className="size-[60px]" circle={true} />
                    </div>

                    <div className="-mb-2">
                        <Skeleton width={"15rem"} count={1} />
                        <Skeleton
                            width={"12rem"}
                            className="text-sm"
                            count={1}
                        />
                    </div>
                </div>
            </div>
            <Skeleton width={"25rem"} className="text-xl p-1" />
        </>
    );
};

export default GroupDetailsLoading;
