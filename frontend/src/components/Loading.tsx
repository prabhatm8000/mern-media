import ReactLoading from "react-loading";

const Loading = () => {
    return (
        <div className="flex justify-center items-center">
            <ReactLoading
                type={"spin"}
                color={"#94a3b8"}
                height={"50px"}
                width={"50px"}
            />
        </div>
    );
};

export default Loading;
