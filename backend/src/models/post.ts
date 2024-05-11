import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
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
                type: mongoose.Schema.Types.ObjectId,
                ref: "UserAuth",
            },
        ],
        likeCount: {
            type: Number,
            required: true,
        },
        commentCount: {
            type: Number,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAuth",
            required: true,
        },
    },
    {
        collection: "Post",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
