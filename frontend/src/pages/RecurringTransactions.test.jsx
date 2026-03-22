import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecurringTransactions from './RecurringTransactions';
import * as api from '../api';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock API
vi.mock('../api', () => ({
  getRecurringTransactions: vi.fn(),
  addRecurringTransaction: vi.fn(),
  updateRecurringTransaction: vi.fn(),
  deleteRecurringTransaction: vi.fn(),
}));

const mockRecurTxs = [
  { id: '1', description: 'Rent', category: 'RENT', amount: 15000, type: 'EXPENSE', frequency: 'MONTHLY', startDate: '2024-03-01', active: true, nextExecutionDate: '2024-04-01' },
];

describe('RecurringTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recurring transactions list', async () => {
    api.getRecurringTransactions.mockResolvedValueOnce(mockRecurTxs);

    await act(async () => {
      render(
        <CurrencyProvider>
          <RecurringTransactions />
        </CurrencyProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Rent')).toBeInTheDocument();
      expect(screen.getByText('MONTHLY')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('calls addRecurringTransaction on form submit', async () => {
    api.getRecurringTransactions.mockResolvedValue(mockRecurTxs);
    api.addRecurringTransaction.mockResolvedValueOnce({ id: '2', amount: 2000 });

    await act(async () => {
      render(
        <CurrencyProvider>
          <RecurringTransactions />
        </CurrencyProvider>
      );
    });

    fireEvent.click(screen.getByText('Add Recurring'));

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '2000' } });
    fireEvent.change(screen.getByPlaceholderText('What is this for?'), { target: { value: 'Internet' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Recurring Transaction'));
    });

    await waitFor(() => {
      expect(api.addRecurringTransaction).toHaveBeenCalled();
    });
  });

  it('calls deleteRecurringTransaction on delete click', async () => {
    api.getRecurringTransactions.mockResolvedValue(mockRecurTxs);
    api.deleteRecurringTransaction.mockResolvedValueOnce({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await act(async () => {
      render(
        <CurrencyProvider>
          <RecurringTransactions />
        </CurrencyProvider>
      );
    });

    await waitFor(() => expect(screen.getAllByTitle('Delete').length).toBeGreaterThan(0));
    
    fireEvent.click(screen.getAllByTitle('Delete')[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.deleteRecurringTransaction).toHaveBeenCalledWith('1');
  });
});
