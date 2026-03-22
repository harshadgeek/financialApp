import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import * as api from '../api';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock API
vi.mock('../api', () => ({
  getDashboard: vi.fn(),
  getTransactions: vi.fn(),
  getBudgetStatus: vi.fn(),
}));

// Mock Recharts to avoid SVG/ResizeObserver issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
}));

const mockDashData = {
  totalIncome: 50000,
  totalExpenses: 20000,
  netBalance: 30000,
  savingsRate: 60,
  expenseByCategory: { FOOD: 5000, RENT: 15000 },
  monthlyTrend: [
    { month: 'Jan', income: 40000, expenses: 15000 },
    { month: 'Feb', income: 45000, expenses: 18000 },
  ]
};

const mockTxs = [
  { id: '1', description: 'Salary', category: 'SALARY', amount: 50000, type: 'INCOME', date: '2024-03-01' },
  { id: '2', description: 'Rent', category: 'RENT', amount: 15000, type: 'EXPENSE', date: '2024-03-02' },
];

const mockBudgetStatuses = [
  { category: 'FOOD', monthlyLimit: 4000, spent: 5000, status: 'OVER' }
];

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    api.getDashboard.mockReturnValue(new Promise(() => {})); // Never resolves
    render(
      <CurrencyProvider>
        <Dashboard />
      </CurrencyProvider>
    );
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
  });

  it('renders dashboard data correctly', async () => {
    api.getDashboard.mockResolvedValueOnce(mockDashData);
    api.getTransactions.mockResolvedValueOnce(mockTxs);
    api.getBudgetStatus.mockResolvedValueOnce(mockBudgetStatuses);

    await act(async () => {
      render(
        <CurrencyProvider>
          <Dashboard />
        </CurrencyProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('₹50,000')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('₹20,000')).toBeInTheDocument();
      expect(screen.getByText('Net Balance')).toBeInTheDocument();
      expect(screen.getByText('₹30,000')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    // Check for budget alert
    expect(screen.getByText(/Budget Exceeded/i)).toBeInTheDocument();
    expect(screen.getByText(/FOOD \(125%\)/i)).toBeInTheDocument();

    // Check for recent transactions
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    api.getDashboard.mockRejectedValueOnce(new Error('API Fail'));
    
    await act(async () => {
        render(
          <CurrencyProvider>
            <Dashboard />
          </CurrencyProvider>
        );
      });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
    });
  });
});
