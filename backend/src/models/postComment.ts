import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postCommentSchema = new Schema(
    {
        comment: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAuth",
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
    },
    {
        collection: "PostComment",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const PostComment = mongoose.model("PostComment", postCommentSchema);

export default PostComment;
