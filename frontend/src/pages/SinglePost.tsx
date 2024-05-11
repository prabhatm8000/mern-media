import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../apiClient";
import PostCard from "../components/PostCard";
import PostCardLoading from "../components/skeletonLoadings/PostCardLoading";

const SinglePost = () => {
    const { postId } = useParams();

    const { data: postData, isFetching: loadingPostData } = useQuery(
        "fetchingPostByPostId",
        () => apiClient.fetchPostsByPostId(postId ? postId : ""),
        {
            enabled: !!postId,
            refetchOnWindowFocus: false,
        }
    );

    const handle = (str: string) => {
        return str;
    };
    return (
        <div className="pt-12 md:pt-0 p-4 h-screen overflow-y-auto overflow-x-auto relative">
            {postData && (
                <div className="py-4">
                    <PostCard handleDeleteBtn={handle} postData={postData} />
                </div>
            )}

            {!postData && !loadingPostData && (
                <div>
                    <h2 className="text-3xl">Error: 404</h2>
                    <h3 className="text-xl">Post not Found</h3>
                </div>
            )}

            {loadingPostData && (
                <div className="py-4">
                    <PostCardLoading />
                </div>
            )}
        </div>
    );
};

export default SinglePost;
