import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as api from './api';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { MemoryRouter } from 'react-router-dom';

// Mock API
vi.mock('./api', () => ({
  getUserProfile: vi.fn(),
  getDashboard: vi.fn(),
  getTransactions: vi.fn(),
  getBudgetStatus: vi.fn(),
  BASE_URL: 'http://localhost:8080'
}));

// Mock Pages to simplify App test
vi.mock('./pages/Dashboard', () => ({ default: () => <div data-testid="dashboard-page">Dashboard</div> }));
vi.mock('./pages/SignIn', () => ({ default: () => <div data-testid="login-page">Login</div> }));
vi.mock('./pages/SignUp', () => ({ default: () => <div data-testid="register-page">Register</div> }));

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    api.getUserProfile.mockResolvedValue({ username: 'testuser' });
    api.getDashboard.mockResolvedValue({ monthlyTrend: [] });
    api.getTransactions.mockResolvedValue([]);
    api.getBudgetStatus.mockResolvedValue([]);
  });

  it('redirects to /login when no token is present', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('renders dashboard when token is present', async () => {
    sessionStorage.setItem('financeiq_token', 'fake-token');
    sessionStorage.setItem('financeiq_username', 'testuser');
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });
});
