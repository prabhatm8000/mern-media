import mongoose from "mongoose";
import { Socket } from "socket.io";

export type UserAuthType = {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
};

export type UserAuthData = {
    username: string;
    password: string;
};

export type UserDataBasicType = {
    name: string;
    profilePictureUrl: string;
    userId: mongoose.Types.ObjectId;
    username: string | undefined;
};

export type UserDataType = {
    _id: mongoose.Types.ObjectId;
    description: string;
    followerCount: number;
    followingCount: number;
    joinedAt: Date;
    link1: string;
    link2: string;
    link3: string;
    name: string;
    postCount: number;
    profilePictureUrl: string;
    userId: mongoose.Types.ObjectId;
    username: string | undefined;
};

export type FollowType = {
    followers: mongoose.Types.Array<mongoose.Types.ObjectId>;
    followings: mongoose.Types.Array<mongoose.Types.ObjectId>;
    userId: mongoose.Types.ObjectId;
};

export type PostType = {
    _id: mongoose.Types.ObjectId;
    title: string;
    caption: string;
    imageUrls: string[];
    likes: mongoose.Types.Array<mongoose.Types.ObjectId> | undefined;
    likeCount: number;
    commentCount: number;
    userId: mongoose.Types.ObjectId;
    postedAt: Date;
    name: string | undefined;
    username: string | undefined;
    profilePictureUrl: string | undefined;
    doILike: boolean | undefined;
};

export type PostCommentType = {
    comment: string;
    commentedAt: Date;
    userId: mongoose.Types.ObjectId;
    postId: string;
};

export type PostCommentUserDataType = {
    _id: mongoose.Types.ObjectId;
    comment: string;
    commentedAt: Date;
    username: string;
    profilePictureUrl: string;
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
};

export type NotificationsDataType = {
    notificationFor: string;
    notificationFrom: {
        userId: mongoose.Types.ObjectId;
        username: string;
        profilePictureUrl: string;
    };
    postId: mongoose.Types.ObjectId | undefined;
    commentId: mongoose.Types.ObjectId | undefined;
    at: Date;
    readStatus: boolean;
};

export type ChatBasicDataType = {
    _id: mongoose.Types.ObjectId;
    userData: UserDataBasicType;
    newMessage?: boolean;
    lastMessage?: string;
    lastMessageOn: Date;
};

export type GroupChatBasicDataType = {
    _id: mongoose.Types.ObjectId;
    name: string;
    lastMessage?: string;
    newMessage?: boolean;
    lastMessageOn: Date;
    groupPictureUrl: string;
    creator: mongoose.Types.ObjectId;
};

export type GroupChatFullDataType = {
    _id: mongoose.Types.ObjectId;
    name: string;
    lastMessage?: string;
    lastMessageOn: Date;
    groupPictureUrl: string;
    creator: mongoose.Types.ObjectId;
    creatorUserData: UserDataBasicType;
    description: string;
    noOfMembers: number;
};

export type GroupChatDataFormType = {
    _id: mongoose.Types.ObjectId;
    name: string;
    lastMessage?: string;
    lastMessageOn: Date;
    groupPictureUrl: string;
    creator: mongoose.Types.ObjectId;
    description: string;
    groupPicture: FileList;
};

export type MessageType = {
    _id: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    attachments?: Array<string>;
    readStatus: boolean;
    sentAt: Date;
    senderUserData: UserDataBasicType;
};

export class CtkSocket extends Socket {
    // Define the additional property userId
    userId?: mongoose.Types.ObjectId;
    chatId?: mongoose.Types.ObjectId;
}
