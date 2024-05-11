import {
    ChatBasicDataType,
    GroupChatBasicDataType,
    MessageType,
    PostCommentUserDataType,
    UserDataBasicType,
} from "../../../backend/src/types/types";

export type ChatsStateType = ChatBasicDataType[];

export type ChatsActionType =
    | {
          type: "SET";
          payload: ChatBasicDataType[];
      }
    | { type: "RESET" }
    | { type: "DELETE_CHAT"; payload: { chatId: string } }
    | {
          type: "UPDATE_LAST_MESSAGE";
          payload: {
              chatId: string;
              message: MessageType;
          };
      }
    | {
          type: "UPDATE_CHATDATA";
          payload: {
              chatId: string;
              chatData: ChatBasicDataType;
          };
      }
    | {
          type: "UPDATE_NEW_MESSAGE";
          payload: {
              chatId: string;
              newStatus: boolean;
          };
      };

export type CommentStateType = PostCommentUserDataType[];

export type CommentActionType =
    | {
          type: "SET_COMMENTS";
          payload: PostCommentUserDataType[];
      }
    | {
          type: "ADD_COMMENTS";
          payload: PostCommentUserDataType[];
      }
    | { type: "RESET" };

export type FollowersStateType = UserDataBasicType[];

export type FollowersActionType =
    | {
          type: "SET_FOLLOWERS";
          payload: UserDataBasicType[];
      }
    | { type: "RESET" };

export type FollowingsStateType = UserDataBasicType[];

export type FollowingsActionType =
    | {
          type: "SET_FOLLOWINGS";
          payload: UserDataBasicType[];
      }
    | { type: "RESET" };

export type GroupChatsStateType = GroupChatBasicDataType[];

export type GroupChatsActionType =
    | {
          type: "SET";
          payload: GroupChatBasicDataType[];
      }
    | { type: "DELETE_CHAT"; payload: { chatId: string } }
    | {
          type: "UPDATE_CHATDATA";
          payload: {
              chatId: string;
              chatData: GroupChatBasicDataType;
          };
      }
    | {
          type: "UPDATE_NEW_MESSAGE";
          payload: {
              chatId: string;
              newStatus: boolean;
          };
      }
    | { type: "RESET" };

export type MessageStateType = Map<string, Array<MessageType>>;

export type MessageActionType =
    | {
          type: "SET_CHAT_ID";
          payload: { chatId: string };
      }
    | {
          type: "RESET_CHAT_ID";
          payload: { chatId: string };
      }
    | {
          type: "SET_READ_STATUS";
          payload: { chatId: string; userId: string };
      }
    | {
          type: "DELETE_CHAT_ID";
          payload: { chatId: string };
      }
    | {
          type: "ADD_MESSAGES";
          payload: { chatId: string; messages: MessageType[] };
      }
    | {
          type: "ADD_MESSAGE";
          payload: { chatId: string; message: MessageType };
      }
    | { type: "RESET" };

export type PostStateType = any[];

export type PostActionType =
    | {
          type: "SET_POSTS";
          payload: any[];
      }
    | { type: "RESET" };

export type SearchStateType = UserDataBasicType[];

export type SearchActionType =
    | {
          type: "SET_SEARCHRESULT";
          payload: UserDataBasicType[];
      }
    | { type: "RESET" };
