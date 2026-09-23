import { WebSocket } from 'ws';

export type Status = "ACTIVE" | "INACTIVE";
export type Role = "CLIENT" | "THERAPIST";

export type User = {
    id: string;
    role: Role;
    ws: WebSocket;
};

export type ConversationRoom = {
    id: string;
    participants: string[];
};

export type MessagePayload = {
    content: string;
    recipientId: string;
};

export type NotificationPayload = {
    content: string;
    recipientId: string;
};
