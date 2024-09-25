import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import type { GroupChatDataFormType } from "../../../backend/src/types/types";
import { imageDataUrlToFile } from "../lib/imageDataUrlToFile";
import type { Area } from "react-easy-crop";
import ImageCropper from "../components/ImageCropper";

// api
import * as apiClient from "../apiClient";

// image
import { TbCameraPlus } from "react-icons/tb";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import defaultGroupPicture from "../statics/images/default-group-picture.svg";
import { AiFillDelete } from "react-icons/ai";

const MAX_LENGTH_OF_DESCRIPTION = 500;

const EditGroupChat = () => {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const { showToast } = useAppContext();

    const [groupPictureShow, setGroupPictureShow] = useState<string>("");
    const [toggleCropWindow, setToggleCropWindow] = useState<boolean>(false);

    const { data: groupChatData } = useQuery("fetchGroupChatDetails", () =>
        apiClient.fetchGroupDetails(chatId as string), {
            refetchOnWindowFocus: false
        }
    );

    const { register, handleSubmit, reset, setValue, watch } =
        useForm<GroupChatDataFormType>();

    useEffect(() => {
        reset(groupChatData);
    }, [groupChatData, reset]);

    const { mutate, isLoading } = useMutation(
        (formData: FormData) =>
            apiClient.editGroupData(chatId as string, formData),
        {
            onSuccess: async () => {
                showToast({
                    message: "Changes saved, Group Updated!",
                    type: "SUCCESS",
                });
                navigate(`/chats/group-chat/${chatId}`);
            },
            onError: (error: Error) => {
                showToast({ message: error.message, type: "ERROR" });
            },
        }
    );

    const handleDeleteBtn = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();
        // if imageUrl not equal to delete image return
        setValue("groupPictureUrl", "");
        setGroupPictureShow("");
    };

    const onSubmit = (groupChatDataForm: GroupChatDataFormType) => {
        const formData = new FormData();

        formData.append("name", groupChatDataForm.name);
        formData.append("description", groupChatDataForm.description);
        formData.append("groupPictureUrl", groupChatDataForm.groupPictureUrl);

        // use cropped image
        if (
            groupChatDataForm.groupPicture &&
            groupChatDataForm.groupPicture.length > 0
        ) {
            const imageFile = imageDataUrlToFile(groupPictureShow);
            const files: File[] = [imageFile];
            const fileList: FileList = {
                item(index: number): File | null {
                    return index < files.length ? files[index] : null;
                },
                ...files,
            };

            formData.append("groupPicture", fileList[0]);
        }

        mutate(formData);
    };

    // image stuff
    useEffect(() => {
        const imageFile = watch("groupPicture");
        if (imageFile && imageFile.length > 0) {
            // when new image is selected open crop window
            setToggleCropWindow((prevValue) => !prevValue);
            const reader = new FileReader();
            reader.readAsDataURL(imageFile[0]);
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setGroupPictureShow(reader.result);
                }
            };
        } else {
            setGroupPictureShow(watch("groupPictureUrl"));
        }
    }, [watch("groupPicture"), watch("groupPictureUrl")]);

    const resizeProfilePicture = (imgCroppedArea: Area) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 400;
        canvas.height = 400;

        let imgObj = new Image();
        imgObj.crossOrigin = "anonymous";
        imgObj.src = groupPictureShow;
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
            setGroupPictureShow(resizedImageData);
        };
    };

    const onCropDone = (croppedArea: Area) => {
        resizeProfilePicture(croppedArea);
    };

    const onCropCancel = () => {
        setToggleCropWindow(false);
        setGroupPictureShow(watch("groupPictureUrl"));
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
                    Edit Group
                </h2>

                {toggleCropWindow && (
                    <ImageCropper
                        image={groupPictureShow}
                        ratioX={1}
                        ratioY={1}
                        onCropDone={onCropDone}
                        onCropCancel={onCropCancel}
                    />
                )}

                {/* image select & preview */}
                <div className="flex flex-col justify-center items-center ">
                    <div className="relative rounded-full border border-whiteAlpha2 hover:border-blue-500/50 m-2">
                        <div className="relative group size-[150px] bg-whiteAlpha2 hover:bg-blue-500/50 rounded-full">
                            <img
                                onError={() => {
                                    setGroupPictureShow(defaultGroupPicture);
                                }}
                                src={
                                    groupPictureShow === ""
                                        ? defaultGroupPicture
                                        : groupPictureShow
                                }
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
                                {...register("groupPicture")}
                            />
                        </label>
                    </div>
                </div>

                {/* form field */}
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
                        to={`/chats/group-chat/${chatId}`}
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

export default EditGroupChat;
