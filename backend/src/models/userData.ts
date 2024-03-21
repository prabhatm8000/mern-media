import mongoose from "mongoose";
import { UserDataType } from "../types/types";

const userDataScheme = new mongoose.Schema({
    description: {
        type: String,
    },
    followerCount: {
        type: Number,
    },
    followingCount: {
        type: Number,
    },
    joinedAt: {
        type: Date,
    },
    link1: { type: String },
    link2: { type: String },
    link3: { type: String },
    name: {
        type: String,
    },
    postCount: {
        type: Number,
    },
    profilePictureUrl: {
        type: String,
    },
    userId: {
        type: String,
        required: true,
        unique: true,
    },
});

const UserData = mongoose.model<UserDataType>("UserData", userDataScheme);

export default UserData;
