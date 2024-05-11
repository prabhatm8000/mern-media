import { Dispatch, createContext, useContext, useReducer } from "react";
import { MessageActionType, MessageStateType } from "../types/contextTypes";
import { MessageType } from "../../../backend/src/types/types";

export const MessageContext = createContext<{
    state: MessageStateType;
    dispatch: Dispatch<MessageActionType>;
}>({
    state: new Map<string, Array<MessageType>>(),
    dispatch: () => {},
});

export const messagesReducer = (
    state: MessageStateType,
    action: MessageActionType
): MessageStateType => {
    switch (action.type) {
        case "RESET_CHAT_ID":
            state.set(action.payload.chatId, new Array());
            break;
        case "DELETE_CHAT_ID":
            state.delete(action.payload.chatId);
            return new Map<string, MessageType[]>(state.entries());
        case "SET_READ_STATUS": {
            const messages = state.get(action.payload.chatId);
            if (messages === undefined) break;

            const newMessages = messages.map((element) => {
                if (
                    element.sender.toString() !==
                        action.payload.userId
                ) {
                    
                    element.readStatus = true;
                }
                return element;
            });

            state.set(action.payload.chatId, newMessages);
            return new Map<string, MessageType[]>(state.entries());
        }
        case "ADD_MESSAGE":
            const chat = state.get(action.payload.chatId);
            if (!chat) {
                state.set(
                    action.payload.chatId,
                    new Array(action.payload.message)
                );
            } else {
                chat.unshift(action.payload.message);
            }
            return new Map<string, MessageType[]>(state.entries());
        case "ADD_MESSAGES":
            const chats = state.get(action.payload.chatId);
            if (!chats) {
                state.set(
                    action.payload.chatId,
                    new Array(...action.payload.messages)
                );
            } else {
                state.set(
                    action.payload.chatId,
                    chats.concat(action.payload.messages)
                );
            }
            break;
        case "RESET":
            state.clear();
            break;
        default:
            return state;
    }
    return state;
};

export const useMessageContext = () => {
    return useContext(MessageContext);
};

export const MessageContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const initialState: MessageStateType = new Map<
        string,
        Array<MessageType>
    >();
    const [state, dispatch] = useReducer(messagesReducer, initialState);

    return (
        <MessageContext.Provider value={{ state, dispatch }}>
            {children}
        </MessageContext.Provider>
    );
};
