import mongoose from "mongoose";
import Post from "../models/post";
import UserData from "../models/userData";
import { faker } from "@faker-js/faker";

const addPost = async (userId: mongoose.Types.ObjectId) => {
    const post = new Post({
        caption: faker.lorem.paragraph({ min: 50, max: 100 }),
        commentCount: 0,
        imageUrls: [faker.image.url()],
        likeCount: 0,
        likes: [],
        title: faker.lorem.sentence({ min: 10, max: 50 }),
        userId,
    });
    await post.save();

    // updating post count value in userData
    await UserData.findOneAndUpdate(
        { userId: userId },
        { $inc: { postCount: 1 } }
    );
};

export const fakeFillPost = async (
    userIds: Array<mongoose.Types.ObjectId>,
    numOfPostEach: number = 1
) => {
    for (let i = 0; i < numOfPostEach; i++) {
        for (let index = 0; index < userIds.length; index++) {
            const userId = userIds[index];
            await addPost(userId);
        }
    }
};
