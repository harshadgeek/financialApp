import { useEffect, useState } from 'react';
import { getBudgets, upsertBudget } from '../api';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

const fmt = v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CATEGORY_ICONS = {
    FOOD: '🍔', TRANSPORT: '🚗', ENTERTAINMENT: '🎬', UTILITIES: '💡',
    HEALTH: '💊', SHOPPING: '🛍️', EDUCATION: '📚', OTHER: '📦', SALARY: '💼', RENT: '🏠'
};

const CATEGORY_COLORS = {
    FOOD: '#34d399', TRANSPORT: '#4f8ef7', ENTERTAINMENT: '#a78bfa',
    UTILITIES: '#fbbf24', HEALTH: '#f87171', SHOPPING: '#22d3ee',
    EDUCATION: '#f97316', OTHER: '#94a3b8', RENT: '#f43f5e'
};

export default function Budgets() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year] = useState(now.getFullYear());
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(null);
    const [editVal, setEditVal] = useState('');

    const load = () => {
        setLoading(true);
        getBudgets(month, year).then(setBudgets).catch(() => setError('Failed to load budgets.')).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [month]);

    const startEdit = (b) => { setEditing(b.id); setEditVal(b.monthlyLimit); };
    const cancelEdit = () => { setEditing(null); setEditVal(''); };

    const saveEdit = async (b) => {
        await upsertBudget({ ...b, monthlyLimit: Number(editVal), month, year });
        setEditing(null);
        load();
    };

    const totalBudget = budgets.reduce((s, b) => s + Number(b.monthlyLimit), 0);
    const totalSpent = budgets.reduce((s, b) => s + Number(b.currentSpend), 0);
    const overBudget = budgets.filter(b => Number(b.percentage) > 100).length;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Budgets</h2>
                    <p>Track spending limits for {MONTH_NAMES[month - 1]} {year}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {MONTH_NAMES.slice(0, now.getMonth() + 1).map((m, i) => (
                        <button key={i} onClick={() => setMonth(i + 1)}
                            className={`btn btn-sm ${month === i + 1 ? 'btn-primary' : 'btn-ghost'}`}>
                            {m.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview */}
            <div className="stats-row" style={{ marginBottom: 28 }}>
                <div className="stat-box">
                    <div className="stat-label">Total Budget</div>
                    <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{fmt(totalBudget)}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Total Spent</div>
                    <div className="stat-value amount-negative">{fmt(totalSpent)}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Over Budget</div>
                    <div className="stat-value" style={{ color: overBudget > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                        {overBudget} {overBudget === 1 ? 'category' : 'categories'}
                    </div>
                </div>
            </div>

            {loading && <div className="loading-state"><div className="spinner" /><p>Loading budgets…</p></div>}
            {error && <div className="error-state">⚠️ {error}</div>}

            {!loading && !error && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {budgets.map(b => {
                        const pct = Math.min(Number(b.percentage), 100);
                        const over = Number(b.percentage) > 100;
                        const color = over ? 'var(--accent-red)' : Number(b.percentage) > 75 ? 'var(--accent-amber)' : CATEGORY_COLORS[b.category] || 'var(--accent-blue)';

                        return (
                            <div className="card" key={b.id} style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 24 }}>{CATEGORY_ICONS[b.category] || '📦'}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.category}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly limit</div>
                                        </div>
                                    </div>
                                    {editing === b.id ? (
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <input className="form-input" style={{ width: 90, padding: '6px 10px' }} type="number" value={editVal}
                                                onChange={e => setEditVal(e.target.value)} />
                                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(b)}><FiSave /></button>
                                            <button className="btn btn-ghost btn-sm" onClick={cancelEdit}><FiX /></button>
                                        </div>
                                    ) : (
                                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(b)} title="Edit budget">
                                            <FiEdit2 style={{ marginRight: 4 }} /> Edit
                                        </button>
                                    )}
                                </div>

                                {/* Progress */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {fmt(b.currentSpend)} of {fmt(b.monthlyLimit)} spent
                                    </span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>
                                        {b.percentage}%
                                    </span>
                                </div>
                                <div className="progress-bar-track" style={{ height: 10 }}>
                                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Remaining</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: Number(b.remaining) < 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                        {Number(b.remaining) < 0 ? '-' : ''}{fmt(Math.abs(b.remaining))}
                                        {over && <span style={{ marginLeft: 6, fontSize: '0.7rem', background: 'rgba(248,113,113,0.15)', color: 'var(--accent-red)', padding: '1px 6px', borderRadius: 20 }}>Over budget!</span>}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
