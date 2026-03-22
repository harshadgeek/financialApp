import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WeeklyReport from './WeeklyReport';
import * as api from '../api';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock API
vi.mock('../api', () => ({
  getWeeklyReport: vi.fn(),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const mockWeeklyData = {
  totalIncome: 10000,
  totalExpenses: 4000,
  netBalance: 6000,
  expenseByCategory: { FOOD: 1000, TRANSPORT: 500 },
  dailyData: [
    { day: 'Mon', date: '2024-03-04', income: 0, expenses: 500 },
    { day: 'Tue', date: '2024-03-05', income: 5000, expenses: 200 },
  ]
};

describe('WeeklyReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weekly report data correctly', async () => {
    api.getWeeklyReport.mockResolvedValueOnce(mockWeeklyData);

    await act(async () => {
      render(
        <CurrencyProvider>
          <WeeklyReport />
        </CurrencyProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Weekly Report')).toBeInTheDocument();
      expect(screen.getByText('₹10,000')).toBeInTheDocument();
      expect(screen.getByText('₹4,000')).toBeInTheDocument();
      expect(screen.getByText('₹6,000')).toBeInTheDocument();
      expect(screen.getByText('FOOD')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    api.getWeeklyReport.mockRejectedValueOnce(new Error('API Fail'));
    
    await act(async () => {
        render(
          <CurrencyProvider>
            <WeeklyReport />
          </CurrencyProvider>
        );
      });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load weekly report/i)).toBeInTheDocument();
    });
  });
});
