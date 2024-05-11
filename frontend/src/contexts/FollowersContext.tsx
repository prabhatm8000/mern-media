import { Dispatch, createContext, useContext, useReducer } from "react";
import { FollowersActionType, FollowersStateType } from "../types/contextTypes";

export const FollowersContext = createContext<{
    state: FollowersStateType;
    dispatch: Dispatch<FollowersActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const followersReducer = (state: FollowersStateType, action: FollowersActionType) => {
    switch (action.type) {
        case "SET_FOLLOWERS":
            return action.payload;
        case "RESET":
            return [];
        default:
            return state;
    }
};

export const useFollowersContext = () => {
    return useContext(FollowersContext);
};

export const FollowersContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, dispatch] = useReducer(followersReducer, [] as FollowersStateType);

    return (
        <FollowersContext.Provider value={{ state, dispatch }}>
            {children}
        </FollowersContext.Provider>
    );
};
