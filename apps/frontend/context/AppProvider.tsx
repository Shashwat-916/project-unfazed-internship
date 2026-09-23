'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './useAuthContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
};
