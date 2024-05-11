import express from "express";
import verifyToken from "../middleware/userAuth";
import {
    addPost,
    getPostsByUserId,
    deletePost,
    getPostById,
    likeUnlike,
    getPostHome,
} from "../controllers/post";
import multer from "multer";

const post = express.Router();

post.use(verifyToken);

// change frontend too (currently at 5) anything greater than or equal to that is fine.
const MAX_LENGTH_OF_IMAGES = 5;

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 3 * 1025 * 1024, // 3MB -> Bytes
    },
});

post.delete("/:postId", deletePost);

post.post(
    "/add",
    upload.array("imageFiles", MAX_LENGTH_OF_IMAGES), // accepts MAX_LENGTH_OF_IMAGES images of 5MB
    addPost
);

post.get("/get-post-home", getPostHome);

post.get("/get-by-userId", getPostsByUserId);

post.get("/get-by-postId/:postId", getPostById);

post.post("/like-unlike/:postId", likeUnlike);

export default post;
