import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  SignUpRequest, 
  User, 
  Transaction, 
  TransactionRequest,
  Budget,
  BudgetRequest,
  BudgetProgress,
  SavingsGoal,
  SavingsGoalRequest,
  SavingsGoalProgress
} from '../types/index';

const api = axios.create({
    baseURL: 'http://localhost:8083/api',
});

// Add token to all requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const registerUser = (userData: SignUpRequest) => {
    return api.post('/auth/signup', userData);
};

export const loginUser = (credentials: LoginRequest) => {
    return api.post<AuthResponse>('/auth/login', credentials);
};

export const getProfile = (token: string) => {
    return api.get<User>('/profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateProfile = (profileData: Partial<User>) => {
    return api.put<User>('/profile', profileData);
};

// Transaction APIs
export const getTransactions = () => {
    return api.get<Transaction[]>('/transactions');
};

export const createTransaction = (transaction: TransactionRequest) => {
    return api.post<Transaction>('/transactions', transaction);
};

export const updateTransaction = (id: number, transaction: TransactionRequest) => {
    return api.put<Transaction>(`/transactions/${id}`, transaction);
};

export const deleteTransaction = (id: number) => {
    return api.delete(`/transactions/${id}`);
};

// Budget APIs
export const getBudgets = (month: number, year: number) => {
    return api.get<Budget[]>('/budgets', {
        params: { month, year }
    });
};

export const createBudget = (budget: BudgetRequest) => {
    return api.post<Budget>('/budgets', budget);
};

export const updateBudget = (id: number, budget: BudgetRequest) => {
    return api.put<Budget>(`/budgets/${id}`, budget);
};

export const deleteBudget = (id: number) => {
    return api.delete(`/budgets/${id}`);
};

export const getBudgetProgress = (month: number, year: number) => {
    return api.get<BudgetProgress[]>('/budgets/progress', {
        params: { month, year }
    });
};

// Savings Goals APIs
export const getSavingsGoals = () => {
    return api.get<SavingsGoal[]>('/savings-goals');
};

export const createSavingsGoal = (goal: SavingsGoalRequest) => {
    return api.post<SavingsGoal>('/savings-goals', goal);
};

export const updateSavingsGoal = (id: number, goal: Partial<SavingsGoalRequest>) => {
    return api.put<SavingsGoal>(`/savings-goals/${id}`, goal);
};

export const deleteSavingsGoal = (id: number) => {
    return api.delete(`/savings-goals/${id}`);
};

export const getSavingsGoalProgress = () => {
    return api.get<SavingsGoalProgress[]>('/savings-goals/progress');
};

export const addToSavingsGoal = (id: number, amount: number) => {
    return api.post<SavingsGoal>(`/savings-goals/${id}/add`, { amount });
};

// Analytics APIs
export const getMonthlySpending = (year: number) => {
    return api.get('/analytics/monthly-spending', { params: { year } });
};

export const getCategorySpending = (month?: number, year?: number) => {
    return api.get('/analytics/category-spending', { 
        params: { month, year } 
    });
};

export const getIncomeVsExpenses = (startDate: string, endDate: string) => {
    return api.get('/analytics/income-vs-expenses', { 
        params: { startDate, endDate } 
    });
};

export const getAnalytics = (year: number, month: number) => {
    return api.get('/analytics', {
        params: { year, month }
    });
};

export const predictNextMonthExpenses = (months = 12) => {
    return api.get('/analytics/predict-next-month', {
        params: { months }
    });
};

// Admin APIs
export const getAllUsers = () => {
    return api.get('/admin/users');
};

export const banUser = (id: number) => {
    return api.post(`/admin/users/${id}/ban`);
};

export const unbanUser = (id: number) => {
    return api.post(`/admin/users/${id}/unban`);
};

export const getAdminRequests = () => {
    return api.get('/admin/admin-requests');
};

export const approveAdmin = (id: number) => {
    return api.post(`/admin/admin-requests/${id}/approve`);
};

export const revokeAdmin = (id: number) => {
    return api.post(`/admin/admin-requests/${id}/revoke`);
};

// Forum APIs
export const getForumPosts = (page = 0, size = 20) => {
    return api.get(`/forum/posts`, { params: { page, size } });
};

export const createForumPost = (content: string) => {
    return api.post('/forum/posts', { content });
};

export const updateForumPost = (postId: number, content: string) => {
    return api.put(`/forum/posts/${postId}`, { content });
};

export const deleteForumPost = (postId: number) => {
    return api.delete(`/forum/posts/${postId}`);
};

export const likeForumPost = (postId: number) => {
    return api.post(`/forum/posts/${postId}/like`);
};

export const addForumComment = (postId: number, content: string) => {
    return api.post(`/forum/posts/${postId}/comments`, { content });
};

export const likeForumComment = (commentId: number) => {
    return api.post(`/forum/comments/${commentId}/like`);
};

export const updateForumComment = (commentId: number, content: string) => {
    return api.put(`/forum/comments/${commentId}`, { content });
};

export const deleteForumComment = (commentId: number) => {
    return api.delete(`/forum/comments/${commentId}`);
};