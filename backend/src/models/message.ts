import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAuth",
        },
        content: {
            type: String,
            required: true,
        },
        attachments: {
            type: [{ type: String }],
        },
        readStatus: {
            type: Boolean,
        },
        created_at: {
            type: Date,
        },
    },
    {
        collection: "Message",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
