import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { useQuery } from "react-query";
import * as apiClient from "../apiClient";
import SearchResultCard from "../components/SearchResultCard";
import SearchResultCardLoading from "../components/skeletonLoadings/SearchResultCardLoading";
import { useSearchResultContext } from "../contexts/SearchContext";

const SEARCH_LIMIT = 10;

const Search = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);
    const [autoCompleteClicked, setAutoCompleteClicked] =
        useState<boolean>(false);

    // autocomplete
    // #region
    const { data: autoComplete, refetch: fetchAutoComplete } = useQuery(
        "gettingSearchAutoComplete",
        () => apiClient.searchAutoComplete(searchQuery),
        {
            enabled: false,
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
        let id: number;
        if (
            searchQuery.length > 1 &&
            !autoCompleteClicked &&
            !searchBtnClicked
        ) {
            // debouncing
            id = setTimeout(fetchAutoComplete, 1500);
        } else {
            setShowAutoComplete(false);
        }
        return () => {
            clearTimeout(id);
            if (autoCompleteClicked) {
                setAutoCompleteClicked(false);
            }
        };
    }, [searchQuery, autoCompleteClicked]);

    const handleAutoCompleteClick = (e: MouseEvent<HTMLHeadingElement>) => {
        setAutoCompleteClicked(true);
        setSearchQuery(e.currentTarget.innerText);
        handleSearchBtn();
    };

    useEffect(() => {
        if (!showAutoComplete) return;
        
        const handleEscapeKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowAutoComplete(false);
            }
        };

        addEventListener("keydown", handleEscapeKeydown);

        return () => {
            removeEventListener("keydown", handleEscapeKeydown);
        };
    }, [showAutoComplete]);
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

    const handleSearchBtn = () => {
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
                    setSearchBtnClicked(false);
                } else setHasMore(false);
            });
        }
    }, [page, searchBtnClicked]);
    // #endregion

    return (
        // {pt-16 md:pt-0} <- for top nav bar in mobile screen
        <div className="pt-16 md:pt-4 p-4 overflow-hidden h-screen grid grid-rows-[50px_1fr] gap-4">
            {/* search input form section */}
            <div className="flex flex-col relative">
                {/* search input form */}
                <form
                    className="flex justify-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearchBtn();
                    }}
                >
                    <input
                        autoFocus
                        className="px-6 py-2 text-lg bg-black2 placeholder:text-whiteAlpha1 border border-e-0 border-whiteAlpha2 rounded-s-full md:w-[400px] lg:md:w-[600px] focus:outline-none"
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(e.target.value.toLowerCase())
                        }
                    />
                    <button
                        className="bg-black2 px-4 border border-s-0 border-whiteAlpha2 rounded-e-full"
                        type="submit"
                    >
                        <BiSearch className="size-6" />
                    </button>
                </form>

                {/* SearchAutoComplete */}
                {showAutoComplete && (
                    <div className="relative flex justify-center mt-2">
                        {autoComplete && (
                            <div className="absolute px-3 mt-1 rounded-md bg-stone-800 flex flex-col gap-1 w-[240px] md:w-[440px] lg:w-[640px]">
                                {autoComplete.map((item, i) => {
                                    return (
                                        <h4
                                            className={`cursor-pointer text-md text-stone-400 hover:text-stone-100 py-1 border-0 ${
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

            {/* SearchResults */}
            <div className="flex flex-col overflow-y-auto overflow-x-hidden items-center gap-2 rounded-lg border border-whiteAlpha2 p-4">
                {searchResults.length > 0 &&
                    searchResults.map((searchResult, i) => {
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

                {loadingResults && (
                    <>
                        <div className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]">
                            <SearchResultCardLoading />
                        </div>
                        <div className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]">
                            <SearchResultCardLoading />
                        </div>
                        <div className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]">
                            <SearchResultCardLoading />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Search;
