import mongoose from "mongoose";

const chatBlockSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAuth",
            required: true,
            unique: true,
        },
        blockedUserIds: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserAuth" }],
        },
    },
    { collection: "ChatBlock" }
);

const ChatBlock = mongoose.model("ChatBlock", chatBlockSchema);

export default ChatBlock;
