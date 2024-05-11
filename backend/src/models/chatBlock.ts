import mongoose from "mongoose";
import { ChatBlockType } from "../../../frontend/src/types/types";

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

const ChatBlock = mongoose.model<ChatBlockType>("ChatBlock", chatBlockSchema);

export default ChatBlock;
