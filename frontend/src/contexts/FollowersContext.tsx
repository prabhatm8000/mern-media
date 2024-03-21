import { Dispatch, createContext, useContext, useReducer } from "react";
import { UserDataBasicType } from "../../../backend/src/types/types";

type StateType = UserDataBasicType[];

type ActionType =
    | {
          type: "SET_FOLLOWERS";
          payload: UserDataBasicType[];
      }
    | { type: "RESET" };

export const FollowersContext = createContext<{
    state: StateType;
    dispatch: Dispatch<ActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const followersReducer = (state: StateType, action: ActionType) => {
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
    const [state, dispatch] = useReducer(followersReducer, [] as StateType);

    return (
        <FollowersContext.Provider value={{ state, dispatch }}>
            {children}
        </FollowersContext.Provider>
    );
};
