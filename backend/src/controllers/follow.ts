import { Request, Response } from "express";
import Follow from "../models/follow";
import UserData from "../models/userData";
import Notification from "../models/notifications";
import mongoose, { startSession } from "mongoose";

export const followUnfollow = async (req: Request, res: Response) => {
    const userId: unknown = req.params.userId;
    const followingUserId = userId as mongoose.Types.ObjectId;

    // using sessions and transactions to handle concurrency issue
    const session = await startSession();

    try {
        session.startTransaction();

        const currentUser = await Follow.findOne(
            {
                userId: req.userId,
            },
            null,
            { session }
        );
        const followingUser = await Follow.findOne(
            {
                userId: followingUserId,
            },
            null,
            { session }
        );

        if (!currentUser || !followingUser) {
            throw new Error("User not found");
        }

        const isFollowing = currentUser.followings.includes(followingUserId);

        if (isFollowing) {
            // if already following then unfollow
            await Follow.findOneAndUpdate(
                { _id: req.userId },
                { $pull: { followings: followingUserId } },
                { new: true }
            );
            await Follow.findOneAndUpdate(
                { _id: followingUserId },
                { $pull: { followers: req.userId } },
                { new: true }
            );
        } else {
            // else follow

            currentUser.followings.push(followingUserId);
            followingUser.followers.push(req.userId);
        }

        await currentUser.save({ session });
        await followingUser.save({ session });

        await UserData.findOneAndUpdate(
            { userId: req.userId },
            { $inc: { followingCount: isFollowing ? -1 : 1 } },
            { session }
        );
        await UserData.findOneAndUpdate(
            { userId: followingUserId },
            { $inc: { followerCount: isFollowing ? -1 : 1 } },
            { session }
        );

        res.status(200).json({ doIFollow: !isFollowing });

        // pushing notification for new follower to followingUser
        await Notification.create({
            userId: followingUserId,
            notificationFormUserId: req.userId,
            notificationFor: "started following you.",
            readStatus: false,
        });

        await session.commitTransaction();
        await session.endSession();
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();

        // console.log("error in follow ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const doIFollow = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if (userId === "me") {
        return res.status(200).json();
    }

    try {
        const follow = await Follow.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                },
            },
            {
                $addFields: {
                    doIFollow: {
                        $in: [
                            new mongoose.Types.ObjectId(userId),
                            "$followings",
                        ],
                    },
                },
            },
            {
                $project: {
                    doIFollow: 1,
                },
            },
        ]);

        if (follow.length <= 0) {
            throw new Error("User not found");
        }

        const doIFollow = follow[0].doIFollow;

        res.status(200).json({ doIFollow });
    } catch (error) {
        // console.log("error in doIFollow ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const followers = async (req: Request, res: Response) => {
    const userId =
        (req.query.userId as string) === "me"
            ? req.userId
            : (req.query.userId as string);
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const follow = await Follow.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    let: { followers: "$followers" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$followers"], // Reference the followings array from the outer document
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData",
                                localField: "_id",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        {
                            $unwind: "$userData", // Unwind the array to access individual elements
                        },
                        {
                            $project: {
                                username: 1,
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {
                $unwind: "$userAuthData", // Unwind the array to access individual elements
            },
            {
                $project: {
                    userId: "$userAuthData._id",
                    username: "$userAuthData.username",
                    name: "$userAuthData.name",
                    profilePictureUrl: "$userAuthData.profilePictureUrl",
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(follow);
    } catch (error) {
        // console.log("error while followers ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const searchFollowers = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const userId =
            (req.query.userId as string) === "me"
                ? req.userId
                : (req.query.userId as string);
        // query -> username, name
        const query = req.query.query as string;

        const follow = await Follow.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    let: { followers: "$followers" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$followers"], // Reference the followings array from the outer document
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData",
                                localField: "_id",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        {
                            $unwind: "$userData", // Unwind the array to access individual elements
                        },
                        {
                            $project: {
                                username: 1,
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {
                $unwind: "$userAuthData", // Unwind the array to access individual elements
            },
            {
                $match: {
                    $or: [
                        {
                            "userAuthData.name": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                        {
                            "userAuthData.username": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    userId: "$userAuthData._id",
                    username: "$userAuthData.username",
                    name: "$userAuthData.name",
                    profilePictureUrl: "$userAuthData.profilePictureUrl",
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(follow);
    } catch (error) {
        // console.log("error while searching followers ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const followings = async (req: Request, res: Response) => {
    const userId =
        (req.query.userId as string) === "me"
            ? req.userId
            : (req.query.userId as string);
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const follow = await Follow.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    let: { followings: "$followings" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$followings"], // Reference the followings array from the outer document
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData",
                                localField: "_id",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        {
                            $unwind: "$userData", // Unwind the array to access individual elements
                        },
                        {
                            $project: {
                                username: 1,
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {
                $unwind: "$userAuthData", // Unwind the array to access individual elements
            },
            {
                $project: {
                    userId: "$userAuthData._id",
                    username: "$userAuthData.username",
                    name: "$userAuthData.name",
                    profilePictureUrl: "$userAuthData.profilePictureUrl",
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(follow);
    } catch (error) {
        // console.log("error while followings ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const searchFollowings = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const userId =
            (req.query.userId as string) === "me"
                ? req.userId
                : (req.query.userId as string);
        // query -> username, name
        const query = req.query.query as string;

        const follow = await Follow.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    let: { followings: "$followings" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$followings"], // Reference the followings array from the outer document
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData",
                                localField: "_id",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        {
                            $unwind: "$userData", // Unwind the array to access individual elements
                        },
                        {
                            $project: {
                                username: 1,
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {
                $unwind: "$userAuthData", // Unwind the array to access individual elements
            },
            {
                $match: {
                    $or: [
                        {
                            "userAuthData.name": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                        {
                            "userAuthData.username": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    userId: "$userAuthData._id",
                    username: "$userAuthData.username",
                    name: "$userAuthData.name",
                    profilePictureUrl: "$userAuthData.profilePictureUrl",
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(follow);
    } catch (error) {
        // console.log("error while searching followings ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
