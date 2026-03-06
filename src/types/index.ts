export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
    userId?: string;
}

export interface Transaction {
    id: string;
    userId: string;
    title: string;
    amount: number;
    date: string; // ISO String
    type: TransactionType;
    categoryId: string;
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    preferences: {
        theme: 'light' | 'dark';
        currency: string;
    };
}

export interface AppData {
    users: User[];
    transactions: Transaction[];
    categories: Category[];
}
