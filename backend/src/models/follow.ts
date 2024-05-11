import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
    {
        followers: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserAuth" }],
        },
        followings: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserAuth" }],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserAuth",
            required: true,
            unique: true,
        },
    },
    { collection: "Follow" }
);

const Follow = mongoose.model<{
    followers: mongoose.Types.Array<mongoose.Types.ObjectId>;
    followings: mongoose.Types.Array<mongoose.Types.ObjectId>;
    userId: mongoose.Types.ObjectId;
}>("Follow", followSchema);

export default Follow;
