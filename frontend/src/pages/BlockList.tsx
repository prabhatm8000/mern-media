import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

// api
import * as apiClient from "../apiClient";

import { IoMdArrowRoundBack } from "react-icons/io";
import type { UserDataBasicType } from "../../../backend/src/types/types";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import SearchResultCard from "../components/SearchResultCard";
import SearchResultCardLoading from "../components/skeletonLoadings/SearchResultCardLoading";
import { useAppContext } from "../contexts/AppContext";

const BLOCKED_USER_LIMIT = 7;

const BlockList = () => {
    const { showToast } = useAppContext();

    // block list
    // #region
    const [blockListPage, setBlockListPage] = useState<number>(1);
    const [hasMoreBlockedUsers, setHasMoreBlockedUsers] =
        useState<boolean>(true);
    const [blockedUsersList, setBlockedUsersList] = useState<
        UserDataBasicType[]
    >([]);
    const [noOfBlockedUser, setNoOfBlockedUser] = useState<number>(0);
    const [isUnblockingUserId, setIsUnblockingUserId] = useState<string>("");

    const removeUserFromList = (userId: string) => {
        setBlockedUsersList((prev) => {
            return prev.filter((data) => {
                if (data.userId.toString() !== userId) {
                    return data;
                }
            });
        });
    };

    const { refetch: fetchBlockedUsers, isFetching: loadingBlockedUsers } =
        useQuery(
            "fetchingBlocketUser",
            () => apiClient.getBlockedList(blockListPage, BLOCKED_USER_LIMIT),
            {
                enabled: false,
                refetchOnWindowFocus: false,
            }
        );

    const BlockedUserObserver = useRef<IntersectionObserver | null>();

    const lastBlockedCardRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingBlockedUsers) return;

            if (BlockedUserObserver.current)
                BlockedUserObserver.current.disconnect();

            BlockedUserObserver.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMoreBlockedUsers) {
                        setBlockListPage((prev) => prev + 1);
                    }
                }
            );

            if (element) BlockedUserObserver.current?.observe(element);
        },
        [loadingBlockedUsers, hasMoreBlockedUsers]
    );

    useEffect(() => {
        if (blockListPage > 0) {
            fetchBlockedUsers().then((result) => {
                if (result.data && result.data.blockedUserList.length > 0) {
                    setNoOfBlockedUser(result.data.noBlockedUsers);
                    setBlockedUsersList((prev) => [
                        ...prev,
                        ...result.data.blockedUserList,
                    ]);
                    if (result.data.blockedUserList.length < BLOCKED_USER_LIMIT)
                        setHasMoreBlockedUsers(false);
                } else setHasMoreBlockedUsers(false);
            });
        } else if (blockListPage === -1) {
            setBlockListPage(1);
        }
    }, [blockListPage]);
    // #endregion

    // unblock user
    // block user
    const handleUnblockBtn = async (userData: UserDataBasicType) => {
        setIsUnblockingUserId(userData.userId.toString());
        try {
            await apiClient.blockUnblockUser(userData.userId.toString());
            showToast({
                type: "SUCCESS",
                message: `${userData.username} is unblocked!`,
            });
            removeUserFromList(userData.userId.toString());
            setNoOfBlockedUser((prev) => (!prev ? prev : prev - 1));
        } catch (error) {
            showToast({
                type: "ERROR",
                message: "Something went wrong",
            });
        }
        setIsUnblockingUserId("");
    };

    return (
        <div className="flex flex-col gap-2 h-screen p-2 overflow-hidden">
            <div className="flex items-center gap-2 py-2 border-b border-whiteAlpha2">
                <Link to={"/chats"}>
                    <IoMdArrowRoundBack className="size-7" />
                </Link>
                <h3 className="text-lg">Block list</h3>
                <h3 className="text-whiteAlpha1">{`(${noOfBlockedUser} users)`}</h3>
            </div>

            <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden items-center gap-3 rounded-lg border border-whiteAlpha2 p-4">
                {blockedUsersList.length > 0 &&
                    blockedUsersList.map((data, i) => {
                        if (blockedUsersList.length === i + 1) {
                            return (
                                <div
                                    ref={lastBlockedCardRef}
                                    key={i}
                                    className="w-full flex justify-between gap-2"
                                >
                                    <SearchResultCard searchResult={data} />
                                    <button
                                        className="px-3 py-1 text-red-500 rounded-md hover:bg-black2 flex gap-2 items-center focus:outline-none"
                                        onClick={() => handleUnblockBtn(data)}
                                        disabled={
                                            data.userId &&
                                            isUnblockingUserId ===
                                                data.userId.toString()
                                        }
                                    >
                                        {data.userId &&
                                        isUnblockingUserId ===
                                            data.userId.toString() ? (
                                            <>
                                                <LoadingCircleSvg className="size-6" />
                                                Unblocking
                                            </>
                                        ) : (
                                            <>
                                                Unblock
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        }
                        return (
                            <div
                                key={i}
                                className="w-full flex justify-between gap-2 border-b border-whiteAlpha2 pb-2"
                            >
                                <SearchResultCard searchResult={data} />
                                <button
                                    className="px-3 py-1 text-red-500 rounded-md hover:bg-black2 flex gap-2 items-center focus:outline-none"
                                    onClick={() => handleUnblockBtn(data)}
                                    disabled={
                                        data.userId &&
                                        isUnblockingUserId ===
                                            data.userId.toString()
                                    }
                                >
                                    {data.userId &&
                                    isUnblockingUserId ===
                                        data.userId.toString() ? (
                                        <>
                                            <LoadingCircleSvg className="size-6" />
                                            Unblocking
                                        </>
                                    ) : (
                                        <>
                                            Unblock
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}

                {loadingBlockedUsers && (
                    <>
                        <div className="w-full flex justify-between gap-2 border-b border-whiteAlpha2 pb-2">
                            <SearchResultCardLoading />
                        </div>
                        <div className="w-full flex justify-between gap-2 border-b border-whiteAlpha2 pb-2">
                            <SearchResultCardLoading />
                        </div>
                        <div className="w-full flex justify-between gap-2 border-b border-whiteAlpha2 pb-2">
                            <SearchResultCardLoading />
                        </div>
                    </>
                )}
                {!loadingBlockedUsers && blockedUsersList.length === 0 && (
                    <div className="text-whiteAlpha1">No users blocked</div>
                )}
            </div>
        </div>
    );
};

export default BlockList;
