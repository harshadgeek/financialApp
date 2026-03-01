import { useState } from 'react';
import { FiX, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { changePassword } from '../api';

export default function ChangePasswordModal({ onClose }) {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const strength = (() => {
        const p = form.newPassword;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 6) s++;
        if (p.length >= 10) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
    const strengthColor = ['', '#f87171', '#fbbf24', '#fbbf24', '#34d399', '#34d399'][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.newPassword !== form.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (form.newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        setSubmitting(true);
        try {
            await changePassword(form.currentPassword, form.newPassword);
            setSuccess(true);
            setTimeout(onClose, 1800);
        } catch (err) {
            const msg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Failed to change password.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const field = (id, label, value, show, setShow, placeholder) => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <FiLock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    id={id}
                    className="form-input"
                    type={show ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                    style={{ paddingLeft: 34, paddingRight: 36 }}
                    required
                />
                <button type="button" onClick={() => setShow(s => !s)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                    {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 999 }} />
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000, width: '100%', maxWidth: 440,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                padding: '28px 28px 24px',
                animation: 'fadeSlideIn 0.18s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiLock size={16} color="var(--accent-blue)" />
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Change Password</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                        <FiX size={18} />
                    </button>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--accent-green)' }}>
                        <FiCheckCircle size={36} style={{ marginBottom: 12 }} />
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>Password changed successfully!</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>You'll be redirected shortly.</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)', fontSize: '0.83rem' }}>
                                <FiAlertCircle size={13} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        {field('currentPassword', 'Current Password', form.currentPassword, showCurrent, setShowCurrent, 'Enter current password')}
                        {field('newPassword', 'New Password', form.newPassword, showNew, setShowNew, 'At least 6 characters')}

                        {/* Strength meter */}
                        {form.newPassword && (
                            <div style={{ marginTop: -6 }}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: strengthColor }}>{strengthLabel}</div>
                            </div>
                        )}

                        {field('confirmPassword', 'Confirm New Password', form.confirmPassword, showConfirm, setShowConfirm, 'Repeat new password')}

                        {/* Match indicator */}
                        {form.confirmPassword && (
                            <div style={{ fontSize: '0.75rem', marginTop: -8, color: form.newPassword === form.confirmPassword ? 'var(--accent-green)' : 'var(--danger)' }}>
                                {form.newPassword === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving…' : '🔒 Update Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
