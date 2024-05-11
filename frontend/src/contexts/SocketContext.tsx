import { createContext, useContext } from "react";
import io from "socket.io-client";

const SOCKET_URI = import.meta.env.VITE_API_BASE_URL || "";

const socket = io(SOCKET_URI, { autoConnect: false, withCredentials: true });

const SocketContext = createContext(socket);

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
