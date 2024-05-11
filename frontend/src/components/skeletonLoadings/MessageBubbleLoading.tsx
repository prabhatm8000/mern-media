import Skeleton from "react-loading-skeleton";

const MessageBubbleLoading = () => {
    return (
        <>
            <div className="flex justify-end relative">
                <Skeleton
                    width={"16rem"}
                    height={"100px"}
                    borderRadius={"8px 0px 8px 8px"}
                />

                <div className="absolute top-1 mt-1.5 mx-3">
                    <div className=" flex flex-col items-end">
                        <Skeleton width={"14.5rem"} height={"15px"} />
                        <Skeleton width={"10rem"} height={"15px"} />
                    </div>
                </div>

                <div className="absolute bottom-1 mx-3">
                    <Skeleton width={"60px"} height={"10px"} />
                </div>
            </div>

            <div className="flex justify-end relative">
                <Skeleton
                    width={"18rem"}
                    height={"100px"}
                    borderRadius={"8px 0px 8px 8px"}
                />

                <div className="absolute top-1 mt-1.5 mx-3">
                    <div className=" flex flex-col items-end">
                        <Skeleton width={"16.5rem"} height={"15px"} />
                        <Skeleton width={"14rem"} height={"15px"} />
                    </div>
                </div>

                <div className="absolute bottom-1 mx-3">
                    <Skeleton width={"60px"} height={"10px"} />
                </div>
            </div>
        </>
    );
};

export default MessageBubbleLoading;
