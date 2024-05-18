import { useEffect, useState } from "react";

interface LoadingPageProps {
    message?: string;
}

const LoadingPage = ({ message }: LoadingPageProps) => {
    const [progress, setprogress] = useState<number>(10);
    useEffect(() => {
        const intervalId = setInterval(() => {
            setprogress((prev) => (prev < 80 ? prev + 5 : prev));
        }, 400);

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
        }, 2000);

        () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    });
    return (
        <>
            <div className="flex justify-center items-center h-screen p-2 relative">
                <div className="absolute top-0 w-[calc(100%-8px)] left-0 right-0">
                    <span className="absolute py-0.5 rounded-full w-full bg-white/30"></span>
                    <span
                        className={`absolute py-0.5 rounded-full bg-blue-500 transition-all ease-linear duration-700`}
                        style={{
                            width: `${progress}%`,
                        }}
                    ></span>
                </div>

                <div className="flex flex-col justify-center gap-3">
                    <h2 className="text-5xl text-white px-3 font-bloodySunday animate-pulse my-4">
                        MernMedia
                    </h2>
                    <span className="text-whiteAlpha1 text-sm w-full text-center">
                        {message}
                    </span>
                </div>
            </div>
        </>
    );
};

export default LoadingPage;
