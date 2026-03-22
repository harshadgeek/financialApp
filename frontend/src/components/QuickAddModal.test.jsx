import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickAddModal from './QuickAddModal';
import * as api from '../api';

vi.mock('../api', () => ({
  addTransaction: vi.fn()
}));

describe('QuickAddModal', () => {
  it('renders correctly', () => {
    render(<QuickAddModal onClose={() => {}} />);
    expect(screen.getByText('Quick Add Transaction')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('calls addTransaction on submit', async () => {
    const onAdded = vi.fn();
    const onClose = vi.fn();
    api.addTransaction.mockResolvedValueOnce({ id: '1', amount: 100 });

    render(<QuickAddModal onClose={onClose} onAdded={onAdded} />);

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '150.50' } });
    fireEvent.change(screen.getByPlaceholderText('What was this for?'), { target: { value: 'Lunch' } });
    
    // Select type and category
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'EXPENSE' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'FOOD' } });

    fireEvent.click(screen.getByText('Save Transaction', { exact: false }));

    await waitFor(() => {
      expect(api.addTransaction).toHaveBeenCalledWith(expect.objectContaining({
        amount: 150.5,
        description: 'Lunch',
        category: 'FOOD',
        type: 'EXPENSE'
      }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Transaction added!/i)).toBeInTheDocument();
    });
  });

  it('shows alert on failure', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    api.addTransaction.mockRejectedValueOnce(new Error('API Error'));

    render(<QuickAddModal onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Save Transaction', { exact: false }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to add transaction.');
    });
  });
});
