import { Request, Response } from "express";
import UserAuth from "../models/userAuth";

export const searchAutoComplete = async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;

        const users = await UserAuth.find(
            {
                username: {
                    $regex: `.*${query}.*`,
                    $options: "i",
                },
            },
            { username: 1, _id: 0 }
        ).limit(7);

        res.status(200).json(users);
    } catch (error) {
        // console.log("error while search autocomplete ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const searchUser = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const query = req.query.query as string;

        const result = await UserAuth.aggregate([
            {
                $match: {
                    username: {
                        $regex: `.*${query}.*`,
                        $options: "i",
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
            { $unwind: "$userData" },
            {
                $project: {
                    username: 1,
                    name: "$userData.name",
                    profilePictureUrl: "$userData.profilePictureUrl",
                    userId: "$userData.userId",
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json(result);
    } catch (error) {
        // console.log("error while search ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
