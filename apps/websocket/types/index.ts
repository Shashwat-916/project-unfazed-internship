import { isIntersectionType } from "typescript/unstable/sync";

export type EVENTS =
    | "ping"
    | "pong"
    | "conversation:join"
    | "conversation:leave"
    | "message:send"
    | "message:new"
    | "message:read"
    | "message:delete"
    | "presence:update"
    | "error";


export type STATUS = "ACTIVE "|"INACTIVE"  
export type User = { userId :string , isAuthenticated :Boolean , status : STATUS}
export type Messages = { senderId :string ,content :string }
export type Conversation= {}