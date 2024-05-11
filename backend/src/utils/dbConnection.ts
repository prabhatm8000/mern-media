import mongoose from "mongoose";

export const connectToDB = (uri: string) => {
    mongoose.connect(uri);
};
