'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientRoutes } from '../services/clientRoutes';
import { useAuthContext } from './useAuthContext';

interface ClientProfile {
    id: string;
    [key: string]: any;
}

interface ClientContextType {
    profile: ClientProfile | null;
    isLoading: boolean;
    clientService: ClientRoutes;
    refreshProfile: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
    const { token, user } = useAuthContext();
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const clientService = new ClientRoutes(token || undefined);

    const refreshProfile = async () => {
        if (!token || user?.role !== 'CLIENT') return;
        setIsLoading(true);
        try {
            const data = await clientService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch client profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token && user?.role === 'CLIENT') {
            refreshProfile();
        } else {
            setProfile(null);
        }
    }, [token, user]);

    return (
        <ClientContext.Provider value={{ profile, isLoading, clientService, refreshProfile }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClientContext = () => {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClientContext must be used within a ClientProvider');
    }
    return context;
};
