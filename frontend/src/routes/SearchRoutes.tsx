import { Route, Routes } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import Search from "../pages/Search";

const SearchRoutes = () => {
    const { isLoggedIn } = useAppContext();

    return (
        <>
            {isLoggedIn && (
                <Routes>
                    <Route path="/" element={<Search />} />
                </Routes>
            )}
        </>
    );
};

export default SearchRoutes;
