import { Dispatch, createContext, useContext, useReducer } from "react";

type StateType = any[];

type ActionType =
    | {
          type: "SET_POSTS";
          payload: any[];
      }
    | { type: "RESET" };

export const PostsContext = createContext<{
    state: StateType;
    dispatch: Dispatch<ActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const postsReducer = (state: StateType, action: ActionType) => {
    switch (action.type) {
        case "SET_POSTS":
            return action.payload;
        case "RESET":
            return [];
        default:
            return state;
    }
};

export const usePostsContext = () => {
    return useContext(PostsContext);
};

export const PostsContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, dispatch] = useReducer(postsReducer, [] as StateType);

    return (
        <PostsContext.Provider value={{ state, dispatch }}>
            {children}
        </PostsContext.Provider>
    );
};
