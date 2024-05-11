import { Dispatch, createContext, useContext, useReducer } from "react";
import { ChatBasicDataType } from "../../../backend/src/types/types";
import { ChatsActionType, ChatsStateType } from "../types/contextTypes";

export const ChatsContext = createContext<{
    state: ChatsStateType;
    dispatch: Dispatch<ChatsActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const chatContextReducer = (
    state: ChatsStateType,
    action: ChatsActionType
) => {
    switch (action.type) {
        case "SET":
            return action.payload;
        case "RESET":
            return [];
        case "DELETE_CHAT": {
            return state.filter(
                (data) => data._id.toString() !== action.payload.chatId
            );
        }
        case "UPDATE_CHATDATA": {
            let flag = false;
            const newData: ChatBasicDataType[] = state.map((data) => {
                if (data._id.toString() === action.payload.chatId) {
                    data.lastMessage = action.payload.chatData.lastMessage;
                    data.lastMessageOn = action.payload.chatData.lastMessageOn;
                    flag = true;
                }
                return data;
            });
            if (!flag) {
                const chatData: ChatBasicDataType = action.payload.chatData;
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
        default:
            return state;
    }
};

export const useChatsContext = () => {
    return useContext(ChatsContext);
};

export const ChatsContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, dispatch] = useReducer(
        chatContextReducer,
        [] as ChatsStateType
    );

    return (
        <ChatsContext.Provider value={{ state, dispatch }}>
            {children}
        </ChatsContext.Provider>
    );
};
