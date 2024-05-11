import { Dispatch, createContext, useContext, useReducer } from "react";
import { PostActionType, PostStateType } from "../types/contextTypes";

export const PostsContext = createContext<{
    state: PostStateType;
    dispatch: Dispatch<PostActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const postsReducer = (state: PostStateType, action: PostActionType) => {
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
    const [state, dispatch] = useReducer(postsReducer, [] as PostStateType);

    return (
        <PostsContext.Provider value={{ state, dispatch }}>
            {children}
        </PostsContext.Provider>
    );
};
