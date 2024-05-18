import { Request, Response } from "express";
import mongoose, { mongo } from "mongoose";
import Chat from "../models/chat";
import ChatBlock from "../models/chatBlock";
import Message from "../models/message";
import UserAuth from "../models/userAuth";
import UserData from "../models/userData";
import { ChatBasicDataType, GroupChatBasicDataType } from "../types/types";
import {
    deleteAttachmentFolder,
    deleteImageByURL,
    uploadAttachmentImages,
    uploadProfilePicture,
} from "../utils/cloudinary";
import { userExistInChat } from "../utils/helperDbOperations";

export const createChat = async (req: Request, res: Response) => {
    try {
        const { name, members } = req.body;

        if (members === undefined || members.length === 0) {
            return res.status(500).json({
                message:
                    "Atleast 2 members are required for individual chat and 3 for group chat",
            });
        }

        const userAuthData = await UserAuth.aggregate([
            {
                $match: {
                    username: {
                        $in: members,
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);

        const userIds = [
            new mongoose.Types.ObjectId(req.userId),
            ...userAuthData.map((data) => {
                return data._id;
            }),
        ];

        const isGroup = userIds.length > 2;
        if (isGroup && name === undefined) {
            return res
                .status(500)
                .json({ message: "Name is required for a group chat" });
        }

        // blocked user check
        if (!isGroup) {
            const blocked = await ChatBlock.findOne({
                userId: new mongoose.Types.ObjectId(req.userId),
            });
            if (blocked && blocked.blockedUserIds.includes(userIds[1])) {
                return res.status(400).json({ message: "User is blocked" });
            }
        }

        const chat = await Chat.find({
            membersUserId: { $in: [userIds] },
        });

        if (chat.length > 0 && !isGroup) {
            return res.status(200).json({ chatId: chat[0]._id.toString() });
        }

        const newChat = await Chat.create({
            creator: isGroup
                ? new mongoose.Types.ObjectId(req.userId)
                : undefined,
            name: isGroup ? name : undefined,
            isGroup,
            membersUserId: userIds,
            lastMessageOn: new Date(),
            groupPictureUrl: isGroup ? "" : undefined,
            description: isGroup ? "" : undefined,
        });

        if (!isGroup) {
            if (!newChat || !newChat.lastMessageOn) {
                throw new Error("chat not created properly!");
            }

            // for the 2nd memeber in the chat
            const userId = userAuthData[0]._id;
            const userData = await UserData.aggregate([
                {
                    $match: {
                        userId,
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
                        _id: 0,
                        username: "$userAuthData.username",
                        name: 1,
                        profilePictureUrl: 1,
                        userId: 1,
                    },
                },
            ]);

            const chatDataBasic: ChatBasicDataType = {
                _id: newChat._id,
                lastMessage: newChat.lastMessage ? newChat.lastMessage : "",
                lastMessageOn: newChat.lastMessageOn,
                userData: userData[0],
            };
            return res.status(201).json(chatDataBasic);
        } else {
            if (
                !newChat ||
                !newChat.lastMessageOn ||
                !newChat.name ||
                !newChat.creator
            ) {
                throw new Error("group chat not created properly!");
            }

            const groupChatDataBasic: GroupChatBasicDataType = {
                _id: newChat._id,
                groupPictureUrl: newChat.groupPictureUrl
                    ? newChat.groupPictureUrl
                    : "",
                name: newChat.name,
                lastMessageOn: newChat.lastMessageOn,
                creator: newChat.creator,
            };
            return res.status(201).json(groupChatDataBasic);
        }
    } catch (error) {
        console.log("error while creating chat", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getChatData = async (req: Request, res: Response) => {
    const chatId = req.params.chatId as string;

    try {
        const chats = await Chat.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(chatId),
                },
            },
            {
                $lookup: {
                    from: "UserData",
                    localField: "membersUserId",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "membersUserId",
                    foreignField: "_id",
                    as: "userAuthData",
                },
            },
            {
                $unwind: "$userData",
            },
            {
                $unwind: "$userAuthData",
            },
            {
                $match: {
                    "userData.userId": {
                        $ne: new mongoose.Types.ObjectId(req.userId),
                    },
                },
            },
            {
                $match: {
                    "userAuthData._id": {
                        $ne: new mongoose.Types.ObjectId(req.userId),
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: {
                        $cond: [{ $eq: ["$isGroup", true] }, "$name", null],
                    },
                    userData: {
                        $cond: [
                            { $eq: ["$isGroup", false] },
                            {
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                                userId: "$userData.userId",
                                username: "$userAuthData.username",
                            },
                            null,
                        ],
                    },
                    lastMessage: 1,
                    createdAt: "$created_at",
                    groupPictureUrl: {
                        $cond: [
                            { $eq: ["$isGroup", true] },
                            "$groupPictureUrl",
                            null,
                        ],
                    },
                    creator: {
                        $cond: [{ $eq: ["$isGroup", true] }, "$creator", null],
                    },
                },
            },
        ]);

        if (chats.length === 0) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.status(200).json(chats[0]);
    } catch (error) {
        console.log("error while getting chat data", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// chat
export const getChats = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const haveChatBlock = await ChatBlock.findOne({
            userId: new mongoose.Types.ObjectId(req.userId),
        });

        if (!haveChatBlock) {
            await ChatBlock.create({
                userId: new mongoose.Types.ObjectId(req.userId),
                blockedUserIds: [],
                noBlockedUsers: 0,
            });
        }

        const chats = await Chat.aggregate([
            {
                $match: {
                    $and: [
                        { isGroup: false },
                        {
                            membersUserId: {
                                $in: [new mongoose.Types.ObjectId(req.userId)],
                            },
                        },
                        { membersUserId: { $size: 2 } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "ChatBlock",
                    pipeline: [
                        {
                            $match: {
                                userId: new mongoose.Types.ObjectId(req.userId),
                            },
                        },
                        { $project: { _id: 0, blockedUserIds: 1 } },
                    ],
                    as: "chatBlock",
                },
            },
            {
                $lookup: {
                    from: "UserData",
                    localField: "membersUserId",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "membersUserId",
                    foreignField: "_id",
                    as: "userAuthData",
                },
            },
            {
                $lookup: {
                    from: "Message",
                    let: { chatId: { $toObjectId: "$_id" } },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$chatId", "$$chatId"] } },
                        },
                        {
                            $sort: {
                                created_at: -1,
                            },
                        },
                        { $limit: 1 },
                        {
                            $project: {
                                content: 1,
                                created_at: 1,
                                readStatus: 1,
                                sender: 1,
                            },
                        },
                    ],
                    as: "message",
                },
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$message.content", 0] },
                    lastMessageOn: {
                        $cond: [
                            { $gt: [{ $size: "$message" }, 0] },
                            { $arrayElemAt: ["$message.created_at", 0] },
                            "$created_at",
                        ],
                    },
                    newMessage: {
                        $cond: [
                            {
                                $eq: [
                                    { $arrayElemAt: ["$message.sender", 0] },
                                    new mongoose.Types.ObjectId(req.userId),
                                ],
                            },
                            false,
                            {
                                $cond: [
                                    {
                                        $arrayElemAt: [
                                            "$message.readStatus",
                                            0,
                                        ],
                                    },
                                    false,
                                    true,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $unwind: "$userData",
            },
            {
                $unwind: "$userAuthData",
            },
            { $unwind: "$lastMessageOn" },
            { $unwind: "$chatBlock" },
            {
                $match: {
                    "userData.userId": {
                        $ne: new mongoose.Types.ObjectId(req.userId),
                    },
                    "userAuthData._id": {
                        $ne: new mongoose.Types.ObjectId(req.userId),
                    },
                    $or: [
                        {
                            $expr: {
                                $eq: ["$chatBlock", null],
                            },
                        },
                        {
                            $expr: {
                                $not: {
                                    $in: [
                                        "$userData.userId",
                                        "$chatBlock.blockedUserIds",
                                    ],
                                },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    userData: {
                        name: "$userData.name",
                        profilePictureUrl: "$userData.profilePictureUrl",
                        userId: "$userData.userId",
                        username: "$userAuthData.username",
                    },
                    newMessage: 1,
                    lastMessage: 1,
                    lastMessageOn: 1,
                    shit: "$chatBlock",
                },
            },
            { $sort: { lastMessageOn: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json(chats);
    } catch (error) {
        console.log("error while getting chat", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const searchChat = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        // query -> username, name
        const query = req.query.query as string;

        const chats = await Chat.aggregate([
            {
                $match: {
                    $and: [
                        { isGroup: false },
                        {
                            membersUserId: {
                                $in: [new mongoose.Types.ObjectId(req.userId)],
                            },
                        },
                        { membersUserId: { $size: 2 } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "ChatBlock",
                    pipeline: [
                        {
                            $match: {
                                userId: new mongoose.Types.ObjectId(req.userId),
                            },
                        },
                        { $project: { _id: 0, blockedUserIds: 1 } },
                    ],
                    as: "chatBlock",
                },
            },
            {
                $lookup: {
                    from: "UserData",
                    localField: "membersUserId",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "membersUserId",
                    foreignField: "_id",
                    as: "userAuthData",
                },
            },
            {
                $lookup: {
                    from: "Message",
                    let: { chatId: { $toObjectId: "$_id" } },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$chatId", "$$chatId"] } },
                        },
                        {
                            $sort: {
                                created_at: -1,
                            },
                        },
                        { $limit: 1 },
                        {
                            $project: {
                                content: 1,
                                created_at: 1,
                            },
                        },
                    ],
                    as: "message",
                },
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$message.content", 0] },
                },
            },
            {
                $addFields: {
                    lastMessageOn: {
                        $cond: [
                            { $gt: [{ $size: "$message" }, 0] },
                            { $arrayElemAt: ["$message.created_at", 0] },
                            "$created_at",
                        ],
                    },
                },
            },
            {
                $unwind: "$userData",
            },
            {
                $unwind: "$userAuthData",
            },
            { $unwind: "$lastMessageOn" },
            { $unwind: "$chatBlock" },
            {
                $match: {
                    "userData.userId": {
                        $ne: new mongoose.Types.ObjectId(req.userId),
                    },
                    "userAuthData._id": {
                        $ne: new mongoose.Types.ObjectId(req.userId),
                    },
                    $expr: {
                        $not: {
                            $in: [
                                "$userData.userId",
                                "$chatBlock.blockedUserIds",
                            ],
                        },
                    },
                    $or: [
                        {
                            "userData.name": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                        {
                            "userAuthData.username": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    userData: {
                        name: "$userData.name",
                        profilePictureUrl: "$userData.profilePictureUrl",
                        userId: "$userData.userId",
                        username: "$userAuthData.username",
                    },
                    lastMessage: 1,
                    lastMessageOn: 1,
                },
            },
            { $sort: { lastMessageOn: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json(chats);
    } catch (error) {
        console.log("error while searching chat ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deleteChat = async (req: Request, res: Response) => {
    const chatId = req.params.chatId as string;

    try {
        const chat = await Chat.findOne({
            _id: new mongoose.Types.ObjectId(chatId),
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        await Chat.deleteOne({ _id: chatId });

        await Message.deleteMany({
            chatId: new mongoose.Types.ObjectId(chatId),
        });

        await deleteAttachmentFolder(chatId);

        res.status(200).json();
    } catch (error) {
        console.log("error while deleting chats", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// group
export const getGroupChats = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const chats = await Chat.aggregate([
            {
                $match: {
                    $and: [
                        { isGroup: true },
                        {
                            membersUserId: {
                                $in: [new mongoose.Types.ObjectId(req.userId)],
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "Message",
                    let: { chatId: { $toObjectId: "$_id" } },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$chatId", "$$chatId"] } },
                        },
                        {
                            $sort: {
                                created_at: -1,
                            },
                        },
                        { $limit: 1 },
                        {
                            $project: {
                                content: 1,
                                created_at: 1,
                            },
                        },
                    ],
                    as: "message",
                },
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$message.content", 0] },
                },
            },
            {
                $addFields: {
                    lastMessageOn: {
                        $cond: [
                            { $gt: [{ $size: "$message" }, 0] },
                            { $arrayElemAt: ["$message.created_at", 0] },
                            "$created_at",
                        ],
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    lastMessage: 1,
                    lastMessageOn: 1,
                    groupPictureUrl: 1,
                    creator: 1,
                },
            },
            { $sort: { lastMessageOn: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json(chats);
    } catch (error) {
        console.log("error while getting group chats", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const searchGroupChat = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        // query -> username, name
        const query = req.query.query as string;

        const chats = await Chat.aggregate([
            {
                $match: {
                    membersUserId: {
                        $in: [new mongoose.Types.ObjectId(req.userId)],
                    },
                    isGroup: true,
                    name: {
                        $regex: `.*${query}.*`,
                        $options: "i",
                    },
                },
            },
            {
                $lookup: {
                    from: "Message",
                    let: { chatId: { $toObjectId: "$_id" } },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$chatId", "$$chatId"] } },
                        },
                        {
                            $sort: {
                                created_at: -1,
                            },
                        },
                        { $limit: 1 },
                        {
                            $project: {
                                content: 1,
                                created_at: 1,
                            },
                        },
                    ],
                    as: "message",
                },
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$message.content", 0] },
                    lastMessageOn: {
                        $cond: [
                            { $gt: [{ $size: "$message" }, 0] },
                            { $arrayElemAt: ["$message.created_at", 0] },
                            "$created_at",
                        ],
                    },
                },
            },
            { $unwind: "$lastMessageOn" },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    lastMessage: 1,
                    lastMessageOn: 1,
                    createdAt: "$created_at",
                    groupPictureUrl: 1,
                },
            },
            { $sort: { lastMessageOn: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json(chats);
    } catch (error) {
        console.log("error while searching group chat ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getGroupDetails = async (req: Request, res: Response) => {
    const chatId = req.params.chatId as string;
    try {
        const chats = await Chat.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(chatId),
                },
            },
            {
                $lookup: {
                    from: "UserData",
                    localField: "creator",
                    foreignField: "userId",
                    as: "creatorUserData",
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creatorUserAuthData",
                },
            },
            {
                $unwind: "$creatorUserData",
            },
            {
                $unwind: "$creatorUserAuthData",
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    creatorUserData: {
                        username: "$creatorUserAuthData.username",
                        name: "$creatorUserData.name",
                        profilePictureUrl: "$creatorUserData.profilePictureUrl",
                        userId: "$creatorUserData.userId",
                    },
                    createdAt: "$created_at",
                    groupPictureUrl: 1,
                    description: 1,
                    noOfMembers: { $size: "$membersUserId" },
                },
            },
        ]);

        if (chats.length === 0) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.status(200).json(chats[0]);
    } catch (error) {
        console.log("error while getting chat details", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getGroupMembersDetail = async (req: Request, res: Response) => {
    const chatId = req.query.chatId as string;
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const memebersUserData = await Chat.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(chatId),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    let: { membersUserId: "$membersUserId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$membersUserId"],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData",
                                localField: "_id",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        {
                            $unwind: "$userData",
                        },
                        {
                            $project: {
                                username: 1,
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {
                $unwind: "$userAuthData",
            },
            {
                $project: {
                    userId: "$userAuthData._id",
                    username: "$userAuthData.username",
                    name: "$userAuthData.name",
                    profilePictureUrl: "$userAuthData.profilePictureUrl",
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(memebersUserData);
    } catch (error) {
        console.log("error while getting chat details", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const editGroupChats = async (req: Request, res: Response) => {
    const chatId = req.params.chatId;

    try {
        const { name, description, groupPictureUrl } = req.body;

        const chatData = await Chat.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(chatId),
                isGroup: true,
                creator: new mongoose.Types.ObjectId(req.userId),
            },
            { name, description },
            { new: false }
        );

        if (!chatData) {
            return res.status(400).json({
                message: "Group chat not found or you'r not the creator",
            });
        }

        const imageFile = req.file as Express.Multer.File;
        // ----delete when----
        // 1. new image is send & there is already an image
        // 2. no image is send & there is no image url in newUserData
        if (
            chatData.groupPictureUrl &&
            ((imageFile && chatData.groupPictureUrl.length > 0) ||
                (!imageFile && groupPictureUrl.length === 0))
        ) {
            await deleteImageByURL(chatData.groupPictureUrl, "PROFILE_PICTURE");
        }

        if (imageFile) {
            const groupPictureUrl = await uploadProfilePicture(imageFile);
            chatData.groupPictureUrl = groupPictureUrl;
            await chatData.save();
        }

        res.status(200).json({ message: "Saved" });
    } catch (error) {
        console.log("error while editing group chatData", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const leaveGroup = async (req: Request, res: Response) => {
    const chatId = req.params.chatId as string;

    try {
        const chat = await Chat.findOne({
            _id: new mongoose.Types.ObjectId(chatId),
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (chat.creator?.toString() === req.userId.toString()) {
            return res
                .status(500)
                .json({ message: "Creator can't leave the group" });
        }

        if (
            !chat.membersUserId.includes(
                new mongoose.Types.ObjectId(req.userId)
            )
        ) {
            return res.status(500).json({ message: "Not a member" });
        }

        await Chat.findOneAndUpdate(
            { _id: chatId },
            {
                $pull: {
                    membersUserId: new mongoose.Types.ObjectId(req.userId),
                },
            }
        );

        res.status(200).json();
    } catch (error) {
        console.log("error while removing member to group chats", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const addMembers = async (req: Request, res: Response) => {
    const chatId = req.params.chatId as string;

    try {
        const { members } = req.body;

        if (members === undefined || members.length === 0) {
            return res.status(500).json({
                message:
                    "Atleast 2 members are required for individual chat and 3 for group chat",
            });
        }

        const chat = await Chat.findOne({
            _id: new mongoose.Types.ObjectId(chatId),
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (chat.creator?.toString() !== req.userId.toString()) {
            return res.status(500).json({ message: "You'r not the creator" });
        }

        const userAuthData = await UserAuth.aggregate([
            {
                $match: {
                    username: {
                        $in: members,
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);

        const userIds = [
            ...userAuthData.filter((data) => {
                if (!chat.membersUserId.includes(data._id.toString()))
                    return data._id;
            }),
        ];

        await Chat.updateOne(
            { _id: chatId },
            { $push: { membersUserId: { $each: userIds } } }
        );

        res.status(200).json();
    } catch (error) {
        console.log("error while adding member to group chats", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const removeMember = async (req: Request, res: Response) => {
    const chatId = req.params.chatId as string;

    try {
        const userId = req.query.userId as string;

        const chat = await Chat.findOne({
            _id: new mongoose.Types.ObjectId(chatId),
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (chat.creator?.toString() !== req.userId.toString()) {
            return res.status(500).json({ message: "You'r not the creator" });
        }

        if (!chat.membersUserId.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(500).json({ message: "Not a member" });
        }

        await Chat.findOneAndUpdate(
            { _id: chatId },
            { $pull: { membersUserId: new mongoose.Types.ObjectId(userId) } }
        );

        res.status(200).json();
    } catch (error) {
        console.log("error while removing member to group chats", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const searchMember = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page ? (req.query.page as string) : "1");
    const limit = parseInt(req.query.limit ? (req.query.limit as string) : "7");
    const skip = (page - 1) * limit;

    try {
        const chatId = req.params.chatId as string;
        const query = req.query.query as string;

        const members = await Chat.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(chatId),
                    isGroup: true,
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    let: {
                        membersUserId: "$membersUserId",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$membersUserId"],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData",
                                localField: "_id",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        { $unwind: "$userData" },
                        {
                            $match: {
                                $or: [
                                    {
                                        username: {
                                            $regex: `.*${query}.*`,
                                            $options: "i",
                                        },
                                    },
                                    {
                                        "userData.name": {
                                            $regex: `.*${query}.*`,
                                            $options: "i",
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $project: {
                                username: 1,
                                userId: "$userData.userId",
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {
                $lookup: {
                    from: "UserData",
                    localField: "membersUserId",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            { $unwind: "$userAuthData" },
            {
                $match: {
                    $or: [
                        {
                            "userAuthData.username": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                        {
                            "userData.name": {
                                $regex: `.*${query}.*`,
                                $options: "i",
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    userId: "$userAuthData._id",
                    username: "$userAuthData.username",
                    name: "$userAuthData.name",
                    profilePictureUrl: "$userAuthData.profilePictureUrl",
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(members);
    } catch (error) {
        console.log("error while searching members ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deleteGroupChats = async (req: Request, res: Response) => {
    const chatId = req.params.chatId as string;

    try {
        const chat = await Chat.findOne({
            _id: new mongoose.Types.ObjectId(chatId),
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (chat.creator && chat.creator.toString() !== req.userId.toString()) {
            return res.status(401).json({ message: "You'r not a authorized" });
        }

        await Chat.deleteOne({ _id: chatId });

        await Message.deleteMany({
            chatId: new mongoose.Types.ObjectId(chatId),
        });

        await deleteAttachmentFolder(chatId);

        res.status(200).json();
    } catch (error) {
        console.log("error while deleting group chats", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// block
export const blockUnblockUser = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    try {
        const blocked = await ChatBlock.findOne({
            userId: new mongoose.Types.ObjectId(req.userId),
        });

        if (!blocked) {
            // create if not found
            await ChatBlock.create({
                userId: new mongoose.Types.ObjectId(req.userId),
                blockedUserIds: [userId],
                noBlockedUsers: 1,
            });
        } else {
            await ChatBlock.updateOne(
                {
                    userId: new mongoose.Types.ObjectId(req.userId),
                },
                [
                    {
                        $set: {
                            blockedUserIds: {
                                $cond: {
                                    if: {
                                        $in: [
                                            new mongoose.Types.ObjectId(userId),
                                            "$blockedUserIds",
                                        ],
                                    },
                                    then: {
                                        $setDifference: [
                                            "$blockedUserIds",
                                            [
                                                new mongoose.Types.ObjectId(
                                                    userId
                                                ),
                                            ],
                                        ],
                                    },
                                    else: {
                                        $concatArrays: [
                                            "$blockedUserIds",
                                            [
                                                new mongoose.Types.ObjectId(
                                                    userId
                                                ),
                                            ],
                                        ],
                                    },
                                },
                            },
                            noBlockedUsers: {
                                $cond: {
                                    if: {
                                        $in: [
                                            new mongoose.Types.ObjectId(userId),
                                            "$blockedUserIds",
                                        ],
                                    },
                                    then: { $subtract: ["$noBlockedUsers", 1] },
                                    else: { $add: ["$noBlockedUsers", 1] },
                                },
                            },
                        },
                    },
                ]
            );
        }

        res.status(200).json({ message: "blocked" });
    } catch (error) {
        console.log("error while blocking user", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getBlockedList = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "0");
    const skip = (page - 1) * limit;

    try {
        const blockedList = await ChatBlock.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
            {
                $lookup: {
                    from: "UserAuth",
                    let: { blockedUserIds: "$blockedUserIds" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$blockedUserIds"], // Reference the followings array from the outer document
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData",
                                localField: "_id",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        {
                            $unwind: "$userData", // Unwind the array to access individual elements
                        },
                        {
                            $project: {
                                userId: "$userData.userId",
                                username: 1,
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                    ],
                    as: "userAuthData",
                },
            },
            {
                $project: {
                    blockedUserList: "$userAuthData",
                    noBlockedUsers: 1,
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        if (blockedList.length > 0) {
            res.status(200).json(blockedList[0]);
        } else {
            res.status(500).json({ message: "Something went wrong" });
        }
    } catch (error) {
        console.log("error while getting blocked user", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// messages
export const getMessages = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const skip = parseInt(req.query.skip ? req.query.skip.toString() : "0");
    try {
        const chatId = req.query.chatId as string;

        if (chatId === undefined) {
            return res.status(404).json({
                message: "Chat not found",
            });
        }

        const isValid = await userExistInChat(chatId, req.userId.toString());
        if (!isValid) {
            return res.status(401).json({
                message: "You'r not a member",
            });
        }

        const messages = await Message.aggregate([
            {
                // get chatData
                $lookup: {
                    from: "Chat",
                    let: { chatId: { $toObjectId: chatId } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$chatId"] }],
                                },
                            },
                        },
                        { $project: { _id: 0, membersUserId: 1, isGroup: 1 } },
                    ],
                    as: "chatData",
                },
            },
            { $unwind: "$chatData" },
            {
                // getting blockedUserIds
                $lookup: {
                    from: "ChatBlock",
                    let: { userId: { $toObjectId: req.userId } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$userId", "$$userId"],
                                },
                            },
                        },
                        { $project: { _id: 0, blockedUserIds: 1 } },
                    ],
                    as: "chatBlock",
                },
            },
            { $unwind: "$chatBlock" },
            {
                $addFields: {
                    otherMember: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$chatData.membersUserId",
                                    cond: {
                                        $ne: [
                                            "$$this",
                                            new mongoose.Types.ObjectId(
                                                req.userId
                                            ),
                                        ],
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $addFields: {
                    isBlocked: {
                        $in: ["$otherMember", "$chatBlock.blockedUserIds"],
                    },
                    isGroup: "$chatData.isGroup",
                },
            },
            {
                $match: {
                    $or: [{ isGroup: true }, { isBlocked: false }],
                },
            },
            {
                $match: {
                    chatId: new mongoose.Types.ObjectId(chatId),
                },
            },
            {
                $lookup: {
                    from: "UserAuth",
                    localField: "sender",
                    foreignField: "_id",
                    as: "userAuthData",
                },
            },
            {
                $lookup: {
                    from: "UserData",
                    localField: "sender",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            { $unwind: "$userAuthData" },
            { $unwind: "$userData" },
            {
                $project: {
                    chatId: 1,
                    sender: 1,
                    content: 1,
                    attachments: 1,
                    readStatus: 1,
                    sentAt: "$created_at",
                    senderUserData: {
                        username: "$userAuthData.username",
                        userId: "$userData.userId",
                        profilePictureUrl: "$userData.profilePictureUrl",
                        name: "$userData.name",
                    },
                    shit: "$isGroup",
                },
            },
            { $sort: { sentAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json(messages);

        await Message.updateMany(
            {
                chatId: new mongoose.Types.ObjectId(chatId),
                sender: {
                    $nin: [new mongoose.Types.ObjectId(req.userId)],
                },
            },
            { readStatus: true }
        );
    } catch (error) {
        console.log("error while getting messages", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const uploadAttachments = async (req: Request, res: Response) => {
    try {
        const chatId = req.params.chatId as string;
        const imageFiles = req.files as Express.Multer.File[];
        // upload images to cloudinary and adding imageUrls
        if (imageFiles && imageFiles.length > 0) {
            const imageUrls = await uploadAttachmentImages(imageFiles, chatId);
            return res.status(200).json({ imageUrls });
        }
        res.status(400).json({ message: "Atleast on image file is required" });
    } catch (error) {
        console.log("error while uploading attachments", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
