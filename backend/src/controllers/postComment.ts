import { Request, Response } from "express";

import PostComment from "../models/postComment";
import Post from "../models/post";
import Notification from "../models/notifications";
import mongoose from "mongoose";
import { PostCommentType } from "../types/types";

export const addComment = async (req: Request, res: Response) => {
    const commentData: PostCommentType = req.body;

    try {
        const user = await PostComment.create({
            postId: commentData.postId,
            userId: req.userId,
            comment: commentData.comment,
        });
        await user.save();

        // pushing notification for like to your post to the user who posted the post
        const post = await Post.findById(commentData.postId);
        await Notification.create({
            userId: post?.userId,
            notificationFormUserId: req.userId,
            notificationFor: `commented '${commentData.comment}' on your post.`,
            postId: commentData.postId,
            commentId: user.id,
            readStatus: false,
        });

        await Post.findOneAndUpdate(
            { _id: commentData.postId },
            { $inc: { commentCount: 1 } }
        );

        res.status(201).json({ message: "Comment added!" });
    } catch (error) {
        console.log("error in addComment ", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getCommentByPostId = async (req: Request, res: Response) => {
    let postId = req.query.postId as string;
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const postComments = await PostComment.aggregate([
            {
                $match: { postId: new mongoose.Types.ObjectId(postId) },
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
                    comment: 1,
                    commentedAt: "$created_at",
                    username: "$userAuthData.username",
                    profilePictureUrl: "$userData.profilePictureUrl",
                    userId: 1,
                    postId: 1,
                },
            },
            {
                $sort: { commentedAt: -1 }, // Sort by postedAt
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(postComments);
    } catch (error) {
        console.log("error while getting comments by postId", error);
        res.status(500).json({ message: "Soemthing went wrong" });
    }
};

export const getMyComments = async (req: Request, res: Response) => {
    let postId = req.query.postId as string;
    const limit = parseInt(req.query.limit ? req.query.limit.toString() : "5");
    const page = parseInt(req.query.page ? req.query.page.toString() : "1");
    const skip = (page - 1) * limit;

    try {
        const postComments = await PostComment.aggregate([
            {
                $match: {
                    postId: new mongoose.Types.ObjectId(postId),
                    userId: new mongoose.Types.ObjectId(req.userId),
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
                    comment: 1,
                    commentedAt: "$created_at",
                    username: "$userAuthData.username",
                    profilePictureUrl: "$userData.profilePictureUrl",
                    userId: 1,
                    postId: 1,
                },
            },
            {
                $sort: { commentedAt: -1 }, // Sort by postedAt
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).json(postComments);
    } catch (error) {
        console.log("error while getting comments by postId", error);
        res.status(500).json({ message: "Soemthing went wrong" });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    const commentId = req.params.commentId;
    try {
        const comment = await PostComment.findOneAndDelete({ _id: commentId });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await Post.findOneAndUpdate(
            { _id: comment.postId },
            { $inc: { commentCount: -1 } }
        );
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        console.log("error while deleting comment", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
