import { Request, Response } from "express";
import UserData from "../models/userData";
import { deleteImageByURL, uploadProfilePicture } from "../utils/cloudinary";
import mongoose from "mongoose";
import { UserDataType } from "../types/types";

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
            await deleteImageByURL(
                userData.profilePictureUrl,
                "PROFILE_PICTURE"
            );
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
    try {
        let userId =
            req.params.userId === "me" ? req.userId : req.params.userId;

        const userData = await UserData.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "userId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                username: 1,
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {$unwind: "$userAuthData"},
            {
                $project: {
                    description: 1,
                    followerCount: 1,
                    followingCount: 1,
                    joinedAt: "$created_at",
                    link1: 1,
                    link2: 1,
                    link3: 1,
                    name: 1,
                    postCount: 1,
                    profilePictureUrl: 1,
                    userId: 1,
                    username: "$userAuthData.username",
                },
            },
        ]);

        if (userData.length <= 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(userData[0]);
    } catch (error) {
        console.log("error while get userData by id", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
