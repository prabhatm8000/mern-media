import { AiOutlineClose } from "react-icons/ai";
import Loading from "./Loading";
import { useCallback, useEffect, useRef, useState } from "react";

import * as apiClient from "../apiClient";
import NotificationCard from "./NotificationCard";
import { NotificationsDataType } from "../../../backend/src/types/types";

interface NotificationBoxProps {
    handleCloseBtn: () => void;
}

const NOTIFICATION_LIMIT = 5;

const NotificationBox = ({ handleCloseBtn }: NotificationBoxProps) => {
    const [notifications, setNotifications] = useState<NotificationsDataType[]>(
        []
    );
    const [loadingNotifications, setLoadingNotifications] =
        useState<boolean>(false);
    const [notificationPage, setNotificationPage] = useState<number>(1);
    const [hasMoreNotifications, setHasMoreNotifications] =
        useState<boolean>(true);

    const notificationObserver = useRef<IntersectionObserver | null>();

    const lastCommentRef = useCallback(
        (element: HTMLDivElement) => {
            if (loadingNotifications) return;

            if (notificationObserver.current)
                notificationObserver.current.disconnect();

            notificationObserver.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMoreNotifications) {
                        setNotificationPage((prev) => prev + 1);
                    }
                }
            );

            if (element) notificationObserver.current?.observe(element);
        },
        [loadingNotifications, hasMoreNotifications]
    );

    useEffect(() => {
        setLoadingNotifications(true);
        apiClient
            .fetchNotifications(notificationPage, NOTIFICATION_LIMIT)
            .then((result) => {
                setLoadingNotifications(false);
                if (result && result?.length > 0) {
                    setNotifications((prev) => [...prev, ...result]);
                    if (result.length < NOTIFICATION_LIMIT)
                        setHasMoreNotifications(false);
                } else setHasMoreNotifications(false);
            });
    }, [notificationPage]);

    const handleClearNotificationsBtn = () => {
        apiClient.clearNotifications();
        setNotifications([]);
    };

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-poppins-bold">Notifications</h2>
                <span className="cursor-pointer" onClick={handleCloseBtn}>
                    <AiOutlineClose />
                </span>
            </div>

            {/* notifications */}
            {notifications && (
                <div className="overflow-y-auto flex flex-col gap-2 pr-1">
                    {notifications.length === 0 && !loadingNotifications && (
                        <div>No Notifications</div>
                    )}
                    {notifications.map((data, i) => {
                        if (notifications.length === i + 1) {
                            return (
                                <div
                                    onClick={handleCloseBtn}
                                    ref={lastCommentRef}
                                    key={i}
                                >
                                    <NotificationCard data={data} />
                                </div>
                            );
                        }
                        return (
                            <div
                                onClick={handleCloseBtn}
                                key={i}
                                className="pb-2 border-b border-b-whiteAlpha2"
                            >
                                <NotificationCard data={data} />
                            </div>
                        );
                    })}
                    {loadingNotifications && <Loading />}
                </div>
            )}

            {/* clear all notification */}
            <button
                onClick={handleClearNotificationsBtn}
                className="mt-2 mb-0 p-1 rounded-md transition ease-in-out delay-100 font-semibold text-xl bg-red-500 hover:bg-red-700 duration-300"
            >
                Clear
            </button>
        </>
    );
};

export default NotificationBox;
