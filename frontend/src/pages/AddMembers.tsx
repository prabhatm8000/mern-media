import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoCloseSharp, IoSend } from "react-icons/io5";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { UserDataBasicType } from "../../../backend/src/types/types";
import * as apiClient from "../apiClient";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import SearchResultCard from "../components/SearchResultCard";
import SearchResultCardLoading from "../components/skeletonLoadings/SearchResultCardLoading";
import { useAppContext } from "../contexts/AppContext";

const AddMembers = () => {
    const { chatId } = useParams();
    const { showToast } = useAppContext();
    const navigation = useNavigate();

    // search
    // #region
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<UserDataBasicType[]>([]);

    const fetchResult = async () => {
        const res = await apiClient.searchUser(searchQuery, 1, 12);
        setSearchResults(res);
    };

    useEffect(() => {
        if (searchQuery.length < 2) return;

        let timeoutId: string | number | NodeJS.Timeout | undefined;

        const fetchData = async () => {
            setIsFetching(true);
            await fetchResult();
            setIsFetching(false);
        };

        const throttledFetch = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    fetchData();
                    timeoutId = undefined;
                }, 1500);
            }
        };

        throttledFetch(); // Call throttledFetch when the effect runs initially

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    // #endregion

    const [members, setMembers] = useState<string[]>([]);

    const addMember = (username: string) => {
        setMembers((prev) => {
            if (!prev.includes(username)) {
                return [...prev, username];
            }
            return prev;
        });
    };

    const removeMember = (username: string) => {
        setMembers((prev) => {
            const temp = prev.filter((member) => member !== username);
            return temp;
        });
    };

    const { isFetching: isAddingMembers, refetch: addMembersToGroup } =
        useQuery(
            "addingMembersToGroup",
            () => apiClient.addMembersToGroup(members, chatId as string),
            {
                enabled: false,
                refetchOnWindowFocus: false,
                keepPreviousData: true,
                onSuccess: () => {
                    showToast({ type: "SUCCESS", message: "Members added!" });
                    navigation(`/chats/group-chat/${chatId as string}`);
                },
                onError: (error: Error) => {
                    showToast({ type: "ERROR", message: error.message });
                },
            }
        );

    const handleAddMembers = () => {
        addMembersToGroup();
    };

    return (
        <div className="flex flex-col gap-2 h-screen p-4 overflow-hidden">
            {/* search input form */}
            <div className="flex justify-center relative">
                <input
                    autoFocus
                    autoComplete="off"
                    className="px-3 py-1 text-md bg-neutral-700 rounded-full md:w-[400px] lg:md:w-[600px] focus:outline-none"
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value.toLowerCase());
                    }}
                />
                <Link
                    to={`/chats/group-chat/${chatId as string}`}
                    className="absolute left-0"
                >
                    <IoMdArrowRoundBack className="size-7" />
                </Link>
            </div>

            {/* SearchResults */}
            <div className="flex flex-col items-center gap-3 mt-4 h-full overflow-y-auto">
                {searchResults.length > 0 && (
                    <>
                        {searchResults.map((searchResult, i) => {
                            return (
                                <div
                                    key={i}
                                    className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px] flex justify-between items-center gap-2"
                                >
                                    <SearchResultCard
                                        searchResult={searchResult}
                                    />
                                    <button
                                        className="p-1 focus:outline-none rounded-full bg-cyan-800"
                                        onClick={() =>
                                            addMember(
                                                searchResult.username as string
                                            )
                                        }
                                    >
                                        <BiPlus className="size-7" />
                                    </button>
                                </div>
                            );
                        })}
                    </>
                )}

                {isFetching && (
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

            {/* members list */}
            {members.length > 0 && (
                <div className="p-2 rounded-md bg-cyan-700 bottom-0 left-0 w-full flex flex-wrap justify-start items-center gap-2 h-12 overflow-y-hidden">
                    <button
                        disabled={isAddingMembers}
                        onClick={handleAddMembers}
                        className="focus:outline-none rounded-full bg-cyan-900 px-2 py-1 flex justify-center items-center gap-2 w-fit"
                    >
                        {isAddingMembers ? (
                            <>
                                <span>Adding</span>
                                <LoadingCircleSvg className="size-5" />
                            </>
                        ) : (
                            <>
                                <span>Add</span>
                                <IoSend className="size-5" />
                            </>
                        )}
                    </button>
                    {members.map((username, index) => {
                        if (index === members.length - 1) {
                            return (
                                <button
                                    onClick={() => {
                                        removeMember(username);
                                    }}
                                    className="focus:outline-none rounded-full bg-cyan-600 px-2 py-1 flex items-center gap-1 w-fit"
                                    key={index}
                                >
                                    {username}
                                    <IoCloseSharp className="size-5" />
                                </button>
                            );
                        }
                        return (
                            <button
                                onClick={() => {
                                    removeMember(username);
                                }}
                                className="focus:outline-none rounded-full bg-cyan-600 px-2 py-1 flex items-center gap-1 w-fit"
                                key={index}
                            >
                                {username}
                                <IoCloseSharp className="size-5" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AddMembers;
