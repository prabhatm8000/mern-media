import { useState } from "react";
import { GoScreenFull } from "react-icons/go";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import PictureInFullScreen from "./PictureInFullScreen";
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";

interface ImageProps {
    urls: string[];
}

const Carousel = ({ urls }: ImageProps) => {
    const [curr, setCurr] = useState<number>(0);

    const prev = () => {
        setCurr((prev) => (prev > 0 ? prev - 1 : 0));
    };

    const next = () => {
        setCurr((prev) =>
            prev < urls.length - 1 ? prev + 1 : urls.length - 1
        );
    };

    // picture in full screen
    const [showInFullScreen, setShowInFullScreen] = useState<string>();

    const handleCloseShowInFullScreen = () => {
        setShowInFullScreen(undefined);
    };

    const handleShowInFullScreen = () => {
        setShowInFullScreen(urls[curr]);
    };

    return (
        <>
            {showInFullScreen && (
                <PictureInFullScreen
                    url={showInFullScreen}
                    onClose={handleCloseShowInFullScreen}
                />
            )}

            <div className="overflow-x-hidden relative select-none">
                <div
                    className={`h-[300px] md:h-[400px] flex items-center transition-transform ease-in-out duration-300`}
                >
                    <img
                        onError={() => {
                            urls[curr] = defaultProfilePicture;
                        }}
                        src={urls[curr]}
                        className="actual-image object-cover w-full h-[300px] md:h-[400px] rounded-lg"
                    />
                    <button
                        className={`absolute z-[11] p-1.5 m-2 text-white3 bg-black1 rounded-full border border-whiteAlpha2 right-0 ${
                            urls.length > 1 ? "bottom-8" : "bottom-0"
                        }`}
                        type="button"
                        onClick={handleShowInFullScreen}
                    >
                        <GoScreenFull className="size-5" />
                    </button>
                </div>

                {urls.length - 1 > 0 && (
                    <>
                        <div className="absolute inset-0 z-10 flex items-center justify-between p-2">
                            <button type="button" onClick={prev}>
                                <MdKeyboardArrowLeft className="size-6 bg-black2 rounded-full border border-whiteAlpha2" />
                            </button>
                            <button type="button" onClick={next}>
                                <MdKeyboardArrowRight className="size-6 bg-black2 rounded-full border border-whiteAlpha2" />
                            </button>
                        </div>

                        <div className="mt-2 right-0 left-0">
                            <div className="flex items-center justify-center gap-2 p-2">
                                {urls.map((_, index) => {
                                    return (
                                        <span
                                            key={index}
                                            className={`transition-all duration-300 bg-white rounded-full ${
                                                curr === index
                                                    ? "size-2 bg-blue-600"
                                                    : "size-1.5 opacity-35"
                                            }`}
                                        ></span>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Carousel;
