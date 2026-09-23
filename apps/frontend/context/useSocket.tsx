'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './useAuthContext';

interface SocketContextType {
    socket: any | null; // Replace 'any' with actual Socket type when a library is chosen (e.g., socket.io-client)
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuthContext();
    const [socket, setSocket] = useState<any | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            if (socket) {
                // socket.disconnect();
            }
            setSocket(null);
            setIsConnected(false);
            return;
        }

        // TODO: Initialize socket connection here
        // Example with socket.io-client:
        // const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5001', {
        //     auth: { token }
        // });
        // 
        // newSocket.on('connect', () => setIsConnected(true));
        // newSocket.on('disconnect', () => setIsConnected(false));
        // setSocket(newSocket);
        //
        // return () => {
        //     newSocket.disconnect();
        // };

    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};
