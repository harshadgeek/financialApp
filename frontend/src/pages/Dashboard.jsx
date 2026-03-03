import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiArrowUpRight, FiArrowDownRight, FiDollarSign, FiPercent, FiAlertCircle, FiX } from 'react-icons/fi';
import { getDashboard, getTransactions, getBudgetStatus } from '../api';
import { useCurrency } from '../context/CurrencyContext.jsx';

const CustomTooltip = ({ active, payload, label, fmt }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px' }}>
            <p style={{ color: '#94a3b8', marginBottom: 6, fontSize: 12 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>
                    {p.name}: {fmt(p.value)}
                </p>
            ))}
        </div>
    );
};

const PIE_COLORS = ['#4f8ef7', '#a78bfa', '#34d399', '#f87171', '#fbbf24', '#22d3ee', '#f97316', '#e879f9'];

export default function Dashboard() {
    const { fmt, fmtAxis } = useCurrency();
    const [data, setData] = useState(null);
    const [recentTx, setRecentTx] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [budgetAlerts, setBudgetAlerts] = useState([]);
    const [alertDismissed, setAlertDismissed] = useState(false);

    const loadAll = () => {
        setLoading(true);
        setAlertDismissed(false);
        Promise.all([getDashboard(), getTransactions(), getBudgetStatus()])
            .then(([dash, txs, statuses]) => {
                setData(dash);
                setRecentTx(txs.slice(0, 8));
                setBudgetAlerts(statuses.filter(s => s.status === 'OVER' || s.status === 'WARNING'));
            })
            .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAll();
        const handler = () => loadAll();
        window.addEventListener('financeiq:transaction-added', handler);
        return () => window.removeEventListener('financeiq:transaction-added', handler);
    }, []);

    if (loading) return <div className="loading-state"><div className="spinner" /><p>Loading dashboard…</p></div>;
    if (error) return <div className="error-state">⚠️ {error}</div>;

    const pieData = Object.entries(data.expenseByCategory || {}).map(([name, value]) => ({ name, value: Number(value) }));
    const isPositive = Number(data.netBalance) >= 0;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>Your financial overview at a glance</p>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 20 }}>
                    Last 6 Months
                </span>
            </div>

            {/* Budget Alert Banner */}
            {!alertDismissed && budgetAlerts.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: budgetAlerts.some(a => a.status === 'OVER') ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)',
                    border: `1px solid ${budgetAlerts.some(a => a.status === 'OVER') ? 'rgba(248,113,113,0.35)' : 'rgba(251,191,36,0.3)'}`,
                    borderRadius: 10, padding: '12px 16px', marginBottom: 20
                }}>
                    <FiAlertCircle size={16} style={{ marginTop: 2, flexShrink: 0, color: budgetAlerts.some(a => a.status === 'OVER') ? 'var(--danger)' : '#fbbf24' }} />
                    <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: budgetAlerts.some(a => a.status === 'OVER') ? 'var(--danger)' : '#fbbf24' }}>
                            {budgetAlerts.some(a => a.status === 'OVER') ? 'Budget Exceeded' : 'Budget Warning'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginLeft: 8 }}>
                            {budgetAlerts.map(a => `${a.category} (${Math.round((Number(a.spent) / Number(a.monthlyLimit)) * 100)}%)`).join(' · ')}
                        </span>
                    </div>
                    <button onClick={() => setAlertDismissed(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                        <FiX size={14} />
                    </button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KpiCard type="income" label="Total Income" value={fmt(data.totalIncome)} icon={<FiArrowUpRight />} sub="Last 6 months" />
                <KpiCard type="expenses" label="Total Expenses" value={fmt(data.totalExpenses)} icon={<FiArrowDownRight />} sub="Last 6 months" />
                <KpiCard type="balance" label="Net Balance" value={fmt(data.netBalance)} icon={<FiDollarSign />} sub="Income - Expenses" valueClass={isPositive ? 'positive' : 'negative'} />
                <KpiCard type="savings" label="Savings Rate" value={`${data.savingsRate}%`} icon={<FiPercent />} sub="Of total income" />
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="card">
                    <div className="chart-title">Income vs Expenses</div>
                    <div className="chart-subtitle">Monthly comparison over the last 6 months</div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data.monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                            <Tooltip content={(props) => <CustomTooltip {...props} fmt={fmt} />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                            <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} fill="url(#gradIncome)" name="Income" />
                            <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#gradExpenses)" name="Expenses" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="chart-title">Spending by Category</div>
                    <div className="chart-subtitle">This month's breakdown</div>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: 'var(--text-muted)' }}>No expense data this month</div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
                <div className="section-title">📋 Recent Transactions</div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Date & Time</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(recentTx).slice(0, 8).map(tx => {
                            let timeString = '';
                            if (tx.createdAt) {
                                try {
                                    timeString = new Intl.DateTimeFormat(navigator.language, {
                                        hour: 'numeric', minute: 'numeric'
                                    }).format(new Date(tx.createdAt));
                                } catch (e) { }
                            }
                            return (
                                <tr key={tx.id}>
                                    <td>{tx.description}</td>
                                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{tx.category}</span></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                        {tx.date}
                                        {timeString && <span style={{ opacity: 0.6, marginLeft: 6 }}>{timeString}</span>}
                                    </td>
                                    <td><span className={`badge ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>{tx.type}</span></td>
                                    <td className={tx.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>{tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {recentTx.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No transactions yet. Go add some!</div>
                )}
            </div>
        </div>
    );
}

function KpiCard({ type, label, value, icon, sub, valueClass }) {
    return (
        <div className={`kpi-card ${type}`}>
            <div className="kpi-header">
                <span className="kpi-label">{label}</span>
                <span className={`kpi-icon ${type}`}>{icon}</span>
            </div>
            <div className={`kpi-value ${valueClass || ''}`}>{value}</div>
            <div className="kpi-sub">{sub}</div>
        </div>
    );
}
