import Skeleton from "react-loading-skeleton";

const ChatCardLoading = () => {
    return (
        <div className="flex justify-start items-center gap-2 p-2 relative">
            <div className="size-[50px] rounded-full">
                <Skeleton className="size-[50px]" circle={true} />
            </div>
            <div className="-mb-2">
                <Skeleton width={"15rem"} count={1} />
                <Skeleton width={"12rem"} className="text-sm" count={1} />
            </div>
        </div>
    );
};

export default ChatCardLoading;
