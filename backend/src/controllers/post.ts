import { Request, Response } from "express";
import { PostType } from "../types/types";
import { deleteImageByURL, uploadPostImages } from "../cloudinary";
import Post from "../models/post";
import UserAuth from "../models/userAuth";
import UserData from "../models/userData";
import Follow from "../models/follow";
import Notification from "../models/notifications";

export const addPost = async (req: Request, res: Response) => {
    try {
        const imageFiles = req.files as Express.Multer.File[];
        const postData: PostType = req.body;

        // upload images to cloudinary and adding imageUrls
        if (imageFiles && imageFiles.length > 0) {
            const imageUrls = await uploadPostImages(imageFiles);
            postData.imageUrls = imageUrls;
        } else {
            postData.imageUrls = [];
        }

        postData.commentCount = 0;
        postData.likeCount = 0;
        postData.likes = [];
        postData.postedAt = new Date();
        postData.userId = req.userId;

        // saving to db
        const post = new Post(postData);
        await post.save();

        // updating post count value in userData
        await UserData.findOneAndUpdate(
            { userId: req.userId },
            { $inc: { postCount: 1 } }
        );

        // 201 -> created
        res.status(201).json(post);
    } catch (error) {
        console.log("error while adding post", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPostHome = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const follow = await Follow.findOne(
            { userId: req.userId },
            { followings: 1 }
        );

        if (!follow) {
            return res.status(404).json({ message: "User not found" });
        }

        const userIds = follow.followings;

        const posts = await Post.aggregate([
            {
                $match: { userId: { $in: userIds } },
            },
            {
                $addFields: {
                    doILike: {
                        $in: [req.userId, "$likes"],
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    caption: 1,
                    imageUrls: 1,
                    likeCount: 1,
                    commentCount: 1,
                    userId: 1,
                    postedAt: 1,
                    doILike: 1,
                },
            },
            {
                $sort: { postedAt: -1 }, // Sort by postedAt
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        // for username
        const userAuth = await UserAuth.find(
            { _id: { $in: userIds } },
            { username: 1, userId: 1 }
        );

        // for profilePictureUrl
        const userData = await UserData.find(
            { userId: { $in: userIds } },
            { name: 1, profilePictureUrl: 1, userId: 1 }
        );

        const response: PostType[] = [];
        for (let index = 0; index < posts.length; index++) {
            const item = posts[index];

            let username = "";
            for (let j = 0; j < userAuth.length; j++) {
                const data = userAuth[j];
                if (data._id.toString() === item.userId) {
                    username = data.username;
                    break;
                }
            }

            let name = "";
            let profilePictureUrl = "";
            for (let j = 0; j < userData.length; j++) {
                const data = userData[j];
                if (data.userId === item.userId) {
                    name = data.name;
                    profilePictureUrl = data.profilePictureUrl;
                    break;
                }
            }

            response.push({
                _id: item._id,
                title: item.title,
                caption: item.caption,
                imageUrls: item.imageUrls,
                likes: undefined,
                likeCount: item.likeCount,
                commentCount: item.commentCount,
                userId: item.userId,
                postedAt: item.postedAt,
                name,
                username,
                profilePictureUrl,
                doILike: item.doILike,
            });
        }

        res.status(200).json(response);
    } catch (error) {
        console.log("error while getting post by userId ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
    let userId = req.query.userId as string;
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        // if userId is equal to me send the current userData
        if (userId === "me") {
            userId = req.userId;
        }
        const posts = await Post.aggregate([
            {
                $match: { userId },
            },
            {
                $addFields: {
                    doILike: {
                        $in: [req.userId, "$likes"],
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    caption: 1,
                    imageUrls: 1,
                    likeCount: 1,
                    commentCount: 1,
                    userId: 1,
                    postedAt: 1,
                    doILike: 1,
                },
            },
            {
                $sort: { postedAt: -1 }, // Sort by postedAt
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        // for username
        const userAuth = await UserAuth.findById(userId, { username: 1 });

        // for profilePictureUrl
        const userData = await UserData.findOne(
            { userId },
            { name: 1, profilePictureUrl: 1 }
        );

        const response: PostType[] = [];
        for (let index = 0; index < posts.length; index++) {
            const item = posts[index];
            response.push({
                _id: item._id,
                title: item.title,
                caption: item.caption,
                imageUrls: item.imageUrls,
                likes: undefined,
                likeCount: item.likeCount,
                commentCount: item.commentCount,
                userId: item.userId,
                postedAt: item.postedAt,
                name: userData?.name,
                username: userAuth?.username,
                profilePictureUrl: userData?.profilePictureUrl,
                doILike: item.doILike,
            });
        }

        res.status(200).json(response);
    } catch (error) {
        console.log("error while getting post by userId ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId, { likes: 0 });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // for username
        const userAuth = await UserAuth.findById(post.userId, { username: 1 });

        // for profilePictureUrl
        const userData = await UserData.findOne(
            { userId: post.userId },
            { name: 1, profilePictureUrl: 1 }
        );

        let flag: boolean = false;

        if (post.likes) {
            for (let index = 0; index < post.likes.length; index++) {
                if (post.likes[index] === req.userId) {
                    flag = true;
                    break;
                }
            }
        }

        const response: PostType = {
            _id: post._id,
            title: post.title,
            caption: post.caption,
            imageUrls: post.imageUrls,
            likes: undefined,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            userId: post.userId,
            postedAt: post.postedAt,
            name: userData?.name,
            username: userAuth?.username,
            profilePictureUrl: userData?.profilePictureUrl,
            doILike: flag,
        };

        res.status(200).json(response);
    } catch (error) {
        console.log("error while getting post by Id", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const postId = req.params.postId;

    try {
        const deletedPost = await Post.findOneAndDelete({
            _id: postId,
            userId: req.userId,
        });
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        const imageUrls = deletedPost.imageUrls;
        imageUrls.map(async (url) => {
            await deleteImageByURL(url, "POST_IMAGES");
        });

        // updating post count value in userData
        await UserData.findOneAndUpdate(
            { userId: req.userId },
            { $inc: { postCount: -1 } }
        );

        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        console.log("error while deleting post", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const likeUnlike = async (req: Request, res: Response) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId, { likeCount: 1, likes: 1 });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const index = post.likes?.indexOf(req.userId);

        if (index === -1) {
            // already unliked -> like
            const newData = await Post.findOneAndUpdate(
                { _id: postId },
                { $push: { likes: req.userId }, $inc: { likeCount: 1 } },
                { new: true }
            );

            // pushing notification for like to your post to the user who posted the post
            await Notification.create({
                userId: newData?.userId,
                notificationForm: req.userId,
                notificationFor: "liked your post.",
                postId: postId,
                at: new Date(),
                readStatus: false,
            });
            return res.status(200).json({ message: "Post liked" });
        } else {
            // already liked -> unlike
            const newData = await Post.findOneAndUpdate(
                { _id: postId },
                { $pull: { likes: req.userId }, $inc: { likeCount: -1 } },
                { new: true }
            );
            return res.status(200).json({ message: "Post like removed" });
        }
    } catch (error) {
        console.log("error in likeUnlike", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
