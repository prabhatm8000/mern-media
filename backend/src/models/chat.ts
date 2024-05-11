import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        membersUserId: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserAuth" }],
        },
        isGroup: {
            type: Boolean,
        },
        name: {
            type: String,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
        },
        lastMessage: {
            type: String,
        },
        lastMessageOn: {
            type: Date,
        },
        groupPictureUrl: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    {
        collection: "Chat",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
