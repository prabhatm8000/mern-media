import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { FaXmark } from "react-icons/fa6";
import { TiTick } from "react-icons/ti";

interface ImageCropperProps {
    image: string;
    ratioX: number;
    ratioY: number;
    onCropDone: (croppedArea: Area) => void;
    onCropCancel: () => void;
}

const ImageCropper = ({
    image,
    ratioX,
    ratioY,
    onCropDone,
    onCropCancel,
}: ImageCropperProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const [croppedArea, setCroppedArea] = useState<Area>();

    const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        if (croppedArea) setCroppedArea(croppedAreaPixels);
    };

    return (
        <div className="z-50 absolute">
            <div className="relative w-full h-full">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={ratioX / ratioY}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    style={{
                        containerStyle: {
                            position: "fixed",
                            left: "calc(50% - 10px)",
                            translate: "-50% 0%",
                            width: "calc(100% - 20px)",
                            height: "100%",
                            maxWidth: "1400px",
                            margin: "0 10px",
                            backdropFilter: "blur(2.5px)",
                        },
                    }}
                />
            </div>

            <div className="fixed bottom-20 left-[50%] translate-x-[-50%] flex gap-5">
                <button
                    className="bg-green-700 p-1 rounded-full text-3xl"
                    onClick={() => {
                        if (croppedArea) onCropDone(croppedArea);
                        onCropCancel();
                    }}
                >
                    <TiTick />
                </button>
                <button
                    className="bg-red-700 p-1 rounded-full text-3xl"
                    onClick={() => {
                        onCropCancel();
                    }}
                >
                    <FaXmark />
                </button>
            </div>
        </div>
    );
};

export default ImageCropper;
