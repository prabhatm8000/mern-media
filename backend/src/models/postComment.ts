import mongoose from "mongoose";
import { PostCommentType } from "../types/types";

const Schema = mongoose.Schema;

const postCommentSchema = new Schema({
    comment: {
        type: String,
        required: true,
    },
    commentedOn: {
        type: Date,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
});

const PostComment = mongoose.model<PostCommentType>(
    "PostComment",
    postCommentSchema
);

export default PostComment;
