// react
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { BiSolidCamera } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";

// api
import * as apiClient from "../apiClient";

// components
import ImageCropper from "../components/ImageCropper";

// contexts
import { useAppContext } from "../contexts/AppContext";

// lib
import { imageDataUrlToFile } from "../lib/imageDataUrlToFile";

// type
import { Area } from "react-easy-crop";

// image
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";

export type UserDataFormType = {
    description: string;
    link1: string;
    link2: string;
    link3: string;
    name: string;
    profilePicture: FileList;
    profilePictureUrl: string;
};

const MAX_LENGTH_OF_DESCRIPTION = 500;

const EditUserData = () => {
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    const [profilePictureShow, setProfilePictureShow] = useState<string>("");
    const [toggleCropWindow, setToggleCropWindow] = useState<boolean>(false);

    const { data: userData } = useQuery("fetchUserDataById", () =>
        apiClient.fetchUserDataById("me")
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserDataFormType>();

    useEffect(() => {
        reset(userData);
    }, [userData, reset]);

    const { mutate, isLoading } = useMutation(apiClient.editUserDataById, {
        onSuccess: async () => {
            showToast({ message: "Saved", type: "SUCCESS" });
            navigate("/home");
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "ERROR" });
        },
    });

    const handleDeleteBtn = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();
        // if imageUrl not equal to delete image return
        setValue("profilePictureUrl", "");
        setProfilePictureShow("");
    };

    const onSubmit = (userDataForm: UserDataFormType) => {
        const formData = new FormData();

        if (userData) {
            // for edit page
            formData.append("userId", userData.userId);
        }

        formData.append("description", userDataForm.description);
        formData.append("name", userDataForm.name);
        formData.append("link1", userDataForm.link1);
        formData.append("link2", userDataForm.link2);
        formData.append("link3", userDataForm.link3);
        formData.append("profilePictureUrl", userDataForm.profilePictureUrl);

        // use cropped image
        if (
            userDataForm.profilePicture &&
            userDataForm.profilePicture.length > 0
        ) {
            const imageFile = imageDataUrlToFile(profilePictureShow);
            const files: File[] = [imageFile];
            const fileList: FileList = {
                item(index: number): File | null {
                    return index < files.length ? files[index] : null;
                },
                ...files,
            };

            formData.append("profilePicture", fileList[0]);
        }

        mutate(formData);
    };

    useEffect(() => {
        const imageFile = watch("profilePicture");
        if (imageFile && imageFile.length > 0) {
            // when new image is selected open crop window
            setToggleCropWindow((prevValue) => !prevValue);
            const reader = new FileReader();
            reader.readAsDataURL(imageFile[0]);
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setProfilePictureShow(reader.result);
                }
            };
        } else {
            setProfilePictureShow(watch("profilePictureUrl"));
        }
    }, [watch("profilePictureUrl"), watch("profilePicture")]);

    const resizeProfilePicture = (imgCroppedArea: Area) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 400;
        canvas.height = 400;

        let imgObj = new Image();
        imgObj.crossOrigin = "anonymous";
        imgObj.src = profilePictureShow;
        imgObj.onload = () => {
            // Draw the image on the canvas, resizing and cropping
            ctx?.drawImage(
                imgObj,
                imgCroppedArea.x,
                imgCroppedArea.y,
                imgCroppedArea.width,
                imgCroppedArea.height,
                0,
                0,
                400,
                400
            );

            // Convert the canvas content to a data URL
            let resizedImageData = canvas.toDataURL("image/jpeg");
            // after resizing the img -> show the preview & change profilePicture
            setProfilePictureShow(resizedImageData);
        };
    };

    const onCropDone = (croppedArea: Area) => {
        resizeProfilePicture(croppedArea);
    };

    // for length check of description
    const [numOfLettersInDescription, setNumOfLettersInDescription] =
        useState<number>(0);
    useEffect(() => {
        if (watch("description")) {
            const len = watch("description").length;
            setNumOfLettersInDescription(len);
        }
    }, [watch("description")]);

    return (
        <form
            className="flex flex-col gap-5 "
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            encType="multipart/form-data"
        >
            <h2 className="text-3xl font-bold">Edit Profile</h2>

            {toggleCropWindow && (
                <ImageCropper
                    image={profilePictureShow}
                    ratioX={1}
                    ratioY={1}
                    onCropDone={onCropDone}
                    onCropCancel={() =>
                        setToggleCropWindow((prevValue) => !prevValue)
                    }
                />
            )}

            {/* image select & preview */}
            <div className="flex flex-col justify-center items-center">
                <div className="relative">
                    <div className="relative group w-[150px] h-[150px]">
                        <img
                            src={
                                profilePictureShow === ""
                                    ? defaultProfilePicture
                                    : profilePictureShow
                            }
                            className="h-full w-full object-cover rounded-full"
                        />
                    </div>
                    <button
                        onClick={(e) => handleDeleteBtn(e)}
                        className="absolute z-0 top-[0%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-2xl p-1 bg-red-700 rounded-full"
                    >
                        <AiFillDelete />
                    </button>
                    <label>
                        <div className="absolute z-0 bottom-[0%] left-[70%] text-2xl p-1 bg-green-700 rounded-full">
                            <BiSolidCamera />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            {...register("profilePicture")}
                        />
                    </label>
                </div>
            </div>

            {/* form fields */}
            <div className="flex flex-col gap-5">
                <label className="text-neutral-200 text-sm font-bold flex-1">
                    Name
                    <input
                        className="bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-2 px-2 font-normal focus:outline-none"
                        type="text"
                        {...register("name")}
                    />
                    {errors.name && (
                        <span className="text-red-500 font-normal">
                            {errors.name.message}
                        </span>
                    )}
                </label>

                <label className="text-neutral-200 text-sm font-bold flex-1">
                    Description
                    <textarea
                        rows={5}
                        maxLength={MAX_LENGTH_OF_DESCRIPTION}
                        className="resize-none bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-1 px-2 font-normal focus:outline-none"
                        {...register("description")}
                    />
                    {errors.description && (
                        <span className="text-red-500 font-normal">
                            {errors.description.message}
                        </span>
                    )}
                    <div className="float-end">
                        <span id="current">{numOfLettersInDescription}</span>
                        <span id="maximum">/{MAX_LENGTH_OF_DESCRIPTION}</span>
                    </div>
                </label>

                <div>
                    <label className="text-neutral-200 text-sm font-bold flex-1">
                        Link 1
                        <input
                            className="bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-2 px-2 font-normal focus:outline-none"
                            type="text"
                            {...register("link1")}
                        />
                    </label>
                    <label className="text-neutral-200 text-sm font-bold flex-1">
                        Link 2
                        <input
                            className="bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-2 px-2 font-normal focus:outline-none"
                            type="text"
                            {...register("link2")}
                        />
                    </label>
                    <label className="text-neutral-200 text-sm font-bold flex-1">
                        Link 3
                        <input
                            className="bg-neutral-800 text-lg border rounded border-neutral-600 w-full py-2 px-2 font-normal focus:outline-none"
                            type="text"
                            {...register("link3")}
                        />
                    </label>
                </div>
            </div>

            {/* submit button */}
            <span className="flex items-center justify-between">
                <button
                    disabled={isLoading}
                    type="submit"
                    className="flex items-center gap-2 px-3 py-1 bg-neutral-600 text-white font-bold text-xl rounded transition ease-in-out delay-150 hover:bg-amber-600 disabled:bg-amber-600 duration-300"
                >
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
                    {isLoading ? "Saving..." : "Save"}
                </button>

                <span className="text-sm">
                    Want to goto your home page?{" "}
                    <Link to={"/home"} className="underline text-blue-300">
                        Home
                    </Link>
                </span>
            </span>
        </form>
    );
};

export default EditUserData;
