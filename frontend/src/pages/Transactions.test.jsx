import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Transactions from './Transactions';
import * as api from '../api';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock API
vi.mock('../api', () => ({
  getTransactions: vi.fn(),
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

// Mock jsPDF and XLSX
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
  })),
}));
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
    aoa_to_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

const mockTxs = [
  { id: '1', description: 'Salary', category: 'SALARY', amount: 50000, type: 'INCOME', date: '2024-03-01' },
  { id: '2', description: 'Rent', category: 'RENT', amount: 15000, type: 'EXPENSE', date: '2024-03-02' },
];

describe('Transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state and then transactions', async () => {
    api.getTransactions.mockResolvedValueOnce(mockTxs);

    await act(async () => {
      render(
        <CurrencyProvider>
          <Transactions />
        </CurrencyProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Rent')).toBeInTheDocument();
    });
  });

  it('filters transactions by search term', async () => {
    api.getTransactions.mockResolvedValueOnce(mockTxs);

    await act(async () => {
      render(
        <CurrencyProvider>
          <Transactions />
        </CurrencyProvider>
      );
    });

    await waitFor(() => expect(screen.getByText('Salary')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Search description/i);
    fireEvent.change(searchInput, { target: { value: 'Rent' } });

    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('calls addTransaction on form submit', async () => {
    api.getTransactions.mockResolvedValue(mockTxs);
    api.addTransaction.mockResolvedValueOnce({ id: '3', amount: 100 });

    await act(async () => {
      render(
        <CurrencyProvider>
          <Transactions />
        </CurrencyProvider>
      );
    });

    fireEvent.click(screen.getByText('Add Transaction'));

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('What was this for?'), { target: { value: 'Coffee' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Transaction'));
    });

    await waitFor(() => {
      expect(api.addTransaction).toHaveBeenCalled();
    });
  });

  it('calls deleteTransaction on delete click', async () => {
    api.getTransactions.mockResolvedValue(mockTxs);
    api.deleteTransaction.mockResolvedValueOnce({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await act(async () => {
      render(
        <CurrencyProvider>
          <Transactions />
        </CurrencyProvider>
      );
    });

    await waitFor(() => expect(screen.getAllByTitle('Delete').length).toBeGreaterThan(0));
    
    fireEvent.click(screen.getAllByTitle('Delete')[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(api.deleteTransaction).toHaveBeenCalled();
    });
  });
});
