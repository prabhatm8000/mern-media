import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import {
    addMessageToDb,
    allMessagesRead,
    membersInChat,
    userExistInChat,
} from "./utils/helperDbOperations";

export class CtkSocket extends Socket {
    // Define the additional property userId
    userId?: any;
    chatId?: any;
}

const userSocketIdMap = new Map<string, string>();
const chatRoomMap = new Map<string, Set<string>>();

let IO: Server;

export const setUpSocket = (io: Server) => {
    IO = io;

    io.on("connection", (socket: CtkSocket) => {
        if (!socket.userId) return;

        userSocketIdMap.set(socket.userId.toString(), socket.id);

        socket.on("leave", () => {
            if (!socket.userId) return;
            userSocketIdMap.delete(socket.userId.toString());
        });

        // other events
        joinLeaveRoomEvents(socket);
        messageEvents(socket);
    });
};

const joinLeaveRoomEvents = (socket: CtkSocket) => {
    socket.on("join-chat-room", async ({ chatId }: { chatId: string }) => {
        if (!socket.userId) return;

        const isValid = await userExistInChat(chatId, socket.userId.toString());
        if (!isValid) {
            socket.emit("error", { message: "You'r not a member" });
            console.log(
                `userId: ${socket.userId} is not a member of chatId: ${chatId}`
            );
            return;
        }

        const users = chatRoomMap.get(chatId);
        if (users) {
            users.add(socket.userId.toString());
        } else {
            chatRoomMap.set(chatId, new Set([socket.userId.toString()]));
        }

        socket.chatId = new mongoose.Types.ObjectId(chatId);
        socket.join(socket.chatId.toString());

        // console.log(socket.userId + " joined " + socket.chatId);
        // console.log(chatRoomMap);

        // emit that user joined the room, means messages been read
        IO.to(socket.chatId.toString()).emit("joined", {
            userId: socket.userId,
            chatId,
        });
        allMessagesRead(chatId, socket.userId.toString());
    });

    socket.on("leave-chat-room", async ({ chatId }: { chatId: string }) => {
        if (!socket.userId) return;

        const users = chatRoomMap.get(chatId);
        if (!users) return;

        users.delete(socket.userId.toString());

        socket.to(chatId.toString()).emit("left", {
            userId: socket.userId.toString(),
            chatId: chatId.toString(),
        });

        if (users.size === 0) {
            chatRoomMap.delete(chatId);
        }

        socket.leave(chatId);
        socket.chatId = undefined;

        // console.log(socket.userId + " left " + socket.chatId);
        // console.log(chatRoomMap);
    });
};

const messageEvents = (socket: CtkSocket) => {
    socket.on(
        "send-message",
        async ({
            content,
            chatId,
            name: groupName,
            groupPictureUrl,
            attachments,
        }: {
            content: string;
            chatId: string | mongoose.Types.ObjectId;
            name?: string;
            groupPictureUrl?: string;
            attachments?: string[];
        }) => {
            if (!socket.userId) return;

            const membersInRoom = chatRoomMap.get(chatId.toString());

            if (!membersInRoom) {
                socket.emit("error", { message: "You'r not in chat room" });
                return;
            }

            const message = await addMessageToDb(
                chatId.toString(),
                socket.userId?.toString(),
                content,
                membersInRoom.size >= 2, // if more then sender(which is the receiver) is present, automark as read
                attachments
            );

            const members = await membersInChat(chatId.toString());

            const socketIdOfMembersConnected: string[] = [];

            members.forEach((data) => {
                const socketId = userSocketIdMap.get(data.toString());
                if (socketId) {
                    socketIdOfMembersConnected.push(socketId);
                }
            });

            console.log(socketIdOfMembersConnected);

            if (socketIdOfMembersConnected.length === 0) {
                console.log("no memeber connected in " + chatId);
                return;
            }

            IO.to(socketIdOfMembersConnected).emit("message", message);
            if (groupName !== undefined && groupPictureUrl !== undefined) {
                IO.to(socketIdOfMembersConnected).emit("group-chat", {
                    _id: socket.chatId,
                    lastMessage: message?.content,
                    lastMessageOn: message?.sentAt,
                    name: groupName,
                    groupPictureUrl,
                });
            } else {
                IO.to(socketIdOfMembersConnected).emit("chat", {
                    _id: socket.chatId,
                    userData: message?.senderUserData,
                    lastMessage: message?.content,
                    lastMessageOn: message?.sentAt,
                });
            }
        }
    );
};

export const emitRefetchChatsTo = (userId: mongoose.Types.ObjectId) => {
    if (!IO) return;

    const socketId = userSocketIdMap.get(userId.toString());

    if (!socketId) return;

    IO.to(socketId).emit("refetch-chats");
};
