export type UserAuthType = {
    _id: any;
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
    userId: any;
    username: string | undefined;
};

export type UserDataType = {
    _id: any;
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
    userId: any;
    username: string | undefined;
};

export type FollowType = {
    followers: Array<any>;
    followings: Array<any>;
    userId: any;
};

export type PostType = {
    _id: any;
    title: string;
    caption: string;
    imageUrls: string[];
    likes: Array<any> | undefined;
    likeCount: number;
    commentCount: number;
    userId: any;
    postedAt: Date;
    name: string | undefined;
    username: string | undefined;
    profilePictureUrl: string | undefined;
    doILike: boolean | undefined;
};

export type PostCommentType = {
    comment: string;
    commentedAt: Date;
    userId: any;
    postId: string;
};

export type PostCommentUserDataType = {
    _id: any;
    comment: string;
    commentedAt: Date;
    username: string;
    profilePictureUrl: string;
    userId: any;
    postId: any;
};

export type NotificationsDataType = {
    notificationFor: string;
    notificationFrom: {
        userId: any;
        username: string;
        profilePictureUrl: string;
    };
    postId: any | undefined;
    commentId: any | undefined;
    at: Date;
    readStatus: boolean;
};

export type ChatBasicDataType = {
    _id: any;
    userData: UserDataBasicType;
    newMessage?: boolean;
    lastMessage?: string;
    lastMessageOn: Date;
};

export type GroupChatBasicDataType = {
    _id: any;
    name: string;
    lastMessage?: string;
    newMessage?: boolean;
    lastMessageOn: Date;
    groupPictureUrl: string;
    creator: any;
};

export type GroupChatFullDataType = {
    _id: any;
    name: string;
    lastMessage?: string;
    lastMessageOn: Date;
    groupPictureUrl: string;
    creator: any;
    creatorUserData: UserDataBasicType;
    description: string;
    noOfMembers: number;
};

export type GroupChatDataFormType = {
    _id: any;
    name: string;
    lastMessage?: string;
    lastMessageOn: Date;
    groupPictureUrl: string;
    creator: any;
    description: string;
    groupPicture: FileList;
};

export type MessageType = {
    _id: any;
    chatId: any;
    sender: any;
    content: string;
    attachments?: Array<string>;
    readStatus: boolean;
    sentAt: Date;
    senderUserData: UserDataBasicType;
};
