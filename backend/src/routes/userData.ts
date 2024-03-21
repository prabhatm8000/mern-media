import express from "express";
import multer from "multer";

import verifyToken from "../middleware/userAuth";
import { editUserData, getUserDataById } from "../controllers/userData";

const userData = express.Router();

userData.use(verifyToken)

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1 * 1025 * 1024,   // 1MB -> Bytes
    }
})

userData.get("/:userId", getUserDataById)

userData.patch("/edit", upload.single("profilePicture"), editUserData)

export default userData;