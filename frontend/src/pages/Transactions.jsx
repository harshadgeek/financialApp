import { useEffect, useState, useCallback } from 'react';
import { FiTrash2, FiPlus, FiEdit2, FiDownload, FiFileText, FiSearch, FiX } from 'react-icons/fi';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useCurrency } from '../context/CurrencyContext.jsx';

const CATEGORIES = ['SALARY', 'RENT', 'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTH', 'SHOPPING', 'EDUCATION', 'INVESTMENT', 'OTHER'];

const defaultForm = { amount: '', type: 'EXPENSE', category: 'FOOD', description: '', date: new Date().toISOString().split('T')[0] };

export default function Transactions() {
    const { fmt, symbol, currency, rate } = useCurrency();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [amountMin, setAmountMin] = useState('');
    const [amountMax, setAmountMax] = useState('');

    const clearFilters = () => {
        setSearch(''); setFilterCategory('ALL');
        setDateFrom(''); setDateTo('');
        setAmountMin(''); setAmountMax('');
        setFilterType('ALL');
    };
    const hasActiveFilters = search || filterCategory !== 'ALL' || dateFrom || dateTo || amountMin || amountMax || filterType !== 'ALL';

    const load = () => {
        setLoading(true);
        getTransactions().then(setTransactions).catch(() => setError('Failed to load transactions.')).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setForm(defaultForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEditClick = (tx) => {
        setForm({ ...tx, amount: tx.amount.toString() });
        setEditingId(tx.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || isNaN(Number(form.amount))) return;
        setSubmitting(true);
        try {
            const payload = { ...form, amount: Number(form.amount) };
            if (editingId) {
                await updateTransaction(editingId, payload);
            } else {
                await addTransaction(payload);
            }
            resetForm();
            load();
        } catch {
            alert(`Failed to ${editingId ? 'update' : 'add'} transaction.`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this transaction?')) return;
        await deleteTransaction(id);
        load();
    };

    const filtered = transactions.filter(t => {
        if (filterType !== 'ALL' && t.type !== filterType) return false;
        if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!t.description?.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
        }
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        if (amountMin && Number(t.amount) < Number(amountMin)) return false;
        if (amountMax && Number(t.amount) > Number(amountMax)) return false;
        return true;
    });

    const exportToPdf = () => {
        const doc = new jsPDF();
        const username = sessionStorage.getItem('financeiq_username') || 'User';
        const label = filterType === 'ALL' ? 'All Transactions' : `${filterType} Transactions`;

        // Header bar
        doc.setFillColor(15, 22, 41);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FinanceIQ', 14, 12);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Smart Finance Tracker', 14, 20);
        doc.text(`Exported: ${new Date().toLocaleDateString('en-IN')}`, 150, 12);
        doc.text(`User: ${username}`, 150, 20);

        // Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, 38);

        // Summary
        const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
        const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Records: ${filtered.length}   |   Total Income: ₹${totalIncome.toLocaleString('en-IN')}   |   Total Expenses: ₹${totalExpense.toLocaleString('en-IN')}`, 14, 46);

        autoTable(doc, {
            startY: 52,
            head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
            body: filtered.map(t => [
                t.date,
                t.description || '—',
                t.category,
                t.type,
                `${t.type === 'INCOME' ? '+' : '-'}₹${Number(t.amount).toLocaleString('en-IN')}`,
            ]),
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [79, 142, 247], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    data.cell.styles.textColor = data.cell.raw === 'INCOME' ? [52, 211, 153] : [248, 113, 113];
                    data.cell.styles.fontStyle = 'bold';
                }
                if (data.section === 'body' && data.column.index === 4) {
                    data.cell.styles.textColor = data.row.raw[3] === 'INCOME' ? [52, 211, 153] : [248, 113, 113];
                    data.cell.styles.fontStyle = 'bold';
                }
            },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 55 },
                2: { cellWidth: 32 },
                3: { cellWidth: 24 },
                4: { cellWidth: 34, halign: 'right' },
            },
        });

        doc.save(`financeiq_transactions_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportToExcel = () => {
        const username = sessionStorage.getItem('financeiq_username') || 'User';
        const rows = filtered.map(t => ({
            Date: t.date,
            Description: t.description || '',
            Category: t.category,
            Type: t.type,
            Amount: Number(t.amount),
            'Amount (formatted)': `${t.type === 'INCOME' ? '+' : '-'}₹${Number(t.amount).toLocaleString('en-IN')}`,
        }));

        const ws = XLSX.utils.json_to_sheet(rows);

        // Column widths
        ws['!cols'] = [
            { wch: 14 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 20 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

        // Add metadata sheet
        const meta = XLSX.utils.aoa_to_sheet([
            ['FinanceIQ — Smart Finance Tracker'],
            ['Exported by:', username],
            ['Export date:', new Date().toLocaleDateString('en-IN')],
            ['Filter:', filterType === 'ALL' ? 'All Transactions' : `${filterType} only`],
            ['Total records:', filtered.length],
        ]);
        XLSX.utils.book_append_sheet(wb, meta, 'Info');

        XLSX.writeFile(wb, `financeiq_transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Transactions</h2>
                    <p>All your income and expense records</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={exportToExcel}
                        disabled={filtered.length === 0}
                        title="Download as Excel"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <FiDownload size={15} /> Excel
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={exportToPdf}
                        disabled={filtered.length === 0}
                        title="Download as PDF"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <FiFileText size={15} /> PDF
                    </button>
                    <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
                        <FiPlus /> {showForm ? 'Cancel' : 'Add Transaction'}
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="chart-title" style={{ marginBottom: 20 }}>{editingId ? '✏️ Edit Transaction' : '➕ New Transaction'}</div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="tx-amount">Amount (₹)</label>
                            <input id="tx-amount" className="form-input" type="number" step="0.01" min="0" placeholder="0.00" value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="tx-type">Type</label>
                            <select id="tx-type" className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="INCOME">Income</option>
                                <option value="EXPENSE">Expense</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="tx-category">Category</label>
                            <select id="tx-category" className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="tx-date">Date</label>
                            <input id="tx-date" className="form-input" type="date" value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label" htmlFor="tx-desc">Description</label>
                            <input id="tx-desc" className="form-input" type="text" placeholder="What was this for?" value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving…' : editingId ? 'Update Transaction' : 'Save Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'flex-end' }}>
                {/* Keyword search */}
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
                    <FiSearch size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="form-input" type="text" placeholder="Search description / category…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 30, fontSize: '0.82rem' }}
                    />
                </div>
                {/* Category */}
                <select className="form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    style={{ flex: '0 1 140px', fontSize: '0.82rem', padding: '7px 10px' }}>
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {/* Type pills */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {['ALL', 'INCOME', 'EXPENSE'].map(f => (
                        <button key={f} onClick={() => setFilterType(f)}
                            className={`btn btn-sm ${filterType === f ? 'btn-primary' : 'btn-ghost'}`}>
                            {f === 'ALL' ? 'All' : f === 'INCOME' ? '↑ Income' : '↓ Expenses'}
                        </button>
                    ))}
                </div>
            </div>
            {/* Date & Amount row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'center' }}>
                <input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ flex: '0 1 150px', fontSize: '0.82rem', padding: '7px 10px' }} title="From date" />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
                <input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ flex: '0 1 150px', fontSize: '0.82rem', padding: '7px 10px' }} title="To date" />
                <input className="form-input" type="number" placeholder="Min ₹" value={amountMin} onChange={e => setAmountMin(e.target.value)}
                    style={{ flex: '0 1 100px', fontSize: '0.82rem', padding: '7px 10px' }} min="0" />
                <input className="form-input" type="number" placeholder="Max ₹" value={amountMax} onChange={e => setAmountMax(e.target.value)}
                    style={{ flex: '0 1 100px', fontSize: '0.82rem', padding: '7px 10px' }} min="0" />
                {hasActiveFilters && (
                    <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiX size={13} /> Clear
                    </button>
                )}
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {loading && <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>}
            {error && <div className="error-state">⚠️ {error}</div>}

            {!loading && !error && (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
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
                            {filtered.map((tx, index) => {
                                const isFirstOfDay = index === 0 || filtered[index - 1].date !== tx.date;

                                let timeString = '';
                                if (tx.createdAt) {
                                    try {
                                        timeString = new Intl.DateTimeFormat(navigator.language, {
                                            hour: 'numeric', minute: 'numeric'
                                        }).format(new Date(tx.createdAt));
                                    } catch (_e) { /* ignore invalid date format */ }
                                }

                                return (
                                    <tr key={tx.id} style={{ borderTop: isFirstOfDay ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent' }}>
                                        <td style={{ color: isFirstOfDay ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: isFirstOfDay ? 600 : 400 }}>{isFirstOfDay ? tx.date : ''}</div>
                                            {timeString && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: isFirstOfDay ? 2 : 0 }}>{timeString}</div>}
                                        </td>
                                        <td>{tx.description || '—'}</td>
                                        <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem' }}>{tx.category}</span></td>
                                        <td><span className={`badge ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>{tx.type}</span></td>
                                        <td className={tx.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>
                                            {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
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
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
