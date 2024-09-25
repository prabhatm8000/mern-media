import { useState } from "react";
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";

const ImageComponent = ({
    src,
    className,
    alt,
    title,
    srcOnError,
    onClick,
}: {
    src?: string;
    className?: string;
    srcOnError?: string;
    alt?: string;
    title?: string;
    onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);
    return (
        <img
            onError={() => {
                setImgSrc(srcOnError ? srcOnError : defaultProfilePicture);
            }}
            src={
                !imgSrc ||
                imgSrc === "" ||
                imgSrc === " " ||
                imgSrc === null ||
                imgSrc === "..."
                    ? defaultProfilePicture
                    : imgSrc
            }
            className={className}
            alt={alt}
            title={title}
            onClick={onClick}
        />
    );
};

export default ImageComponent;
