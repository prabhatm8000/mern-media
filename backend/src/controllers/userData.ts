import { Request, Response } from "express";
import { UserDataType } from "../types/types";
import UserData from "../models/userData";
import { deleteImageByURL, uploadProfilePicture } from "../cloudinary";
import UserAuth from "../models/userAuth";

export const editUserData = async (req: Request, res: Response) => {
    try {
        const newUserData: UserDataType = req.body;

        const userData = await UserData.findOneAndUpdate(
            {
                userId: req.userId,
            },
            newUserData,
            { new: false }
        );

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const imageFile = req.file as Express.Multer.File;
        // ----delete when----
        // 1. new image is send & there is already an image
        // 2. no image is send & there is no image url in newUserData
        if (
            (imageFile && userData.profilePictureUrl.length > 0) ||
            (!imageFile && newUserData.profilePictureUrl.length === 0)
        ) {
            await deleteImageByURL(userData.profilePictureUrl, "PROFILE_PICTURE");
        }

        if (imageFile) {
            const profilePictureUrl = await uploadProfilePicture(imageFile);
            userData.profilePictureUrl = profilePictureUrl;
            await userData.save();
        }

        res.status(200).json({ message: "Saved" });
    } catch (error) {
        console.log("error while editing user data", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getUserDataById = async (req: Request, res: Response) => {
    let userId = req.params.userId as string;

    try {
        // if userId is equal to me send the current userData
        if (userId === "me") {
            userId = req.userId;
        }

        const userData = await UserData.findOne({ userId: userId });

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = await UserAuth.findById(userData.userId);

        const response: UserDataType = {
            _id: userData._id,
            description: userData.description,
            followerCount: userData.followerCount,
            followingCount: userData.followingCount,
            joinedAt: userData.joinedAt,
            link1: userData.link1,
            link2: userData.link2,
            link3: userData.link3,
            name: userData.name,
            postCount: userData.postCount,
            profilePictureUrl: userData.profilePictureUrl,
            userId: userData.userId,
            username: userData.username,
        };

        if (user) {
            response.username = user?.username;
        }

        res.status(200).json(response);
    } catch (error) {
        console.log("error while get userData by id", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
