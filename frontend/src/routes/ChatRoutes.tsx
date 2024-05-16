import { Route, Routes } from "react-router-dom";
import ColumnChatLayout from "../layouts/ColumnChatLayout";
import AddMembers from "../pages/AddMembers";
import BlockList from "../pages/BlockList";
import { default as ChatRoom } from "../pages/ChatRoom";
import Chats from "../pages/Chats";
import CreateChat from "../pages/CreateChat";
import EditGroupChat from "../pages/EditGroupChat";
import GroupChatRoom from "../pages/GroupChatRoom";
import GroupDetails from "../pages/GroupDetails";

const ChatRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ColumnChatLayout showMainPage={false} showSideBar={true}>
                        <Chats />
                    </ColumnChatLayout>
                }
            />

            <Route
                path="/block-list"
                element={
                    <ColumnChatLayout showMainPage={true} showSideBar={false}>
                        <BlockList />
                    </ColumnChatLayout>
                }
            />

            <Route
                path="/create-chat"
                element={
                    <ColumnChatLayout showMainPage={true} showSideBar={false}>
                        <CreateChat />
                    </ColumnChatLayout>
                }
            />

            <Route
                path="/chat/:chatId"
                element={
                    <ColumnChatLayout showMainPage={true} showSideBar={false}>
                        <ChatRoom />
                    </ColumnChatLayout>
                }
            />

            <Route
                path="/group-chat/:chatId"
                element={
                    <ColumnChatLayout showMainPage={true} showSideBar={false}>
                        <GroupChatRoom />
                    </ColumnChatLayout>
                }
            />

            <Route
                path="/group-chat/:chatId/details"
                element={
                    <ColumnChatLayout showMainPage={true} showSideBar={false}>
                        <GroupDetails />
                    </ColumnChatLayout>
                }
            />

            <Route
                path="/group-chat/:chatId/edit"
                element={
                    <ColumnChatLayout showMainPage={true} showSideBar={false}>
                        <EditGroupChat />
                    </ColumnChatLayout>
                }
            />

            <Route
                path="/group-chat/:chatId/add-members"
                element={
                    <ColumnChatLayout showMainPage={true} showSideBar={false}>
                        <AddMembers />
                    </ColumnChatLayout>
                }
            />
        </Routes>
    );
};

export default ChatRoutes;
