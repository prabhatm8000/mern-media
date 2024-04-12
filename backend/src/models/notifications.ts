import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    notificationFor: {
        type: String,
        required: true,
    },
    notificationForm: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
    },
    commentId: {
        type: String,
    },
    at: {
        type: Date,
        required: true,
    },
    readStatus: {
        type: Boolean,
        required: true,
    },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
