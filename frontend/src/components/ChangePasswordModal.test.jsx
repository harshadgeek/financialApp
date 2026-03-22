import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChangePasswordModal from './ChangePasswordModal';
import * as api from '../api';

vi.mock('../api', () => ({
  changePassword: vi.fn()
}));

describe('ChangePasswordModal', () => {
  it('renders modal and inputs', () => {
    const fn = vi.fn();
    render(<ChangePasswordModal onClose={fn} />);
    
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    // Use placeholder text to find inputs
    expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat new password')).toBeInTheDocument();
  });

  it('shows error when new passwords do not match', async () => {
    const fn = vi.fn();
    render(<ChangePasswordModal onClose={fn} />);
    
    // Fill form with unmatched passwords
    fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' }});
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'newpass123' }});
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'different123' }});
    
    // Submit
    fireEvent.click(screen.getByText('Update Password', { exact: false }));
    
    // Expect error
    await waitFor(() => {
      expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
    });
    
    expect(api.changePassword).not.toHaveBeenCalled();
  });

  it('calls changePassword on successful submit', async () => {
    const fn = vi.fn();
    api.changePassword.mockResolvedValueOnce({});
    
    render(<ChangePasswordModal onClose={fn} />);
    
    // Fill properly
    fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' }});
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'newpass123' }});
    fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'newpass123' }});
    
    // Submit
    fireEvent.click(screen.getByText('Update Password', { exact: false }));
    
    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith('oldpass123', 'newpass123');
    });
    
    // Expect success text
    await waitFor(() => {
      expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
    });
  });
});
