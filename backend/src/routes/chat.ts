import express from "express";
import multer from "multer";
import {
    addMembers,
    blockUser,
    createChat,
    deleteChat,
    deleteGroupChats,
    editGroupChats,
    getBlockedList,
    getChatData,
    getChats,
    getGroupChats,
    getGroupDetails,
    getGroupMembersDetail,
    getMessages,
    leaveGroup,
    removeMember,
    searchChat,
    searchGroupChat,
    searchMember,
    unblockUser,

    uploadAttachments
} from "../controllers/chat";
import verifyToken from "../middleware/userAuth";

const chat = express.Router();

chat.use(verifyToken);

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1 * 1025 * 1024, // 1MB -> Bytes
    },
});

// change frontend too (currently at 5) anything greater than or equal to that is fine.
const MAX_LENGTH_OF_IMAGES = 5;

chat.post("/create-chat", createChat);

chat.get("/get-chat-data/:chatId", getChatData);

// chats
chat.get("/get-chats", getChats);

chat.get("/search-chat", searchChat);

chat.delete("/delete-chat/:chatId", deleteChat);

// group chats
chat.get("/search-group-chat", searchGroupChat);

chat.get("/get-group-chats", getGroupChats);

chat.get("/get-group-details/:chatId", getGroupDetails);

chat.get("/get-group-members", getGroupMembersDetail);

chat.patch(
    "/edit-group-chats/:chatId",
    upload.single("groupPicture"),
    editGroupChats
);

chat.patch("/leave-group/:chatId", leaveGroup);

chat.patch("/add-members/:chatId", addMembers);

chat.patch("/remove-member/:chatId", removeMember);

chat.get("/search-member/:chatId", searchMember);

chat.delete("/delete-group-chat/:chatId", deleteGroupChats);

// block users
chat.patch("/block/:userId", blockUser);

chat.patch("/unblock/:userId", unblockUser);

chat.get("/get-blocked-list", getBlockedList);

// messages
chat.get("/get-messages", getMessages);

chat.post(
    "/upload-attachments/:chatId",
    upload.array("imageFiles", MAX_LENGTH_OF_IMAGES), // accepts MAX_LENGTH_OF_IMAGES images of 5MB
    uploadAttachments
);

export default chat;
