'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TherapistRoutes } from '../services/therapistRoutes';
import { ServiceRoutes } from '../services/serviceRoutes';
import { AvailabilityRoutes } from '../services/availabilityRoutes';
import { useAuthContext } from './useAuthContext';

interface TherapistProfile {
    id: string;
    [key: string]: any;
}

interface TherapistContextType {
    profile: TherapistProfile | null;
    isLoading: boolean;
    therapistService: TherapistRoutes;
    serviceService: ServiceRoutes;
    availabilityService: AvailabilityRoutes;
    refreshProfile: () => Promise<void>;
}

const TherapistContext = createContext<TherapistContextType | undefined>(undefined);

export const TherapistProvider = ({ children }: { children: ReactNode }) => {
    const { token, user } = useAuthContext();
    const [profile, setProfile] = useState<TherapistProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const therapistService = new TherapistRoutes(token || undefined);
    const serviceService = new ServiceRoutes(token || undefined);
    const availabilityService = new AvailabilityRoutes(token || undefined);

    const refreshProfile = async () => {
        if (!token || user?.role !== 'THERAPIST') return;
        setIsLoading(true);
        try {
            const data = await therapistService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch therapist profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token && user?.role === 'THERAPIST') {
            refreshProfile();
        } else {
            setProfile(null);
        }
    }, [token, user]);

    return (
        <TherapistContext.Provider 
            value={{ 
                profile, 
                isLoading, 
                therapistService, 
                serviceService, 
                availabilityService, 
                refreshProfile 
            }}
        >
            {children}
        </TherapistContext.Provider>
    );
};

export const useTherapistContext = () => {
    const context = useContext(TherapistContext);
    if (context === undefined) {
        throw new Error('useTherapistContext must be used within a TherapistProvider');
    }
    return context;
};
