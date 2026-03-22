import { useState } from 'react';
import { FiX, FiZap } from 'react-icons/fi';
import { addTransaction } from '../api';

const CATEGORIES = ['SALARY', 'RENT', 'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTH', 'SHOPPING', 'EDUCATION', 'INVESTMENT', 'OTHER'];
const defaultForm = { amount: '', type: 'EXPENSE', category: 'FOOD', description: '', date: new Date().toISOString().split('T')[0] };

export default function QuickAddModal({ onClose, onAdded }) {
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || isNaN(Number(form.amount))) return;
        setSubmitting(true);
        try {
            await addTransaction({ ...form, amount: Number(form.amount) });
            setSuccess(true);
            // Signal other pages to refresh
            window.dispatchEvent(new CustomEvent('financeiq:transaction-added'));
            if (onAdded) onAdded();
            setTimeout(() => {
                setForm(defaultForm);
                setSuccess(false);
                onClose();
            }, 900);
        } catch {
            alert('Failed to add transaction.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
                role="button"
                tabIndex={0}
                aria-label="Close modal"
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(4px)', zIndex: 999
                }}
            />
            {/* Modal */}
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000, width: '100%', maxWidth: 480,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                padding: '28px 28px 24px',
                animation: 'fadeSlideIn 0.18s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiZap size={18} color="var(--accent-blue)" />
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Quick Add Transaction</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                        <FiX size={18} />
                    </button>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--accent-green)', fontSize: '1.1rem', fontWeight: 600 }}>
                        ✅ Transaction added!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="form-group">
                            <label htmlFor="txn-amount" className="form-label">Amount (₹)</label>
                            <input
                                id="txn-amount"
                                className="form-input" autoFocus type="number" step="0.01" min="0" placeholder="0.00"
                                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="txn-type" className="form-label">Type</label>
                            <select id="txn-type" className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="INCOME">Income</option>
                                <option value="EXPENSE">Expense</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="txn-category" className="form-label">Category</label>
                            <select id="txn-category" className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="txn-date" className="form-label">Date</label>
                            <input id="txn-date" className="form-input" type="date" value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="txn-desc" className="form-label">Description</label>
                            <input id="txn-desc" className="form-input" type="text" placeholder="What was this for?"
                                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving…' : '⚡ Save Transaction'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
