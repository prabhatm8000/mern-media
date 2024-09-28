import { useEffect, useState } from "react";
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
    const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    return (
        <img
            onError={() => {
                setImgSrc(srcOnError ? srcOnError : defaultProfilePicture);
                console.log("error");
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
