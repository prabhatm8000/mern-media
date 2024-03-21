import { Dispatch, createContext, useContext, useReducer } from "react";
import { UserDataBasicType } from "../../../backend/src/types/types";

type StateType = UserDataBasicType[];

type ActionType =
    | {
          type: "SET_FOLLOWINGS";
          payload: UserDataBasicType[];
      }
    | { type: "RESET" };

export const FollowingsContext = createContext<{
    state: StateType;
    dispatch: Dispatch<ActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const followingsReducer = (state: StateType, action: ActionType) => {
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
    const [state, dispatch] = useReducer(followingsReducer, [] as StateType);

    return (
        <FollowingsContext.Provider value={{ state, dispatch }}>
            {children}
        </FollowingsContext.Provider>
    );
};
