import { useCallback, useEffect, useRef, useState } from "react";
import { MdPersonOff } from "react-icons/md";
import { useQuery } from "react-query";

// types
import { PostType } from "../../../backend/src/types/types";

// apiClient
import * as apiClient from "../apiClient";

// componenyts
import PostCard from "../components/PostCard";
import PostCardLoading from "../components/skeletonLoadings/PostCardLoading";

const POSTS_LIMIT = 5;

const Home = () => {
    // posts
    // #region
    const [postsPage, setPostsPage] = useState<number>(0);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

    const { refetch: fetchPosts, isFetching: loadingPosts } = useQuery(
        "fetchingPosts",
        () => apiClient.fetchPostsHome(postsPage, POSTS_LIMIT),
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
                    setPosts((prev) => [...prev, ...result.data]);
                    if (result.data.length < POSTS_LIMIT)
                        setHasMorePosts(false);
                } else setHasMorePosts(false);
            });
        } else {
            setPosts([]);
            setPostsPage(1);
        }
    }, [postsPage]);

    const handle = (str: string) => {
        return str;
    };
    return (
        // {pt-12 md:pt-0} <- for top nav bar in mobile screen
        <div className="pt-12 md:pt-0 p-4 h-screen overflow-y-auto overflow-x-auto relative">
            {(!posts || posts.length === 0) && !loadingPosts && (
                <div className="flex flex-col justify-center items-center h-[300px]">
                    <span className="text-3xl p-2 rounded-full bg-neutral-800">
                        <MdPersonOff />
                    </span>
                    <h3 className="text-2xl font-semibold">
                        No Posts from your followings
                    </h3>
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
                                handleDeleteBtn={handle}
                                postData={data}
                            />
                        </div>
                    );
                }
                return (
                    <div key={i} className="py-4 border-b border-whiteAlpha2">
                        <PostCard handleDeleteBtn={handle} postData={data} />
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
    );
};

export default Home;
