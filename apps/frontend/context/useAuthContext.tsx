'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthRoutes } from '../services/authRoutes';
import { UserRoutes } from '../services/userRoutes';

interface User {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    authService: AuthRoutes;
    userService: UserRoutes;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const authService = new AuthRoutes(token || undefined);
    const userService = new UserRoutes(token || undefined);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    // Fetch user info when token is present
                    const tempUserService = new UserRoutes(storedToken);
                    const userData = await tempUserService.getCurrentUser();
                    setUser(userData.user || userData.data || userData);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, logout, authService, userService }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
