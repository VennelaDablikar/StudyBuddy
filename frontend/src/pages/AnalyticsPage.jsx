// pages/AnalyticsPage.jsx — Redesigned analytics dashboard with bar chart, rings, activity feed
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const API = 'http://localhost:5000';

function BarChart({ data, color = 'var(--blue)' }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 4px' }}>
            {data.map((d, i) => (
                <div key={i} style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '6px', height: '100%',
                    justifyContent: 'flex-end'
                }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-2)' }}>
                        {d.count}
                    </span>
                    <div style={{
                        width: '100%', maxWidth: '38px',
                        height: `${Math.max((d.count / max) * 100, 4)}%`,
                        background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                        borderRadius: '6px 6px 3px 3px',
                        transition: 'height 0.6s var(--ease-out)',
                        minHeight: '4px',
                    }} />
                    <span style={{ fontSize: '11px', color: 'var(--subtle)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {d.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ProgressRing({ value, max, label, color = 'var(--blue)', size = 90 }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    const radius = (size - 12) / 2;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (pct / 100) * circ;

    return (
        <div style={{ textAlign: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s var(--ease-out)' }} />
            </svg>
            <div style={{ marginTop: '-58px', marginBottom: '18px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    {Math.round(pct)}%
                </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => { logout(); navigate('/'); };

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data: res } = await axios.get(`${API}/analytics`);
                setData(res);
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const getLast7Days = () => {
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            days.push({ date: dateStr, label: dayNames[d.getDay()] });
        }
        return days;
    };

    const chartData = () => {
        if (!data) return [];
        const days = getLast7Days();
        const notesMap = {};
        data.notesPerDay.forEach(n => { notesMap[n.date] = n.count; });
        return days.map(d => ({ label: d.label, count: notesMap[d.date] || 0 }));
    };

    const statCards = data ? [
        { icon: '📚', label: 'Courses', value: data.stats.totalCourses, color: 'var(--blue)' },
        { icon: '📝', label: 'Notes', value: data.stats.totalNotes, color: 'var(--purple)' },
        { icon: '📄', label: 'PDFs', value: data.stats.totalPdfs, color: '#06b6d4' },
        { icon: '✨', label: 'Summaries', value: data.stats.totalSummaries, color: 'var(--gold)' },
        { icon: '✅', label: 'Reviewed', value: data.stats.reviewedNotes, color: 'var(--green)' },
        { icon: '📅', label: 'Sessions', value: data.stats.totalSessions, color: '#ec4899' },
    ] : [];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ground)', fontFamily: 'var(--font-body)' }}>
            {/* ── Top Nav ──────────────────────────────────── */}
            <header style={{
                height: '64px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--s1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
            }}>
                <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink)' }}>StudyBuddy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} icon="←">Dashboard</Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/planner')} icon="📅">Planner</Button>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--blue), var(--purple))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '13px', fontWeight: 700,
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
            </header>

            <main style={{
                maxWidth: '1100px', margin: '0 auto', padding: '32px 32px 64px',
                animation: 'fadeInUp 0.3s var(--ease-out) both',
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--ink)', marginBottom: '4px',
                    }}>
                        📊 Analytics
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
                        Track your study progress and activity
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '12px' }}>
                        <div className="sb-spinner sb-spinner--lg" />
                        <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Loading analytics…</span>
                    </div>
                ) : data ? (
                    <>
                        {/* ── Stat Cards Grid ────────────────────── */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                            gap: '14px', marginBottom: '28px',
                        }}>
                            {statCards.map((s, i) => (
                                <AnalyticsStatCard key={i} {...s} delay={i * 0.05} />
                            ))}
                        </div>

                        {/* ── Charts Row ──────────────────────────── */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                            gap: '20px', marginBottom: '28px',
                        }}>
                            {/* Notes per Day */}
                            <div style={{
                                background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                                padding: '24px', border: '1.5px solid var(--border)',
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--ink)' }}>
                                    📝 Notes Created <span style={{ color: 'var(--subtle)', fontWeight: 400, fontSize: '13px' }}>(Last 7 Days)</span>
                                </h3>
                                <BarChart data={chartData()} color="var(--blue)" />
                            </div>

                            {/* Notes per Course */}
                            <div style={{
                                background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                                padding: '24px', border: '1.5px solid var(--border)',
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--ink)' }}>
                                    📚 Notes per Course
                                </h3>
                                {data.notesPerCourse.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--subtle)' }}>
                                        No courses yet
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {data.notesPerCourse.map((c, i) => {
                                            const maxN = Math.max(...data.notesPerCourse.map(x => x.noteCount), 1);
                                            return (
                                                <div key={i}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-2)' }}>{c.name}</span>
                                                        <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>{c.noteCount} notes · {c.pdfCount} PDFs</span>
                                                    </div>
                                                    <div style={{ background: 'var(--sunken)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${(c.noteCount / maxN) * 100}%`,
                                                            height: '100%',
                                                            background: 'linear-gradient(90deg, var(--blue), var(--purple))',
                                                            borderRadius: '6px',
                                                            transition: 'width 0.6s var(--ease-out)',
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Progress Rings + Activity ────────── */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                            gap: '20px',
                        }}>
                            <div style={{
                                background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                                padding: '24px', border: '1.5px solid var(--border)',
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', color: 'var(--ink)' }}>
                                    🎯 Progress Overview
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                                    <ProgressRing value={data.stats.reviewedNotes} max={data.stats.totalNotes} label="Notes Reviewed" color="var(--green)" />
                                    <ProgressRing value={data.stats.totalSummaries} max={data.stats.totalNotes} label="Notes Summarized" color="var(--purple)" />
                                    <ProgressRing value={data.stats.completedSessions} max={data.stats.totalSessions} label="Sessions Done" color="var(--blue)" />
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                                padding: '24px', border: '1.5px solid var(--border)',
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--ink)' }}>
                                    🕐 Recent Activity
                                </h3>
                                {data.recentNotes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--subtle)' }}>
                                        No activity yet
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {data.recentNotes.map((n, i) => (
                                            <div key={i} style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '10px 14px', borderRadius: 'var(--r)',
                                                background: 'var(--sunken)',
                                                transition: 'background 0.13s ease',
                                                cursor: 'default',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-soft)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'var(--sunken)'}
                                            >
                                                <div style={{
                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                    background: 'var(--blue)', flexShrink: 0,
                                                }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: '13px', fontWeight: 700, color: 'var(--ink)',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    }}>
                                                        {n.title}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: 'var(--subtle)' }}>
                                                        {n.courseName} · {new Date(n.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--subtle)' }}>
                        Failed to load analytics
                    </div>
                )}
            </main>
        </div>
    );
}

function AnalyticsStatCard({ icon, label, value, color, delay = 0 }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-md)',
                padding: '20px',
                border: `1.5px solid ${hovered ? color : 'var(--border)'}`,
                textAlign: 'center',
                transition: 'all 0.17s ease',
                boxShadow: hovered ? 'var(--s3)' : 'none',
                animation: `fadeInUp 0.3s var(--ease-out) ${delay}s both`,
            }}
        >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{value}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', fontWeight: 500 }}>{label}</div>
        </div>
    );
}
