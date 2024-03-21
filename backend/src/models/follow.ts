import mongoose from "mongoose";
import { FollowType } from "../types/types";

const followSchema = new mongoose.Schema({
    followers: {
        type: [{ type: String }],
    },
    followings: {
        type: [{ type: String }],
    },
    userId: {
        type: String,
        required: true,
        unique: true,
    },
});

const Follow = mongoose.model<FollowType>("Follow", followSchema);

export default Follow;
