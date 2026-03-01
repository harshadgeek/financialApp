import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { FiLock, FiUser, FiMail } from 'react-icons/fi';

export default function SignUp() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await register(form);
            sessionStorage.setItem('financeiq_token', res.data.token);
            sessionStorage.setItem('financeiq_username', res.data.username);
            navigate('/');
        } catch (err) {
            setError(err.response?.data || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <div className="card" style={{ width: 400, padding: 40 }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                        Create an <span style={{ color: 'var(--accent)' }}>account</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>Join FinanceIQ to manage your money better.</div>
                </div>

                {error && (
                    <div style={{ padding: 12, borderRadius: 8, background: 'rgba(248, 113, 113, 0.1)', color: 'var(--danger)', marginBottom: 20, textAlign: 'center', fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                            <input className="form-input" style={{ paddingLeft: 40 }} required minLength={3}
                                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                            <input className="form-input" type="email" style={{ paddingLeft: 40 }} required
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                            <input className="form-input" type="password" style={{ paddingLeft: 40 }} required minLength={6}
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: 10, width: '100%' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
}
