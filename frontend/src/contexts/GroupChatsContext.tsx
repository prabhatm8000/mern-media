import { Dispatch, createContext, useContext, useReducer } from "react";
import {
    GroupChatsActionType,
    GroupChatsStateType,
} from "../types/contextTypes";
import { GroupChatBasicDataType } from "../../../backend/src/types/types";

export const GroupChatsContext = createContext<{
    state: GroupChatsStateType;
    dispatch: Dispatch<GroupChatsActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const GroupChatContextReducer = (
    state: GroupChatsStateType,
    action: GroupChatsActionType
) => {
    switch (action.type) {
        case "SET":
            return action.payload;
        case "RESET":
            return [];
        case "UPDATE_CHATDATA": {
            let flag = false;
            const newData: GroupChatBasicDataType[] = state.map((data) => {
                if (data._id.toString() === action.payload.chatId) {
                    data.lastMessage = action.payload.chatData.lastMessage;
                    data.lastMessageOn = action.payload.chatData.lastMessageOn;
                    flag = true;
                }
                return data;
            });

            if (!flag) {
                const chatData: GroupChatBasicDataType =
                    action.payload.chatData;
                newData.push(chatData);
            }
            return newData.sort((a, b) => {
                return (
                    new Date(b.lastMessageOn).getTime() -
                    new Date(a.lastMessageOn).getTime()
                );
            });
        }
        case "UPDATE_NEW_MESSAGE": {
            state.forEach((data) => {
                if (data._id.toString() === action.payload.chatId) {
                    data.newMessage = action.payload.newStatus;
                    return;
                }
            });
            return [...state];
        }
        case "DELETE_CHAT": {
            return state.filter(
                (data) => data._id.toString() !== action.payload.chatId
            );
        }
        default:
            return state;
    }
};

export const useGroupChatsContext = () => {
    return useContext(GroupChatsContext);
};

export const GroupChatsContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, dispatch] = useReducer(
        GroupChatContextReducer,
        [] as GroupChatsStateType
    );

    return (
        <GroupChatsContext.Provider value={{ state, dispatch }}>
            {children}
        </GroupChatsContext.Provider>
    );
};
