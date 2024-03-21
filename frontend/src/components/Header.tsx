// react
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { BiSearch } from "react-icons/bi";

// contexts
import { useAppContext } from "../contexts/AppContext";

// components
import SignOutButton from "./SignoutButton";

// api
import * as apiClient from "../apiClient";

// image
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";

const Header = () => {
    const { isLoggedIn } = useAppContext();
    const { data: userData } = useQuery(
        "fetchMyUserData",
        () => apiClient.fetchUserDataById("me"),
        {
            refetchOnWindowFocus: false,
        }
    );
    return (
        <div className="py-6 px-4">
            <div className="container mx-auto flex justify-between items-center">
                <span className="text-3xl text-white font-bold tracking-tight">
                    <Link to={"/home"}>MernMedia</Link>
                </span>
                <span className="flex items-center md:flex-row gap-2">
                    {isLoggedIn && (
                        <>
                            <Link to={"/profile/me"}>
                                <img
                                    className="rounded-full w-[30px] h-[30px] hover:scale-125 transition ease-in-out delay-100 duration-300"
                                    src={
                                        userData?.profilePictureUrl === ""
                                            ? defaultProfilePicture
                                            : userData?.profilePictureUrl
                                    }
                                    alt={userData?.name}
                                    title={userData?.name}
                                />
                            </Link>

                            <Link
                                to={"/search"}
                                className="font-bold text-2xl p-1 rounded-full transition ease-in-out delay-150 hover:bg-amber-600 duration-300"
                            >
                                <BiSearch />
                            </Link>

                            <SignOutButton />
                        </>
                    )}
                </span>
            </div>
        </div>
    );
};

export default Header;
