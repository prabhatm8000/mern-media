import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { UserAuthType } from "../types/types";

const userAuthSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// mongodb middleware for save
// password hashing
userAuthSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

const UserAuth = mongoose.model<UserAuthType>("UserAuth", userAuthSchema);

export default UserAuth;
