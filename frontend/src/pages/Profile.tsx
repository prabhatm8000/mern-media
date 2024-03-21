// react
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiCalendar, BiImage, BiLink, BiPlus } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";

// api
import * as apiClient from "../apiClient";

// type
import { UserDataType } from "../../../backend/src/types/types";

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
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import SearchResultCard from "../components/SearchResultCard";

const FOLLOWERS_FOLLOWINGS_LIMIT = 5;
const POSTS_LIMIT = 5;

const Profile = () => {
    const { currUserId, isLoggedIn, showToast } = useAppContext();
    const { userId } = useParams();

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

    const {
        data: doIFollowData,
        refetch: fetchDoIFollow,
        isFetching: fetchingDoIFollow,
    } = useQuery(
        "fetchDoIFollow",
        () => apiClient.doIFollow(userId ? userId : ""),
        {
            enabled: !!userId,
            refetchOnWindowFocus: false,
        }
    );

    const handleFollowBtn = async () => {
        await apiClient.followUnfollow(userId as string);
        fetchDoIFollow();
    };

    useEffect(() => {
        fetchDoIFollow();
    }, [userId]);
    // #endregion

    const [postCount, setPostCount] = useState<number | undefined>(
        userData?.postCount
    );

    const [showBottomList, setShowBottomList] = useState<
        "FOLLOWERS" | "FOLLOWINGS" | ""
    >("");

    // followers
    // #region
    const [followersPage, setFollowersPage] = useState<number>(1);
    const { state: followers, dispatch: followersDispatch } =
        useFollowersContext();
    const [hasMoreFollowers, setHasMoreFollowers] = useState<boolean>(true);

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
    const { state: followings, dispatch: followingsDispatch } =
        useFollowingsContext();
    const [hasMoreFollowings, setHasMoreFollowings] = useState<boolean>(true);

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
                if (prevValue) return prevValue - 1;
            });
            showToast({ type: "SUCCESS", message: "Comment deleted" });
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

    if (loadingProfile) {
        return <Loading />;
    }

    return (
        <div>
            {/* profile data */}
            {userData && (
                <div
                    className={`flex flex-col gap-0 ${
                        showBottomList !== "" ? "blur-sm" : ""
                    } transition delay-100 duration-300 border-b border-neutral-900`}
                >
                    <div className="flex items-center justify-between">
                        <img
                            src={
                                userData.profilePictureUrl === ""
                                    ? defaultProfilePicture
                                    : userData?.profilePictureUrl
                            }
                            className="w-[150px] h-[150px] object-cover rounded-full"
                        />

                        {userData.userId === currUserId ? (
                            <Link
                                className="px-3 py-1 rounded-full bg-gradient-to-r from-neutral-900 to-neutral-600 from-[25%]"
                                to={"/edit-profile"}
                            >
                                Edit Profile
                            </Link>
                        ) : (
                            <button
                                onClick={handleFollowBtn}
                                disabled={fetchingDoIFollow}
                                className={`px-3 py-1 rounded-full ${
                                    doIFollowData?.doIFollow
                                        ? "bg-neutral-800 text-neutral-100"
                                        : "bg-neutral-500 text-neutral-100"
                                } font-bold`}
                            >
                                {doIFollowData?.doIFollow
                                    ? "Unfollow"
                                    : "Follow"}
                            </button>
                        )}
                    </div>
                    <h2 className="text-xl font-bold">{userData.name}</h2>
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
                    <div className="flex items-center py-3 text-neutral-400 justify-between md:justify-start md:gap-4">
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

            {/* bottom card for followers and followings */}
            <div
                className={`fixed container mx-auto px-4 bottom-0 ${
                    showBottomList !== "" ? "h-[65%] py-3" : "h-[0px]"
                } w-[calc(100%-10%)] rounded-t-xl bg-neutral-700 transition-all delay-100 duration-300`}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {showBottomList === "FOLLOWERS" && "Followers"}
                        {showBottomList === "FOLLOWINGS" && "Followings"}
                    </h2>
                    <span
                        className="cursor-pointer"
                        onClick={() => {
                            setShowBottomList("");
                        }}
                    >
                        <AiOutlineClose />
                    </span>
                </div>
                {showBottomList === "FOLLOWERS" && (
                    <div className="overflow-auto flex flex-col gap-2 py-4 h-full">
                        {(!followers || followers.length === 0) && (
                            <div>No Followers</div>
                        )}
                        {followers?.map((data, i) => {
                            if (followers.length === i + 1) {
                                return (
                                    <div
                                        ref={lastSearchResultCardFollowersRef}
                                        key={i}
                                        className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]"
                                    >
                                        <SearchResultCard searchResult={data} />
                                    </div>
                                );
                            }
                            return (
                                <div
                                    key={i}
                                    className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]"
                                >
                                    <SearchResultCard searchResult={data} />
                                </div>
                            );
                        })}
                        {loadingFollowers && <Loading />}
                    </div>
                )}

                {showBottomList === "FOLLOWINGS" && (
                    <div className="overflow-auto flex flex-col gap-2 py-4 h-full">
                        {(!followings || followings.length === 0) && (
                            <div>No Followings</div>
                        )}
                        {followings?.map((data, i) => {
                            if (followings.length === i + 1) {
                                return (
                                    <div
                                        ref={lastSearchResultCardFollowingsRef}
                                        key={i}
                                        className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]"
                                    >
                                        <SearchResultCard searchResult={data} />
                                    </div>
                                );
                            }
                            return (
                                <div
                                    key={i}
                                    className="min-w-[340px] md:min-w-[540px] lg:min-w-[740px]"
                                >
                                    <SearchResultCard searchResult={data} />
                                </div>
                            );
                        })}
                        {loadingFollowings && <Loading />}
                    </div>
                )}
            </div>

            {/* posts */}
            <div className="overflow-auto flex flex-col h-full">
                {(!posts || posts.length === 0) && (
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
                            className="border-b py-4 border-neutral-900"
                        >
                            <PostCard
                                handleDeleteBtn={handlePostDeleteBtn}
                                postData={data}
                            />
                        </div>
                    );
                })}
            </div>

            {isLoggedIn && (
                <div className="fixed p-1 rounded-full bg-cyan-800 bottom-5 right-5">
                    <Link to={"/add-post"} className="text-5xl">
                        <BiPlus />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Profile;
