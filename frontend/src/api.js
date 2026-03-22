import axios from 'axios';

// Read from the global window object injected at runtime via index.html
const injectedUrl = window.RUNTIME_API_URL;
const rawUrl = (injectedUrl && injectedUrl !== "__RUNTIME_API_URL__")
  ? injectedUrl
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : `https://financial-app-backend-600881932726.us-central1.run.app`;
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
export const BASE_URL = rawUrl;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('financeiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (data) => api.post('/auth/register', data);

export const getDashboard = () => api.get('/reports/dashboard').then(r => r.data);
export const getWeeklyReport = () => api.get('/reports/weekly').then(r => r.data);
export const getMonthlyReport = (month, year) => api.get('/reports/monthly', { params: { month, year } }).then(r => r.data);

export const getTransactions = () => api.get('/transactions').then(r => r.data);
export const addTransaction = (txn) => api.post('/transactions', txn).then(r => r.data);
export const updateTransaction = (id, txn) => api.put(`/transactions/${id}`, txn).then(r => r.data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

export const getRecurringTransactions = () => api.get('/recurring-transactions').then(r => r.data);
export const addRecurringTransaction = (txn) => api.post('/recurring-transactions', txn).then(r => r.data);
export const updateRecurringTransaction = (id, txn) => api.put(`/recurring-transactions/${id}`, txn).then(r => r.data);
export const deleteRecurringTransaction = (id) => api.delete(`/recurring-transactions/${id}`);

export const getFutureProjection = (targetDate) => api.get('/reports/future-projection', { params: { targetDate } }).then(r => r.data);

// User Profile
export const getUserProfile = () => api.get('/users/profile').then(r => r.data);
export const uploadProfilePicture = (formData) => api.post('/users/profile-picture', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data);

// Budgets
export const getBudgets = () => api.get('/budgets').then(r => r.data);
export const upsertBudget = (category, monthlyLimit) => api.post('/budgets', { category, monthlyLimit }).then(r => r.data);
export const deleteBudget = (category) => api.delete(`/budgets/${category}`);
export const getBudgetStatus = (month, year) => api.get('/budgets/status', { params: { month, year } }).then(r => r.data);

// Account
export const changePassword = (currentPassword, newPassword) =>
  api.post('/users/change-password', { currentPassword, newPassword }).then(r => r.data);
