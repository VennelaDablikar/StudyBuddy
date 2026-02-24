// pages/LandingPage.jsx — Premium SaaS Landing Page
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

const features = [
    { icon: '📚', title: 'Course Organization', desc: 'Keep all your courses, notes, and study materials organized in one beautiful workspace.', color: 'var(--blue)', bg: 'var(--blue-soft)' },
    { icon: '📝', title: 'Rich Markdown Notes', desc: 'Write beautiful notes with full Markdown support — headings, code blocks, lists, and more.', color: 'var(--green)', bg: 'var(--green-soft)' },
    { icon: '📄', title: 'PDF Upload & View', desc: 'Upload textbooks, lecture slides, and past papers. View them side-by-side with your notes.', color: 'var(--gold)', bg: 'var(--gold-soft)' },
    { icon: '✨', title: 'AI Summarization', desc: 'Get instant AI-powered summaries of your notes and PDFs. Study smarter, not harder.', color: 'var(--purple)', bg: 'var(--purple-soft)' },
    { icon: '🔍', title: 'Global Search', desc: 'Find any note, course, or PDF in seconds with powerful full-text search across everything.', color: '#0ea5e9', bg: '#f0f9ff' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Track your study progress with review status, analytics, and visual progress indicators.', color: 'var(--red)', bg: 'var(--red-soft)' },
];

const steps = [
    { num: '1', title: 'Create your courses', desc: 'Set up your semester courses in seconds. Organize by subject, class, or project.' },
    { num: '2', title: 'Add notes & PDFs', desc: 'Write Markdown notes or upload PDFs. Everything lives in one organized space.' },
    { num: '3', title: 'Study with AI', desc: 'Generate AI summaries, track your progress, and ace your exams with confidence.' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState(null);

    // Contact form state
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactStatus, setContactStatus] = useState({ loading: false, success: '', error: '' });

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactStatus({ loading: true, success: '', error: '' });
        try {
            const { data } = await axios.post(`${API}/contact`, contactForm);
            setContactStatus({ loading: false, success: data.message, error: '' });
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setContactStatus({ loading: false, success: '', error: err.response?.data?.error || 'Failed to send. Please try again.' });
        }
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div style={{ fontFamily: 'var(--font-body)' }}>
            {/* ── Navbar ─────────────────────────────────────────── */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
                transition: 'all 0.3s ease',
            }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '22px',
                        color: scrolled ? 'var(--ink)' : 'white',
                        transition: 'color 0.3s ease',
                    }}>
                        StudyBuddy
                    </span>
                </Link>

                <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a href="#features" style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: scrolled ? 'var(--muted)' : 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        borderRadius: 'var(--r)',
                        transition: 'all 0.15s ease',
                    }}>
                        Features
                    </a>
                    <a href="#how-it-works" style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: scrolled ? 'var(--muted)' : 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        borderRadius: 'var(--r)',
                        transition: 'all 0.15s ease',
                    }}>
                        How It Works
                    </a>
                    <a href="#contact" style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: scrolled ? 'var(--muted)' : 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        borderRadius: 'var(--r)',
                        transition: 'all 0.15s ease',
                    }}>
                        Contact
                    </a>
                    <div style={{ width: '1px', height: '20px', background: scrolled ? 'var(--border)' : 'rgba(255,255,255,0.15)', margin: '0 8px' }} />
                    <Link to="/login" style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: scrolled ? 'var(--ink-2)' : 'white',
                        textDecoration: 'none',
                        borderRadius: 'var(--r)',
                        transition: 'all 0.15s ease',
                    }}>
                        Login
                    </Link>
                    <Link to="/signup" style={{
                        padding: '8px 20px',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'white',
                        background: 'var(--blue)',
                        borderRadius: 'var(--r)',
                        textDecoration: 'none',
                        transition: 'all 0.17s ease',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                    }}>
                        Get Started
                    </Link>
                </nav>
            </header>

            {/* ── Dark Hero Section ──────────────────────────────── */}
            <section style={{
                minHeight: '92vh',
                background: '#0c1524',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '-64px',
                paddingTop: '64px',
                paddingBottom: '80px',
            }}>
                {/* Grid pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />
                {/* Blue radial glow */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    height: '600px',
                    background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(37,99,235,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Hero Content */}
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '760px', padding: '0 24px' }}>
                    {/* Eyebrow pill */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: '1px solid rgba(59,130,246,0.3)',
                        background: 'rgba(59,130,246,0.1)',
                        color: '#93c5fd',
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '32px',
                        animation: 'fadeInDown 0.5s var(--ease-out) both',
                    }}>
                        ✦ AI-Powered Study Tool
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(44px, 6vw, 80px)',
                        color: 'white',
                        lineHeight: 1.05,
                        marginBottom: '24px',
                        animation: 'fadeInUp 0.6s var(--ease-out) 0.1s both',
                    }}>
                        Study smarter,<br />
                        <em style={{ fontStyle: 'italic' }}>not harder.</em>
                    </h1>

                    {/* Subheading */}
                    <p style={{
                        fontSize: '18px',
                        color: '#64748b',
                        maxWidth: '480px',
                        margin: '0 auto 40px auto',
                        lineHeight: 1.7,
                        animation: 'fadeInUp 0.6s var(--ease-out) 0.2s both',
                    }}>
                        Organize your courses, take beautiful notes, and let AI help you study more effectively.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        animation: 'fadeInUp 0.6s var(--ease-out) 0.3s both',
                    }}>
                        <button
                            onClick={() => navigate('/signup')}
                            style={{
                                height: '52px',
                                padding: '0 28px',
                                background: 'var(--blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '15px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-body)',
                                cursor: 'pointer',
                                transition: 'all 0.17s ease',
                                boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)'; }}
                        >
                            Start for free →
                        </button>
                        <a
                            href="#features"
                            style={{
                                height: '52px',
                                padding: '0 28px',
                                background: 'transparent',
                                color: 'white',
                                border: '1.5px solid rgba(255,255,255,0.2)',
                                borderRadius: 'var(--r)',
                                fontSize: '15px',
                                fontWeight: 600,
                                fontFamily: 'var(--font-body)',
                                cursor: 'pointer',
                                transition: 'all 0.17s ease',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            See how it works
                        </a>
                    </div>

                    {/* Social proof */}
                    <p style={{
                        fontSize: '13px',
                        color: '#475569',
                        marginTop: '32px',
                        animation: 'fadeInUp 0.6s var(--ease-out) 0.4s both',
                    }}>
                        Trusted by students at 50+ universities
                    </p>
                </div>

                {/* Floating stats */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '48px',
                    position: 'relative',
                    zIndex: 2,
                    animation: 'fadeInUp 0.8s var(--ease-out) 0.5s both',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    padding: '0 24px',
                }}>
                    {[
                        { label: 'Courses', val: '500+', delay: '0s' },
                        { label: 'Notes', val: '10K+', delay: '2s' },
                        { label: 'AI Summaries', val: '5K+', delay: '4s' },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            padding: '20px 28px',
                            textAlign: 'center',
                            minWidth: '140px',
                            animation: `float 6s ease-in-out ${s.delay} infinite`,
                        }}>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>{s.val}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features Section ───────────────────────────────── */}
            <section id="features" style={{
                background: 'var(--surface)',
                padding: '80px 40px',
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <div className="section-label">FEATURES</div>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(32px, 4vw, 52px)',
                            color: 'var(--ink)',
                            lineHeight: 1.15,
                            marginBottom: '16px',
                        }}>
                            Everything you need to<br />ace your exams
                        </h2>
                        <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '440px', margin: '0 auto' }}>
                            A complete study toolkit designed to help you learn more efficiently.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px',
                    }}>
                        {features.map((f, i) => (
                            <div
                                key={i}
                                onMouseEnter={() => setHoveredFeature(i)}
                                onMouseLeave={() => setHoveredFeature(null)}
                                style={{
                                    background: 'var(--surface)',
                                    border: `1px solid ${hoveredFeature === i ? 'var(--blue)' : 'var(--border)'}`,
                                    borderRadius: 'var(--r-lg)',
                                    padding: '28px',
                                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                                    transform: hoveredFeature === i ? 'translateY(-4px)' : 'none',
                                    boxShadow: hoveredFeature === i ? 'var(--s4)' : 'none',
                                    cursor: 'default',
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: f.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    marginBottom: '16px',
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '17px',
                                    fontWeight: 700,
                                    color: 'var(--ink)',
                                    marginBottom: '8px',
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: 'var(--muted)',
                                    lineHeight: 1.65,
                                    marginBottom: '16px',
                                }}>
                                    {f.desc}
                                </p>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'var(--blue)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'gap 0.2s ease',
                                }}>
                                    Learn more →
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ───────────────────────────────────── */}
            <section id="how-it-works" style={{
                background: 'var(--ground)',
                padding: '80px 40px',
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <div className="section-label">HOW IT WORKS</div>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(32px, 4vw, 48px)',
                            color: 'var(--ink)',
                        }}>
                            Get started in minutes
                        </h2>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '40px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        position: 'relative',
                    }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{
                                flex: '1 1 220px',
                                maxWidth: '260px',
                                textAlign: 'center',
                                position: 'relative',
                            }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: 'var(--blue)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    margin: '0 auto 20px auto',
                                    fontFamily: 'var(--font-body)',
                                }}>
                                    {s.num}
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: 'var(--ink)',
                                    marginBottom: '8px',
                                }}>
                                    {s.title}
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: 'var(--muted)',
                                    lineHeight: 1.65,
                                }}>
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Contact Section ─────────────────────────────────── */}
            <section id="contact" style={{
                padding: '80px 40px',
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            background: 'var(--purple-soft)',
                            color: 'var(--purple)',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            marginBottom: '16px',
                        }}>
                            Get in Touch
                        </span>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(28px, 4vw, 44px)',
                            color: 'var(--ink)',
                            lineHeight: 1.15,
                            marginBottom: '12px',
                        }}>
                            Have a question?
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: 'var(--muted)',
                            lineHeight: 1.7,
                            maxWidth: '460px',
                            margin: '0 auto',
                        }}>
                            We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
                        </p>
                    </div>

                    <form onSubmit={handleContactSubmit} style={{
                        background: 'var(--ground)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-lg)',
                        padding: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>Name *</label>
                                <input
                                    type="text"
                                    value={contactForm.name}
                                    onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Your name"
                                    required
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        padding: '0 14px',
                                        border: '1.5px solid var(--border)',
                                        borderRadius: 'var(--r)',
                                        fontSize: '14px',
                                        fontFamily: 'var(--font-body)',
                                        background: 'var(--surface)',
                                        color: 'var(--ink)',
                                        outline: 'none',
                                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>Email *</label>
                                <input
                                    type="email"
                                    value={contactForm.email}
                                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="you@example.com"
                                    required
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        padding: '0 14px',
                                        border: '1.5px solid var(--border)',
                                        borderRadius: 'var(--r)',
                                        fontSize: '14px',
                                        fontFamily: 'var(--font-body)',
                                        background: 'var(--surface)',
                                        color: 'var(--ink)',
                                        outline: 'none',
                                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>Subject</label>
                            <input
                                type="text"
                                value={contactForm.subject}
                                onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                                placeholder="What's this about?"
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    padding: '0 14px',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 'var(--r)',
                                    fontSize: '14px',
                                    fontFamily: 'var(--font-body)',
                                    background: 'var(--surface)',
                                    color: 'var(--ink)',
                                    outline: 'none',
                                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>Message *</label>
                            <textarea
                                value={contactForm.message}
                                onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                                placeholder="Tell us what's on your mind..."
                                required
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 'var(--r)',
                                    fontSize: '14px',
                                    fontFamily: 'var(--font-body)',
                                    background: 'var(--surface)',
                                    color: 'var(--ink)',
                                    outline: 'none',
                                    resize: 'vertical',
                                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                    boxSizing: 'border-box',
                                    lineHeight: 1.6,
                                }}
                                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {contactStatus.error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'var(--red-soft)',
                                border: '1px solid #fecaca',
                                borderRadius: 'var(--r)',
                                color: 'var(--red)',
                                fontSize: '13px',
                                fontWeight: 500,
                            }}>
                                ⚠️ {contactStatus.error}
                            </div>
                        )}

                        {contactStatus.success && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'var(--green-soft)',
                                border: '1px solid #bbf7d0',
                                borderRadius: 'var(--r)',
                                color: 'var(--green)',
                                fontSize: '13px',
                                fontWeight: 500,
                            }}>
                                ✅ {contactStatus.success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={contactStatus.loading}
                            style={{
                                height: '48px',
                                background: contactStatus.loading ? 'var(--muted)' : 'var(--blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--r)',
                                fontSize: '15px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-body)',
                                cursor: contactStatus.loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.17s ease',
                                boxShadow: contactStatus.loading ? 'none' : '0 4px 16px rgba(37,99,235,0.25)',
                            }}
                            onMouseEnter={e => { if (!contactStatus.loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                        >
                            {contactStatus.loading ? 'Sending...' : 'Send Message →'}
                        </button>
                    </form>
                </div>
            </section>

            {/* ── CTA Section ────────────────────────────────────── */}
            <section style={{
                background: 'var(--ink)',
                padding: '80px 40px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(32px, 4vw, 52px)',
                        color: 'white',
                        lineHeight: 1.15,
                        marginBottom: '16px',
                    }}>
                        Ready to ace your exams?
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#64748b',
                        marginBottom: '32px',
                        lineHeight: 1.7,
                    }}>
                        Join thousands of students using StudyBuddy to organize their study materials and learn more effectively.
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        style={{
                            height: '52px',
                            padding: '0 32px',
                            background: 'var(--blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--r)',
                            fontSize: '15px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-body)',
                            cursor: 'pointer',
                            transition: 'all 0.17s ease',
                            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                    >
                        Get started for free →
                    </button>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '32px 64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--ink)' }}>StudyBuddy</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--subtle)' }}>
                    © {new Date().getFullYear()} StudyBuddy. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
