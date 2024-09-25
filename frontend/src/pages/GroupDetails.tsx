import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import * as apiClient from "../apiClient";
import { useAppContext } from "../contexts/AppContext";

// image
import { AiOutlineClose } from "react-icons/ai";
import { BsPersonFillDash } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import type { UserDataBasicType } from "../../../backend/src/types/types";
import ImageComponent from "../components/Image";
import LoadingCircleSvg from "../components/LoadingCircleSvg";
import SearchResultCard from "../components/SearchResultCard";
import GroupDetailsLoading from "../components/skeletonLoadings/GroupDetailsLoading";
import SearchResultCardLoading from "../components/skeletonLoadings/SearchResultCardLoading";

const MEMBERS_LIMIT = 7;

const GroupDetails = () => {
    const { chatId } = useParams();
    const { showToast, currUserId } = useAppContext();
    const [noOfMembers, setNoOfMembers] = useState<number>();
    const [searchQuery, setSearchQuery] = useState<string>("");

    // chatData
    const { data: groupChatData, refetch: fetchGroupChatDetails } = useQuery(
        "fetchingGroupChatDetails",
        () => apiClient.fetchGroupDetails(chatId as string),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            keepPreviousData: true,
            onError: (error: Error) => {
                showToast({ type: "ERROR", message: error.message });
            },
        }
    );

    useEffect(() => {
        fetchGroupChatDetails();
    }, [chatId]);

    useEffect(() => {
        setNoOfMembers(groupChatData?.noOfMembers);
    }, [groupChatData]);

    // members
    // #region
    const [members, setMembers] = useState<UserDataBasicType[]>([]);
    const [membersPage, setMembersPage] = useState<number>(1);
    const [hasMoreMembers, setHasMoreMembers] = useState<boolean>(true);

    const { refetch: fetchMembers, isFetching: loadingMembers } = useQuery(
        "fetchingMembers",
        () =>
            apiClient.fetchGroupMembers(
                chatId as string,
                membersPage,
                MEMBERS_LIMIT
            ),
        {
            enabled: false,
            refetchOnWindowFocus: false,
        }
    );

    const membersObserver = useRef<IntersectionObserver | null>();

    const lastSearchResultCardFollowersRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingMembers) return;

            if (membersObserver.current) membersObserver.current.disconnect();

            membersObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreMembers) {
                    setMembersPage((prev) => prev + 1);
                }
            });

            if (element) membersObserver.current?.observe(element);
        },
        [loadingMembers, hasMoreMembers]
    );

    useEffect(() => {
        if (membersPage > 0 && searchQuery.length < 2) {
            fetchMembers().then((result) => {
                if (result.data && result.data?.length > 0) {
                    setMembers((prev) => [...prev, ...result.data]);
                    if (result.data.length < MEMBERS_LIMIT)
                        setHasMoreMembers(false);
                } else setHasMoreMembers(false);
            });
        } else if (membersPage === -1) {
            setMembersPage(1);
        }
    }, [membersPage, searchQuery]);
    // #endregion

    // removing member
    // #region
    const [isRemovingMember, setIsRemovingMember] = useState<string>("");

    const handleRemoveMemberBtn = async (userId: string) => {
        setIsRemovingMember(userId);
        try {
            await apiClient.removeMemberFromGroup(userId, chatId as string);
            showToast({
                type: "SUCCESS",
                message: "Member removed!",
            });
            setMembers((prev) =>
                prev.filter((data) => data.userId.toString() !== userId)
            );
            setNoOfMembers((prev) => (!prev ? prev : prev - 1));
        } catch (error) {
            showToast({
                type: "ERROR",
                message: "Something went wrong",
            });
        }
        setIsRemovingMember("");
    };
    // #endregion

    // search member
    // #region
    const { refetch: searchMembers, isFetching: searchingMembers } = useQuery(
        "searchingMembers",
        () =>
            apiClient.searchGroupMembers(
                chatId as string,
                searchQuery,
                1,
                MEMBERS_LIMIT
            ),
        {
            enabled: false,
            refetchOnWindowFocus: false,
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        let timeoutId: number | undefined;

        if (searchQuery.length >= 2) {
            timeoutId = setTimeout(
                () =>
                    searchMembers().then((result) => {
                        if (result.data) setMembers([...result.data]);
                    }),
                1500
            );
        } else {
            setMembers([]);
            setMembersPage(1);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [searchQuery]);

    // #endregion

    return (
        // {pt-14 md:pt-0} <- for top nav bar in mobile screen
        <div className="pt-8 p-4 h-screen overflow-auto flex flex-col gap-2 relative">
            <Link
                to={`/chats/group-chat/${chatId}`}
                className="absolute top-0 left-0 my-4"
            >
                <IoMdArrowRoundBack className="size-7" />
            </Link>

            {/* profile data */}
            {groupChatData ? (
                <>
                    <div
                        className={`flex flex-col gap-2 pb-2 transition delay-100 duration-300 border-b border-whiteAlpha2`}
                    >
                        <div className="relative w-fit">
                            <ImageComponent
                                src={groupChatData.groupPictureUrl}
                                className="w-[150px] h-[150px] object-cover rounded-full border border-whiteAlpha1"
                            />
                            {groupChatData.creatorUserData.userId.toString() ===
                                currUserId && (
                                <Link
                                    className="absolute bottom-[15%] translate-y-[50%] right-[15%] translate-x-[50%] p-1.5 rounded-full bg-blue-500 border border-blue-300"
                                    to={`/chats/group-chat/${groupChatData._id}/edit`}
                                    title="Edit Group"
                                >
                                    <MdEdit className="size-6" />
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-poppins-bold">
                                {groupChatData.name}
                            </h2>
                            <div className="relative max-h-[200px] overflow-y-auto">
                                {groupChatData.description}
                            </div>
                        </div>

                        <div className="flex gap-2 items-center">
                            <Link
                                to={`/profile/${groupChatData.creatorUserData.userId.toString()}`}
                            >
                                <ImageComponent
                                    src={
                                        groupChatData.creatorUserData
                                            .profilePictureUrl
                                    }
                                    className="size-[60px] object-cover rounded-full opacity-80"
                                />
                            </Link>

                            <Link
                                to={`/profile/${groupChatData.creatorUserData.userId.toString()}`}
                            >
                                <h2 className="font-poppins-bold">
                                    {groupChatData.creatorUserData.name}
                                </h2>
                                <h4 className="text-sm font-semibold text-neutral-400">
                                    {groupChatData.creatorUserData.username +
                                        " (Creator)"}
                                </h4>
                            </Link>
                        </div>
                    </div>
                    <h2 className="text-xl font-poppins-bold">
                        {noOfMembers} Members
                        <div className="my-2 font-poppins-light flex justify-between bg-black2 mx-3 w-[calc(100%-24px)] px-4 py-2 rounded-full">
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Search"
                                className="focus:outline-none bg-transparent placeholder:text-whiteAlpha1 w-full"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                value={searchQuery}
                            />
                            {searchQuery.length !== 0 && (
                                <button
                                    className="focus:outline-none"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <AiOutlineClose className="size-6 text-white3" />
                                </button>
                            )}
                        </div>
                    </h2>
                </>
            ) : (
                <GroupDetailsLoading />
            )}

            <div className="flex flex-col gap-2 px-3">
                {members.map((data, i) => {
                    if (members.length === i + 1 && searchQuery.length < 2) {
                        return (
                            <div
                                ref={lastSearchResultCardFollowersRef}
                                key={i}
                                className="w-full flex justify-between gap-2"
                            >
                                <SearchResultCard searchResult={data} />
                                {groupChatData &&
                                    groupChatData.creatorUserData.userId.toString() ===
                                        currUserId &&
                                    data.userId.toString() !== currUserId && (
                                        <button
                                            onClick={() =>
                                                handleRemoveMemberBtn(
                                                    data.userId.toString()
                                                )
                                            }
                                            className="text-red-500"
                                            title="Remove Member"
                                        >
                                            {isRemovingMember ===
                                            data.userId.toString() ? (
                                                <LoadingCircleSvg className="size-6" />
                                            ) : (
                                                <BsPersonFillDash className="size-6" />
                                            )}
                                        </button>
                                    )}
                            </div>
                        );
                    }
                    return (
                        <div
                            key={i}
                            className="w-full flex justify-between gap-2 border-b border-whiteAlpha2 pb-2"
                        >
                            <SearchResultCard searchResult={data} />
                            {groupChatData &&
                                groupChatData.creatorUserData.userId.toString() ===
                                    currUserId &&
                                data.userId.toString() !== currUserId && (
                                    <button
                                        onClick={() =>
                                            handleRemoveMemberBtn(
                                                data.userId.toString()
                                            )
                                        }
                                        className="text-red-500"
                                        title="Remove Member"
                                        disabled={
                                            isRemovingMember ===
                                            data.userId.toString()
                                        }
                                    >
                                        {isRemovingMember ===
                                        data.userId.toString() ? (
                                            <LoadingCircleSvg className="size-6" />
                                        ) : (
                                            <BsPersonFillDash className="size-6" />
                                        )}
                                    </button>
                                )}
                        </div>
                    );
                })}
                {(loadingMembers || searchingMembers) && (
                    <LoadingMembersSkeleton />
                )}
            </div>
        </div>
    );
};

export default GroupDetails;

const LoadingMembersSkeleton = () => {
    return (
        <>
            <div className="w-full">
                <SearchResultCardLoading />
            </div>
            <div className="w-full">
                <SearchResultCardLoading />
            </div>
            <div className="w-full">
                <SearchResultCardLoading />
            </div>
        </>
    );
};
