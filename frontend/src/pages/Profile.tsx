// react
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BiCalendar, BiImage, BiLink } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import gsap from "gsap";

// api
import * as apiClient from "../apiClient";

// type
import {
    UserDataType,
    type UserDataBasicType,
} from "../../../backend/src/types/types";

// image
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";

// date-fns for formatting date
import { formatDistanceToNow } from "date-fns";

// context
import { useAppContext } from "../contexts/AppContext";
import { useFollowersContext } from "../contexts/FollowersContext";
import { useFollowingsContext } from "../contexts/FollowingsContext";
import { usePostsContext } from "../contexts/PostContext";

// components
import PostCard from "../components/PostCard";
import SearchResultCard from "../components/SearchResultCard";
import FadeBG from "../components/FadeBG";
import PostCardLoading from "../components/skeletonLoadings/PostCardLoading";
import ProfileLoading from "../components/skeletonLoadings/ProfileLoading";
import SearchResultCardLoading from "../components/skeletonLoadings/SearchResultCardLoading";
import LoadingCircleSvg from "../components/LoadingCircleSvg";

const FOLLOWERS_FOLLOWINGS_LIMIT = 5;
const POSTS_LIMIT = 5;

const Profile = () => {
    const { currUserId, showToast } = useAppContext();
    const { userId } = useParams();

    const [doIFollowData, setDoIFollowData] = useState<{
        doIFollow: boolean;
    }>();
    const [postCount, setPostCount] = useState<number>(0);
    const [fetchingDoIFollow, setFetchingDoIFollow] = useState<boolean>(false);

    // profileData
    // #region
    const {
        data: userData,
        isFetching: loadingProfile,
        error: errorProfile,
    }: {
        data: UserDataType | null | undefined;
        isFetching: boolean;
        error: Error | null;
    } = useQuery(
        ["fetchUserDataById", userId],
        () => apiClient.fetchUserDataById(userId ? userId : ""),
        {
            enabled: !!userId,
            refetchOnWindowFocus: false,
        }
    );

    useEffect(() => {
        setPostCount(userData ? userData.postCount : 0);
    }, [userData]);

    const handleFollowBtn = async () => {
        setFetchingDoIFollow(true);
        const data = await apiClient.followUnfollow(userId as string);
        setDoIFollowData(data);
        setFetchingDoIFollow(false);
    };

    useEffect(() => {
        apiClient
            .doIFollow(userId ? userId : "")
            .then((data) => setDoIFollowData(data));
    }, [userId]);
    // #endregion

    const bottomListDivRef = useRef<HTMLDivElement>(null);

    const [showBottomList, setShowBottomList] = useState<
        "FOLLOWERS" | "FOLLOWINGS" | ""
    >("");

    useEffect(() => {
        if (showBottomList !== "") {
            gsap.to(bottomListDivRef.current || {}, {
                duration: 0.1,
                ease: "power.inOut",
                paddingTop: 6,
                paddingBottom: 6,
                paddingLeft: 6,
                paddingRight: 6,
                height: "60vh",
                y: "0px",
            });
        } else {
            gsap.to(bottomListDivRef.current || {}, {
                duration: 0.1,
                ease: "power.inOut",
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                height: "0px",
                y: "600px",
            });
        }
    }, [showBottomList]);

    const [searchQuery, setSearchQuery] = useState<string>("");

    // followers
    // #region
    const [followersPage, setFollowersPage] = useState<number>(1);
    const [hasMoreFollowers, setHasMoreFollowers] = useState<boolean>(true);
    const { state: followersState, dispatch: followersDispatch } =
        useFollowersContext();
    const [followers, setFollowers] = useState<UserDataBasicType[]>([]);

    useEffect(() => {
        setFollowers(followersState);
    }, [followersState]);

    const { refetch: fetchFollowers, isFetching: loadingFollowers } = useQuery(
        "fetchingFollowers",
        () =>
            apiClient.fetchFollowers(
                followersPage,
                FOLLOWERS_FOLLOWINGS_LIMIT,
                userId as string
            ),
        {
            enabled: false,
            refetchOnWindowFocus: false,
        }
    );

    const followersObserver = useRef<IntersectionObserver | null>();

    const lastSearchResultCardFollowersRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingFollowers) return;

            if (followersObserver.current)
                followersObserver.current.disconnect();

            followersObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreFollowers) {
                    setFollowersPage((prev) => prev + 1);
                }
            });

            if (element) followersObserver.current?.observe(element);
        },
        [loadingFollowers, hasMoreFollowers]
    );

    useEffect(() => {
        if (followersPage > 0) {
            fetchFollowers().then((result) => {
                if (result.data && result.data?.length > 0) {
                    followersDispatch({
                        type: "SET_FOLLOWERS",
                        payload: [...followers, ...result.data],
                    });
                    if (result.data.length < FOLLOWERS_FOLLOWINGS_LIMIT)
                        setHasMoreFollowers(false);
                } else setHasMoreFollowers(false);
            });
        } else if (followersPage === -1) {
            setFollowersPage(1);
        }
    }, [followersPage]);
    // #endregion

    // followings
    // #region
    const [followingsPage, setFollowingsPage] = useState<number>(1);
    const [hasMoreFollowings, setHasMoreFollowings] = useState<boolean>(true);
    const { state: followingsState, dispatch: followingsDispatch } =
        useFollowingsContext();
    const [followings, setFollowings] = useState<UserDataBasicType[]>([]);

    useEffect(() => {
        setFollowings(followingsState);
    }, [followingsState]);

    const { refetch: fetchFollowings, isFetching: loadingFollowings } =
        useQuery(
            "fetchingFollowingss",
            () =>
                apiClient.fetchFollowings(
                    followingsPage,
                    FOLLOWERS_FOLLOWINGS_LIMIT,
                    userId as string
                ),
            {
                enabled: false,
                refetchOnWindowFocus: false,
            }
        );

    const followingsObserver = useRef<IntersectionObserver | null>();

    const lastSearchResultCardFollowingsRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingFollowings) return;

            if (followingsObserver.current)
                followingsObserver.current.disconnect();

            followingsObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreFollowings) {
                    setFollowingsPage((prev) => prev + 1);
                }
            });

            if (element) followingsObserver.current?.observe(element);
        },
        [loadingFollowings, hasMoreFollowings]
    );

    useEffect(() => {
        if (followingsPage > 0) {
            fetchFollowings().then((result) => {
                if (result.data && result.data?.length > 0) {
                    followingsDispatch({
                        type: "SET_FOLLOWINGS",
                        payload: [...followings, ...result.data],
                    });
                    if (result.data.length < FOLLOWERS_FOLLOWINGS_LIMIT)
                        setHasMoreFollowings(false);
                } else setHasMoreFollowings(false);
            });
        } else if (followingsPage === -1) {
            setFollowingsPage(1);
        }
    }, [followingsPage]);
    // #endregion

    // search
    // #region
    const { refetch: searchFollower, isFetching: searchingFollowers } =
        useQuery(
            "searchChats",
            () =>
                apiClient.searchFollower(
                    1,
                    FOLLOWERS_FOLLOWINGS_LIMIT,
                    userId as string,
                    searchQuery
                ),
            {
                enabled: false,
                refetchOnWindowFocus: false,
                keepPreviousData: true,
            }
        );

    const { refetch: searchFollowing, isFetching: searchingFollowings } =
        useQuery(
            "searchChats",
            () =>
                apiClient.searchFollowing(
                    1,
                    FOLLOWERS_FOLLOWINGS_LIMIT,
                    userId as string,
                    searchQuery
                ),
            {
                enabled: false,
                refetchOnWindowFocus: false,
                keepPreviousData: true,
            }
        );

    useEffect(() => {
        const search = () => {
            if (showBottomList === "FOLLOWERS") {
                searchFollower().then((result) => {
                    if (result.data) setFollowers([...result.data]);
                });
            }
            if (showBottomList === "FOLLOWINGS") {
                searchFollowing().then((result) => {
                    if (result.data) setFollowings([...result.data]);
                });
            }
        };

        let timeoutId: number | undefined;

        if (searchQuery.length < 2) {
            setFollowers(followersState);
            setFollowings(followingsState);
        } else {
            timeoutId = setTimeout(search, 1500);
        }

        return () => {
            clearInterval(timeoutId);
        };
    }, [searchQuery]);
    // #endregion

    // posts
    // #region
    const [postsPage, setPostsPage] = useState<number>(1);
    const { state: posts, dispatch: postsDispatch } = usePostsContext();
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

    const { refetch: fetchPosts, isFetching: loadingPosts } = useQuery(
        "fetchingPosts",
        () =>
            apiClient.fetchPostsByUserId(
                userId as string,
                postsPage,
                POSTS_LIMIT
            ),
        {
            enabled: false,
            refetchOnWindowFocus: false,
        }
    );

    const postsObserver = useRef<IntersectionObserver | null>();

    const lastSearchResultCardPostsRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingPosts) return;

            if (postsObserver.current) postsObserver.current.disconnect();

            postsObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMorePosts) {
                    setPostsPage((prev) => prev + 1);
                }
            });

            if (element) postsObserver.current?.observe(element);
        },
        [loadingPosts, hasMorePosts]
    );

    useEffect(() => {
        if (postsPage > 0) {
            fetchPosts().then((result) => {
                if (result.data && result.data?.length > 0) {
                    postsDispatch({
                        type: "SET_POSTS",
                        payload: [...posts, ...result.data],
                    });
                    if (result.data.length < POSTS_LIMIT)
                        setHasMorePosts(false);
                } else setHasMorePosts(false);
            });
        } else if (postsPage === -1) {
            setPostsPage(1);
        }
    }, [postsPage]);
    // #endregion

    // delete post
    const handlePostDeleteBtn = async (postId: string) => {
        try {
            await apiClient.deletePost(postId);
            postsDispatch({
                type: "SET_POSTS",
                payload: posts.filter((item) => item._id !== postId),
            });
            setPostCount((prevValue) => {
                return prevValue > 0 ? prevValue - 1 : 0;
            });
            showToast({ type: "SUCCESS", message: "Post deleted" });
        } catch (error) {
            showToast({ type: "ERROR", message: error as string });
        }
    };

    // reset followers, followings and posts when userId changes
    useEffect(() => {
        setShowBottomList("");
        followersDispatch({ type: "RESET" });
        followingsDispatch({ type: "RESET" });
        postsDispatch({ type: "RESET" });
        setFollowersPage(-1);
        setFollowingsPage(-1);
        setPostsPage(-1);
        setHasMoreFollowers(true);
        setHasMoreFollowings(true);
        setHasMorePosts(true);
    }, [userId]);

    if (errorProfile) {
        return <div>{errorProfile.message}</div>;
    }

    return (
        // {pt-14 md:pt-0} <- for top nav bar in mobile screen
        <div className=" pt-14 md:pt-0 p-4 h-screen overflow-y-auto overflow-x-auto relative">
            {/* profile data */}
            {userData && (
                <div
                    className={`flex flex-col gap-0 transition delay-100 duration-300 border-b border-whiteAlpha2`}
                >
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <img
                                src={
                                    userData.profilePictureUrl === ""
                                        ? defaultProfilePicture
                                        : userData?.profilePictureUrl
                                }
                                className="w-[150px] h-[150px] object-cover rounded-full border border-whiteAlpha1"
                            />
                            {userData.userId.toString() === currUserId && (
                                <Link
                                    className="absolute bottom-[15%] translate-y-[50%] right-[15%] translate-x-[50%] p-1.5 rounded-full bg-blue-500 border border-blue-300"
                                    to={"/edit-profile"}
                                    title="Edit Profile"
                                >
                                    <MdEdit className="size-6" />
                                </Link>
                            )}
                        </div>

                        {userData.userId.toString() !== currUserId && (
                            <div className="flex flex-col gap-2 justify-center items-center">
                                <button
                                    onClick={handleFollowBtn}
                                    disabled={fetchingDoIFollow}
                                    className={`px-3 py-1 rounded-full ${
                                        doIFollowData?.doIFollow
                                            ? "bg-black2"
                                            : "bg-blue-500"
                                    } font-poppins-bold hover:bg-blue-400 hover:px-4 transition-all duration-300 delay-75`}
                                >
                                    <span className="flex justify-center items-center gap-1">
                                        {fetchingDoIFollow && (
                                            <LoadingCircleSvg className="size-5" />
                                        )}
                                        {doIFollowData?.doIFollow
                                            ? "Unfollow"
                                            : "Follow"}
                                    </span>
                                </button>

                                <Link
                                    className="px-3 py-1 rounded-full bg-black2 font-poppins-bold hover:bg-blue-400 hover:px-4 transition-all duration-300 delay-75"
                                    to={"/"}
                                    title="Message"
                                >
                                    Message
                                </Link>
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-poppins-bold">
                        {userData.name}
                    </h2>
                    <h4 className="text-md font-semibold text-neutral-400">
                        {userData.username}
                    </h4>
                    <div className="relative max-h-[200px] overflow-y-auto">
                        {userData.description}
                    </div>
                    <div className="font-xl flex items-center gap-2 text-neutral-400">
                        <BiCalendar />
                        Joined:{" "}
                        {formatDistanceToNow(new Date(userData.joinedAt))} ago
                    </div>
                    <div className="flex flex-col gap-0 text-md text-blue-400 underline">
                        {userData.link1 && (
                            <span className="flex items-center gap-1">
                                <BiLink />
                                <a
                                    className="w-[200px] overflow-hidden text-ellipsis"
                                    target="_blank"
                                    href={userData.link1}
                                >
                                    {userData.link1}
                                </a>
                            </span>
                        )}
                        {userData.link2 && (
                            <span className="flex items-center gap-1">
                                <BiLink />
                                <a
                                    className="w-[200px] overflow-hidden text-ellipsis"
                                    target="_blank"
                                    href={userData.link2}
                                >
                                    {userData.link2}
                                </a>
                            </span>
                        )}
                        {userData.link3 && (
                            <span className="flex items-center gap-1">
                                <BiLink />
                                <a
                                    className="w-[200px] overflow-hidden text-ellipsis"
                                    target="_blank"
                                    href={userData.link3}
                                >
                                    {userData.link3}
                                </a>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center py-3 text-neutral-400 justify-start gap-4">
                        <span className="flex gap-1">
                            <b className="text-white">{postCount}</b>
                            Posts
                        </span>
                        <span
                            className="flex gap-1 cursor-pointer"
                            onClick={() => setShowBottomList("FOLLOWERS")}
                        >
                            <b className="text-white">
                                {userData.followerCount}
                            </b>
                            Followers
                        </span>
                        <span
                            className="flex gap-1 cursor-pointer"
                            onClick={() => setShowBottomList("FOLLOWINGS")}
                        >
                            <b className="text-white">
                                {userData.followingCount}
                            </b>
                            Followings
                        </span>
                    </div>
                </div>
            )}

            {!userData && loadingProfile && <ProfileLoading />}

            {/* bottom card for followers and followings */}
            {showBottomList !== "" && (
                <FadeBG
                    onClick={() => {
                        setShowBottomList("");
                        setSearchQuery("");
                    }}
                />
            )}
            <div
                className={`fixed h-0 sm:ms-6 md:ms-48 lg:ms-40 z-[20] bottom-0 left-0 right-0 flex items-end justify-center`}
            >
                <div
                    ref={bottomListDivRef}
                    className={`relative w-[350px] md:w-[500px] lg:w-[700px] bottom-0 left-0 grid-rows-[100px_1fr] grid grid-flow-row transition-all ease-in-out delay-75 duration-300 rounded-t-lg bg-black2`}
                >
                    {showBottomList && (
                        <>
                            {/* header */}
                            <div>
                                <div className="flex justify-between items-center ">
                                    <h2 className="text-xl font-poppins-bold">
                                        {showBottomList === "FOLLOWERS" &&
                                            "Followers"}
                                        {showBottomList === "FOLLOWINGS" &&
                                            "Followings"}
                                    </h2>
                                    <button
                                        className="focus:outline-none p-2"
                                        onClick={() => {
                                            setShowBottomList("");
                                            setSearchQuery("");
                                        }}
                                    >
                                        <AiOutlineClose className="size-6" />
                                    </button>
                                </div>
                                <div className="flex justify-between bg-black2 mx-3 w-[calc(100%-24px)] px-4 py-2 rounded-full">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Search"
                                        className="focus:outline-none bg-transparent placeholder:text-whiteAlpha1 w-full"
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
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
                            </div>

                            {/* body */}
                            <div className="overflow-y-auto overflow-x-hidden flex flex-col gap-2 px-3">
                                {showBottomList === "FOLLOWERS" && (
                                    <>
                                        {(!followers ||
                                            followers.length === 0) && (
                                            <div>No Followers</div>
                                        )}
                                        {followers?.map((data, i) => {
                                            if (
                                                followers.length === i + 1 &&
                                                searchQuery.length < 2
                                            ) {
                                                return (
                                                    <div
                                                        ref={
                                                            lastSearchResultCardFollowersRef
                                                        }
                                                        key={i}
                                                        className="w-full"
                                                    >
                                                        <SearchResultCard
                                                            searchResult={data}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div
                                                    key={i}
                                                    className="w-full border-b border-whiteAlpha2 pb-2"
                                                >
                                                    <SearchResultCard
                                                        searchResult={data}
                                                    />
                                                </div>
                                            );
                                        })}
                                        {(loadingFollowers ||
                                            searchingFollowers) && (
                                            <LoadingFollowSkeleton />
                                        )}
                                    </>
                                )}

                                {showBottomList === "FOLLOWINGS" && (
                                    <>
                                        {(!followings ||
                                            followings.length === 0) && (
                                            <div>No Followings</div>
                                        )}
                                        {followings?.map((data, i) => {
                                            if (
                                                followings.length === i + 1 &&
                                                searchQuery.length < 2
                                            ) {
                                                return (
                                                    <div
                                                        ref={
                                                            lastSearchResultCardFollowingsRef
                                                        }
                                                        key={i}
                                                        className="w-full"
                                                    >
                                                        <SearchResultCard
                                                            searchResult={data}
                                                        />
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div
                                                    key={i}
                                                    className="w-full border-b border-whiteAlpha2 pb-2"
                                                >
                                                    <SearchResultCard
                                                        searchResult={data}
                                                    />
                                                </div>
                                            );
                                        })}
                                        {(loadingFollowings ||
                                            searchingFollowings) && (
                                            <LoadingFollowSkeleton />
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* posts */}
            <div className="flex flex-col">
                {!loadingPosts && (!posts || posts.length === 0) && (
                    <div className="flex flex-col justify-center items-center h-[300px]">
                        <span className="text-3xl p-2 rounded-full bg-neutral-800">
                            <BiImage />
                        </span>
                        <h3 className="text-2xl font-semibold">No Posts</h3>
                    </div>
                )}

                {posts?.map((data, i) => {
                    if (posts.length === i + 1) {
                        return (
                            <div
                                ref={lastSearchResultCardPostsRef}
                                key={i}
                                className="py-4"
                            >
                                <PostCard
                                    handleDeleteBtn={handlePostDeleteBtn}
                                    postData={data}
                                />
                            </div>
                        );
                    }
                    return (
                        <div
                            key={i}
                            className="py-4 border-b border-whiteAlpha2"
                        >
                            <PostCard
                                handleDeleteBtn={handlePostDeleteBtn}
                                postData={data}
                            />
                        </div>
                    );
                })}

                {loadingPosts && (
                    <>
                        <div className="py-4 border-b border-whiteAlpha2">
                            <PostCardLoading />
                        </div>
                        <div className="py-4">
                            <PostCardLoading />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;

const LoadingFollowSkeleton = () => {
    return (
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
    );
};
