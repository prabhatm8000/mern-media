import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import UserAuth from "../models/userAuth";
import UserData from "../models/userData";
import Follow from "../models/follow";

export const signin = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }

    try {
        let user = await UserAuth.findOne({
            username: req.body.username,
        });

        if (user) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // req.body -> {username, password}
        user = new UserAuth(req.body);
        await user.save();

        // init UserData for new user
        const userData = new UserData({
            description: "",
            followerCount: 0,
            followingCount: 0,
            link1: "",
            link2: "",
            link3: "",
            name: "",
            postCount: 0,
            profilePictureUrl: "",
            userId: user._id,
        });
        await userData.save();

        // init Follow for new user
        const follow = new Follow({
            followers: [],
            followings: [],
            userId: user.id,
        });
        await follow.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "3d" }
        );

        // cookie for saving token (automaticaly handled by the browser)
        // httpOnly -> http only cookie that can only be accessed by the server
        // secure -> for https {only for production server}
        // maxAge -> will be similar to expiresIn {in milisecond}
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            // domain: process.env.FRONTEND_URL,
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3days in milesec
        });

        return res.status(200).send({ message: "User signed in" });
    } catch (error) {
        console.log("Error while signin", error);
        res.status(500).send({ message: "Something went wrong" });
    }
};

export const login = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const user = await UserAuth.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid Username" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "3d" }
        );

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            // domain: process.env.FRONTEND_URL,
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3days in milesec,
        });

        return res.status(200).json({ userId: user.id });
    } catch (error) {
        console.log("Error while login", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const logout = async (req: Request, res: Response) => {
    // auth_token will be override and expires at the time of creation
    res.cookie("auth_token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({ message: "Signed out Successful" });
};
