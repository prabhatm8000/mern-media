import { Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
    ChatBasicDataType,
    GroupChatBasicDataType,
    MessageType,
} from "../../backend/src/types/types";
import { useAppContext } from "./contexts/AppContext";
import { useChatsContext } from "./contexts/ChatsContext";
import { FollowersContextProvider } from "./contexts/FollowersContext";
import { FollowingsContextProvider } from "./contexts/FollowingsContext";
import { useGroupChatsContext } from "./contexts/GroupChatsContext";
import { useMessageContext } from "./contexts/MessageContext";
import { useSocketContext } from "./contexts/SocketContext";
import ColumnLayout from "./layouts/ColumnLayout";
import EditUserData from "./pages/EditUserData";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signin from "./pages/Signin";
import ChatRoutes from "./routes/ChatRoutes";
import PostRoutes from "./routes/PostRoutes";
import SearchRoutes from "./routes/SearchRoutes";

function App() {
    const { isLoggedIn, currUserId } = useAppContext();
    const socket = useSocketContext();

    const { dispatch: messageDispatch } = useMessageContext();
    const { dispatch: chatsDispatch } = useChatsContext();
    const { dispatch: groupChatsDispatch } = useGroupChatsContext();

    // handling tab close
    useEffect(() => {
        if (!currUserId) {
            return;
        }

        function handleTabClose() {
            return socket.emit("leave");
        }

        window.addEventListener("beforeunload", handleTabClose);

        socket.on("message", (message: MessageType) => {
            messageDispatch({
                type: "ADD_MESSAGE",
                payload: { chatId: message.chatId.toString(), message },
            });

            if (currUserId && message.sender.toString() !== currUserId) {
                console.log("message not form me!");

                chatsDispatch({
                    type: "UPDATE_NEW_MESSAGE",
                    payload: {
                        chatId: message.chatId.toString(),
                        newStatus: !message.readStatus,
                    },
                });
                groupChatsDispatch({
                    type: "UPDATE_NEW_MESSAGE",
                    payload: {
                        chatId: message.chatId.toString(),
                        newStatus: !message.readStatus,
                    },
                });
            }
        });

        socket.on("chat", (chatData: ChatBasicDataType) => {
            chatsDispatch({
                type: "UPDATE_CHATDATA",
                payload: {
                    chatId: chatData._id.toString(),
                    chatData,
                },
            });
        });

        socket.on("group-chat", (chatData: GroupChatBasicDataType) => {
            groupChatsDispatch({
                type: "UPDATE_CHATDATA",
                payload: {
                    chatId: chatData._id.toString(),
                    chatData,
                },
            });
        });

        socket.on(
            "joined",
            ({ userId, chatId }: { userId: string; chatId: string }) => {
                if (currUserId && userId === currUserId) {
                    chatsDispatch({
                        type: "UPDATE_NEW_MESSAGE",
                        payload: {
                            chatId: chatId,
                            newStatus: false,
                        },
                    });
                    groupChatsDispatch({
                        type: "UPDATE_NEW_MESSAGE",
                        payload: {
                            chatId: chatId,
                            newStatus: false,
                        },
                    });
                } else {
                    messageDispatch({
                        type: "SET_READ_STATUS",
                        payload: { userId, chatId },
                    });
                }
            }
        );

        return () => {
            window.removeEventListener("beforeunload", handleTabClose);
            socket.off("message");
            socket.off("chat");
            socket.off("group-chat");
            socket.off("joined");
        };
    }, [socket, currUserId]);

    return (
        <div className="bg-black text-white font-poppins-light h-screen">
            <div className="container max-w-[1200px] mx-auto">
                <BrowserRouter>
                    <Routes>
                        {isLoggedIn ? (
                            <>
                                <Route
                                    path="/"
                                    element={
                                        <ColumnLayout>
                                            <Home />
                                        </ColumnLayout>
                                    }
                                />
                                <Route
                                    path="/edit-profile"
                                    element={
                                        <ColumnLayout>
                                            <EditUserData />
                                        </ColumnLayout>
                                    }
                                />
                                <Route
                                    path="/profile/:userId"
                                    element={
                                        <FollowersContextProvider>
                                            <FollowingsContextProvider>
                                                <ColumnLayout>
                                                    <Profile />
                                                </ColumnLayout>
                                            </FollowingsContextProvider>
                                        </FollowersContextProvider>
                                    }
                                />

                                <Route
                                    path="/search/*"
                                    element={
                                        <ColumnLayout>
                                            <SearchRoutes />
                                        </ColumnLayout>
                                    }
                                />

                                <Route
                                    path="/post/*"
                                    element={<PostRoutes />}
                                />

                                <Route
                                    path="/chats/*"
                                    element={<ChatRoutes />}
                                />
                            </>
                        ) : (
                            <>
                                <Route path="/" element={<Login />} />
                                <Route path="/sign-in" element={<Signin />} />
                            </>
                        )}

                        <Route path="*" element={<Navigate to={"/"} />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    );
}

export default App;
