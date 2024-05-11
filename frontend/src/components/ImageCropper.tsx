import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";

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

            <div className="fixed bottom-14 left-[50%] translate-x-[-50%] flex gap-5">
                <button
                    className="bg-blue-600 rounded-full border border-blue-500 p-1 text-lg w-[100px]"
                    onClick={() => {
                        if (croppedArea) onCropDone(croppedArea);
                        onCropCancel();
                    }}
                >
                    Crop
                </button>
                <button
                    className="bg-whiteAlpha2 rounded-full border border-whiteAlpha1 p-1 text-lg w-[100px]"
                    onClick={() => {
                        onCropCancel();
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ImageCropper;
