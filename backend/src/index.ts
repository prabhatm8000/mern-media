import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

import { verifySocketToken } from "./middleware/userAuth";
import chat from "./routes/chat";
import follow from "./routes/follow";
import notifications from "./routes/notifications";
import post from "./routes/post";
import postComment from "./routes/postComment";
import search from "./routes/search";
import userAuth from "./routes/userAuth";
import userData from "./routes/userData";
import { setUpSocket } from "./socket";
import { connectToCloudinary } from "./utils/cloudinary";
import { connectToDB } from "./utils/dbConnection";
import { fakeFillUser } from "./seeder/user";
import { fakeFillPost } from "./seeder/post";

dotenv.config({
    path: "./.env",
});

// env vars
const MONGO_URI = process.env.MONGO_URI;
const PORT = parseInt(process.env.PORT || "5000");

const CLOUDINARY_CLOUDE_NAME = process.env.CLOUDINARY_CLOUDE_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// connection to DB and cloud storage
connectToDB(MONGO_URI as string);
connectToCloudinary({
    cloud_name: CLOUDINARY_CLOUDE_NAME as string,
    api_key: CLOUDINARY_API_KEY as string,
    api_secret: CLOUDINARY_API_SECRET as string,
});

// seeder
fakeFillUser(60).then((userIds) => {
    fakeFillPost(userIds, 2);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // chnage this to the url of production frontend
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// socket
io.use(verifySocketToken);
setUpSocket(io);

// serving frontend
// app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// routes
app.use("/api/auth", userAuth);
app.use("/api/userdata", userData);
app.use("/api/search", search);
app.use("/api/follow", follow);
app.use("/api/post", post);
app.use("/api/post-comment", postComment);
app.use("/api/notifications", notifications);
app.use("/api/chat", chat);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({ message: "working" });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`running at ${PORT}`);
});
