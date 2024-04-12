import express from "express";
import verifyToken from "../middleware/userAuth";
import {
    clearAllNotifications,
    getNotifications,
    doIHaveNotifications,
} from "../controllers/notifications";

const notifications = express.Router();

notifications.use(verifyToken);

notifications.get("/", getNotifications);
notifications.delete("/", clearAllNotifications);
notifications.get("/doIHaveNotifications", doIHaveNotifications);

export default notifications;
