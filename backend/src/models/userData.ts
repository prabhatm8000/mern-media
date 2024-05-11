import mongoose from "mongoose";

const userDataScheme = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
        followerCount: {
            type: Number,
            required: true,
        },
        followingCount: {
            type: Number,
            required: true,
        },
        link1: { type: String, required: true },
        link2: { type: String, required: true },
        link3: { type: String, required: true },
        name: {
            type: String,
            required: true,
        },
        postCount: {
            type: Number,
            required: true,
        },
        profilePictureUrl: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAuth",
            required: true,
            unique: true,
        },
    },
    {
        collection: "UserData",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const UserData = mongoose.model("UserData", userDataScheme);

export default UserData;
