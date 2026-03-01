import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Supported currencies: code → { label, symbol, locale }
export const CURRENCIES = {
    INR: { label: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
    USD: { label: 'US Dollar', symbol: '$', locale: 'en-US' },
    EUR: { label: 'Euro', symbol: '€', locale: 'de-DE' },
    GBP: { label: 'British Pound', symbol: '£', locale: 'en-GB' },
    JPY: { label: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
    AED: { label: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
    SGD: { label: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
    CAD: { label: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
    AUD: { label: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
    const [currency, setCurrencyState] = useState(
        () => localStorage.getItem('financeiq_currency') || 'INR'
    );
    const [rate, setRate] = useState(1);          // INR → selected currency
    const [rateLoading, setRateLoading] = useState(false);
    const [rateError, setRateError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch live exchange rate from INR to selected currency
    const fetchRate = useCallback(async (code) => {
        if (code === 'INR') {
            setRate(1);
            setRateError(null);
            setLastUpdated(new Date());
            return;
        }
        setRateLoading(true);
        setRateError(null);
        try {
            // frankfurter.app — free, no API key required
            const res = await fetch(`https://api.frankfurter.app/latest?from=INR&to=${code}`);
            if (!res.ok) throw new Error('Rate fetch failed');
            const data = await res.json();
            setRate(data.rates[code]);
            setLastUpdated(new Date());
        } catch {
            setRateError('Could not fetch live rate. Showing cached/estimated values.');
        } finally {
            setRateLoading(false);
        }
    }, []);

    // On mount and on currency change
    useEffect(() => {
        fetchRate(currency);
    }, [currency, fetchRate]);

    const setCurrency = (code) => {
        localStorage.setItem('financeiq_currency', code);
        setCurrencyState(code);
    };

    // Convert a value from INR to current currency and format it
    const fmt = useCallback((inrValue) => {
        const meta = CURRENCIES[currency] || CURRENCIES.INR;
        const converted = Number(inrValue) * rate;
        const decimals = currency === 'JPY' ? 0 : 0; // JPY has no decimals
        return `${meta.symbol}${converted.toLocaleString(meta.locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })}`;
    }, [currency, rate]);

    // Compact formatter for chart axes (e.g. ₹45k or $540)
    const fmtAxis = useCallback((inrValue) => {
        const meta = CURRENCIES[currency] || CURRENCIES.INR;
        const converted = Number(inrValue) * rate;
        if (Math.abs(converted) >= 1000) {
            return `${meta.symbol}${(converted / 1000).toFixed(1)}k`;
        }
        return `${meta.symbol}${converted.toFixed(0)}`;
    }, [currency, rate]);

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            rate,
            rateLoading,
            rateError,
            lastUpdated,
            fmt,
            fmtAxis,
            symbol: CURRENCIES[currency]?.symbol || '₹',
            currencyMeta: CURRENCIES[currency] || CURRENCIES.INR,
            refreshRate: () => fetchRate(currency),
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
    return ctx;
}
