import express from "express";
import verifyToken from "../middleware/userAuth";
import {
    addComment,
    deleteComment,
    getCommentByPostId,
    getMyComments,
} from "../controllers/postComment";

const postComment = express.Router();

postComment.use(verifyToken);

postComment.post("/add", addComment);

postComment.get("/by-postId", getCommentByPostId);

postComment.get("/my-comments-by-postId", getMyComments);

postComment.delete("/:commentId", deleteComment);

export default postComment;
