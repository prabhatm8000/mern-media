// react
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { BiImageAdd, BiSolidSend } from "react-icons/bi";

// api
import * as apiClient from "../apiClient";

// context
import { useAppContext } from "../contexts/AppContext";
import { useHorizontalScroll } from "../lib/horizontalScroll";
import { compressImages } from "../lib/compressImages";

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
        <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            encType="multipart/form-data"
        >
            <h2 className="text-3xl font-bold">Add Post</h2>

            {/* form feilds */}
            <div className="flex flex-col gap-2">
                <label className="text-neutral-200 text-sm font-bold flex-1">
                    Title
                    <textarea
                        rows={3}
                        maxLength={MAX_LENGTH_OF_TITLE}
                        className="resize-none bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-1 px-2 font-normal focus:outline-none"
                        {...register("title")}
                    />
                    {errors.title && (
                        <span className="text-red-500 font-normal">
                            {errors.title.message}
                        </span>
                    )}
                    <div className="float-end">
                        <span id="current">{numOfLettersInTitle}</span>
                        <span id="maximum">/{MAX_LENGTH_OF_TITLE}</span>
                    </div>
                </label>

                <label className="text-neutral-200 text-sm font-bold flex-1">
                    Caption
                    <textarea
                        rows={10}
                        maxLength={MAX_LENGTH_OF_CAPTION}
                        className="resize-none bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-1 px-2 font-normal focus:outline-none"
                        {...register("caption")}
                    />
                    {errors.caption && (
                        <span className="text-red-500 font-normal">
                            {errors.caption.message}
                        </span>
                    )}
                    <div className="float-end">
                        <span id="current">{numOfLettersInCaption}</span>
                        <span id="maximum">/{MAX_LENGTH_OF_CAPTION}</span>
                    </div>
                </label>
            </div>

            {/* image input & preview */}
            <div className="relative flex flex-col justify-center items-center">
                <span className="text-neutral-200 text-sm font-bold w-full">
                    Images
                </span>

                <div
                    ref={scrollRef}
                    className="relative bg-neutral-800 border rounded border-neutral-600 flex items-center gap-4 overflow-x-auto h-[400px] w-full"
                >
                    {imageDataUrls.map((imageFile, i) => {
                        return (
                            <img
                                key={i}
                                src={imageFile}
                                className="h-full object-cover rounded-md"
                            />
                        );
                    })}
                </div>

                <label
                    className={`absolute ${
                        watch("imageFiles")?.length > 0
                            ? "bottom-7 right-5"
                            : ""
                    }`}
                >
                    {watch("imageFiles")?.length < 5 && (
                        <div
                            className={`text-3xl cursor-pointer bg-neutral-500 p-2 rounded-full hover:scale-110 transition-all delay-75 duration-300`}
                        >
                            <BiImageAdd className=" translate-x-[2px] translate-y-[2px]" />
                        </div>
                    )}
                    <input
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
                </label>
                <div className="text-right w-full font-bold text-sm">
                    <span id="current">{numOfLettersInImages}</span>
                    <span id="maximum">/{MAX_LENGTH_OF_IMAGES}</span>
                </div>

                {errors.imageFiles && (
                    <span className="text-red-500">
                        {errors.imageFiles.message}
                    </span>
                )}
            </div>

            {/* submit button */}
            <span className="flex items-center justify-between">
                <button
                    disabled={isLoading}
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1 bg-neutral-600 text-white font-bold text-xl rounded transition ease-in-out delay-150 hover:bg-amber-600 disabled:bg-amber-600 duration-300"
                >
                    {isLoading ? "Posting..." : "Post"}
                    {!isLoading && <BiSolidSend />}
                    {isLoading && (
                        <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-10"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    )}
                </button>
            </span>
        </form>
    );
};

export default AddPost;
