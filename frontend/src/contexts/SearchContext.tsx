import { Dispatch, createContext, useContext, useReducer } from "react";
import { SearchActionType, SearchStateType } from "../types/contextTypes";

export const SearchResultContext = createContext<{
    state: SearchStateType;
    dispatch: Dispatch<SearchActionType>;
}>({
    state: [],
    dispatch: () => {},
});

export const searchResultReducer = (
    state: SearchStateType,
    action: SearchActionType
) => {
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
    const [state, dispatch] = useReducer(
        searchResultReducer,
        [] as SearchStateType
    );

    return (
        <SearchResultContext.Provider value={{ state, dispatch }}>
            {children}
        </SearchResultContext.Provider>
    );
};
