import { Dispatch, createContext, useContext, useReducer } from "react";
import { PostCommentUserDataType } from "../../../backend/src/types/types";

type StateType = PostCommentUserDataType[];

type ActionType =
     {
          type: "SET_COMMENTS";
          payload: PostCommentUserDataType[];
      }
    | {
          type: "ADD_COMMENTS";
          payload: PostCommentUserDataType[];
      }
    | { type: "RESET" };

export const CommentsContext = createContext<{
    state: StateType;
    dispatch: Dispatch<ActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const commentsReducer = (state: StateType, action: ActionType) => {
    switch (action.type) {
        case "SET_COMMENTS":
            return action.payload;
        case "ADD_COMMENTS":
            return [...state, ...action.payload];
        case "RESET":
            return [];
        default:
            return state;
    }
};

export const useCommentsContext = () => {
    return useContext(CommentsContext);
};

export const CommentsContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, dispatch] = useReducer(commentsReducer, [] as StateType);

    return (
        <CommentsContext.Provider value={{ state, dispatch }}>
            {children}
        </CommentsContext.Provider>
    );
};
