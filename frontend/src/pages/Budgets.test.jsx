import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Budgets from './Budgets';
import * as api from '../api';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock API
vi.mock('../api', () => ({
  getBudgets: vi.fn(),
  upsertBudget: vi.fn(),
  deleteBudget: vi.fn(),
  getBudgetStatus: vi.fn(),
}));

const mockBudgets = [
  { category: 'FOOD', monthlyLimit: 5000 },
  { category: 'RENT', monthlyLimit: 15000 },
];

const mockStatuses = [
  { category: 'FOOD', monthlyLimit: 5000, spent: 6000, status: 'OVER' },
  { category: 'RENT', monthlyLimit: 15000, spent: 15000, status: 'NORMAL' },
];

describe('Budgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders budget list and statuses', async () => {
    api.getBudgets.mockResolvedValueOnce(mockBudgets);
    api.getBudgetStatus.mockResolvedValueOnce(mockStatuses);

    await act(async () => {
      render(
        <CurrencyProvider>
          <Budgets />
        </CurrencyProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('FOOD')).toBeInTheDocument();
      expect(screen.getByText('RENT')).toBeInTheDocument();
      expect(screen.getByText(/6,000 spent/i)).toBeInTheDocument();
      expect(screen.getByText(/Over budget by ₹1,000/i)).toBeInTheDocument();
    });
  });

  it('calls upsertBudget on form submit', async () => {
    api.getBudgets.mockResolvedValue(mockBudgets);
    api.getBudgetStatus.mockResolvedValue(mockStatuses);
    api.upsertBudget.mockResolvedValueOnce({});

    await act(async () => {
      render(
        <CurrencyProvider>
          <Budgets />
        </CurrencyProvider>
      );
    });

    const amountInput = screen.getByPlaceholderText(/e.g. 5000/i);
    fireEvent.change(amountInput, { target: { value: '2000' } });
    
    // Select is 'FOOD' by default. We can change it if we want.
    
    await act(async () => {
      fireEvent.click(screen.getByText('Update Limit'));
    });

    expect(api.upsertBudget).toHaveBeenCalledWith('FOOD', 2000);
  });

  it('calls deleteBudget on remove click', async () => {
    api.getBudgets.mockResolvedValue(mockBudgets);
    api.getBudgetStatus.mockResolvedValue(mockStatuses);
    api.deleteBudget.mockResolvedValueOnce({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await act(async () => {
      render(
        <CurrencyProvider>
          <Budgets />
        </CurrencyProvider>
      );
    });

    await waitFor(() => expect(screen.getAllByTitle('Remove budget').length).toBeGreaterThan(0));
    
    fireEvent.click(screen.getAllByTitle('Remove budget')[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.deleteBudget).toHaveBeenCalledWith('FOOD');
  });
});
