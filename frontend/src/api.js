import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getDashboard = () => api.get('/reports/dashboard').then(r => r.data);
export const getWeeklyReport = () => api.get('/reports/weekly').then(r => r.data);
export const getMonthlyReport = (month, year) => api.get('/reports/monthly', { params: { month, year } }).then(r => r.data);
export const getTransactions = () => api.get('/transactions').then(r => r.data);
export const addTransaction = (tx) => api.post('/transactions', tx).then(r => r.data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getBudgets = (month, year) => api.get('/budgets', { params: { month, year } }).then(r => r.data);
export const upsertBudget = (budget) => api.post('/budgets', budget).then(r => r.data);

export default api;
