import mongoose from "mongoose";
import Chat from "../models/chat";
import Message from "../models/message";
import UserData from "../models/userData";

export const userExistInChat = async (
    chatId: string,
    userId: string
): Promise<boolean> => {
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        {
            $addFields: {
                userExist: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        "$membersUserId",
                    ],
                },
            },
        },
        {
            $project: {
                userExist: 1,
            },
        },
    ]);

    if (chat.length === 0) throw Error("ChatId not found");

    return chat[0].userExist as boolean;
};

export const addMessageToDb = async (
    chatId: string,
    sender: string,
    content: string,
    readStatus: boolean,
    attachments?: string[]
) => {
    try {
        const message = await Message.create({
            chatId: new mongoose.Types.ObjectId(chatId),
            sender: new mongoose.Types.ObjectId(sender),
            content,
            readStatus,
            attachments,
        });

        const senderUserData = await UserData.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(sender),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userAuthData",
                },
            },
            { $unwind: "$userAuthData" },
            {
                $project: {
                    name: 1,
                    profilePictureUrl: 1,
                    userId: 1,
                    username: "$userAuthData.username",
                },
            },
        ]);

        const res = {
            chatId: message.chatId,
            sender: message.sender,
            content: message.content,
            readStatus: message.readStatus,
            sentAt: message.created_at,
            senderUserData: senderUserData[0],
            attachments: message.attachments
        };

        return res;
    } catch (error) {
        console.log("error while adding message to database", error);
    }
};

export const membersInChat = async (chatId: string): Promise<string[]> => {
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        {
            $project: {
                membersUserId: 1,
                _id: 0,
            },
        },
    ]);

    if (chat.length === 0) throw Error("ChatId not found");

    return chat[0].membersUserId.map((data: mongoose.Types.ObjectId) => {
        return data.toString();
    });
};

export const allMessagesRead = async (chatId: string, userId: string) => {
    await Message.updateMany(
        {
            chatId: new mongoose.Types.ObjectId(chatId),
            sender: {
                $nin: [new mongoose.Types.ObjectId(userId)],
            },
        },
        { readStatus: true }
    );
};
