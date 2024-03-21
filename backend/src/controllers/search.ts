import { Request, Response } from "express";
import UserData from "../models/userData";
import UserAuth from "../models/userAuth";
import { UserDataBasicType, UserDataType } from "../types/types";

export const searchAutoComplete = async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;

        const users = await UserAuth.find(
            {
                username: new RegExp(query, "i"),
            },
            { username: 1, _id: 0 }
        ).limit(7);

        res.status(200).json(users);
    } catch (error) {
        console.log("error while search autocomplete ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const searchUser = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const query = req.query.query as string;

        const userIds = await UserAuth.find(
            { username: new RegExp(query, "i") },
            { _id: 1, username: 1 }
        )
            .skip(skip)
            .limit(limit);

        const userDatas = await UserData.find(
            {
                userId: { $in: userIds.map((item) => item._id) },
            },
            { name: 1, profilePictureUrl: 1, userId: 1 }
        );

        const response: UserDataBasicType[] = userDatas.map((userData, i) => {
            let username: string = "";

            for (let index = 0; index < userIds.length; index++) {
                if (userIds[index]._id.toString() === userData.userId) {
                    username = userIds[index].username;
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
        console.log("error while search autocomplete ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
