"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeJWTPayload, getDisplayName } from '@/lib/utils';

interface User {
    name: string;
    email: string;
    userId: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const payload = decodeJWTPayload(storedToken);
            if (payload && payload.userId) {
                setUser({
                    name: getDisplayName(payload.name),
                    email: payload.email || '',
                    userId: payload.userId
                });
                setToken(storedToken);
            } else {
                localStorage.removeItem("token");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        const payload = decodeJWTPayload(newToken);
        if (payload && payload.userId) {
            const userData = {
                name: getDisplayName(payload.name),
                email: payload.email || '',
                userId: payload.userId
            };
            setUser(userData);
            setToken(newToken);
            localStorage.setItem("token", newToken);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("interviewSessionId");
        localStorage.removeItem("firstQuestion");
        localStorage.removeItem("totalQuestions");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("pendingSession");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}