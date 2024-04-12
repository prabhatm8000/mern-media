// react
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { BiBell, BiSearch, BiSolidBadge } from "react-icons/bi";
import { useEffect, useState } from "react";

// contexts
import { useAppContext } from "../contexts/AppContext";

// components
import SignOutButton from "./SignoutButton";
import NotificationBox from "./NotificationBox";

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

    const [doIHaveNewNotifications, setDoIHaveNewNotifications] =
        useState<boolean>(false);

    useEffect(() => {
        const handler = () => {
            apiClient.fetchDoIHaveNotifications().then((res) => {
                setDoIHaveNewNotifications(res.response.doIHaveNotifications);
            });
        };
        handler();
        const intervalId = setInterval(handler, 30000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const [showNotifications, setShowNotifications] = useState<boolean>(false);

    const handleShowNotificationsBtn = () => {
        setShowNotifications(true);
        setDoIHaveNewNotifications(false);
    };
    return (
        <div className="py-6 px-4">
            <div className="container mx-auto flex justify-between items-center">
                <span className="text-3xl text-white font-bold tracking-tight">
                    <Link to={"/home"}>MernMedia</Link>
                </span>
                <span className="flex items-center md:flex-row gap-2">
                    {isLoggedIn && (
                        <>
                            <button
                                onClick={handleShowNotificationsBtn}
                                className="font-bold text-2xl p-1 rounded-full transition ease-in-out delay-150 hover:bg-amber-600 duration-300"
                            >
                                {doIHaveNewNotifications && (
                                    <span className="absolute text-red-500 text-sm translate-y-[-20%] translate-x-[10%]">
                                        <BiSolidBadge />
                                    </span>
                                )}

                                <BiBell />
                            </button>
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

            {/* notification box */}
            <div
                className={`fixed top-[90px] right-[10px] sm:right-[120px] ${
                    showNotifications ? "z-[10]" : ""
                } flex items-end justify-center`}
            >
                <div
                    className={`grid grid-flow-row grid-rows-[0.5fr_9fr_0.5fr] gap-1 px-4 py-2 h-[500px] w-[300px] sm:w-[400px] lg:w-[550px] ${
                        showNotifications ? "" : "hidden"
                    } rounded-lg bg-neutral-700 transition-all delay-100 duration-200`}
                >
                    {showNotifications && (
                        <NotificationBox
                            handleCloseBtn={() => {
                                setShowNotifications(false);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
