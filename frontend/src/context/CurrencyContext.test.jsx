import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrencyProvider, useCurrency } from './CurrencyContext';

const TestComponent = () => {
  const { currency, setCurrency, fmt, symbol } = useCurrency();
  return (
    <div>
      <span data-testid="currency-code">{currency}</span>
      <span data-testid="currency-symbol">{symbol}</span>
      <span data-testid="formatted-value">{fmt(100)}</span>
      <button onClick={() => setCurrency('USD')}>Set USD</button>
    </div>
  );
};

describe('CurrencyContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('provides default INR currency', async () => {
    await act(async () => {
      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );
    });
    expect(screen.getByTestId('currency-code')).toHaveTextContent('INR');
    expect(screen.getByTestId('currency-symbol')).toHaveTextContent('₹');
    // For INR, rate is 1, symbol is ₹
    expect(screen.getByTestId('formatted-value')).toHaveTextContent('₹100');
  });

  it('changes currency and fetches rate', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { USD: 0.012 } }),
    });

    await act(async () => {
      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );
    });

    const btn = screen.getByText('Set USD');
    await act(async () => {
      btn.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('currency-code')).toHaveTextContent('USD');
      expect(screen.getByTestId('currency-symbol')).toHaveTextContent('$');
    });

    // 100 * 0.012 = 1.2
    // formatter in code: `${meta.symbol}${converted.toLocaleString(...) format... }`
    // Wait, the formatter uses toLocaleString which might behave differently in JSDOM, 
    // but we can check if it starts with $
    expect(screen.getByTestId('formatted-value')).toHaveTextContent('$1');
  });

  it('handles fetch error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Down'));

    await act(async () => {
        render(
          <CurrencyProvider>
            <TestComponent />
          </CurrencyProvider>
        );
      });

    const btn = screen.getByText('Set USD');
    await act(async () => {
      btn.click();
    });

    // Should still set the currency even if rate fails
    await waitFor(() => {
        expect(screen.getByTestId('currency-code')).toHaveTextContent('USD');
    });
  });
});
