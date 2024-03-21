import mongoose from "mongoose";
import { PostType } from "../types/types";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    caption: {
        type: String,
    },
    imageUrls: [
        {
            type: String,
        },
    ],
    likes: [
        {
            type: String,
        },
    ],
    likeCount: {
        type: Number,
    },
    commentCount: {
        type: Number,
    },
    userId: {
        type: String,
        required: true,
    },
    postedAt: {
        type: Date,
        required: true,
    },
});

const Post = mongoose.model<PostType>("Post", postSchema);

export default Post;
