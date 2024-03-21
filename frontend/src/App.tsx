import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import Signin from "./pages/Signin";
import { useAppContext } from "./contexts/AppContext";
import Login from "./pages/Login";
import EditUserData from "./pages/EditUserData";
import Profile from "./pages/Profile";
import LayoutWithoutFooter from "./layouts/LayoutWithoutFooter";
import Search from "./pages/Search";
import { FollowersContextProvider } from "./contexts/FollowersContext";
import { FollowingsContextProvider } from "./contexts/FollowingsContext";
import AddPost from "./pages/AddPost";
import SinglePost from "./pages/SinglePost";
import Home from "./pages/Home";

function App() {
    const { isLoggedIn } = useAppContext();
    return (
        <div className="bg-neutral-950 text-white">
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Layout>
                                <Login />
                            </Layout>
                        }
                    />
                    <Route
                        path="/sign-in"
                        element={
                            <Layout>
                                <Signin />
                            </Layout>
                        }
                    />
                    {isLoggedIn && (
                        <>
                            <Route
                                path="/home"
                                element={
                                    <LayoutWithoutFooter>
                                        <Home />
                                    </LayoutWithoutFooter>
                                }
                            />
                            <Route
                                path="/edit-profile"
                                element={
                                    <Layout>
                                        <EditUserData />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/profile/:userId"
                                element={
                                    <LayoutWithoutFooter>
                                        <FollowersContextProvider>
                                            <FollowingsContextProvider>
                                                <Profile />
                                            </FollowingsContextProvider>
                                        </FollowersContextProvider>
                                    </LayoutWithoutFooter>
                                }
                            />

                            <Route
                                path="/search"
                                element={
                                    <LayoutWithoutFooter>
                                        <Search />
                                    </LayoutWithoutFooter>
                                }
                            />

                            <Route
                                path="/add-post"
                                element={
                                    <LayoutWithoutFooter>
                                        <AddPost />
                                    </LayoutWithoutFooter>
                                }
                            />

                            <Route
                                path="/post/:postId"
                                element={
                                    <LayoutWithoutFooter>
                                        <SinglePost />
                                    </LayoutWithoutFooter>
                                }
                            />
                        </>
                    )}

                    <Route path="*" element={<Navigate to={"/"} />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
