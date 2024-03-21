import { BiSearch } from "react-icons/bi";
import { useQuery } from "react-query";
import * as apiClient from "../apiClient";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import SearchResultCard from "../components/SearchResultCard";
import Loading from "../components/Loading";
import { useSearchResultContext } from "../contexts/SearchContext";

const SEARCH_LIMIT = 5;

const Search = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);

    // autocomplete
    // #region
    const { data: autoComplete, refetch: fetchAutoComplete } = useQuery(
        "gettingSearchAutoComplete",
        () => apiClient.searchAutoComplete(searchQuery),
        {
            enabled: searchQuery.length > 1,
            refetchOnWindowFocus: false,
            onSuccess: () => {
                setShowAutoComplete(true);
            },
            onError: () => {
                setShowAutoComplete(false);
            },
        }
    );

    useEffect(() => {
        if (searchQuery.length > 1) {
            fetchAutoComplete();
        } else {
            setShowAutoComplete(false);
        }
    }, [searchQuery]);

    const handleAutoCompleteClick = (e: MouseEvent<HTMLHeadingElement>) => {
        setSearchQuery(e.currentTarget.innerText);
    };
    // #endregion

    // search
    // #region
    const [page, setPage] = useState<number>(1);
    const { state: searchResults, dispatch } = useSearchResultContext();
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [searchBtnClicked, setSearchBtnClicked] = useState<boolean>(false);

    const { refetch: fetchResult, isFetching: loadingResults } = useQuery(
        "gettingSearch",
        () => apiClient.searchUser(searchQuery, page, SEARCH_LIMIT),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            keepPreviousData: true,
        }
    );

    const handleSubmitBtn = () => {
        setShowAutoComplete(false);
        setHasMore(true);
        dispatch({ type: "RESET" });
        setPage(1);
        setSearchBtnClicked(true);
    };

    const observer = useRef<IntersectionObserver | null>();

    const lastSearchResultCardRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingResults) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev) => prev + 1);
                    setSearchBtnClicked(false);
                }
            });

            if (element) observer.current?.observe(element);
        },
        [loadingResults]
    );

    useEffect(() => {
        if ((searchQuery.length > 0 && page > 1) || searchBtnClicked) {
            fetchResult().then((result) => {
                if (result.data && result.data?.length > 0) {
                    dispatch({
                        type: "SET_SEARCHRESULT",
                        payload: [...searchResults, ...result.data],
                    });
                    if (result.data.length < SEARCH_LIMIT) setHasMore(false);
                } else setHasMore(false);
            });
        }
    }, [page, searchBtnClicked]);
    // #endregion

    return (
        <div>
            {/* search input form section */}
            <div className="flex flex-col">
                {/* search input form */}
                <form
                    className="flex justify-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitBtn();
                    }}
                >
                    <input
                        autoFocus
                        className="px-3 py-1 text-md bg-neutral-700 rounded-s-full md:w-[400px] lg:md:w-[600px] focus:outline-none"
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(e.target.value.toLowerCase())
                        }
                    />
                    <button
                        className="text-2xl bg-neutral-700 py-1 px-2 rounded-e-full"
                        type="submit"
                    >
                        <BiSearch />
                    </button>
                </form>

                {/* SearchAutoComplete */}
                {showAutoComplete && (
                    <div className="relative flex justify-center">
                        {autoComplete && (
                            <div className="absolute px-3 mt-1 rounded-md bg-neutral-700 flex flex-col w-[240px] md:w-[440px] lg:w-[640px]">
                                {autoComplete.map((item, i) => {
                                    return (
                                        <h4
                                            className={`cursor-pointer text-md text-neutral-400 hover:text-neutral-300 border-0 ${
                                                i !== autoComplete.length - 1
                                                    ? "border-b-[1px] border-neutral-600"
                                                    : ""
                                            }`}
                                            key={i}
                                            onClick={handleAutoCompleteClick}
                                        >
                                            {item.username}
                                        </h4>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* todo: SearchResults */}
            {searchResults.length > 0 && (
                <div className="flex flex-col items-center gap-3 mt-4">
                    <h3 className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]">
                        <i className="text-neutral-400">Search Result for: </i>
                        {searchQuery}
                    </h3>
                    {searchResults.map((searchResult, i) => {
                        if (searchResults.length === i + 1) {
                            return (
                                <div
                                    ref={lastSearchResultCardRef}
                                    key={i}
                                    className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]"
                                >
                                    <SearchResultCard
                                        searchResult={searchResult}
                                    />
                                </div>
                            );
                        }
                        return (
                            <div
                                key={i}
                                className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]"
                            >
                                <SearchResultCard searchResult={searchResult} />
                            </div>
                        );
                    })}
                </div>
            )}

            {loadingResults && <Loading />}
        </div>
    );
};

export default Search;
