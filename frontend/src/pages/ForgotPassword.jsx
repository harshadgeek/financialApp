import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword as resetPasswordApi } from '../api';
import { FiLock, FiMail, FiKey, FiAlertCircle, FiCheckCircle, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Dynamic password requirements check
    const requirements = [
        { label: 'At least 6 characters', valid: newPassword.length >= 6 },
        { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(newPassword) },
        { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(newPassword) },
        { label: 'One number (0-9)', valid: /[0-9]/.test(newPassword) },
        { label: 'One special character (@#$%^&+=!)', valid: /[@#$%^&+=!]/.test(newPassword) }
    ];
    
    const isPasswordValid = requirements.every(req => req.valid);

    // Handle resend countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInfo('');
        try {
            const res = await forgotPassword(email);
            setInfo(res?.data || 'If the email is registered, a password reset code has been sent.');
            setStep(2);
            setResendTimer(60); // 60 seconds resend cooldown
        } catch (err) {
            setError(err.response?.data || 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInfo('');
        try {
            await verifyOtp(email, otpCode);
            setStep(3);
        } catch (err) {
            setError(err.response?.data || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!isPasswordValid) {
            setError('Please satisfy all password requirements.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await resetPasswordApi(email, otpCode, newPassword);
            setStep(4);
        } catch (err) {
            setError(err.response?.data || 'Failed to reset password. Please request a new code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setError('');
        setInfo('');
        try {
            await forgotPassword(email);
            setInfo('A new verification code has been sent to your email.');
            setResendTimer(60);
        } catch (err) {
            setError(err.response?.data || 'Failed to send code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <div className="card" style={{ width: 420, padding: 40 }}>
                {step === 1 && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                <FiArrowLeft /> Back to Sign In
                            </Link>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                Forgot Password?
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                Enter your email below, and we will send you a 6-digit code to reset your password.
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', borderRadius: 8,
                                background: 'rgba(248, 113, 113, 0.12)',
                                border: '1px solid rgba(248, 113, 113, 0.3)',
                                color: 'var(--danger)', marginBottom: 20, fontSize: 13
                            }}>
                                <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                                    <input id="email" className="form-input" type="email" style={{ paddingLeft: 40 }} required
                                        value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'Sending code...' : 'Send Reset Code'}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                <FiArrowLeft /> Back to Email
                            </button>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                Verify OTP
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                We have sent a 6-digit verification code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                            </div>
                        </div>

                        {info && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', borderRadius: 8,
                                background: 'rgba(52, 211, 153, 0.12)',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                color: 'var(--accent-green)', marginBottom: 20, fontSize: 13
                            }}>
                                <FiCheckCircle size={15} style={{ flexShrink: 0 }} />
                                {info}
                            </div>
                        )}

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', borderRadius: 8,
                                background: 'rgba(248, 113, 113, 0.12)',
                                border: '1px solid rgba(248, 113, 113, 0.3)',
                                color: 'var(--danger)', marginBottom: 20, fontSize: 13
                            }}>
                                <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="otp">6-Digit Code</label>
                                <div style={{ position: 'relative' }}>
                                    <FiKey style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                                    <input id="otp" className="form-input" type="text" maxLength={6} style={{ paddingLeft: 40, letterSpacing: 4, fontWeight: 'bold' }} required
                                        value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                                Didn't receive the code?{' '}
                                {resendTimer > 0 ? (
                                    <span>Resend in {resendTimer}s</span>
                                ) : (
                                    <button type="button" onClick={handleResendOtp} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', fontWeight: 500, cursor: 'pointer' }}>
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                Reset Password
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                Choose a strong, secure new password for your account.
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', borderRadius: 8,
                                background: 'rgba(248, 113, 113, 0.12)',
                                border: '1px solid rgba(248, 113, 113, 0.3)',
                                color: 'var(--danger)', marginBottom: 20, fontSize: 13
                            }}>
                                <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="new-password">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                                    <input id="new-password" className="form-input" type="password" style={{ paddingLeft: 40 }} required
                                        value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 8 }}>
                                <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-secondary)' }} />
                                    <input id="confirm-password" className="form-input" type="password" style={{ paddingLeft: 40 }} required
                                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                                </div>
                            </div>

                            {/* Requirement Checker */}
                            <div style={{
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                                    Password Requirements
                                </div>
                                {requirements.map((req, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: req.valid ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                        <div style={{
                                            width: 16, height: 16, borderRadius: '50%',
                                            background: req.valid ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.03)',
                                            border: req.valid ? '1px solid var(--accent-green)' : '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {req.valid && <FiCheck size={10} />}
                                        </div>
                                        {req.label}
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || !isPasswordValid}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px', color: 'var(--accent-green)'
                        }}>
                            <FiCheckCircle size={32} />
                        </div>
                        
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                            Password Reset!
                        </div>
                        
                        <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: '1.6' }}>
                            Your password has been changed successfully. You can now use your new password to sign in.
                        </div>

                        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Sign In Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
