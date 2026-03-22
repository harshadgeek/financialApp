import { useEffect, useState } from 'react';
import { FiTrendingUp, FiArrowRight, FiCalendar } from 'react-icons/fi';
import { getFutureProjection } from '../api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { useCurrency } from '../context/CurrencyContext.jsx';

export default function FutureTrends() {
    const { fmt, fmtAxis } = useCurrency();
    const [projection, setProjection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [targetDate, setTargetDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3); // Default to 3 months ahead
        return d.toISOString().split('T')[0];
    });

    const load = () => {
        setLoading(true);
        getFutureProjection(targetDate)
            .then(setProjection)
            .catch(() => setError('Failed to load projection data.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [targetDate]);

    return (
        <div className="future-trends">
            <div className="page-header">
                <div>
                    <h2>Future Trends</h2>
                    <p>Financial forecast based on your current balance and recurring transactions</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <FiCalendar style={{ color: 'var(--primary)' }} />
                    <label htmlFor="forecast-date" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Forecast Until:</label>
                    <input
                        id="forecast-date"
                        type="date"
                        value={targetDate}
                        onChange={e => setTargetDate(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    />
                </div>
            </div>

            {loading && <div className="loading-state"><div className="spinner" /><p>Calculating forecast…</p></div>}
            {error && <div className="error-state">⚠️ {error}</div>}

            {projection && !loading && (
                <>
                    <div className="stats-grid" style={{ marginBottom: 32 }}>
                        <div className="stat-card">
                            <div className="stat-label">Current Balance</div>
                            <div className="stat-value">{fmt(projection.currentBalance)}</div>
                            <div className="stat-desc">As of today</div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                            <div className="stat-label">Projected Incoming</div>
                            <div className="stat-value" style={{ color: '#10b981' }}>+{fmt(projection.projectedIncome)}</div>
                            <div className="stat-desc">Scheduled until {targetDate}</div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                            <div className="stat-label">Projected Outgoing</div>
                            <div className="stat-value" style={{ color: '#ef4444' }}>-{fmt(projection.projectedExpenses)}</div>
                            <div className="stat-desc">Scheduled until {targetDate}</div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                            <div className="stat-label" style={{ color: 'var(--primary)' }}>Estimated Final Balance</div>
                            <div className="stat-value">{fmt(projection.projectedFinalBalance)}</div>
                            <div className="stat-desc">Expected on {targetDate}</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px', height: '450px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Projected Balance Trend</h3>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Visualization of your wealth growth over time</p>
                            </div>
                            <div className="badge income" style={{ padding: '6px 12px' }}>
                                <FiTrendingUp style={{ marginRight: 6 }} />
                                {projection.projectedFinalBalance >= projection.currentBalance ? 'Positive Outlook' : 'Negative Forecast'}
                            </div>
                        </div>

                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projection.trend}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                        tickFormatter={fmtAxis}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: 'white' }}
                                        formatter={(v) => [fmt(v), 'Balance']}
                                        labelStyle={{ color: 'var(--text-muted)', marginBottom: 8 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid-2" style={{ marginTop: 24 }}>
                        <div className="card">
                            <h4 style={{ marginBottom: 16 }}>Top Contributors to Trend</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                Your projection is highly influenced by recurring items. To improve your final balance, consider lowering expenses or adding more passive income sources.
                            </p>
                            <div style={{ marginTop: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                        <FiTrendingUp />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Wealth Appreciation</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net growth projected: {fmt(projection.projectedIncome - projection.projectedExpenses)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.5rem' }}>
                                <FiTrendingUp />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 8px' }}>Manage Recurring Items</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, padding: '0 20px' }}>
                                    Want to change the outcome? Head over to recurring transactions to adjust your plans.
                                </p>
                            </div>
                            <button className="btn btn-ghost" onClick={() => window.location.hash = '#/recurring'}>
                                Go to Recurring <FiArrowRight style={{ marginLeft: 8 }} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
