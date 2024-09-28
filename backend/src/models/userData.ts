import mongoose from "mongoose";

const userDataScheme = new mongoose.Schema(
    {
        description: {
            type: String,
        },
        followerCount: {
            type: Number,
            required: true,
        },
        followingCount: {
            type: Number,
            required: true,
        },
        link1: { type: String },
        link2: { type: String },
        link3: { type: String },
        name: {
            type: String,
        },
        postCount: {
            type: Number,
            required: true,
        },
        profilePictureUrl: {
            type: String,
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
