import { LoginFormData } from "./pages/Login";
import { SigninFormDataType } from "./pages/Signin";

// types
import {
    ChatBasicDataType,
    GroupChatBasicDataType,
    GroupChatFullDataType,
    MessageType,
    NotificationsDataType,
    PostCommentUserDataType,
    PostType,
    UserDataBasicType,
    UserDataType,
} from "../../backend/src/types/types";
import { PostCommentFormType } from "./components/CommentBox";

// env variable for vite react
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const signin = async (formData: SigninFormDataType) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-in`, {
        method: "POST",
        // for sending cookies to the backend
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const responseBody = await response.json();

    if (!response.ok) {
        throw new Error(responseBody.message);
    }
};

export const login = async (formData: LoginFormData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/log-in`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const responseBody = await response.json();

    if (!response.ok) {
        throw new Error(responseBody.message);
    }
    return responseBody;
};

export const logout = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/log-out`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Something went wrong, while logout");
    }

    return await response.json();
};

export type ValidateTokenResult = {
    userId: string;
};

export const validateToken = async (): Promise<ValidateTokenResult> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Token invalid");
    }

    return await response.json();
};

export const fetchUserDataById = async (
    userId: string
): Promise<UserDataType> => {
    // for current userData userId is not reqired, so empty string
    const response = await fetch(`${API_BASE_URL}/api/userdata/${userId}`, {
        credentials: "include",
    });

    if (response.status === 404) {
        throw new Error("User not found");
    }

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const editUserData = async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/userdata/edit`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong while updating profile!");
    }
};

export const searchAutoComplete = async (
    searchQuery: string
): Promise<{ username: string }[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/search/autocomplete?query=${searchQuery}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const searchUser = async (
    searchQuery: string,
    page: number,
    limit: number
): Promise<UserDataBasicType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/search?query=${searchQuery}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const doIFollow = async (
    userId: string
): Promise<{ doIFollow: boolean }> => {
    const response = await fetch(
        `${API_BASE_URL}/api/follow/do-i-follow/${userId}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const followUnfollow = async (
    userId: string
): Promise<{ doIFollow: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/api/follow/${userId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchFollowers = async (
    page: number,
    limit: number,
    userId: string
): Promise<UserDataBasicType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/follow/followers?userId=${userId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const searchFollower = async (
    page: number,
    limit: number,
    userId: string,
    query: string,
): Promise<UserDataBasicType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/follow/search-follower?query=${query}&userId=${userId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchFollowings = async (
    page: number,
    limit: number,
    userId: string
): Promise<UserDataBasicType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/follow/followings?userId=${userId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const searchFollowing = async (
    page: number,
    limit: number,
    userId: string,
    query: string,
): Promise<UserDataBasicType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/follow/search-following?query=${query}&userId=${userId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const addPost = async (postFormData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/post/add`, {
        method: "POST",
        credentials: "include",
        body: postFormData,
    });

    if (!response.ok) {
        if (res) throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchPostsByUserId = async (
    userId: string,
    page: number,
    limit: number
): Promise<PostType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/post/get-by-userId?userId=${userId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchPostsHome = async (
    page: number,
    limit: number
): Promise<PostType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/post/get-post-home?page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchPostsByPostId = async (postId: string): Promise<PostType> => {
    const response = await fetch(
        `${API_BASE_URL}/api/post/get-by-postId/${postId}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const deletePost = async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/post/${postId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const likeUnlikePost = async (postId: string) => {
    const response = await fetch(
        `${API_BASE_URL}/api/post/like-unlike/${postId}`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const addComment = async (formData: PostCommentFormType) => {
    const response = await fetch(`${API_BASE_URL}/api/post-comment/add`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(formData),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchMyCommentsByPostId = async (
    postId: string,
    page: number,
    limit: number
): Promise<PostCommentUserDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/post-comment/my-comments-by-postId?postId=${postId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchCommentsByPostId = async (
    postId: string,
    page: number,
    limit: number
): Promise<PostCommentUserDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/post-comment/by-postId?postId=${postId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const deleteComment = async (commentId: string) => {
    const response = await fetch(
        `${API_BASE_URL}/api/post-comment/${commentId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchDoIHaveNotifications = async (): Promise<{
    response: {
        doIHaveNotifications: boolean;
        doIHaveNewMessage: boolean;
    };
}> => {
    const response = await fetch(
        `${API_BASE_URL}/api/notifications/doIHaveNotifications`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchNotifications = async (
    page: number,
    limit: number
): Promise<NotificationsDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/notifications/?page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const clearNotifications = async () => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const createChat = async (
    members: string[],
    name?: string
): Promise<ChatBasicDataType | GroupChatBasicDataType | { chatId: string }> => {
    if (members.length > 1 && name === undefined) {
        throw new Error("Group name is required!");
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/create-chat/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ members, name }),
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const deleteChat = async (chatId: string) => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/delete-chat/${chatId}`,
        {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }
};

export const fetchChats = async (
    page: number,
    limit: number
): Promise<ChatBasicDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/get-chats?page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchGroupChats = async (
    page: number,
    limit: number
): Promise<GroupChatBasicDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/get-group-chats?page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const searchChat = async (
    page: number,
    limit: number,
    query: string
): Promise<ChatBasicDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/search-chat?query=${query}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const searchGroupChat = async (
    page: number,
    limit: number,
    query: string
): Promise<GroupChatBasicDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/search-group-chat?query=${query}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchChatData = async (
    chatId: string
): Promise<ChatBasicDataType | GroupChatBasicDataType> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/get-chat-data/${chatId}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchGroupDetails = async (
    chatId: string
): Promise<GroupChatFullDataType> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/get-group-details/${chatId}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const fetchGroupMembers = async (
    chatId: string,
    page: number,
    limit: number
): Promise<UserDataBasicType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/get-group-members?chatId=${chatId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const searchGroupMembers = async (
    chatId: string,
    query: string,
    page: number,
    limit: number
): Promise<UserDataBasicType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/search-member/${chatId}?page=${page}&limit=${limit}&query=${query}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const editGroupData = async (chatId: string, formData: FormData) => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/edit-group-chats/${chatId}`,
        {
            method: "PATCH",
            credentials: "include",
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }
};

export const leaveGroup = async (chatId: string) => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/leave-group/${chatId}`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }
};

export const addMembersToGroup = async (members: string[], chatId: string) => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/add-members/${chatId}`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ members }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }
};

export const removeMemberFromGroup = async (userId: string, chatId: string) => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/remove-member/${chatId}?userId=${userId}`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }
};

export const fetchPrevMessages = async (
    chatId: string,
    skip: number,
    limit: number
): Promise<MessageType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/get-messages?chatId=${chatId}&skip=${skip}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};

export const uploadAttachments = async (
    chatId: string,
    imageForm: FormData
): Promise<{ imageUrls: string[] }> => {
    const response = await fetch(
        `${API_BASE_URL}/api/chat/upload-attachments/${chatId}`,
        {
            method: "POST",
            credentials: "include",
            body: imageForm,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        if (error.message) throw new Error(error.message);

        throw new Error("Something went wrong");
    }

    return await response.json();
};
