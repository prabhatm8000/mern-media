import { Request, Response } from "express";
import Notification from "../models/notifications";
import UserData from "../models/userData";
import { NotificationsDataType } from "../types/types";
import UserAuth from "../models/userAuth";

export const getNotifications = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;
    try {
        const notifications = await Notification.aggregate([
            {
                $match: { userId: req.userId },
            },
            {
                $sort: { at: -1 }, // Sort by postedAt
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        const userIds = [];
        for (let index = 0; index < notifications.length; index++) {
            const element = notifications[index];
            userIds.push(element.notificationForm);
        }

        const userDatas = await UserData.find(
            { userId: { $in: userIds } },
            { profilePictureUrl: 1, userId: 1 }
        );

        const userAuths = await UserAuth.find(
            { _id: { $in: userIds } },
            { username: 1 }
        );

        const response: NotificationsDataType[] = [];

        for (let index = 0; index < notifications.length; index++) {
            const element = notifications[index];
            const userData = userDatas.filter(
                (data) => data.userId === element.notificationForm
            )[0];
            const userAuth = userAuths.filter(
                (data) => data.id == element.notificationForm
            )[0];

            response.push({
                notificationFor: element.notificationFor,
                notificationForm: {
                    userId: userData.userId,
                    username: userAuth.username,
                    profilePictureUrl: userData.profilePictureUrl,
                },
                postId: element.postId,
                commentId: element.commentId,
                at: element.at,
                readStatus: element.readStatus,
            });
        }

        res.status(200).json(response);

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
                $match: { userId: req.userId },
            },
            {
                $sort: { at: -1 }, // Sort by postedAt
            },
            {
                $limit: 1,
            },
        ]);

        const response = {
            doIHaveNotifications: false,
        };

        if (notifications.length > 0 && !notifications[0].readStatus) {
            response.doIHaveNotifications = true;
        }

        res.status(200).json({response});
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: "Something went wrong" });
    }
};
