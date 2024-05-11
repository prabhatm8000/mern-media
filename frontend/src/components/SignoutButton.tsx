import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../apiClient";
import { useAppContext } from "../contexts/AppContext";
import { BiLogOut } from "react-icons/bi";

import { useSocketContext } from "../contexts/SocketContext.tsx";
import { usePostsContext } from "../contexts/PostContext.tsx";
import { useMessageContext } from "../contexts/MessageContext.tsx";
import { useSearchResultContext } from "../contexts/SearchContext.tsx";
import { useChatsContext } from "../contexts/ChatsContext.tsx";
import { useGroupChatsContext } from "../contexts/GroupChatsContext.tsx";

const SignOutButton = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();

    const socket = useSocketContext();
    const { dispatch: dispatchPosts } = usePostsContext();
    const { dispatch: dispatchMessage } = useMessageContext();
    const { dispatch: dispatchSearchResult } = useSearchResultContext();
    const { dispatch: dispatchChats } = useChatsContext();
    const { dispatch: dispatchGroupChats } = useGroupChatsContext();

    const mutation = useMutation(apiClient.logout, {
        onSuccess: async () => {
            // to make validateToken query invalid, when signing out
            await queryClient.invalidateQueries("validateToken");
            showToast({ message: "Logout successfull!", type: "SUCCESS" });

            socket.disconnect();
            dispatchPosts({type: "RESET"});
            dispatchMessage({type: "RESET"});
            dispatchSearchResult({type: "RESET"});
            dispatchChats({type: "RESET"});
            dispatchGroupChats({type: "RESET"});
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "ERROR" });
        },
    });

    const handleClick = () => {
        mutation.mutate();
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-2 py-2 px-3 rounded-xl hover:scale-105 hover:translate-x-1 hover:bg-red-900 transition-transform delay-75 duration-200"
        >
            <BiLogOut className="translate-x-[-15%] size-6" />
            <span className="font-semibold text-lg">Logout</span>
            {/* Logout */}
        </button>
    );
};

export default SignOutButton;
