import axios from 'axios';

const port = import.meta.env.VITE_BACKEND_PORT || 8080;
const API_BASE = `http://localhost:${port}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('financeiq_token');
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
