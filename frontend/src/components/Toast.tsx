import { useEffect, useState } from "react";

type ToastProps = {
    message: string;
    type: "SUCCESS" | "ERROR";
    onClose: () => void;
};

const Toast = ({ message, type, onClose }: ToastProps) => {
    const [hide, setHide] = useState<boolean>(false);
    const [bottomBarWidth, setBottomBarWidth] = useState<number>(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setBottomBarWidth((prev) => {
                return prev > 10 ? prev - 11 : 0;
            });
        }, 1000);

        const timerHide = setTimeout(() => {
            clearInterval(interval);
            // call onClose func after 5sec, to auto close
            setHide(true);
        }, 10000);

        const timerClose = setTimeout(() => {
            // call onClose func after 5sec, to auto close
            onClose();
        }, 11000);

        // auto clears the timer
        return () => {
            setBottomBarWidth(100);
            clearInterval(interval);
            clearTimeout(timerHide);
            clearTimeout(timerClose);
        };
    }, [onClose, setHide]);

    return (
        <div
            className={`${
                hide ? "scale-0 translate-y-7" : "scale-100 translate-y-0"
            } transition-transform duration-500 fixed z-50 bottom-0 left-[50%] -translate-x-[50%] w-[300px] my-4 ${
                type === "SUCCESS" ? "bg-blue-950" : "bg-red-950"
            } rounded-md border border-whiteAlpha2`}
        >
            <div className="flex flex-col justify-center items-center gap-1">
                <span className="text-white2 text-center pt-1">{message}</span>
                <span
                    style={{
                        width: `${bottomBarWidth}%`,
                    }}
                    className={`${
                        type === "SUCCESS" ? "bg-blue-600" : "bg-red-600"
                    }  p-0.5 transition-all ease-linear duration-1000`}
                ></span>
            </div>
        </div>
    );
};

export default Toast;
