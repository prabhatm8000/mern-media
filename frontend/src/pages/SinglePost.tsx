import { useQuery } from "react-query";
import * as apiClient from "../apiClient";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";

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
        <div>
            {loadingPostData && <Loading />}
            {postData ? (
                <PostCard handleDeleteBtn={handle} postData={postData} />
            ) : (
                <div>
                    <h2 className="text-3xl">Error: 404</h2>
                    <h3 className="text-xl">Post not Found</h3>
                </div>
            )}
        </div>
    );
};

export default SinglePost;
