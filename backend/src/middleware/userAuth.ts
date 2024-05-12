import cookieParser from "cookie-parser";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import type { CtkSocket } from "../socket";

// adding a new propery userId: string <- Request <- Express
declare global {
    namespace Express {
        interface Request {
            userId: mongoose.Types.ObjectId;
        }
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies["auth_token"];

    if (!token) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        // assigning value to userId
        req.userId = (decode as JwtPayload).userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "unauthorized" });
    }
};

export const verifySocketToken = (
    socket: CtkSocket,
    next: (err?: any) => void
) => {
    const cookieParserMiddleware = cookieParser();

    const mockResponse = {
        // Define an end function
        end: () => {},
    };

    cookieParserMiddleware(socket.request as any, mockResponse as any, () => {
        const token = (socket.request as any).cookies["auth_token"];

        if (!token) {
            console.error("Socket token not found");
            return socket.disconnect(true);
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        // assigning value to userId
        socket.userId = (decode as JwtPayload).userId;
        next();
    });
};

export default verifyToken;
