'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './useAuthContext';
import { SocketProvider } from './useSocket';
import { ClientProvider } from './useClientContext';
import { TherapistProvider } from './useTherapistContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthProvider>
            <SocketProvider>
                <ClientProvider>
                    <TherapistProvider>
                        {children}
                    </TherapistProvider>
                </ClientProvider>
            </SocketProvider>
        </AuthProvider>
    );
};
