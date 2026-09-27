"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./useAuthContext";

interface SocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: new Set(),
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuthContext();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!token) return;

        const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Handle different types of events if needed globally
                if (data.type === "online_users") {
                    setOnlineUsers(new Set(data.users));
                }
            } catch (error) {
                console.error("Failed to parse websocket message", error);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
