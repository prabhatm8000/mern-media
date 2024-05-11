import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppContextProvider } from "./contexts/AppContext.tsx";
import { PostsContextProvider } from "./contexts/PostContext.tsx";
import { SocketContextProvider } from "./contexts/SocketContext.tsx";
import { MessageContextProvider } from "./contexts/MessageContext.tsx";
import { SearchResultContextProvider } from "./contexts/SearchContext.tsx";

import "react-loading-skeleton/dist/skeleton.css";
import { ChatsContextProvider } from "./contexts/ChatsContext.tsx";
import { GroupChatsContextProvider } from "./contexts/GroupChatsContext.tsx";

// by default Query client will fetch and retry multiple time,
// if got an error
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 0,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <SocketContextProvider>
            <AppContextProvider>
                <SearchResultContextProvider>
                    <PostsContextProvider>
                        <MessageContextProvider>
                            <ChatsContextProvider>
                                <GroupChatsContextProvider>
                                    <App />
                                </GroupChatsContextProvider>
                            </ChatsContextProvider>
                        </MessageContextProvider>
                    </PostsContextProvider>
                </SearchResultContextProvider>
            </AppContextProvider>
        </SocketContextProvider>
    </QueryClientProvider>
);
