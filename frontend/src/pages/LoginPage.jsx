// pages/LoginPage.jsx — Premium split‑layout login
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const API = 'http://localhost:5000';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API}/auth/login`, form);
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Try again.');
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
                {/* Grid pattern */}
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
                        Your personal <br />study companion.
                    </h2>
                    <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px', maxWidth: '360px' }}>
                        Organize courses, take notes, upload PDFs, and let AI help you study smarter.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: '📚', text: 'Unlimited course organization' },
                            { icon: '✨', text: 'AI-powered note summaries' },
                            { icon: '📊', text: 'Progress tracking & analytics' },
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
                        "StudyBuddy transformed how I organize my study materials. The AI summaries save me hours every week."
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '12px' }}>
                        — Alex Chen, Stanford University
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
                        Welcome back
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: 'var(--muted)',
                        marginBottom: '32px',
                    }}>
                        Sign in to continue learning
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
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            style={{ width: '100%', marginTop: '4px' }}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>

                    <p style={{
                        textAlign: 'center',
                        marginTop: '24px',
                        fontSize: '14px',
                        color: 'var(--muted)',
                    }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
