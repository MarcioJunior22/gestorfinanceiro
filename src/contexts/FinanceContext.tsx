import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { AppData, Transaction, Category, CreditCard } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface FinanceContextType {
    transactions: Transaction[];
    categories: Category[];
    creditCards: CreditCard[];
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    monthlyTransactions: Transaction[];
    addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addCategory: (data: Omit<Category, 'id' | 'userId'>) => void;
    updateCategory: (id: string, data: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    addCreditCard: (data: Omit<CreditCard, 'id' | 'userId'>) => void;
    updateCreditCard: (id: string, data: Partial<CreditCard>) => void;
    deleteCreditCard: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [appData, setAppData] = useLocalStorage<AppData>('gestor_financeiro_data', {
        users: [], transactions: [], categories: [], creditCards: []
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (user) {
            setTransactions(appData.transactions.filter(t => t.userId === user.id) || []);
            setCreditCards(appData.creditCards?.filter(c => c.userId === user.id) || []);
            const userCategories = appData.categories.filter(c => c.userId === user.id);

            if (userCategories.length === 0) {
                const defaults: Category[] = [
                    { id: uuidv4(), userId: user.id, name: 'Alimentação', color: '#ef4444', icon: 'pizza', type: 'expense' },
                    { id: uuidv4(), userId: user.id, name: 'Moradia', color: '#3b82f6', icon: 'home', type: 'expense' },
                    { id: uuidv4(), userId: user.id, name: 'Transporte', color: '#f59e0b', icon: 'car', type: 'expense' },
                    { id: uuidv4(), userId: user.id, name: 'Salário', color: '#10b981', icon: 'briefcase', type: 'income' },
                    { id: uuidv4(), userId: user.id, name: 'Investimentos', color: '#8b5cf6', icon: 'trending-up', type: 'both' },
                ];
                setAppData(prev => ({ ...prev, categories: [...prev.categories, ...defaults] }));
                setCategories(defaults);
            } else {
                setCategories(userCategories);
            }
        } else {
            setTransactions([]);
            setCategories([]);
            setCreditCards([]);
        }
    }, [user, appData]);

    const monthlyTransactions = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
    }, [transactions, currentMonth]);

    const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
        if (!user) return;

        // Handle installments logically
        if (data.recurrence === 'installment' && data.installmentsCount && data.installmentsCount > 1) {
            const parentId = uuidv4();
            const installmentAmount = data.amount / data.installmentsCount;
            const baseDate = parseISO(data.date);

            const newTxs: Transaction[] = Array.from({ length: data.installmentsCount }).map((_, i) => {
                const d = new Date(baseDate);
                d.setMonth(d.getMonth() + i);
                return {
                    ...data,
                    id: uuidv4(),
                    userId: user.id,
                    amount: installmentAmount,
                    date: d.toISOString(),
                    parentId,
                    currentInstallment: i + 1,
                    createdAt: new Date().toISOString()
                };
            });
            setAppData(prev => ({ ...prev, transactions: [...prev.transactions, ...newTxs] }));
        } else {
            const newTx: Transaction = {
                ...data,
                id: uuidv4(),
                userId: user.id,
                createdAt: new Date().toISOString()
            };
            setAppData(prev => ({ ...prev, transactions: [...prev.transactions, newTx] }));
        }
    };

    const updateTransaction = (id: string, data: Partial<Transaction>) => {
        setAppData(prev => ({
            ...prev,
            transactions: prev.transactions.map(t => t.id === id ? { ...t, ...data } : t)
        }));
    };

    const deleteTransaction = (id: string) => {
        setAppData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    };

    const addCategory = (data: Omit<Category, 'id' | 'userId'>) => {
        if (!user) return;
        const newCat = { ...data, id: uuidv4(), userId: user.id };
        setAppData(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
    };

    const updateCategory = (id: string, data: Partial<Category>) => {
        setAppData(prev => ({
            ...prev,
            categories: prev.categories.map(c => c.id === id ? { ...c, ...data } : c)
        }));
    };

    const deleteCategory = (id: string) => {
        setAppData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
    };

    const addCreditCard = (data: Omit<CreditCard, 'id' | 'userId'>) => {
        if (!user) return;
        const newCard = { ...data, id: uuidv4(), userId: user.id };
        setAppData(prev => ({ ...prev, creditCards: [...(prev.creditCards || []), newCard] }));
    };

    const updateCreditCard = (id: string, data: Partial<CreditCard>) => {
        setAppData(prev => ({
            ...prev,
            creditCards: (prev.creditCards || []).map(c => c.id === id ? { ...c, ...data } : c)
        }));
    };

    const deleteCreditCard = (id: string) => {
        setAppData(prev => ({ ...prev, creditCards: (prev.creditCards || []).filter(c => c.id !== id) }));
    };

    return (
        <FinanceContext.Provider value={{
            transactions, categories, creditCards, currentMonth, setCurrentMonth, monthlyTransactions,
            addTransaction, updateTransaction, deleteTransaction, addCategory, updateCategory, deleteCategory,
            addCreditCard, updateCreditCard, deleteCreditCard
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) throw new Error('useFinance must be used within a FinanceProvider');
    return context;
};
