import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getWeeklyReport } from '../api';
import { useCurrency } from '../context/CurrencyContext.jsx';

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

export default function WeeklyReport() {
    const { fmt, fmtAxis } = useCurrency();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getWeeklyReport().then(setData).catch(() => setError('Failed to load weekly report.')).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading weekly report…</p></div>;
    if (error) return <div className="error-state">⚠️ {error}</div>;

    const isPositive = Number(data.netBalance) >= 0;
    const categoryEntries = Object.entries(data.expenseByCategory || {});
    const maxCat = categoryEntries.reduce((m, [, v]) => Math.max(m, Number(v)), 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Weekly Report</h2>
                    <p>Spending and income summary for this week</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
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
                    <div className={`stat-value ${isPositive ? 'amount-positive' : 'amount-negative'}`}>{fmt(data.netBalance)}</div>
                </div>
            </div>

            {/* Daily Bar Chart */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="chart-title">Daily Breakdown</div>
                <div className="chart-subtitle">Income and expenses for each day this week</div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data.dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={6} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                        <Tooltip content={(props) => <CustomTooltip {...props} fmt={fmt} />} cursor={{ fill: 'var(--bg-card-hover)' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                        <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} name="Income" />
                        <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} name="Expenses" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Category Breakdown */}
                <div className="card">
                    <div className="chart-title">💸 Expenses by Category</div>
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {categoryEntries.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No expenses this week.</p>}
                        {categoryEntries.map(([cat, amt]) => {
                            const pct = maxCat > 0 ? (Number(amt) / maxCat) * 100 : 0;
                            return (
                                <div key={cat}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.85rem' }}>{cat}</span>
                                        <span className="amount-negative" style={{ fontSize: '0.85rem' }}>{fmt(amt)}</span>
                                    </div>
                                    <div className="progress-bar-track">
                                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--accent-red)' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Detail Table */}
                <div className="card">
                    <div className="chart-title">📅 Day-by-Day Summary</div>
                    <table className="data-table" style={{ marginTop: 12 }}>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Date</th>
                                <th>Income</th>
                                <th>Expenses</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.dailyData.map(d => (
                                <tr key={d.day}>
                                    <td style={{ fontWeight: 600 }}>{d.day}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{d.date}</td>
                                    <td className="amount-positive">{fmt(d.income)}</td>
                                    <td className="amount-negative">{fmt(d.expenses)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
