// react
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

// api
import * as apiClient from "../apiClient";

// context
import { CiImageOn } from "react-icons/ci";
import { useAppContext } from "../contexts/AppContext";
import { compressImages } from "../lib/compressImages";
import { useHorizontalScroll } from "../lib/horizontalScroll";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import Carousel from "../components/Carousel";

const MAX_LENGTH_OF_TITLE = 150;
const MAX_LENGTH_OF_CAPTION = 500;

// change backend too (currently at 5) anything less than or equal to that is fine
const MAX_LENGTH_OF_IMAGES = 5;

export type PostFormType = {
    title: string;
    caption: string;
    imageUrls: string[];
    imageFiles: FileList;
};

const AddPost = () => {
    const navigate = useNavigate();
    const { showToast } = useAppContext();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PostFormType>();

    // images preview
    const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
    useEffect(() => {
        const imageFiles = watch("imageFiles");
        if (imageFiles && imageFiles.length > 0) {
            // when new image is selected open crop window
            setImageDataUrls([]);
            for (let index = 0; index < imageFiles.length; index++) {
                const reader = new FileReader();
                reader.readAsDataURL(imageFiles[index]);
                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        setImageDataUrls((prev) => [
                            ...prev,
                            reader.result as string,
                        ]);
                    }
                };
            }
        }
    }, [watch("imageFiles")]);

    const scrollRef = useHorizontalScroll();

    // form submit and mutaion
    // #region
    const { mutate, isLoading } = useMutation(apiClient.addPost, {
        onSuccess: async () => {
            showToast({ message: "Posted", type: "SUCCESS" });
            navigate("/profile/me");
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "ERROR" });
        },
    });

    const onSubmit = async (postDataForm: PostFormType) => {
        if (
            postDataForm.caption.trim().length === 0 &&
            postDataForm.title.trim().length === 0 &&
            postDataForm.imageFiles.length === 0
        ) {
            showToast({
                type: "ERROR",
                message: "Atleast one of the above field in required!",
            });
        }

        const formData = new FormData();

        formData.append("title", postDataForm.title);
        formData.append("caption", postDataForm.caption);

        // image Compression
        const compressedImageFiles = await compressImages(
            postDataForm.imageFiles
        );

        // FileList not allows forEach,
        // so, making array out of FileList
        Array.from(compressedImageFiles).forEach((item) => {
            formData.append(`imageFiles`, item);
        });

        mutate(formData);
    };
    // #endregion

    // length check
    // #region
    // for title
    const [numOfLettersInTitle, setNumOfLettersInTitle] = useState<number>(0);
    useEffect(() => {
        if (watch("title")) {
            const len = watch("title").length;
            setNumOfLettersInTitle(len);
        }
    }, [watch("title")]);

    // for caption
    const [numOfLettersInCaption, setNumOfLettersInCaption] =
        useState<number>(0);
    useEffect(() => {
        if (watch("caption")) {
            const len = watch("caption").length;
            setNumOfLettersInCaption(len);
        }
    }, [watch("caption")]);

    // for images
    const [numOfLettersInImages, setNumOfLettersInImages] = useState<number>(0);
    useEffect(() => {
        if (watch("imageFiles")) {
            const len = watch("imageFiles").length;
            setNumOfLettersInImages(len);
        }
    }, [watch("imageFiles")]);
    // #endregion
    return (
        <div className="pt-16 md:pt-0 flex justify-center py-2 md:py-4 h-screen select-none overflow-hidden">
            <form
                className="max-w-[600px] w-[calc(100%-20px)] h-fit max-h-[calc(100%-40px)] p-6 flex flex-col gap-3 rounded-lg border border-whiteAlpha2 overflow-y-auto"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
                encType="multipart/form-data"
            >
                <h2 className="text-xl mb-2 pb-2 text-whiteAlpha1 border-b border-whiteAlpha2">
                    What is happening?!
                </h2>

                {/* form feilds */}
                <div className="flex flex-col gap-5 mx-2">
                    {/* title */}
                    <div className="relative">
                        <textarea
                            id="titleField"
                            rows={3}
                            maxLength={MAX_LENGTH_OF_TITLE}
                            className="block resize-none rounded-md px-4 pb-2 pt-6 w-full bg-black1 border border-whiteAlpha2 focus:border-blue-500 appearance-none focus:outline-none peer"
                            placeholder=" "
                            {...register("title")}
                        />
                        <label
                            htmlFor="titleField"
                            className="absolute text-whiteAlpha1 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                        >
                            Title
                        </label>
                        <div className="absolute top-0 right-0 mx-3 my-2 text-whiteAlpha1 text-xs">
                            <span id="current">{numOfLettersInTitle}</span>
                            <span id="maximum">/{MAX_LENGTH_OF_TITLE}</span>
                        </div>
                    </div>

                    {/* caption */}
                    <div className="relative">
                        <textarea
                            id="captionField"
                            rows={6}
                            maxLength={MAX_LENGTH_OF_CAPTION}
                            className="block resize-none rounded-md px-4 pb-2 pt-6 w-full bg-black1 border border-whiteAlpha2 focus:border-blue-500 appearance-none focus:outline-none peer"
                            placeholder=" "
                            {...register("caption")}
                        />
                        <label
                            htmlFor="captionField"
                            className="absolute text-whiteAlpha1 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                        >
                            Caption
                        </label>
                        <div className="absolute top-0 right-0 mx-3 my-2 text-whiteAlpha1 text-xs">
                            <span id="current">{numOfLettersInCaption}</span>
                            <span id="maximum">/{MAX_LENGTH_OF_CAPTION}</span>
                        </div>
                    </div>

                    {/* images input */}
                    <input
                        id="postImageInput"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        {...register("imageFiles", {
                            validate: (imageFiles) => {
                                const totalLength = imageFiles.length;
                                if (totalLength > 5) {
                                    return "Cannot be more than 5";
                                } else return true;
                            },
                        })}
                    />

                    <div className="flex justify-between items-center bg-black1 border border-whiteAlpha2 rounded-md px-3 py-2">
                        <label
                            className={`cursor-pointer`}
                            htmlFor="postImageInput"
                        >
                            <CiImageOn className="size-6 text-blue-600 font-poppins-bold" />
                        </label>
                        <div className=" text-whiteAlpha1 text-xs">
                            <span id="current">{numOfLettersInImages}</span>
                            <span id="maximum">/{MAX_LENGTH_OF_IMAGES}</span>
                        </div>
                    </div>

                    {errors.imageFiles && (
                        <span className="text-red-500">
                            {errors.imageFiles.message}
                        </span>
                    )}
                </div>

                {/* image preview */}
                {imageDataUrls.length > 0 && (
                    <div className="size-full mb-4">
                        <Carousel urls={imageDataUrls} />
                    </div>
                )}

                {/* submit button */}
                <div className="w-full flex justify-center gap-5 items-center pt-4 mt-2 border-t border-whiteAlpha2">
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="font-semibold py-1 px-2 w-[100px] rounded-full border border-whiteAlpha2 shadow-sm hover:shadow-blue-500 hover:bg-blue-600 transition-all delay-75 duration-200"
                    >
                        <span className="flex justify-center items-center gap-1">
                            {isLoading && <LoadingCircleSvg className="size-5" />}
                            {isLoading ? "Posting" : "Post"}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPost;
