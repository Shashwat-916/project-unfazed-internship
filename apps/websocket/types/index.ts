import { WebSocket } from 'ws';

export type Status = "ACTIVE" | "INACTIVE";
export type Role = "CLIENT" | "THERAPIST";
export type Message = { id: string, senderId: string, conversationId: string }
export type Conversation = { id: string, clientId: string, therapistId: string, messages: Message[] }
export type User ={userId: string;role: string;status: Status;socket: WebSocket}