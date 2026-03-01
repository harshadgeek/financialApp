import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

export default function SignIn() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await login(form);
            localStorage.setItem('financeiq_token', res.data.token);
            localStorage.setItem('financeiq_username', res.data.username);
            navigate('/');
        } catch (err) {
            const msg =
                typeof err.response?.data === 'string' ? err.response.data :
                    err.response?.data?.message || err.response?.data?.error ||
                    'Invalid username or password. Please try again.';
            setError(msg);
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <style>{`
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    20%,60% { transform: translateX(-8px); }
                    40%,80% { transform: translateX(8px); }
                }
            `}</style>
            <div className="card" style={{ width: 400, padding: 40, animation: shake ? 'shake 0.5s ease' : 'none' }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                        finance<span style={{ color: 'var(--accent)' }}>iq</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>Welcome back! Please enter your details.</div>
                </div>

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', borderRadius: 8,
                        background: 'rgba(248, 113, 113, 0.12)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        color: 'var(--danger)', marginBottom: 20, fontSize: 14
                    }}>
                        <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                            <input className="form-input" style={{ paddingLeft: 40 }} required
                                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                            <input className="form-input" type="password" style={{ paddingLeft: 40 }} required
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: 10, width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
}
