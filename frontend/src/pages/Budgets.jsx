import { useState, useEffect } from 'react';
import { FiTrash2, FiPlusCircle, FiTarget, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { getBudgets, upsertBudget, deleteBudget, getBudgetStatus } from '../api';
import { useCurrency } from '../context/CurrencyContext.jsx';

const CATEGORIES = ['SALARY', 'RENT', 'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTH', 'SHOPPING', 'EDUCATION', 'INVESTMENT', 'OTHER'];

const CAT_ICONS = {
    SALARY: '💼', RENT: '🏠', FOOD: '🍔', TRANSPORT: '🚗', ENTERTAINMENT: '🎬',
    UTILITIES: '💡', HEALTH: '🏥', SHOPPING: '🛍️', EDUCATION: '📚', INVESTMENT: '📈', OTHER: '📦'
};

function StatusIcon({ status }) {
    if (status === 'OVER') return <FiAlertCircle size={14} color="var(--danger)" />;
    if (status === 'WARNING') return <FiAlertCircle size={14} color="#fbbf24" />;
    return <FiCheckCircle size={14} color="var(--accent-green)" />;
}

export default function Budgets() {
    const { fmt } = useCurrency();
    const [statuses, setStatuses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ category: 'FOOD', monthlyLimit: '' });
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        setLoading(true);
        Promise.all([getBudgets(), getBudgetStatus()])
            .then(([b, s]) => { setBudgets(b); setStatuses(s); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const statusMap = Object.fromEntries(statuses.map(s => [s.category, s]));
    const budgetCategories = new Set(budgets.map(b => b.category));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.monthlyLimit || isNaN(Number(form.monthlyLimit)) || Number(form.monthlyLimit) <= 0) return;
        setSubmitting(true);
        try {
            await upsertBudget(form.category, Number(form.monthlyLimit));
            setForm(f => ({ ...f, monthlyLimit: '' }));
            load();
        } catch {
            alert('Failed to save budget.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (category) => {
        if (!confirm(`Remove budget for ${category}?`)) return;
        await deleteBudget(category);
        load();
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Budget Goals</h2>
                    <p>Set monthly spending limits per category</p>
                </div>
            </div>

            {/* Set Budget Form */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="chart-title" style={{ marginBottom: 18 }}>🎯 Set a Monthly Budget</div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: '1 1 180px' }}>
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: '1 1 200px' }}>
                        <label className="form-label">Monthly Limit (₹)</label>
                        <input
                            className="form-input"
                            type="number" min="1" step="1" placeholder="e.g. 5000"
                            value={form.monthlyLimit}
                            onChange={e => setForm(f => ({ ...f, monthlyLimit: e.target.value }))}
                            required
                        />
                    </div>
                    <div style={{ paddingBottom: 2 }}>
                        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiPlusCircle size={15} />
                            {budgetCategories.has(form.category) ? 'Update Limit' : 'Set Limit'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Budget Status Cards */}
            {loading && <div className="loading-state"><div className="spinner" /><p>Loading budgets…</p></div>}

            {!loading && budgets.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '48px 32px', color: 'var(--text-muted)' }}>
                    <FiTarget size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <p style={{ fontsize: '1rem', marginBottom: 4 }}>No budgets set yet.</p>
                    <p style={{ fontSize: '0.85rem' }}>Use the form above to set a monthly limit for any spending category.</p>
                </div>
            )}

            {!loading && budgets.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {budgets.map(budget => {
                        const s = statusMap[budget.category] || {};
                        const spent = Number(s.spent || 0);
                        const limit = Number(budget.monthlyLimit);
                        const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                        const isOver = s.status === 'OVER';
                        const isWarn = s.status === 'WARNING';
                        const barColor = isOver ? 'var(--danger)' : isWarn ? '#fbbf24' : 'var(--accent-green)';

                        return (
                            <div key={budget.category} className="card" style={{ padding: '20px 22px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '1.3rem' }}>{CAT_ICONS[budget.category]}</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{budget.category}</span>
                                        <StatusIcon status={s.status} />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(budget.category)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                                        title="Remove budget"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                                    <div style={{
                                        width: `${pct}%`, height: '100%', borderRadius: 4,
                                        background: barColor,
                                        transition: 'width 0.6s ease',
                                        boxShadow: `0 0 8px ${barColor}55`
                                    }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                    <span style={{ color: isOver ? 'var(--danger)' : isWarn ? '#fbbf24' : 'var(--text-secondary)' }}>
                                        {fmt(spent)} spent
                                    </span>
                                    <span style={{ color: 'var(--text-muted)' }}>limit: {fmt(limit)}</span>
                                </div>

                                {isOver && (
                                    <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--danger)', background: 'rgba(248,113,113,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                                        ⚠ Over budget by {fmt(spent - limit)}
                                    </div>
                                )}
                                {isWarn && !isOver && (
                                    <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                                        ⚡ {Math.round(pct)}% used — approaching limit
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
