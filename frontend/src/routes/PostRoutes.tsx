import { Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import ColumnLayout from "../layouts/ColumnLayout";
import LoadingPage from "../pages/LoadingPage";

import SinglePost from "../pages/SinglePost";
import AddPost from "../pages/AddPost";

const PostRoutes = () => {
    return (
        <Suspense fallback={<LoadingPage message="Loading pages..." />}>
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
        </Suspense>
    );
};

export default PostRoutes;
