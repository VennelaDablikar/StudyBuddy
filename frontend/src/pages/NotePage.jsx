// pages/NotePage.jsx — Redesigned note view with AI summary + markdown body
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Breadcrumb from '../components/Breadcrumb';
import NoteEditor from '../components/NoteEditor';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const API = 'http://localhost:5000';

function NotePage() {
    const { id, noteId } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/'); };

    const [course, setCourse] = useState(null);
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState(null);
    const [isReviewed, setIsReviewed] = useState(false);

    const fetchCourse = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/courses`);
            const found = data.find((c) => String(c.id) === String(id));
            if (found) setCourse(found);
        } catch { /* breadcrumb is optional */ }
    }, [id]);

    const fetchNote = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await axios.get(`${API}/courses/${id}/notes`);
            const found = data.find((n) => String(n.id) === String(noteId));
            if (found) {
                setNote(found);
                if (found.summary) setSummary(found.summary);
                setIsReviewed(found.is_reviewed === 1);
            } else {
                setError('Note not found.');
            }
        } catch { setError('Failed to load note.'); } finally { setLoading(false); }
    }, [id, noteId]);

    useEffect(() => { fetchCourse(); fetchNote(); }, [fetchCourse, fetchNote]);

    const handleSave = async ({ title, body }) => {
        setSaving(true);
        try {
            const { data } = await axios.put(`${API}/courses/${id}/notes/${noteId}`, { title, body });
            setNote(data);
            setIsEditing(false);
            if (!data.summary) setSummary(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save note.');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete note "${note?.title}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/courses/${id}/notes/${noteId}`);
            navigate(`/courses/${id}`);
        } catch { setError('Failed to delete note.'); }
    };

    const handleSummarize = async () => {
        setLoadingSummary(true);
        setSummaryError(null);
        try {
            const res = await axios.post(`${API}/courses/${id}/notes/${noteId}/summarize`);
            setSummary(res.data.summary);
        } catch (err) {
            setSummaryError(err.response?.data?.error || 'Failed to generate summary. Try again.');
        } finally { setLoadingSummary(false); }
    };

    const handleToggleReviewed = async () => {
        try {
            const res = await axios.patch(`${API}/courses/${id}/notes/${noteId}/toggle-reviewed`);
            setIsReviewed(res.data.is_reviewed === 1);
        } catch (err) { console.error('Toggle failed:', err); }
    };

    const breadcrumb = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: course ? course.name : 'Course', path: `/courses/${id}` },
        { label: note ? note.title : 'Note' },
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--ground)', fontFamily: 'var(--font-body)' }}>
                <header style={{
                    height: '64px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', padding: '0 32px', boxShadow: 'var(--s1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink)' }}>StudyBuddy</span>
                    </div>
                </header>
                <main style={{ maxWidth: '860px', margin: '0 auto', padding: '64px 32px', textAlign: 'center' }}>
                    <div className="sb-spinner sb-spinner--lg" style={{ margin: '0 auto 12px' }} />
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Loading note…</span>
                </main>
            </div>
        );
    }

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
                maxWidth: '860px',
                margin: '0 auto',
                padding: '24px 32px 64px',
                animation: 'fadeInUp 0.3s var(--ease-out) both',
            }}>
                <Breadcrumb items={breadcrumb} />

                {error && (
                    <div style={{
                        background: 'var(--red-soft)', color: 'var(--red)', padding: '12px 16px',
                        borderRadius: 'var(--r)', fontSize: '14px', marginBottom: '20px',
                        border: '1.5px solid #fecaca', fontWeight: 500,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {note && (
                    <>
                        {/* ── Note Header Card ───────────────────── */}
                        {!isEditing && (
                            <div style={{
                                background: 'var(--surface)',
                                border: '1.5px solid var(--border)',
                                borderRadius: 'var(--r-lg)',
                                padding: '28px 32px',
                                marginBottom: '20px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        {course && <Badge variant="blue" size="sm" style={{ marginBottom: '12px' }}>{course.name}</Badge>}
                                        <h1 style={{
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '32px',
                                            color: 'var(--ink)',
                                            lineHeight: 1.2,
                                            marginBottom: '8px',
                                        }}>
                                            {note.title}
                                        </h1>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--subtle)' }}>
                                                {new Date(note.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {isReviewed && <Badge variant="green">✅ Reviewed</Badge>}
                                            {summary && <Badge variant="purple">✨ Has AI Summary</Badge>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon="✏️">Edit</Button>
                                        <Button variant="danger" size="sm" onClick={handleDelete} icon="🗑️">Delete</Button>
                                        <Button
                                            variant="ai"
                                            size="sm"
                                            onClick={handleSummarize}
                                            loading={loadingSummary}
                                            disabled={loadingSummary}
                                        >
                                            {loadingSummary ? 'Generating…' : summary ? '✨ Re-summarize' : '✨ Summarize'}
                                        </Button>
                                        <button
                                            onClick={handleToggleReviewed}
                                            style={{
                                                height: '32px',
                                                padding: '0 12px',
                                                borderRadius: 'var(--r-sm)',
                                                border: `1.5px solid ${isReviewed ? 'var(--green)' : 'var(--border)'}`,
                                                background: isReviewed ? 'var(--green-soft)' : 'var(--surface)',
                                                color: isReviewed ? 'var(--green)' : 'var(--muted)',
                                                fontSize: '13px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.17s ease',
                                                fontFamily: 'var(--font-body)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}
                                        >
                                            {isReviewed ? '✅ Reviewed' : '○ Mark Reviewed'}
                                        </button>
                                    </div>
                                </div>
                                {summaryError && (
                                    <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '12px', fontWeight: 500 }}>
                                        ⚠️ {summaryError}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ── Edit Mode ─────────────────────────── */}
                        {isEditing ? (
                            <NoteEditor
                                initialTitle={note.title}
                                initialBody={note.body || ''}
                                onSave={handleSave}
                                onCancel={() => setIsEditing(false)}
                                isLoading={saving}
                                submitLabel="💾 Save Changes"
                            />
                        ) : (
                            <>
                                {/* ── AI Summary Card ─────────────────── */}
                                {summary && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, var(--purple-soft), var(--blue-soft))',
                                        border: '1.5px solid #ddd6fe',
                                        borderRadius: 'var(--r-lg)',
                                        padding: '24px 28px',
                                        marginBottom: '20px',
                                        animation: 'fadeInUp 0.3s var(--ease-out) both',
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                        }}>
                                            <h3 style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '20px',
                                                color: 'var(--purple)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}>
                                                ✨ AI Summary
                                            </h3>
                                            <button
                                                onClick={() => setSummary(null)}
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: 'var(--r-sm)',
                                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                                    fontSize: '14px', color: 'var(--muted)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.13s ease',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                                title="Dismiss summary"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {summary.split('\n').filter(line => line.trim()).map((line, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                gap: '10px',
                                                marginBottom: '10px',
                                                fontSize: '14px',
                                                color: 'var(--ink-2)',
                                                lineHeight: 1.65,
                                                animation: `bulletStagger 0.3s var(--ease-out) ${i * 0.06}s both`,
                                            }}>
                                                <span style={{ color: 'var(--purple)', flexShrink: 0, marginTop: '2px' }}>✦</span>
                                                <span>{line.replace(/^•\s*/, '')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Note Body — Markdown ────────────── */}
                                <div className="md-body" style={{
                                    background: 'var(--surface)',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: 'var(--r-lg)',
                                    padding: '32px 36px',
                                }}>
                                    {note.body ? (
                                        <ReactMarkdown>{note.body}</ReactMarkdown>
                                    ) : (
                                        <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                                            This note has no content yet. Click "Edit" to start writing.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default NotePage;
