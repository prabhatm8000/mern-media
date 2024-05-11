import { Dispatch, createContext, useContext, useReducer } from "react";
import {
    FollowingsActionType,
    FollowingsStateType,
} from "../types/contextTypes";

export const FollowingsContext = createContext<{
    state: FollowingsStateType;
    dispatch: Dispatch<FollowingsActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const followingsReducer = (
    state: FollowingsStateType,
    action: FollowingsActionType
) => {
    switch (action.type) {
        case "SET_FOLLOWINGS":
            return action.payload;
        case "RESET":
            return [];
        default:
            return state;
    }
};

export const useFollowingsContext = () => {
    return useContext(FollowingsContext);
};

export const FollowingsContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, dispatch] = useReducer(
        followingsReducer,
        [] as FollowingsStateType
    );

    return (
        <FollowingsContext.Provider value={{ state, dispatch }}>
            {children}
        </FollowingsContext.Provider>
    );
};
