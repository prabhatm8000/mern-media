import bcrypt from "bcryptjs";
import mongoose from "mongoose";


const userAuthSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, {collection: "UserAuth"});

userAuthSchema.index({ username: 'text' });

// mongodb middleware for save
// password hashing
userAuthSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

const UserAuth = mongoose.model("UserAuth", userAuthSchema);

export default UserAuth;
