import Skeleton from "react-loading-skeleton";

const ProfileLoading = () => {
    return (
        <div
            className={`flex flex-col gap-2 transition delay-100 duration-300 border-b border-whiteAlpha2`}
        >
            <div className="flex items-center justify-between pb-2">
                <div className="size-[150px] rounded-full">
                    <Skeleton className="size-[150px]" circle={true} />
                </div>

                <Skeleton borderRadius={"50px"} width={100} height={30} />
            </div>

            {/* name */}
            <Skeleton width={"25rem"} className="text-xl p-1" />
            {/* username */}
            <Skeleton width={"20rem"} />

            {/* desc */}
            <div>
                <Skeleton width={"30rem"} />
                <Skeleton width={"27rem"} />
                <Skeleton width={"25rem"} />
            </div>

            {/* joined at */}
            <Skeleton width={"30rem"} />

            <div className="flex flex-col gap-0 text-md text-blue-400 underline">
                <Skeleton width={"20rem"} />
                <Skeleton width={"20rem"} />
                <Skeleton width={"20rem"} />
            </div>

            <div className="flex items-center py-3 text-neutral-400 justify-start gap-4">
                <span className="flex gap-1">
                    <Skeleton width={"6rem"} />
                </span>
                <span className="flex gap-1 cursor-pointer">
                    <Skeleton width={"6rem"} />
                </span>
                <span className="flex gap-1 cursor-pointer">
                    <Skeleton width={"6rem"} />
                </span>
            </div>
        </div>
    );
};

export default ProfileLoading;
