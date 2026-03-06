import React, { createContext, useContext, useEffect } from 'react';
import type { User, AppData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthContextType {
    user: User | null;
    login: (email: string, passwordHash: string) => boolean;
    register: (name: string, email: string, passwordHash: string) => boolean;
    logout: () => void;
    updateTheme: (theme: 'light' | 'dark') => void;
    updateBudget: (categoryId: string, limit: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [appData, setAppData] = useLocalStorage<AppData>('gestor_financeiro_data', {
        users: [],
        transactions: [],
        categories: []
    });

    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('gestor_current_user', null);

    useEffect(() => {
        if (currentUser) {
            document.documentElement.setAttribute('data-theme', currentUser.preferences.theme);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [currentUser]);

    const login = (email: string, passwordHash: string) => {
        const found = appData.users.find(u => u.email === email && u.passwordHash === passwordHash);
        if (found) {
            setCurrentUser(found);
            return true;
        }
        return false;
    };

    const register = (name: string, email: string, passwordHash: string) => {
        if (appData.users.find(u => u.email === email)) return false;

        const newUser: User = {
            id: uuidv4(),
            name,
            email,
            passwordHash,
            preferences: { theme: 'light', currency: 'BRL' }
        };

        setAppData(prev => ({ ...prev, users: [...prev.users, newUser] }));
        setCurrentUser(newUser);
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const updateTheme = (theme: 'light' | 'dark') => {
        if (currentUser) {
            const updatedUser: User = { ...currentUser, preferences: { ...currentUser.preferences, theme } };
            setCurrentUser(updatedUser);
            setAppData(prev => ({
                ...prev,
                users: prev.users.map(u => u.id === currentUser.id ? updatedUser : u)
            }));
        }
    };

    const updateBudget = (categoryId: string, limit: number) => {
        if (currentUser) {
            const budgets = currentUser.preferences.monthlyBudgets || {};
            const updatedUser: User = {
                ...currentUser,
                preferences: {
                    ...currentUser.preferences,
                    monthlyBudgets: { ...budgets, [categoryId]: limit }
                }
            };
            setCurrentUser(updatedUser);
            setAppData(prev => ({
                ...prev,
                users: prev.users.map(u => u.id === currentUser.id ? updatedUser : u)
            }));
        }
    };

    return (
        <AuthContext.Provider value={{ user: currentUser, login, register, logout, updateTheme, updateBudget }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
