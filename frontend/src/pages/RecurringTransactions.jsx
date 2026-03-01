import { useEffect, useState } from 'react';
import { FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';
import { getRecurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } from '../api';

const fmt = v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const CATEGORIES = ['SALARY', 'RENT', 'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTH', 'SHOPPING', 'EDUCATION', 'INVESTMENT', 'OTHER'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const defaultForm = { amount: '', type: 'EXPENSE', category: 'RENT', description: '', frequency: 'MONTHLY', startDate: new Date().toISOString().split('T')[0], endDate: '', active: true };

export default function RecurringTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const load = () => {
        setLoading(true);
        getRecurringTransactions().then(setTransactions).catch(() => setError('Failed to load recurring transactions.')).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setForm(defaultForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEditClick = (tx) => {
        setForm({
            ...tx,
            amount: tx.amount.toString(),
            endDate: tx.endDate || ''
        });
        setEditingId(tx.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || isNaN(Number(form.amount))) return;
        setSubmitting(true);
        try {
            const payload = { ...form, amount: Number(form.amount) };
            if (!payload.endDate) delete payload.endDate;

            if (editingId) {
                await updateRecurringTransaction(editingId, payload);
            } else {
                await addRecurringTransaction(payload);
            }
            resetForm();
            load();
        } catch {
            alert(`Failed to ${editingId ? 'update' : 'add'} recurring transaction.`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this recurring transaction?')) return;
        await deleteRecurringTransaction(id);
        load();
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Recurring Transactions</h2>
                    <p>Manage your automated recurring income and expenses</p>
                </div>
                <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
                    <FiPlus /> {showForm ? 'Cancel' : 'Add Recurring'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="chart-title" style={{ marginBottom: 20 }}>{editingId ? '✏️ Edit Recurring Transaction' : '➕ New Recurring Transaction'}</div>
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
                            <label className="form-label">Frequency</label>
                            <select className="form-select" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input className="form-input" type="date" value={form.startDate}
                                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date (Optional)</label>
                            <input className="form-input" type="date" value={form.endDate}
                                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 1' }}>
                            <label className="form-label">Active</label>
                            <div style={{ paddingTop: 10 }}>
                                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                                <span style={{ marginLeft: 8 }}>Enabled</span>
                            </div>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Description</label>
                            <input className="form-input" type="text" placeholder="What is this for?" value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving…' : editingId ? 'Update Recurring Transaction' : 'Save Recurring Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>}
            {error && <div className="error-state">⚠️ {error}</div>}

            {!loading && !error && (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Range</th>
                                <th>Next Run</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Frequency</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 && (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No recurring transactions set up.</td></tr>
                            )}
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        {tx.startDate} {tx.endDate ? `to ${tx.endDate}` : '(No end)'}
                                    </td>
                                    <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{tx.nextExecutionDate || '—'}</td>
                                    <td>{tx.description || '—'}</td>
                                    <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem' }}>{tx.category}</span></td>
                                    <td><span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{tx.frequency}</span></td>
                                    <td><span className={`badge ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>{tx.type}</span></td>
                                    <td className={tx.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>
                                        {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                                    </td>
                                    <td>
                                        <span className={`badge ${tx.active ? 'income' : 'expense'}`}>
                                            {tx.active ? 'ACTIVE' : 'PAUSED'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(tx)} title="Edit">
                                                <FiEdit2 />
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tx.id)} title="Delete">
                                                <FiTrash2 />
                                            </button>
                                        </div>
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
