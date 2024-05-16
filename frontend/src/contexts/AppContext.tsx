import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import * as apiClient from "../apiClient";
import Toast from "../components/Toast";
import { useSocketContext } from "./SocketContext";

export type ToastMessage = {
    message: string;
    type: "SUCCESS" | "ERROR";
};

export type AppContext = {
    showToast: (toastMessage: ToastMessage) => void;
    isLoggedIn: boolean;
    currUserId: string | undefined;
};

const AppContext = createContext<AppContext | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    return context as AppContext;
};

export const AppContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [connectSocket, setConnectSocket] = useState<boolean>(false);

    const { data } = useQuery(
        "validateToken",
        apiClient.validateToken,
        {
            retry: false,
            refetchOnWindowFocus: true,
            onError: () => {
                setConnectSocket(false);
                setIsLoggedIn(false)
            },
            onSuccess: () => {
                setConnectSocket(true);
                setIsLoggedIn(true)
            },
        }
    );

    const socket = useSocketContext();

    useEffect(() => {
        if (connectSocket) {
            socket.connect();
        }
    }, [connectSocket]);

    return (
        <AppContext.Provider
            value={{
                showToast: (toastMessage) => {
                    setToast(toastMessage);
                },
                isLoggedIn: isLoggedIn,
                currUserId: data?.userId,
            }}
        >
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    // when timer runout, setToast(undefined)
                    onClose={() => setToast(undefined)}
                />
            )}
            {children}
        </AppContext.Provider>
    );
};
