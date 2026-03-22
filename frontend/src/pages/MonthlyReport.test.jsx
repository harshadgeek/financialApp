import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MonthlyReport from './MonthlyReport';
import * as api from '../api';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock API
vi.mock('../api', () => ({
  getMonthlyReport: vi.fn(),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  Legend: () => null,
}));

const mockMonthlyData = {
  month: 'March',
  year: 2024,
  totalIncome: 45000,
  totalExpenses: 20000,
  netBalance: 25000,
  savingsRate: 55,
  expenseByCategory: { RENT: 12000, FOOD: 3000 },
  dailyRunningTotal: [{ day: 1, cumulativeIncome: 1000, cumulativeExpenses: 200 }],
  weeklyBreakdown: [{ week: 'Week 1', income: 10000, expenses: 5000 }],
};

describe('MonthlyReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders monthly report data correctly', async () => {
    api.getMonthlyReport.mockResolvedValueOnce(mockMonthlyData);

    await act(async () => {
      render(
        <CurrencyProvider>
          <MonthlyReport />
        </CurrencyProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Monthly Report')).toBeInTheDocument();
      expect(screen.getByText('₹45,000')).toBeInTheDocument();
      expect(screen.getByText('55%')).toBeInTheDocument();
      expect(screen.getByText('RENT')).toBeInTheDocument();
    });
  });

  it('navigates to previous and next month', async () => {
    api.getMonthlyReport.mockResolvedValue(mockMonthlyData);

    await act(async () => {
      render(
        <CurrencyProvider>
          <MonthlyReport />
        </CurrencyProvider>
      );
    });

    const prevBtn = screen.getAllByRole('button')[0]; // Left arrow
    const nextBtn = screen.getAllByRole('button')[1]; // Right arrow

    await act(async () => {
      fireEvent.click(prevBtn);
    });

    expect(api.getMonthlyReport).toHaveBeenCalledTimes(2); // Initial + prev
  });
});
