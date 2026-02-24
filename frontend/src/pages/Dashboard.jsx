// pages/Dashboard.jsx — Redesigned Dashboard with premium app shell
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const API = 'http://localhost:5000';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditing] = useState(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [stats, setStats] = useState({ totalCourses: 0, totalNotes: 0, totalSummaries: 0, totalPdfs: 0, totalPdfSummaries: 0 });
    const [courseProgress, setCourseProgress] = useState({});

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await axios.get(`${API}/courses`);
            setCourses(data);
        } catch (err) {
            setError('Failed to load courses. Is the backend server running?');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    useEffect(() => {
        axios.get(`${API}/courses/stats`)
            .then(res => setStats(res.data))
            .catch(() => { });
    }, [courses]);

    useEffect(() => {
        courses.forEach(async (course) => {
            try {
                const res = await axios.get(`${API}/courses/${course.id}/progress`);
                setCourseProgress(prev => ({ ...prev, [course.id]: res.data }));
            } catch (err) {
                console.error('Progress fetch failed:', err);
            }
        });
    }, [courses]);

    const openCreate = () => {
        setEditing(null);
        setFormName('');
        setFormDesc('');
        setFormError('');
        setShowForm(true);
    };

    const openEdit = (course) => {
        setEditing(course);
        setFormName(course.name);
        setFormDesc(course.description || '');
        setFormError('');
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditing(null);
        setFormName('');
        setFormDesc('');
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            setFormError('Course name is required.');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            if (editingCourse) {
                await axios.put(`${API}/courses/${editingCourse.id}`, {
                    name: formName.trim(),
                    description: formDesc.trim(),
                });
            } else {
                await axios.post(`${API}/courses`, {
                    name: formName.trim(),
                    description: formDesc.trim(),
                });
            }
            cancelForm();
            fetchCourses();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to save course. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course) => {
        if (!window.confirm(`Delete "${course.name}" and all its notes? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/courses/${course.id}`);
            fetchCourses();
        } catch (err) {
            setError('Failed to delete course. Please try again.');
        }
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const statCards = [
        { num: stats.totalCourses, label: 'Courses', icon: '📚' },
        { num: stats.totalNotes, label: 'Total Notes', icon: '📝' },
        { num: stats.totalSummaries, label: 'AI Summaries', icon: '✨' },
        { num: stats.totalPdfs, label: 'PDFs', icon: '📄' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ground)', fontFamily: 'var(--font-body)' }}>
            {/* ── Top Nav ─────────────────────────────────────── */}
            <header style={{
                height: '64px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: 'var(--s1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
            }}>
                {/* Left: Logo */}
                <div
                    onClick={() => navigate('/dashboard')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        minWidth: '180px',
                    }}
                >
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink)' }}>StudyBuddy</span>
                </div>

                {/* Center: Search */}
                <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px' }}>
                    <SearchBar />
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')} icon="📊">Analytics</Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/planner')} icon="📅">Planner</Button>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
                    {/* Avatar */}
                    <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--blue), var(--purple))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 700,
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)' }}>{user?.name}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
            </header>

            {/* ── Main Content ────────────────────────────────── */}
            <main style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '32px 32px 64px',
                animation: 'fadeInUp 0.3s var(--ease-out) both',
            }}>
                {/* Page Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '32px',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '32px',
                            color: 'var(--ink)',
                            marginBottom: '4px',
                        }}>
                            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p style={{ fontSize: '15px', color: 'var(--muted)' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            {stats.totalNotes > 0 && ` · You have ${stats.totalNotes} notes`}
                        </p>
                    </div>
                    <Button variant="primary" size="lg" onClick={openCreate} icon="✚">
                        New Course
                    </Button>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px',
                }}>
                    {statCards.map(stat => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>

                {/* Error */}
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
                        ⚠️ {error}
                    </div>
                )}

                {/* Course Modal */}
                <Modal
                    open={showForm}
                    onClose={cancelForm}
                    title={editingCourse ? '✏️ Edit Course' : '✚ New Course'}
                >
                    <form onSubmit={handleSubmit}>
                        {formError && (
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
                                ⚠️ {formError}
                            </div>
                        )}
                        <Input
                            label="Course Name"
                            type="text"
                            placeholder="e.g. Operating Systems"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            disabled={saving}
                            required
                        />
                        <Input
                            label="Description"
                            type="text"
                            placeholder="A brief description of this course"
                            value={formDesc}
                            onChange={(e) => setFormDesc(e.target.value)}
                            disabled={saving}
                            hint="Optional"
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                            <Button type="button" variant="outline" onClick={cancelForm} disabled={saving}>Cancel</Button>
                            <Button type="submit" variant="primary" loading={saving}>
                                {saving ? 'Saving…' : editingCourse ? 'Save Changes' : 'Create Course'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Course Grid */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '12px' }}>
                        <div className="sb-spinner sb-spinner--lg" />
                        <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Loading courses…</span>
                    </div>
                ) : courses.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '64px 24px',
                        animation: 'fadeInUp 0.3s var(--ease-out) both',
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '24px',
                            color: 'var(--ink)',
                            marginBottom: '8px',
                        }}>
                            No courses yet
                        </h3>
                        <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '24px' }}>
                            Create your first course to get started
                        </p>
                        <Button variant="primary" size="lg" onClick={openCreate} icon="✚">
                            Create Your First Course
                        </Button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '20px',
                    }}>
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                                progress={courseProgress[course.id]}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ num, label, icon }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--surface)',
                border: `1px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: 'var(--r-md)',
                padding: '20px 24px',
                transition: 'all 0.17s ease',
                boxShadow: hovered ? 'var(--s3)' : 'none',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '36px',
                        color: 'var(--ink)',
                        lineHeight: 1,
                    }}>
                        {num}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                        {label}
                    </div>
                </div>
                <span style={{ fontSize: '24px' }}>{icon}</span>
            </div>
        </div>
    );
}

export default Dashboard;
