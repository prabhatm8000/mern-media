import express from "express";
import verifyToken from "../middleware/userAuth";
import { doIFollow, followUnfollow, followers, followings } from "../controllers/follow";

const follow = express.Router();

follow.use(verifyToken)

follow.get("/followers", followers);

follow.get("/followings", followings);

follow.get("/do-i-follow/:userId", doIFollow);

follow.get("/:userId", followUnfollow);

export default follow;
