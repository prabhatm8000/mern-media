import { Request, Response } from "express";
import { PostCommentType, PostCommentUserDataType } from "../types/types";
import PostComment from "../models/postComment";
import Post from "../models/post";
import UserData from "../models/userData";
import UserAuth from "../models/userAuth";
import Notification from "../models/notifications";

export const addComment = async (req: Request, res: Response) => {
    const commentData: PostCommentType = req.body;

    try {
        const user = await PostComment.create({
            postId: commentData.postId,
            userId: req.userId,
            comment: commentData.comment,
            commentedOn: new Date(),
        });
        await user.save();

        // pushing notification for like to your post to the user who posted the post
        const post = await Post.findById(commentData.postId);
        await Notification.create({
            userId: post?.userId,
            notificationForm: req.userId,
            notificationFor: `commented '${commentData.comment}' on your post.`,
            postId: commentData.postId,
            commentId: user.id,
            at: new Date(),
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
                $match: { postId },
            },
            {
                $sort: { commentedOn: -1 }, // Sort by postedAt
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        const userIds = postComments.map((item) => item.userId);

        const userDatas = await UserData.find(
            { userId: { $in: userIds } },
            { profilePictureUrl: 1, userId: 1, _id: 0 }
        );

        const userAuths = await UserAuth.find(
            { _id: { $in: userIds } },
            { username: 1, _id: 1 }
        );

        const response: PostCommentUserDataType[] = [];
        for (let index = 0; index < postComments.length; index++) {
            const item = postComments[index];

            let profilePictureUrl = "";
            for (let j = 0; j < userDatas.length; j++) {
                const userDataItem = userDatas[j];
                if (userDataItem.userId === item.userId) {
                    profilePictureUrl = userDataItem.profilePictureUrl;
                    break;
                }
            }

            let username = "";
            for (let j = 0; j < userAuths.length; j++) {
                const userAuthItem = userAuths[j];
                if (userAuthItem._id.toString() === item.userId) {
                    username = userAuthItem.username;
                    break;
                }
            }

            response.push({
                _id: item._id,
                comment: item.comment,
                commentedOn: item.commentedOn,
                username,
                profilePictureUrl,
                userId: item.userId,
                postId: item.postId,
            });
        }

        res.status(200).json(response);
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
                $match: { postId, userId: req.userId },
            },
            {
                $sort: { commentedOn: -1 }, // Sort by postedAt
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ]);

        const userData = await UserData.findOne(
            { userId: req.userId },
            { profilePictureUrl: 1, userId: 1, _id: 0 }
        );

        const userAuth = await UserAuth.findOne(
            { _id: req.userId },
            { username: 1, _id: 1 }
        );

        if (!postComments || !userAuth || !userData) {
            return res
                .status(404)
                .json({ message: "Comments or user not found" });
        }

        const response: PostCommentUserDataType[] = [];
        for (let index = 0; index < postComments.length; index++) {
            const item = postComments[index];

            response.push({
                _id: item._id,
                comment: item.comment,
                commentedOn: item.commentedOn,
                username: userAuth.username,
                profilePictureUrl: userData.profilePictureUrl,
                userId: item.userId,
                postId: item.postId,
            });
        }

        res.status(200).json(response);
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
