import React, { createContext, useContext, useState } from "react";
import Toast from "../components/Toast";
import { useQuery } from "react-query";
import * as apiClient from "../apiClient";

export type ToastMessage = {
    message: string;
    type: "SUCCESS" | "ERROR";
};

export type AppContext = {
    showToast: (toastMessage: ToastMessage) => void;
    isLoggedIn: boolean;
    currUserId: string | undefined
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

    const { isError, data } = useQuery("validateToken", apiClient.validateToken, {
        retry: false,
    });

    return (
        <AppContext.Provider
            value={{
                showToast: (toastMessage) => {
                    setToast(toastMessage);
                },
                isLoggedIn: !isError,
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
