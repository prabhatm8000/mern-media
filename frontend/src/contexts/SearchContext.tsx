import { Dispatch, createContext, useContext, useReducer } from "react";
import { UserDataBasicType } from "../../../backend/src/types/types";

type StateType = UserDataBasicType[];

type ActionType =
    | {
          type: "SET_SEARCHRESULT";
          payload: UserDataBasicType[];
      }
    | { type: "RESET" };

export const SearchResultContext = createContext<{
    state: StateType;
    dispatch: Dispatch<ActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const searchResultReducer = (state: StateType, action: ActionType) => {
    switch (action.type) {
        case "SET_SEARCHRESULT":
            return action.payload;
        case "RESET":
            return [];
        default:
            return state;
    }
};

export const useSearchResultContext = () => {
    return useContext(SearchResultContext);
};

export const SearchResultContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, dispatch] = useReducer(searchResultReducer, [] as StateType);

    return (
        <SearchResultContext.Provider value={{ state, dispatch }}>
            {children}
        </SearchResultContext.Provider>
    );
};
