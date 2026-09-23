'use client';

import  { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TherapistRoutes } from '../services/therapistRoutes';
import { ServiceRoutes } from '../services/serviceRoutes';
import { AvailabilityRoutes, Availability } from '../services/availabilityRoutes';
import { useAuthContext } from './useAuthContext';

export interface TherapistProfile {
    id: string;
    phoneNumber: string;
    slug: string;
    specialization: string[];
    bio: string[];
    profileImage: string | null;
    languages: string[];
    status: string;
    userId: string;
    user: {
        name: string;
        email: string;
    };
    [key: string]: any;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    createdAt: string;
    updatedAt: string;
    therapistId: string;
}

interface TherapistContextType {
    profile: TherapistProfile | null;
    services: Service[];
    availability: Availability[];
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
    const [services, setServices] = useState<Service[]>([]);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const therapistService = new TherapistRoutes(token || undefined);
    const serviceService = new ServiceRoutes(token || undefined);
    const availabilityService = new AvailabilityRoutes(token || undefined);

    const refreshProfile = async () => {
        if (!token || user?.role !== 'THERAPIST') return;
        setIsLoading(true);
        try {
            const results = await Promise.allSettled([
                therapistService.getProfile(),
                serviceService.getServices(),
                availabilityService.getAvailability()
            ]);
            
            if (results[0].status === 'fulfilled' && results[0].value?.success) {
                setProfile(results[0].value.data);
            }
            if (results[1].status === 'fulfilled' && results[1].value?.success) {
                setServices(results[1].value.data);
            }
            if (results[2].status === 'fulfilled' && results[2].value?.success) {
                setAvailability(results[2].value.data);
            }

        } catch (error) {
            console.error('Failed to fetch therapist data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token && user?.role === 'THERAPIST') {
            refreshProfile();
        } else {
            setProfile(null);
            setServices([]);
            setAvailability([]);
        }
    }, [token, user]);

    return (
        <TherapistContext.Provider 
            value={{ 
                profile, 
                services,
                availability,
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
