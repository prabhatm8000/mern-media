export type UserAuthType = {
    _id: string;
    username: string;
    password: string;
};

export type UserDataBasicType = {
    _id: string;
    name: string;
    profilePictureUrl: string;
    userId: string;
    username: string | undefined;
};

export type UserDataType = {
    _id: string;
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
    userId: string;
    username: string | undefined;
};

export type FollowType = {
    followers: string[];
    followings: string[];
    userId: string;
};

export type PostType = {
    _id: string;
    title: string;
    caption: string;
    imageUrls: string[];
    likes: string[] | undefined;
    likeCount: number;
    commentCount: number;
    userId: string;
    postedAt: Date;
    name: string | undefined;
    username: string | undefined;
    profilePictureUrl: string | undefined;
    doILike: boolean | undefined;
};

export type PostCommentType = {
    comment: string;
    commentedOn: Date;
    userId: string;
    postId: string;
};

export type PostCommentUserDataType = {
    _id: string;
    comment: string;
    commentedOn: Date;
    username: string;
    profilePictureUrl: string;
    userId: string;
    postId: string;
};
