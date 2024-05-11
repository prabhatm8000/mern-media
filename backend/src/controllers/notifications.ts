import { Request, Response } from "express";
import Notification from "../models/notifications";
import mongoose from "mongoose";
import Chat from "../models/chat";

export const getNotifications = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;
    try {
        const notifications = await Notification.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.userId) },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "notificationFormUserId",
                    foreignField: "_id",
                    as: "userAuthData",
                },
            },
            {
                $lookup: {
                    from: "UserData",
                    localField: "notificationFormUserId",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            { $unwind: "$userAuthData" },
            { $unwind: "$userData" },
            {
                $addFields: {
                    notificationFrom: {
                        userId: "$userAuthData._id",
                        username: "$userAuthData.username",
                        profilePictureUrl: "$userData.profilePictureUrl",
                    },
                },
            },
            {
                $project: {
                    notificationFor: 1,
                    notificationFrom: 1,
                    postId: 1,
                    commentId: 1,
                    at: "$created_at",
                    readStatus: 1,
                },
            },
            {
                $sort: { at: -1 }, // Sort by time
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(notifications);

        // change readStatus of the notifications which are already fetched.
        await Notification.updateMany(
            { userId: req.userId },
            { readStatus: true }
        );
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
    try {
        await Notification.deleteMany({ userId: req.userId });
        res.status(200).json({ message: "Notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const doIHaveNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.userId) },
            },
            {
                $project: {
                    readStatus: 1,
                },
            },
            {
                $sort: { at: -1 },
            },
            {
                $limit: 1,
            },
        ]);

        const chats = await Chat.aggregate([
            {
                $match: {
                    membersUserId: {
                        $in: [new mongoose.Types.ObjectId(req.userId)],
                    },
                },
            },
            {
                $lookup: {
                    from: "Message",
                    let: { chatId: { $toObjectId: "$_id" } },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$chatId", "$$chatId"] } },
                        },
                        {
                            $sort: {
                                created_at: -1,
                            },
                        },
                        { $limit: 1 },
                        {
                            $project: {
                                readStatus: 1,
                                sender: 1,
                            },
                        },
                    ],
                    as: "message",
                },
            },
            {
                $addFields: {
                    newMessage: {
                        $cond: [
                            {
                                $eq: [
                                    { $arrayElemAt: ["$message.sender", 0] },
                                    new mongoose.Types.ObjectId(req.userId),
                                ],
                            },
                            false,
                            {
                                $cond: [
                                    {
                                        $arrayElemAt: [
                                            "$message.readStatus",
                                            0,
                                        ],
                                    },
                                    false,
                                    true,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $project: {
                    newMessage: 1,
                },
            },
            { $sort: { lastMessageOn: -1 } },
            { $limit: 1 },
        ]);

        const response = {
            doIHaveNotifications:
                notifications.length > 0 ? !notifications[0].readStatus : false,
            doIHaveNewMessage: chats.length > 0 ? chats[0].newMessage : false,
        };

        res.status(200).json({ response });
    } catch (error) {
        console.log("error while do i have notifications", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
