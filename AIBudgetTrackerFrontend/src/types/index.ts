export interface User {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'OWNER';
    firstName?: string;
    lastName?: string;
    monthlyIncome?: number;
    savings?: number;
    targetExpenses?: number;
    banned?: boolean;
    adminApproved?: boolean;
}

export interface AuthResponse {
    token: string;
}

export interface SignUpRequest {
    username: string;
    email: string;
    password: string;
    role?: 'USER' | 'ADMIN';
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface Transaction {
    id: number;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
    description?: string;
    transactionDate: string;
    createdAt: string;
}

export interface TransactionRequest {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
    description?: string;
    transactionDate: string;
}

export interface Budget {
    id: number;
    category: string;
    amount: number;
    month: number;
    year: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface BudgetRequest {
    category: string;
    amount: number;
    month: number;
    year: number;
}

export interface SavingsGoal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface SavingsGoalRequest {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string;
}

export interface BudgetProgress {
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
}

export interface SavingsGoalProgress extends SavingsGoal {
    progressPercentage: number;
    daysRemaining: number | null;
    onTrack: boolean;
}