// pages/SignupPage.jsx — Premium split‑layout signup
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const API = 'http://localhost:5000';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API}/auth/signup`, form);
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            fontFamily: 'var(--font-body)',
        }}>
            {/* ── Left Dark Panel ────────────────────────────── */}
            <div style={{
                width: '45%',
                background: 'var(--ink)',
                padding: '64px 48px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '500px',
                    height: '400px',
                    background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '64px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'white' }}>StudyBuddy</span>
                    </Link>

                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '36px',
                        color: 'white',
                        lineHeight: 1.15,
                        marginBottom: '24px',
                    }}>
                        Start your journey<br />to smarter learning.
                    </h2>
                    <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px', maxWidth: '360px' }}>
                        Create your account and start organizing your study life like never before.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: '⚡', text: 'Set up in under 30 seconds' },
                            { icon: '🔒', text: 'Your data stays private and secure' },
                            { icon: '🎓', text: 'Free for all students' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '14px',
                                color: '#94a3b8',
                            }}>
                                <span style={{ fontSize: '18px' }}>{f.icon}</span>
                                {f.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#94a3b8',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        borderLeft: '2px solid rgba(37,99,235,0.4)',
                        paddingLeft: '16px',
                    }}>
                        "The best study tool I've ever used. It's like having a personal tutor that organizes everything for you."
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
                        — Sarah Park, MIT
                    </p>
                </div>
            </div>

            {/* ── Right Form Panel ───────────────────────────── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                background: 'var(--surface)',
            }}>
                <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInUp 0.4s var(--ease-out) both' }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        marginBottom: '40px',
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink)' }}>StudyBuddy</span>
                    </Link>

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '32px',
                        color: 'var(--ink)',
                        marginBottom: '8px',
                    }}>
                        Create your account
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: 'var(--muted)',
                        marginBottom: '32px',
                    }}>
                        Start organizing your studies today
                    </p>

                    {error && (
                        <div style={{
                            background: 'var(--red-soft)',
                            color: 'var(--red)',
                            padding: '12px 16px',
                            borderRadius: 'var(--r)',
                            fontSize: '14px',
                            marginBottom: '20px',
                            border: '1.5px solid #fecaca',
                            fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            type="text"
                            required
                            placeholder="John Doe"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            disabled={loading}
                        />

                        <Input
                            label="Email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            disabled={loading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            disabled={loading}
                            hint="Minimum 6 characters"
                            minLength={6}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            style={{ width: '100%', marginTop: '4px' }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p style={{
                        textAlign: 'center',
                        marginTop: '24px',
                        fontSize: '14px',
                        color: 'var(--muted)',
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
