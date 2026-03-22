import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUp from './SignUp';
import * as api from '../api';
import { MemoryRouter } from 'react-router-dom';

// Mock API
vi.mock('../api', () => ({
  register: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('SignUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders sign up form', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );
    expect(screen.getByText(/Create an/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('calls register on submit and redirects on success', async () => {
    api.register.mockResolvedValueOnce({ data: { token: 'test-token', username: 'newuser' } });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    });

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({ username: 'newuser', email: 'new@example.com', password: 'password123' });
      expect(sessionStorage.getItem('financeiq_token')).toBe('test-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error message on failure', async () => {
    api.register.mockRejectedValueOnce({
      response: { data: 'Username already exists' }
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'exists' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Username already exists/i)).toBeInTheDocument();
    });
  });
});
