import "dotenv/config";
import mongoose from "mongoose";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import path from "path";

import userAuth from "./routes/userAuth";
import userData from "./routes/userData";
import search from "./routes/search";
import follow from "./routes/follow";
import post from "./routes/post";
import postComment from "./routes/postComment";

mongoose.connect(process.env.MONGO_URI as string);

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// serving frontend
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api/auth", userAuth);
app.use("/api/userdata", userData);
app.use("/api/search", search);
app.use("/api/follow", follow);
app.use("/api/post", post);
app.use("/api/post-comment", postComment);

app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({ message: "working" });
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`running at ${process.env.PORT || 5000}`);
});
