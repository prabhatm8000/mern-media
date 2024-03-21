import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppContextProvider } from "./contexts/AppContext.tsx";
import { SearchResultContextProvider } from "./contexts/SearchContext.tsx";
import { PostsContextProvider } from "./contexts/PostContext.tsx";
import { CommentsContextProvider } from "./contexts/CommentContext.tsx";

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
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AppContextProvider>
                <SearchResultContextProvider>
                    <PostsContextProvider>
                        <CommentsContextProvider>
                            <App />
                        </CommentsContextProvider>
                    </PostsContextProvider>
                </SearchResultContextProvider>
            </AppContextProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
