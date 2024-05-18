import { Suspense, lazy, useEffect } from "react";
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

import LoadingPage from "./pages/LoadingPage";

import ColumnLayout from "./layouts/ColumnLayout";
// import EditUserData from "./pages/EditUserData";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Profile from "./pages/Profile";
// import Signin from "./pages/Signin";
// import ChatRoutes from "./routes/ChatRoutes";
// import PostRoutes from "./routes/PostRoutes";
// import SearchRoutes from "./routes/SearchRoutes";

const Login = lazy(() => import("./pages/Login"));
const Signin = lazy(() => import("./pages/Signin"));
const Home = lazy(() => import("./pages/Home"));
const EditUserData = lazy(() => import("./pages/EditUserData"));
const Profile = lazy(() => import("./pages/Profile"));
const SearchRoutes = lazy(() => import("./routes/SearchRoutes"));
const PostRoutes = lazy(() => import("./routes/PostRoutes"));
const ChatRoutes = lazy(() => import("./routes/ChatRoutes"));

function App() {
    const { checkingAuthToken, isLoggedIn, currUserId, showToast } =
        useAppContext();
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

        socket.on("error", ({ message }: { message: string }) => {
            showToast({ type: "ERROR", message });
        });

        return () => {
            window.removeEventListener("beforeunload", handleTabClose);
            socket.off("message");
            socket.off("chat");
            socket.off("group-chat");
            socket.off("joined");
            socket.off("error");
        };
    }, [socket, currUserId]);

    return (
        <div className="bg-black text-white font-poppins-light h-screen">
            <div className="container max-w-[1200px] mx-auto">
                {!isLoggedIn && checkingAuthToken ? (
                    // when auth_token is checked
                    <LoadingPage message="Verifying authentication token..." />
                ) : (
                    <BrowserRouter>
                        <Routes>
                            {!isLoggedIn ? (
                                <>
                                    <Route
                                        path="/"
                                        element={
                                            <Suspense
                                                fallback={<LoadingPage />}
                                            >
                                                <Login />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/sign-in"
                                        element={
                                            <Suspense
                                                fallback={<LoadingPage />}
                                            >
                                                <Signin />
                                            </Suspense>
                                        }
                                    />
                                    <Route
                                        path="/*"
                                        element={<Navigate to={"/"} />}
                                    />
                                </>
                            ) : (
                                <>
                                    <Route
                                        path="/"
                                        element={
                                            <ColumnLayout>
                                                <Suspense
                                                    fallback={<LoadingPage />}
                                                >
                                                    <Home />
                                                </Suspense>
                                            </ColumnLayout>
                                        }
                                    />
                                    <Route
                                        path="/edit-profile"
                                        element={
                                            <ColumnLayout>
                                                <Suspense
                                                    fallback={<LoadingPage />}
                                                >
                                                    <EditUserData />
                                                </Suspense>
                                            </ColumnLayout>
                                        }
                                    />
                                    <Route
                                        path="/profile/:userId"
                                        element={
                                            <FollowersContextProvider>
                                                <FollowingsContextProvider>
                                                    <ColumnLayout>
                                                        <Suspense
                                                            fallback={
                                                                <LoadingPage />
                                                            }
                                                        >
                                                            <Profile />
                                                        </Suspense>
                                                    </ColumnLayout>
                                                </FollowingsContextProvider>
                                            </FollowersContextProvider>
                                        }
                                    />

                                    <Route
                                        path="/search/*"
                                        element={
                                            <ColumnLayout>
                                                <Suspense
                                                    fallback={<LoadingPage />}
                                                >
                                                    <SearchRoutes />
                                                </Suspense>
                                            </ColumnLayout>
                                        }
                                    />

                                    <Route
                                        path="/post/*"
                                        element={
                                            <Suspense
                                                fallback={<LoadingPage />}
                                            >
                                                <PostRoutes />
                                            </Suspense>
                                        }
                                    />

                                    <Route
                                        path="/chats/*"
                                        element={
                                            <Suspense
                                                fallback={<LoadingPage />}
                                            >
                                                <ChatRoutes />
                                            </Suspense>
                                        }
                                    />

                                    <Route
                                        path="/*"
                                        element={<Navigate to={"/"} />}
                                    />
                                </>
                            )}
                        </Routes>
                    </BrowserRouter>
                )}
            </div>
        </div>
    );
}

export default App;
