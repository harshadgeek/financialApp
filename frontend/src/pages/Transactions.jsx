import { useEffect, useState } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { getTransactions, addTransaction, deleteTransaction } from '../api';

const fmt = v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const CATEGORIES = ['SALARY', 'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTH', 'SHOPPING', 'EDUCATION', 'OTHER'];

const defaultForm = { amount: '', type: 'EXPENSE', category: 'FOOD', description: '', date: new Date().toISOString().split('T')[0] };

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [filterType, setFilterType] = useState('ALL');

    const load = () => {
        setLoading(true);
        getTransactions().then(setTransactions).catch(() => setError('Failed to load transactions.')).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || isNaN(Number(form.amount))) return;
        setSubmitting(true);
        try {
            await addTransaction({ ...form, amount: Number(form.amount) });
            setForm(defaultForm);
            setShowForm(false);
            load();
        } catch {
            alert('Failed to add transaction.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this transaction?')) return;
        await deleteTransaction(id);
        load();
    };

    const filtered = filterType === 'ALL' ? transactions : transactions.filter(t => t.type === filterType);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Transactions</h2>
                    <p>All your income and expense records</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
                    <FiPlus /> {showForm ? 'Cancel' : 'Add Transaction'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="chart-title" style={{ marginBottom: 20 }}>➕ New Transaction</div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Amount (₹)</label>
                            <input className="form-input" type="number" step="0.01" min="0" placeholder="0.00" value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="INCOME">Income</option>
                                <option value="EXPENSE">Expense</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date" value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Description</label>
                            <input className="form-input" type="text" placeholder="What was this for?" value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving…' : 'Save Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['ALL', 'INCOME', 'EXPENSE'].map(f => (
                    <button key={f} onClick={() => setFilterType(f)}
                        className={`btn btn-sm ${filterType === f ? 'btn-primary' : 'btn-ghost'}`}>
                        {f === 'ALL' ? 'All' : f === 'INCOME' ? '↑ Income' : '↓ Expenses'}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>
                    {filtered.length} records
                </span>
            </div>

            {loading && <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>}
            {error && <div className="error-state">⚠️ {error}</div>}

            {!loading && !error && (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No transactions found.</td></tr>
                            )}
                            {filtered.map(tx => (
                                <tr key={tx.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{tx.date}</td>
                                    <td>{tx.description || '—'}</td>
                                    <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem' }}>{tx.category}</span></td>
                                    <td><span className={`badge ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>{tx.type}</span></td>
                                    <td className={tx.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>
                                        {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                                    </td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tx.id)} title="Delete">
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
