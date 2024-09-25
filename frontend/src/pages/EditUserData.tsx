// react
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillDelete } from "react-icons/ai";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";

// api
import * as apiClient from "../apiClient";

// components
import ImageComponentCropper from "../components/ImageCropper";

// contexts
import { useAppContext } from "../contexts/AppContext";

// lib
import { imageDataUrlToFile } from "../lib/imageDataUrlToFile";

// type
import { Area } from "react-easy-crop";

// image
import { TbCameraPlus } from "react-icons/tb";
import ImageComponent from "../components/Image";
import LoadingCircleSvg from "../components/LoadingCircleSvg";

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

    const { register, handleSubmit, reset, setValue, watch } =
        useForm<UserDataFormType>();

    useEffect(() => {
        reset(userData);
    }, [userData, reset]);

    const { mutate, isLoading } = useMutation(apiClient.editUserData, {
        onSuccess: async () => {
            showToast({
                message: "Changes saved, Profile Updated!",
                type: "SUCCESS",
            });
            navigate("/profile/me");
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
            formData.append("userId", userData.userId.toString());
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

    // image stuff
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

    const onCropCancel = () => {
        setToggleCropWindow(false);
        setProfilePictureShow(watch("profilePictureUrl"));
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
        <div className="pt-14 md:pt-4 overflow-auto flex justify-center h-screen select-none">
            <form
                className="max-w-[600px] w-[calc(100%-20px)] h-fit p-6 flex flex-col gap-3 rounded-lg border border-whiteAlpha2"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
                encType="multipart/form-data"
            >
                <h2 className="text-xl mb-2 pb-2 text-whiteAlpha1 border-b border-whiteAlpha2">
                    Edit Profile
                </h2>

                {toggleCropWindow && (
                    <ImageComponentCropper
                        image={profilePictureShow}
                        ratioX={1}
                        ratioY={1}
                        onCropDone={onCropDone}
                        onCropCancel={onCropCancel}
                    />
                )}

                {/* image select & preview */}
                <div className="flex flex-col justify-center items-center ">
                    <div className="relative rounded-full border m-2">
                        <div className="relative group size-[150px] rounded-full">
                            <ImageComponent
                                src={profilePictureShow}
                                className="h-full w-full object-cover rounded-full opacity-80"
                            />
                        </div>
                        <button
                            onClick={(e) => handleDeleteBtn(e)}
                            title="Delete Picture"
                            className="absolute z-0 bottom-[0%] left-[70%] text-2xl p-1 bg-red-700 rounded-full"
                        >
                            <AiFillDelete />
                        </button>
                        <label
                            title="Delete Picture"
                            className="cursor-pointer"
                        >
                            <div className="absolute z-0 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-2xl p-1 bg-whiteAlpha1 rounded-full">
                                <TbCameraPlus className="text-black2" />
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
                <div className="flex flex-col gap-5 mx-2">
                    {/* name */}
                    <div className="relative">
                        <input
                            type="text"
                            id="nameField"
                            className="block rounded-md px-4 pb-2 pt-6 w-full bg-black1 border border-whiteAlpha2 focus:border-blue-500 appearance-none focus:outline-none peer"
                            placeholder=" "
                            {...register("name")}
                        />
                        <label
                            htmlFor="nameField"
                            className="absolute text-whiteAlpha1 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                        >
                            Name
                        </label>
                    </div>

                    {/* description */}
                    <div className="relative">
                        <textarea
                            id="descriptionField"
                            rows={5}
                            maxLength={MAX_LENGTH_OF_DESCRIPTION}
                            className="block resize-none rounded-md px-4 pb-2 pt-6 w-full bg-black1 border border-whiteAlpha2 focus:border-blue-500 appearance-none focus:outline-none peer"
                            placeholder=" "
                            {...register("description")}
                        />
                        <label
                            htmlFor="descriptionField"
                            className="absolute text-whiteAlpha1 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                        >
                            Description
                        </label>
                        <div className="absolute top-0 right-0 mx-3 my-2 text-whiteAlpha1 text-xs">
                            <span id="current">
                                {numOfLettersInDescription}
                            </span>
                            <span id="maximum">
                                /{MAX_LENGTH_OF_DESCRIPTION}
                            </span>
                        </div>
                    </div>

                    {/* links */}
                    <>
                        <div className="relative">
                            <input
                                type="text"
                                id="link1"
                                className="block rounded-md px-4 pb-2 pt-6 w-full bg-black1 border border-whiteAlpha2 focus:border-blue-500 appearance-none focus:outline-none peer"
                                placeholder=" "
                                {...register("link1")}
                            />
                            <label
                                htmlFor="link1"
                                className="absolute text-whiteAlpha1 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                            >
                                Link 1
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                id="link2"
                                className="block rounded-md px-4 pb-2 pt-6 w-full bg-black1 border border-whiteAlpha2 focus:border-blue-500 appearance-none focus:outline-none peer"
                                placeholder=" "
                                {...register("link2")}
                            />
                            <label
                                htmlFor="link2"
                                className="absolute text-whiteAlpha1 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                            >
                                Link 2
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                id="link3"
                                className="block rounded-md px-4 pb-2 pt-6 w-full bg-black1 border border-whiteAlpha2 focus:border-blue-500 appearance-none focus:outline-none peer"
                                placeholder=" "
                                {...register("link3")}
                            />
                            <label
                                htmlFor="link3"
                                className="absolute text-whiteAlpha1 duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                            >
                                Link 3
                            </label>
                        </div>
                    </>
                </div>

                {/* submit button */}
                <div className="w-full flex justify-center gap-5 items-center pt-4 mt-2 border-t border-whiteAlpha2">
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="font-semibold py-1 px-2 w-[100px] rounded-full border border-whiteAlpha2 shadow-sm hover:shadow-blue-500 hover:bg-blue-600 transition-all delay-75 duration-200"
                    >
                        <span className="flex justify-center items-center gap-1">
                            {isLoading && (
                                <LoadingCircleSvg className="size-5" />
                            )}
                            {isLoading ? "Saving" : "Save"}
                        </span>
                    </button>
                    <Link
                        to={"/profile/me"}
                        className="font-semibold text-center py-1 px-2 w-[100px] rounded-full border border-whiteAlpha2 shadow-sm hover:shadow-red-500 hover:bg-red-900 transition-all delay-75 duration-200"
                    >
                        {/* <AiOutlineClose className="size-7" /> */}
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditUserData;
