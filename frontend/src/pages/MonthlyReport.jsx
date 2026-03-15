import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getMonthlyReport } from '../api';
import { useCurrency } from '../context/CurrencyContext.jsx';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CustomTooltip = ({ active, payload, label, fmt }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', boxShadow: 'var(--shadow-lg)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 12 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>{p.name}: {fmt(p.value)}</p>
            ))}
        </div>
    );
};

export default function MonthlyReport() {
    const { fmt, fmtAxis } = useCurrency();
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getMonthlyReport(month, year).then(setData).catch(() => setError('Failed to load monthly report.')).finally(() => setLoading(false));
    }, [month, year]);

    const handlePrev = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const handleNext = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const isCurrentOrFuture = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);

    const categoryEntries = data ? Object.entries(data.expenseByCategory || {}) : [];
    const maxCat = categoryEntries.reduce((m, [, v]) => Math.max(m, Number(v)), 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Monthly Report</h2>
                    <p>Detailed breakdown for the selected month</p>
                </div>
                <div className="month-picker">
                    <button onClick={handlePrev}><FiChevronLeft /></button>
                    <span className="month-label">{MONTH_NAMES[month - 1]} {year}</span>
                    <button onClick={handleNext} disabled={isCurrentOrFuture} style={{ opacity: isCurrentOrFuture ? 0.4 : 1 }}>
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {loading && <div className="loading-state"><div className="spinner" /><p>Loading monthly report…</p></div>}
            {error && <div className="error-state">⚠️ {error}</div>}

            {data && !loading && (
                <>
                    {/* Stats */}
                    <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div className="stat-box">
                            <div className="stat-label">Income</div>
                            <div className="stat-value amount-positive">{fmt(data.totalIncome)}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Expenses</div>
                            <div className="stat-value amount-negative">{fmt(data.totalExpenses)}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Net Balance</div>
                            <div className={`stat-value ${Number(data.netBalance) >= 0 ? 'amount-positive' : 'amount-negative'}`}>{fmt(data.netBalance)}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Savings Rate</div>
                            <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{data.savingsRate}%</div>
                        </div>
                    </div>

                    {/* Cumulative chart */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="chart-title">Cumulative Income & Expenses</div>
                        <div className="chart-subtitle">Day-by-day running totals for {data.month} {data.year}</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={data.dailyRunningTotal} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="gradCumInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradCumExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Day of Month', position: 'insideBottom', offset: -2, fill: 'var(--text-muted)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                                <Tooltip content={(props) => <CustomTooltip {...props} fmt={fmt} />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                                <Area type="monotone" dataKey="cumulativeIncome" stroke="#34d399" strokeWidth={2} fill="url(#gradCumInc)" name="Income" />
                                <Area type="monotone" dataKey="cumulativeExpenses" stroke="#f87171" strokeWidth={2} fill="url(#gradCumExp)" name="Expenses" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        {/* Weekly Breakdown Chart */}
                        <div className="card">
                            <div className="chart-title">Weekly Breakdown</div>
                            <div className="chart-subtitle">Income and expenses per week</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.weeklyBreakdown} barGap={6} barCategoryGap="35%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                                    <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                                    <Tooltip content={(props) => <CustomTooltip {...props} fmt={fmt} />} cursor={{ fill: 'var(--bg-card-hover)' }} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                                    <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} name="Income" />
                                    <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Breakdown */}
                        <div className="card">
                            <div className="chart-title">💸 Expenses by Category</div>
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 230, overflowY: 'auto' }}>
                                {categoryEntries.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No expenses this month.</p>}
                                {categoryEntries.map(([cat, amt]) => {
                                    const pct = maxCat > 0 ? (Number(amt) / maxCat) * 100 : 0;
                                    return (
                                        <div key={cat}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: '0.85rem' }}>{cat}</span>
                                                <span className="amount-negative" style={{ fontSize: '0.85rem' }}>{fmt(amt)}</span>
                                            </div>
                                            <div className="progress-bar-track">
                                                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--accent-purple)' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
