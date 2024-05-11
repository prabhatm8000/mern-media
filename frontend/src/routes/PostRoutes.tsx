import { Route, Routes } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import AddPost from "../pages/AddPost";
import SinglePost from "../pages/SinglePost";
import ColumnLayout from "../layouts/ColumnLayout";

const PostRoutes = () => {
    const { isLoggedIn } = useAppContext();
    return (
        <>
            {isLoggedIn && (
                <Routes>
                    <Route
                        path="/add"
                        element={
                            <ColumnLayout>
                                <AddPost />
                            </ColumnLayout>
                        }
                    />

                    <Route
                        path="/:postId"
                        element={
                            <ColumnLayout>
                                <SinglePost />
                            </ColumnLayout>
                        }
                    />
                </Routes>
            )}
        </>
    );
};

export default PostRoutes;
