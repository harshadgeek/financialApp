import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FutureTrends from './FutureTrends';
import * as api from '../api';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock API
vi.mock('../api', () => ({
  getFutureProjection: vi.fn(),
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
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
}));

const mockProjection = {
  currentBalance: 30000,
  projectedIncome: 50000,
  projectedExpenses: 20000,
  projectedFinalBalance: 60000,
  trend: [
    { date: '2024-03-01', balance: 30000 },
    { date: '2024-04-01', balance: 40000 },
  ]
};

describe('FutureTrends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders projection data correctly', async () => {
    api.getFutureProjection.mockResolvedValueOnce(mockProjection);

    await act(async () => {
      render(
        <CurrencyProvider>
          <FutureTrends />
        </CurrencyProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Future Trends')).toBeInTheDocument();
      expect(screen.getByText('₹30,000')).toBeInTheDocument();
      expect(screen.getByText('+₹50,000')).toBeInTheDocument();
      expect(screen.getByText('-₹20,000')).toBeInTheDocument();
      expect(screen.getByText('₹60,000')).toBeInTheDocument();
      expect(screen.getByText('Positive Outlook')).toBeInTheDocument();
    });
  });

  it('re-loads data when target date changes', async () => {
    api.getFutureProjection.mockResolvedValue(mockProjection);

    await act(async () => {
      render(
        <CurrencyProvider>
          <FutureTrends />
        </CurrencyProvider>
      );
    });

    const dateInput = screen.getByLabelText(/Forecast Until:/i);
    fireEvent.change(dateInput, { target: { value: '2024-12-31' } });

    expect(api.getFutureProjection).toHaveBeenCalledTimes(2); // Initial + change
    expect(api.getFutureProjection).toHaveBeenCalledWith('2024-12-31');
  });

  it('handles error state', async () => {
    api.getFutureProjection.mockRejectedValueOnce(new Error('API Fail'));
    
    await act(async () => {
        render(
          <CurrencyProvider>
            <FutureTrends />
          </CurrencyProvider>
        );
      });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load projection data/i)).toBeInTheDocument();
    });
  });
});
