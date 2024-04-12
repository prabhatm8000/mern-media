import { Request, Response } from "express";
import Follow from "../models/follow";
import UserData from "../models/userData";
import UserAuth from "../models/userAuth";
import { UserDataBasicType } from "../types/types";
import Notification from "../models/notifications";

export const followUnfollow = async (req: Request, res: Response) => {
    const { userId: followingUserId } = req.params;
    try {
        const currentUser = await Follow.findOne({
            userId: req.userId,
        });
        const followingUser = await Follow.findOne({
            userId: followingUserId,
        });

        const index1 = currentUser?.followings.indexOf(
            followingUserId as string
        );
        const index2 = followingUser?.followers.indexOf(req.userId);

        if (index1 !== -1 && index2 !== -1) {
            // if already following then unfollow
            currentUser?.followings.splice(index1 ? (index1 as number) : 0, 1);
            followingUser?.followers.splice(index2 ? (index2 as number) : 0, 1);
            currentUser?.save();
            followingUser?.save();

            await UserData.findOneAndUpdate(
                { userId: req.userId },
                { $inc: { followingCount: -1 } }
            );
            await UserData.findOneAndUpdate(
                { userId: followingUserId },
                { $inc: { followerCount: -1 } }
            );
            return res.status(200).json({ doIFollow: false });
        }

        // else follow
        currentUser?.followings.push(followingUserId as string);
        followingUser?.followers.push(req.userId);
        currentUser?.save();
        followingUser?.save();

        // pushing notification for new follower to followingUser
        await Notification.create({
            userId: followingUserId,
            notificationForm: req.userId,
            notificationFor: "started following you.",
            at: new Date(),
            readStatus: false,
        });

        await UserData.findOneAndUpdate(
            { userId: req.userId },
            { $inc: { followingCount: 1 } }
        );
        await UserData.findOneAndUpdate(
            { userId: followingUserId },
            { $inc: { followerCount: 1 } }
        );
        res.status(200).json({ doIFollow: true });
    } catch (error) {
        console.log("error in follow ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const doIFollow = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const follow = await Follow.findOne({
            userId: req.userId,
        });

        const index = follow?.followings.indexOf(userId);

        if (index !== -1) {
            return res.status(200).json({ doIFollow: true });
        }
        res.status(200).json({ doIFollow: false });
    } catch (error) {
        console.log("error in doIFollow ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const followers = async (req: Request, res: Response) => {
    const userId =
        (req.query.userId as string) === "me" ? req.userId : req.query.userId;
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const follow = await Follow.findOne({ userId: userId });

        if (!follow) {
            return res.status(404).json({ message: "Followers not found" });
        }

        const users = await UserAuth.find(
            { _id: { $in: follow.followers } },
            { _id: 1, username: 1 }
        )
            .skip(skip)
            .limit(limit);

        const userDatas = await UserData.find(
            {
                userId: { $in: users.map((item) => item._id) },
            },
            { name: 1, profilePictureUrl: 1, userId: 1 }
        );

        const response: UserDataBasicType[] = userDatas.map((userData, i) => {
            let username: string = "";

            for (let index = 0; index < users.length; index++) {
                if (users[index]._id.toString() === userData.userId) {
                    username = users[index].username;
                    break;
                }
            }

            return {
                _id: userData._id,
                name: userData.name,
                profilePictureUrl: userData.profilePictureUrl,
                userId: userData.userId,
                username,
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.log("error while search followers ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const followings = async (req: Request, res: Response) => {
    const userId =
        (req.query.userId as string) === "me" ? req.userId : req.query.userId;
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const follow = await Follow.findOne({ userId: userId });

        if (!follow) {
            return res.status(404).json({ message: "Followers not found" });
        }

        const users = await UserAuth.find(
            { _id: { $in: follow.followings } },
            { _id: 1, username: 1 }
        )
            .skip(skip)
            .limit(limit);

        const userDatas = await UserData.find(
            {
                userId: { $in: users.map((item) => item._id) },
            },
            { name: 1, profilePictureUrl: 1, userId: 1 }
        );

        const response: UserDataBasicType[] = userDatas.map((userData, i) => {
            let username: string = "";

            for (let index = 0; index < users.length; index++) {
                if (users[index]._id.toString() === userData.userId) {
                    username = users[index].username;
                    break;
                }
            }

            return {
                _id: userData._id,
                name: userData.name,
                profilePictureUrl: userData.profilePictureUrl,
                userId: userData.userId,
                username,
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.log("error while search followings ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
