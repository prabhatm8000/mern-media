import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        notificationFor: {
            type: String,
            required: true,
        },
        notificationFormUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAuth",
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
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PostComment",
        },
        readStatus: {
            type: Boolean,
            required: true,
        },
    },
    {
        collection: "Notification",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
