// react
import { useEffect, useState } from "react";
import { BiBell, BiSearch } from "react-icons/bi";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

// contexts
import { useAppContext } from "../contexts/AppContext";

// components
import NotificationBox from "./NotificationBox";
import SignOutButton from "./SignoutButton";

// api
import * as apiClient from "../apiClient";

// image
import { AiOutlineClose } from "react-icons/ai";
import { FiHome } from "react-icons/fi";
import { MdAddCircle } from "react-icons/md";
import { RiChat3Line } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";
import FadeBG from "./FadeBG";

const SideBar = ({
    showSideBar,
    handleShowSideBarBtn,
    offScreenFade,
}: {
    showSideBar: boolean;
    handleShowSideBarBtn: () => void;
    offScreenFade: () => void;
}) => {
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
    const [doIHaveNewMessage, setDoIHaveNewMessage] = useState<boolean>(false);

    useEffect(() => {
        const handler = () => {
            apiClient.fetchDoIHaveNotifications().then((res) => {
                setDoIHaveNewNotifications(res.response.doIHaveNotifications);
                setDoIHaveNewMessage(res.response.doIHaveNewMessage);
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

    const linkClicked = () => {
        offScreenFade();
    };

    return (
        <>
            <div
                className="px-4 py-2 w-full fixed z-50 bg-black/60 md:hidden flex justify-between items-center"
                style={{
                    backdropFilter: "blur(2px)",
                }}
            >
                <Link className="text-4xl font-bloodySunday" to={"/home"}>
                    MernMedia
                </Link>
                <button
                    className="w-fit bg-black/60"
                    onClick={() => {
                        handleShowSideBarBtn();
                        setShowNotifications(false);
                    }}
                    style={{ backdropFilter: "blur(5px" }}
                >
                    {showSideBar ? (
                        <AiOutlineClose className="size-6 z-[11]" />
                    ) : (
                        <>
                            {doIHaveNewNotifications && (
                                <span className="absolute -translate-y-[25%] -translate-x-[125%] bg-red-500 p-1.5 rounded-full"></span>
                            )}
                            <RxHamburgerMenu className="size-6 z-[11] bg-transparent" />
                        </>
                    )}
                </button>
            </div>

            {showSideBar && (
                <FadeBG
                    onClick={() => {
                        handleShowSideBarBtn();
                        setShowNotifications(false);
                    }}
                />
            )}

            <div
                className={`py-6 px-4 bg-black border-e border-whiteAlpha2 h-screen fixed z-50 ${
                    showSideBar ? "translate-x-0" : "-translate-x-full"
                } md:relative md:translate-x-0 transition-transform duration-300`}
            >
                {/* links */}
                <div className="flex items-start flex-col justify-start gap-6">
                    <div className="text-5xl text-white px-3 font-bloodySunday">
                        <Link to={"/home"}>MernMedia</Link>
                    </div>

                    {isLoggedIn && (
                        <div className="flex flex-col gap-3">
                            <Link
                                to={"/post/add"}
                                className="relative items-center justify-start inline-block mx-3 px-4 py-2 overflow-hidden font-medium transition-all bg-blue-600 rounded-full hover:bg-white group"
                            >
                                <span className="absolute inset-0 border-0 group-hover:border-[25px] ease-linear duration-100 transition-all border-white rounded-full"></span>
                                <span className="relative flex items-center gap-1 w-full text-white transition-colors duration-300 ease-in-out group-hover:text-blue-600">
                                    <MdAddCircle className="size-7" />
                                    <span className="font-semibold text-lg">
                                        New Post
                                    </span>
                                </span>
                            </Link>

                            <Link
                                to={"/home"}
                                className="flex items-center gap-3 py-2 px-3 rounded-xl hover:scale-105 hover:translate-x-1 hover:bg-whiteAlpha2 transition-transform delay-75 duration-200"
                            >
                                <FiHome className="size-6" />
                                <span className="font-semibold text-lg">
                                    Home
                                </span>
                            </Link>

                            <Link
                                to={"/search"}
                                onClick={linkClicked}
                                className="flex items-center gap-3 py-2 px-3 rounded-xl hover:scale-105 hover:translate-x-1 hover:bg-whiteAlpha2 transition-transform delay-75 duration-200"
                            >
                                <BiSearch className="size-6" />
                                <span className="font-semibold text-lg">
                                    Search
                                </span>
                            </Link>

                            <button
                                onClick={handleShowNotificationsBtn}
                                className="flex items-center gap-3 py-2 px-3 rounded-xl hover:scale-105 hover:translate-x-1 hover:bg-whiteAlpha2 transition-transform delay-75 duration-200"
                            >
                                {doIHaveNewNotifications && (
                                    <span className="absolute -translate-y-[75%] -translate-x-[25%] bg-red-500 p-1.5 rounded-full"></span>
                                )}
                                <BiBell className="size-6" />{" "}
                                <span className="font-semibold text-lg">
                                    Notifications
                                </span>
                            </button>

                            <Link
                                to={"/chats"}
                                className="flex items-center gap-3 py-2 px-3 rounded-xl hover:scale-105 hover:translate-x-1 hover:bg-whiteAlpha2 transition-transform delay-75 duration-200"
                            >
                                {doIHaveNewMessage && (
                                    <span className="absolute -translate-y-[75%] -translate-x-[25%] bg-red-500 p-1.5 rounded-full"></span>
                                )}
                                <RiChat3Line className="size-6" />
                                <span className="font-semibold text-lg">
                                    Chats
                                </span>
                            </Link>

                            <SignOutButton />

                            <Link
                                to={"/profile/me"}
                                className="flex items-center gap-2 rounded-full w-[calc(87%)] hover:bg-whiteAlpha2 my-6 p-2 absolute bottom-0"
                            >
                                <img
                                    className="rounded-full border border-whiteAlpha2 size-10 hover:scale-125 transition ease-in-out delay-100 duration-300"
                                    onError={() => {
                                        if (userData)
                                            userData.profilePictureUrl =
                                                defaultProfilePicture;
                                    }}
                                    src={
                                        userData?.profilePictureUrl === ""
                                            ? defaultProfilePicture
                                            : userData?.profilePictureUrl
                                    }
                                    alt={userData?.name}
                                    title={userData?.name}
                                />
                                <div className="flex flex-col">
                                    <span className="font-semibold truncate">
                                        {userData?.name}
                                    </span>
                                    <span className="text-sm text-whiteAlpha1 truncate">
                                        {userData?.username}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* notification box */}
                <div
                    className={`bottom-0 my-4 fixed grid grid-flow-row grid-rows-[40px_1fr_50px] gap-1 px-4 pt-2 pb-4 h-[500px] w-[300px] sm:w-[400px] lg:w-[550px] ${
                        showNotifications
                            ? "translate-y-0"
                            : "translate-y-[110%]"
                    } rounded-lg bg-black1 transition-transform ease-out duration-500`}
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
        </>
    );
};

export default SideBar;
