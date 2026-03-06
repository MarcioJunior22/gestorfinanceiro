import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppData, Transaction, Category } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface FinanceContextType {
    transactions: Transaction[];
    categories: Category[];
    addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
    deleteTransaction: (id: string) => void;
    addCategory: (name: string, color: string, icon: string) => void;
    deleteCategory: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [appData, setAppData] = useLocalStorage<AppData>('gestor_financeiro_data', {
        users: [],
        transactions: [],
        categories: []
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (user) {
            setTransactions(appData.transactions.filter(t => t.userId === user.id) || []);

            const userCategories = appData.categories.filter(c => c.userId === user.id || !c.userId);
            if (userCategories.length === 0) {
                const defaults = [
                    { id: uuidv4(), userId: user.id, name: 'Alimentação', color: '#ef4444', icon: 'pizza' },
                    { id: uuidv4(), userId: user.id, name: 'Moradia', color: '#3b82f6', icon: 'home' },
                    { id: uuidv4(), userId: user.id, name: 'Transporte', color: '#f59e0b', icon: 'car' },
                    { id: uuidv4(), userId: user.id, name: 'Salário', color: '#10b981', icon: 'briefcase' }
                ];
                setAppData(prev => ({ ...prev, categories: [...prev.categories, ...defaults] }));
                setCategories(defaults);
            } else {
                setCategories(userCategories);
            }
        } else {
            setTransactions([]);
            setCategories([]);
        }
    }, [user, appData, setAppData]); // added missing dependency

    const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
        if (!user) return;
        const newTx: Transaction = {
            ...data,
            id: uuidv4(),
            userId: user.id,
            createdAt: new Date().toISOString()
        };
        setAppData(prev => ({ ...prev, transactions: [...prev.transactions, newTx] }));
    };

    const deleteTransaction = (id: string) => {
        setAppData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    };

    const addCategory = (name: string, color: string, icon: string) => {
        if (!user) return;
        const newCat = { id: uuidv4(), userId: user.id, name, color, icon };
        setAppData(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
    };

    const deleteCategory = (id: string) => {
        setAppData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
    };

    return (
        <FinanceContext.Provider value={{
            transactions, categories, addTransaction, deleteTransaction, addCategory, deleteCategory
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
