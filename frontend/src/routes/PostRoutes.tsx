import { Route, Routes } from "react-router-dom";
import ColumnLayout from "../layouts/ColumnLayout";
import AddPost from "../pages/AddPost";
import SinglePost from "../pages/SinglePost";

const PostRoutes = () => {
    return (
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
    );
};

export default PostRoutes;
