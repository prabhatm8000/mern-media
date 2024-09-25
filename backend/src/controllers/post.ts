import { Request, Response } from "express";
import { deleteImageByURL, uploadPostImages } from "../utils/cloudinary";
import Post from "../models/post";
import UserData from "../models/userData";
import Follow from "../models/follow";
import Notification from "../models/notifications";
import mongoose from "mongoose";
import { PostType } from "../types/types";

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
        postData.likes = new mongoose.Types.Array();
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
        // console.log("error while adding post", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPostHome = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const homePosts = await Follow.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                },
            },
            {
                $lookup: {
                    from: "Post", // Assuming the collection name is "posts"
                    let: { followings: "$followings" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$userId", "$$followings"],
                                },
                            },
                        },
                        {
                            $addFields: {
                                doILike: {
                                    $in: [
                                        new mongoose.Types.ObjectId(req.userId),
                                        "$likes",
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "UserAuth", // Assuming the collection name is "UserAuth"
                                localField: "userId",
                                foreignField: "_id",
                                as: "userAuth",
                            },
                        },
                        {
                            $lookup: {
                                from: "UserData", // Assuming the collection name is "UserData"
                                localField: "userId",
                                foreignField: "userId",
                                as: "userData",
                            },
                        },
                        { $unwind: "$userAuth" },
                        { $unwind: "$userData" },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                caption: 1,
                                imageUrls: 1,
                                likeCount: 1,
                                commentCount: 1,
                                userId: 1,
                                postedAt: "$created_at",
                                doILike: 1,

                                username: "$userAuth.username",
                                name: "$userData.name",
                                profilePictureUrl:
                                    "$userData.profilePictureUrl",
                            },
                        },
                        {
                            $sort: {
                                postedAt: -1,
                            },
                        },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    as: "posts",
                },
            },
            { $unwind: "$posts" },
            {
                $project: {
                    _id: "$posts._id",
                    title: "$posts.title",
                    caption: "$posts.caption",
                    imageUrls: "$posts.imageUrls",
                    likeCount: "$posts.likeCount",
                    commentCount: "$posts.commentCount",
                    userId: "$posts.userId",
                    postedAt: "$posts.postedAt",
                    doILike: "$posts.doILike",

                    username: "$posts.username",
                    name: "$posts.name",
                    profilePictureUrl: "$posts.profilePictureUrl",
                },
            },
        ]);

        res.status(200).json(homePosts);
    } catch (error) {
        // console.log("error while getting home posts", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
    let userId =
        req.query.userId === "me" ? req.userId : (req.query.userId as string);

    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const posts = await Post.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $addFields: {
                    doILike: {
                        $in: [
                            new mongoose.Types.ObjectId(req.userId),
                            "$likes",
                        ],
                    },
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
            {
                $lookup: {
                    from: "UserData",
                    localField: "userId",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            { $unwind: "$userAuthData" },
            { $unwind: "$userData" },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    caption: 1,
                    imageUrls: 1,
                    likeCount: 1,
                    commentCount: 1,
                    userId: 1,
                    postedAt: "$created_at",
                    doILike: 1,

                    username: "$userAuthData.username",
                    name: "$userData.name",
                    profilePictureUrl: "$userData.profilePictureUrl",
                },
            },
            {
                $sort: {
                    postedAt: -1,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.status(200).json(posts);
    } catch (error) {
        // console.log("error while getting post by userId ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    try {
        const post = await Post.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(postId),
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
            {
                $lookup: {
                    from: "UserData",
                    localField: "userId",
                    foreignField: "userId",
                    as: "userData",
                },
            },
            { $unwind: "$userAuthData" },
            { $unwind: "$userData" },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    caption: 1,
                    imageUrls: 1,
                    likeCount: 1,
                    commentCount: 1,
                    userId: 1,
                    postedAt: "$created_at",
                    doILike: 1,

                    username: "$userAuth.username",
                    name: "$userData.name",
                    profilePictureUrl: "$userData.profilePictureUrl",
                },
            },
        ]);

        res.status(200).json(post[0]);
    } catch (error) {
        // console.log("error while getting post by Id", error);
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
        // console.log("error while deleting post", error);
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

        const isLiked = post.likes?.includes(req.userId);

        if (isLiked) {
            // already liked -> unlike
            await Post.findOneAndUpdate(
                { _id: postId },
                { $pull: { likes: req.userId }, $inc: { likeCount: -1 } },
                { new: true }
            );
            return res.status(200).json({ message: "Post like removed" });
        } else {
            // already unliked -> like
            const newData = await Post.findOneAndUpdate(
                { _id: postId },
                { $push: { likes: req.userId }, $inc: { likeCount: 1 } },
                { new: true }
            );

            // pushing notification for like to your post to the user who posted the post
            await Notification.create({
                userId: newData?.userId,
                notificationFormUserId: req.userId,
                notificationFor: "liked your post.",
                postId: postId,
                readStatus: false,
            });
            return res.status(200).json({ message: "Post liked" });
        }
    } catch (error) {
        // console.log("error in likeUnlike", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
