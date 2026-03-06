export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';
export type RecurrenceType = 'none' | 'fixed' | 'installment';

export interface Category {
    id: string;
    userId: string;
    name: string;
    color: string;
    icon: string;
    type: TransactionType | 'both';
}

export interface CreditCard {
    id: string;
    userId: string;
    name: string;
    limit: number;
    closingDay: number;
    dueDay: number;
    color: string;
}

export interface Transaction {
    id: string;
    userId: string;
    title: string;
    amount: number;
    date: string; // ISO Dtate
    type: TransactionType;
    categoryId: string;
    status: TransactionStatus;
    recurrence: RecurrenceType;
    installmentsCount?: number;
    currentInstallment?: number;
    parentId?: string;
    creditCardId?: string; // If this transaction was paid with a credit card
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
        monthlyBudgets?: Record<string, number>; // categoryId -> target amount limit
    };
}

export interface AppData {
    users: User[];
    transactions: Transaction[];
    categories: Category[];
    creditCards: CreditCard[];
}
