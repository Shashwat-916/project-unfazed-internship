'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './useAuthContext';
import { SocketContextProvider } from './useSocketContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthProvider>
            <SocketContextProvider>
                {children}
            </SocketContextProvider>
        </AuthProvider>
    );
};
