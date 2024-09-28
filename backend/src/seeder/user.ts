import mongoose from "mongoose";
import Follow from "../models/follow";
import UserAuth from "../models/userAuth";
import UserData from "../models/userData";
import { faker } from "@faker-js/faker";
import { UserAuthType } from "../types/types";

const addfakeUser = async (): Promise<{
    user?: UserAuthType;
    success: boolean;
}> => {
    const data = {
        username: faker.internet.userName(),
        email: "@gmail.com",
        password: "pass1254",
    };

    data.email = data.username + data.email;

    let user = await UserAuth.findOne({
        username: data.username,
    });

    if (user) {
        return { success: false };
    }

    // req.body -> {username, password}
    user = new UserAuth(data);
    await user.save();

    // init UserData for new user
    const userData = new UserData({
        description: faker.person.bio(),
        followerCount: 0,
        followingCount: 0,
        link1: faker.internet.url(),
        link2: faker.internet.url(),
        link3: faker.internet.url(),
        name: faker.person.fullName(),
        postCount: 0,
        profilePictureUrl: faker.image.avatar(),
        userId: user._id,
    });
    await userData.save();

    // init Follow for new user
    const follow = new Follow({
        followers: [],
        followings: [],
        userId: user.id,
    });
    await follow.save();

    return { user, success: true };
};

export const fakeFillUser = async (
    n: number
): Promise<Array<mongoose.Types.ObjectId>> => {
    const userIds: Array<mongoose.Types.ObjectId> = [];

    for (let index = 0; index < n; index++) {
        const user = await addfakeUser();
        if (user.user != null)
            userIds.push(new mongoose.Types.ObjectId(user.user._id));
    }
    return userIds;
};
