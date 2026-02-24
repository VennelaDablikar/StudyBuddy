// pages/PlannerPage.jsx — Redesigned study planner with calendar + sidebar
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const API = 'http://localhost:5000';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const SESSION_COLORS = ['#2563eb', '#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e', '#ec4899', '#ef4444'];

export default function PlannerPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', course_id: '', start_time: '', end_time: '' });
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handleLogout = () => { logout(); navigate('/'); };

    const fetchSessions = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/planner`, { params: { month: month + 1, year } });
            setSessions(data);
        } catch (err) { console.error('Failed to load sessions:', err); } finally { setLoading(false); }
    }, [month, year]);

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get(`${API}/courses`);
            setCourses(data);
        } catch (err) { console.error('Failed to load courses:', err); }
    };

    useEffect(() => { fetchSessions(); }, [fetchSessions]);
    useEffect(() => { fetchCourses(); }, []);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const calendarCells = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

    const getDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const getSessionsForDay = (day) => sessions.filter(s => s.session_date === getDateStr(day));

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const openAddModal = (dateStr) => {
        setEditingSession(null);
        setForm({ title: '', description: '', course_id: '', start_time: '', end_time: '' });
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const openEditModal = (session) => {
        setEditingSession(session);
        setForm({
            title: session.title,
            description: session.description || '',
            course_id: session.course_id || '',
            start_time: session.start_time || '',
            end_time: session.end_time || ''
        });
        setSelectedDate(session.session_date);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, session_date: selectedDate, course_id: form.course_id || null };
            if (editingSession) {
                await axios.put(`${API}/planner/${editingSession.id}`, payload);
            } else {
                await axios.post(`${API}/planner`, payload);
            }
            setShowModal(false);
            fetchSessions();
        } catch (err) { console.error('Save error:', err); }
    };

    const toggleSession = async (id) => {
        try { await axios.patch(`${API}/planner/${id}/toggle`); fetchSessions(); }
        catch (err) { console.error('Toggle error:', err); }
    };

    const deleteSession = async (id) => {
        try { await axios.delete(`${API}/planner/${id}`); fetchSessions(); }
        catch (err) { console.error('Delete error:', err); }
    };

    const sidebarDate = selectedDate || todayStr;
    const sidebarSessions = sessions.filter(s => s.session_date === sidebarDate);
    const sidebarDateObj = new Date(sidebarDate + 'T00:00:00');

    const upcomingSessions = sessions.filter(s => {
        const d = new Date(s.session_date + 'T00:00:00');
        return d >= today && d <= new Date(today.getTime() + 7 * 86400000);
    }).sort((a, b) => a.session_date.localeCompare(b.session_date));

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
                    <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')} icon="📊">Analytics</Button>
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
                maxWidth: '1200px', margin: '0 auto', padding: '32px 32px 64px',
                animation: 'fadeInUp 0.3s var(--ease-out) both',
            }}>
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--ink)', marginBottom: '4px' }}>
                        📅 Study Planner
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
                        Schedule study sessions and stay on track
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                    {/* ── Calendar ─────────────────────────────── */}
                    <div style={{
                        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                        padding: '24px', border: '1.5px solid var(--border)',
                    }}>
                        {/* Calendar Nav */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <Button variant="outline" size="sm" onClick={prevMonth}>←</Button>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                                    {MONTH_NAMES[month]} {year}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
                                <Button variant="outline" size="sm" onClick={nextMonth}>→</Button>
                            </div>
                        </div>

                        {/* Day Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                            {DAYS.map(d => (
                                <div key={d} style={{
                                    textAlign: 'center', fontSize: '12px', fontWeight: 700,
                                    color: 'var(--subtle)', padding: '8px 0', textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar Cells */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                            {calendarCells.map((day, i) => {
                                if (day === null) return <div key={i} />;
                                const dateStr = getDateStr(day);
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;
                                const daySessions = getSessionsForDay(day);

                                return (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedDate(dateStr)}
                                        onDoubleClick={() => openAddModal(dateStr)}
                                        style={{
                                            minHeight: '80px', padding: '6px',
                                            borderRadius: 'var(--r)',
                                            cursor: 'pointer',
                                            background: isSelected ? 'var(--blue-soft)' : isToday ? 'var(--green-soft)' : 'var(--sunken)',
                                            border: isSelected ? '2px solid var(--blue)' : isToday ? '2px solid var(--green)' : '1px solid transparent',
                                            transition: 'all 0.13s ease',
                                        }}
                                        onMouseEnter={e => { if (!isSelected && !isToday) e.currentTarget.style.background = 'var(--border)'; }}
                                        onMouseLeave={e => { if (!isSelected && !isToday) e.currentTarget.style.background = 'var(--sunken)'; }}
                                    >
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: isToday ? 800 : 500,
                                            color: isToday ? 'var(--green)' : isSelected ? 'var(--blue)' : 'var(--ink-2)',
                                            marginBottom: '4px',
                                        }}>
                                            {day}
                                        </div>
                                        {daySessions.slice(0, 3).map((s, j) => (
                                            <div key={j} style={{
                                                fontSize: '10px',
                                                padding: '2px 5px',
                                                borderRadius: '4px',
                                                marginBottom: '2px',
                                                background: s.completed ? 'var(--green-soft)' : `${SESSION_COLORS[j % SESSION_COLORS.length]}18`,
                                                color: s.completed ? 'var(--green)' : SESSION_COLORS[j % SESSION_COLORS.length],
                                                fontWeight: 700,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                textDecoration: s.completed ? 'line-through' : 'none',
                                            }}>
                                                {s.title}
                                            </div>
                                        ))}
                                        {daySessions.length > 3 && (
                                            <div style={{ fontSize: '10px', color: 'var(--subtle)', textAlign: 'center' }}>
                                                +{daySessions.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Sidebar ──────────────────────────────── */}
                    <div style={{ position: 'sticky', top: '80px' }}>
                        {/* Day Detail */}
                        <div style={{
                            background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                            padding: '22px', border: '1.5px solid var(--border)',
                            marginBottom: '16px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                                        {sidebarDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--subtle)', marginTop: '2px' }}>
                                        {sidebarSessions.length} session{sidebarSessions.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <Button variant="primary" size="sm" onClick={() => openAddModal(sidebarDate)} icon="✚">Add</Button>
                            </div>

                            {sidebarSessions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--subtle)', fontSize: '13px' }}>
                                    No sessions scheduled.<br />
                                    <span style={{ fontSize: '12px' }}>Double-click a date or press + to add one.</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {sidebarSessions.map((s) => (
                                        <SessionCard
                                            key={s.id}
                                            session={s}
                                            onToggle={toggleSession}
                                            onEdit={openEditModal}
                                            onDelete={deleteSession}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming */}
                        <div style={{
                            background: 'var(--surface)', borderRadius: 'var(--r-lg)',
                            padding: '22px', border: '1.5px solid var(--border)',
                        }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--ink)' }}>
                                🔔 Upcoming (7 days)
                            </h3>
                            {upcomingSessions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--subtle)', fontSize: '12px' }}>
                                    No upcoming sessions
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {upcomingSessions.slice(0, 5).map(s => (
                                        <div key={s.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '10px 12px', borderRadius: 'var(--r)',
                                            background: 'var(--sunken)', fontSize: '12px',
                                            transition: 'background 0.13s ease',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-soft)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--sunken)'}
                                        >
                                            <div style={{
                                                width: '7px', height: '7px', borderRadius: '50%',
                                                background: s.completed ? 'var(--green)' : 'var(--blue)', flexShrink: 0,
                                            }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 700, color: 'var(--ink-2)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>{s.title}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--subtle)' }}>
                                                    {new Date(s.session_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    {s.start_time ? ` · ${s.start_time}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Session Modal ────────────────────────── */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title={editingSession ? '✏️ Edit Session' : '➕ New Study Session'}
                maxWidth="440px"
            >
                <div style={{ marginBottom: '16px' }}>
                    <Badge variant="blue">
                        📅 {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </Badge>
                </div>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Title *"
                        type="text"
                        required
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Study Chapter 5"
                    />
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{
                            display: 'block', fontSize: '13px', fontWeight: 700,
                            marginBottom: '6px', color: 'var(--ink-2)',
                        }}>
                            Course (optional)
                        </label>
                        <select
                            value={form.course_id}
                            onChange={e => setForm({ ...form, course_id: e.target.value })}
                            style={{
                                width: '100%', height: '42px', padding: '0 12px',
                                borderRadius: 'var(--r)', border: '1.5px solid var(--border)',
                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                background: 'var(--surface)', color: 'var(--ink)',
                                fontFamily: 'var(--font-body)',
                            }}
                        >
                            <option value="">— No course —</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input
                            label="Start Time"
                            type="time"
                            value={form.start_time}
                            onChange={e => setForm({ ...form, start_time: e.target.value })}
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={form.end_time}
                            onChange={e => setForm({ ...form, end_time: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block', fontSize: '13px', fontWeight: 700,
                            marginBottom: '6px', color: 'var(--ink-2)',
                        }}>
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="What will you study?"
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 14px',
                                borderRadius: 'var(--r)', border: '1.5px solid var(--border)',
                                fontSize: '14px', outline: 'none', resize: 'vertical',
                                fontFamily: 'var(--font-body)', boxSizing: 'border-box',
                                background: 'var(--surface)', color: 'var(--ink)',
                                transition: 'border-color 0.15s ease',
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-glow)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">
                            {editingSession ? 'Save Changes' : 'Create Session'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function SessionCard({ session: s, onToggle, onEdit, onDelete }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '14px', borderRadius: 'var(--r)',
                border: `1.5px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                background: s.completed ? 'var(--green-soft)' : 'var(--surface)',
                opacity: s.completed ? 0.85 : 1,
                transition: 'all 0.17s ease',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '14px', fontWeight: 700,
                        textDecoration: s.completed ? 'line-through' : 'none',
                        color: s.completed ? 'var(--muted)' : 'var(--ink)',
                    }}>
                        {s.title}
                    </div>
                    {s.courseName && (
                        <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '3px', fontWeight: 600 }}>
                            📚 {s.courseName}
                        </div>
                    )}
                    {s.start_time && (
                        <div style={{ fontSize: '11px', color: 'var(--subtle)', marginTop: '2px' }}>
                            🕐 {s.start_time}{s.end_time ? ` – ${s.end_time}` : ''}
                        </div>
                    )}
                    {s.description && (
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.5 }}>
                            {s.description}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button onClick={() => onToggle(s.id)} style={{
                    flex: 1, padding: '6px', borderRadius: 'var(--r-sm)',
                    border: 'none', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer',
                    background: s.completed ? 'var(--red-soft)' : 'var(--green-soft)',
                    color: s.completed ? 'var(--red)' : 'var(--green)',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.13s ease',
                }}>
                    {s.completed ? '↩ Undo' : '✅ Done'}
                </button>
                <button onClick={() => onEdit(s)} style={{
                    padding: '6px 10px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    fontSize: '12px', cursor: 'pointer',
                    transition: 'all 0.13s ease',
                }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >✏️</button>
                <button onClick={() => onDelete(s.id)} style={{
                    padding: '6px 10px', borderRadius: 'var(--r-sm)',
                    border: 'none', background: 'var(--red-soft)',
                    fontSize: '12px', cursor: 'pointer', color: 'var(--red)',
                    transition: 'all 0.13s ease',
                }}>🗑️</button>
            </div>
        </div>
    );
}
