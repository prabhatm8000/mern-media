import { AiOutlineClose } from "react-icons/ai";
import FadeBG from "./FadeBG";
import Image from "./Image";

interface PictureInFullScreenProps {
    url: string;
    onClose: () => void;
}

const PictureInFullScreen = ({ url, onClose }: PictureInFullScreenProps) => {
    return (
        <>
            <FadeBG onClick={onClose} />
            <div
                onClick={onClose}
                className="absolute inset-0 z-[21] flex justify-center items-center overflow-hidden"
            >
                <div
                    className="fixed pt-14 md:pt-4 p-2 max-w-[900px] h-screen"
                    style={{
                        width: "clamp(18.75rem, 5.113636363636365rem + 68.18181818181817vw, 56.25rem)",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-0 m-2 p-1 rounded-full bg-red-900 border border-red-600 text-white2"
                    >
                        <AiOutlineClose className="size-5" />
                    </button>
                    <Image
                        src={url}
                        alt="full-screen-image"
                        className="w-fit h-fit rounded-lg"
                    />
                </div>
            </div>
        </>
    );
};

export default PictureInFullScreen;
