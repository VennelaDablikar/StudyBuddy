// pages/CoursePage.jsx — Redesigned course detail page with tabs for notes & PDFs
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumb';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const API = 'http://localhost:5000';

function CoursePage() {
    const { id } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    const [course, setCourse] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('notes');

    // PDF state
    const [pdfs, setPdfs] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [pdfSummaries, setPdfSummaries] = useState({});
    const [summarizingPdf, setSummarizingPdf] = useState(null);
    const [viewingPdf, setViewingPdf] = useState(null);

    // Course edit state
    const [editingCourse, setEditingCourse] = useState(false);
    const [editCourseName, setEditCourseName] = useState('');
    const [editCourseDesc, setEditCourseDesc] = useState('');
    const [savingCourse, setSavingCourse] = useState(false);

    // Fetch operations (business logic preserved exactly as-is)
    const fetchCourse = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/courses`);
            const found = data.find((c) => String(c.id) === String(id));
            if (found) setCourse(found);
            else setError('Course not found.');
        } catch { setError('Failed to load course.'); }
    }, [id]);

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await axios.get(`${API}/courses/${id}/notes`);
            setNotes(data);
        } catch { setError('Failed to load notes.'); } finally { setLoading(false); }
    }, [id]);

    useEffect(() => { fetchCourse(); fetchNotes(); }, [fetchCourse, fetchNotes]);

    useEffect(() => {
        if (activeTab === 'pdfs') {
            axios.get(`${API}/courses/${id}/pdfs`)
                .then(res => setPdfs(res.data))
                .catch(() => setError('Failed to load PDFs.'));
        }
    }, [activeTab, id]);

    const openCreate = () => { setEditing(null); setShowForm(true); };
    const openEdit = (note) => { setEditing(note); setShowForm(true); };
    const cancelForm = () => { setEditing(null); setShowForm(false); };

    const handleSave = async ({ title, body }) => {
        setSaving(true);
        try {
            if (editingNote) {
                await axios.put(`${API}/courses/${id}/notes/${editingNote.id}`, { title, body });
            } else {
                await axios.post(`${API}/courses/${id}/notes`, { title, body });
            }
            cancelForm();
            fetchNotes();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save note.');
        } finally { setSaving(false); }
    };

    const handleDelete = async (note) => {
        if (!window.confirm(`Delete note "${note.title}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API}/courses/${id}/notes/${note.id}`);
            fetchNotes();
        } catch { setError('Failed to delete note.'); }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('pdf', file);
        try {
            const res = await axios.post(`${API}/courses/${id}/pdfs`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPdfs(prev => [res.data, ...prev]);
        } catch (err) {
            setUploadError(err.response?.data?.error || 'Upload failed. Try again.');
        } finally { setUploading(false); e.target.value = ''; }
    };

    const handlePdfDelete = async (pdfId) => {
        if (!window.confirm('Delete this PDF?')) return;
        try {
            await axios.delete(`${API}/courses/${id}/pdfs/${pdfId}`);
            setPdfs(prev => prev.filter(p => p.id !== pdfId));
        } catch { setError('Failed to delete PDF.'); }
    };

    const handlePdfSummarize = async (pdfId) => {
        setSummarizingPdf(pdfId);
        try {
            const res = await axios.post(`${API}/courses/${id}/pdfs/${pdfId}/summarize`);
            setPdfSummaries(prev => ({ ...prev, [pdfId]: res.data.summary }));
        } catch (err) {
            alert(err.response?.data?.error || 'Summarization failed');
        } finally { setSummarizingPdf(null); }
    };

    const openEditCourse = () => {
        setEditCourseName(course?.name || '');
        setEditCourseDesc(course?.description || '');
        setEditingCourse(true);
    };

    const handleSaveCourse = async () => {
        if (!editCourseName.trim()) return;
        setSavingCourse(true);
        try {
            await axios.put(`${API}/courses/${id}`, {
                name: editCourseName.trim(),
                description: editCourseDesc.trim()
            });
            await fetchCourse();
            setEditingCourse(false);
        } catch { setError('Failed to update course.'); } finally { setSavingCourse(false); }
    };

    const breadcrumb = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: course ? course.name : 'Course' },
    ];

    const tabs = [
        { key: 'notes', label: '📝 Notes', count: notes.length },
        { key: 'pdfs', label: '📄 PDFs', count: pdfs.length },
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
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)' }}>{user?.name}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
            </header>

            <main style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '24px 32px 64px',
                animation: 'fadeInUp 0.3s var(--ease-out) both',
            }}>
                <Breadcrumb items={breadcrumb} />

                {/* ── Course Hero Card ────────────────────────────── */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-lg)',
                    padding: '32px',
                    marginBottom: '24px',
                }}>
                    {editingCourse ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Input
                                label="Course Name"
                                value={editCourseName}
                                onChange={e => setEditCourseName(e.target.value)}
                                placeholder="Course name"
                            />
                            <Input
                                label="Description"
                                value={editCourseDesc}
                                onChange={e => setEditCourseDesc(e.target.value)}
                                placeholder="Description (optional)"
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="primary" size="md" onClick={handleSaveCourse} loading={savingCourse}>Save</Button>
                                <Button variant="outline" size="md" onClick={() => setEditingCourse(false)} disabled={savingCourse}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: 'var(--blue-soft)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0,
                                }}>
                                    📚
                                </div>
                                <div>
                                    <h1 style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '28px',
                                        color: 'var(--ink)',
                                        marginBottom: '4px',
                                    }}>
                                        {course ? course.name : 'Loading…'}
                                    </h1>
                                    {course?.description && (
                                        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                                            {course.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Badge variant="blue">📝 {notes.length} Notes</Badge>
                                        <Badge variant="green">📄 {pdfs.length} PDFs</Badge>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="outline" size="sm" onClick={openEditCourse} icon="✏️">Edit</Button>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${id}/quiz`)} icon="🧠">Quiz</Button>
                                {activeTab === 'notes' && (
                                    <Button variant="primary" size="md" onClick={openCreate} icon="✚">Add Note</Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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

                {/* ── Tab Switcher ────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    background: 'var(--sunken)',
                    borderRadius: 'var(--r)',
                    padding: '4px',
                    marginBottom: '24px',
                    width: 'fit-content',
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: 'var(--r-sm)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                fontFamily: 'var(--font-body)',
                                background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                                color: activeTab === tab.key ? 'var(--blue)' : 'var(--muted)',
                                boxShadow: activeTab === tab.key ? 'var(--s2)' : 'none',
                                transition: 'all 0.17s ease',
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* ═══════════════ NOTES TAB ════════════════════════ */}
                {activeTab === 'notes' && (
                    <>
                        {showForm && (
                            <div style={{ marginBottom: '24px' }}>
                                <NoteEditor
                                    initialTitle={editingNote?.title || ''}
                                    initialBody={editingNote?.body || ''}
                                    onSave={handleSave}
                                    onCancel={cancelForm}
                                    isLoading={saving}
                                    submitLabel={editingNote ? '💾 Save Changes' : '➕ Add Note'}
                                />
                            </div>
                        )}

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '12px' }}>
                                <div className="sb-spinner sb-spinner--lg" />
                                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Loading notes…</span>
                            </div>
                        ) : (
                            <NoteList
                                notes={notes}
                                courseId={id}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </>
                )}

                {/* ═══════════════ PDFs TAB ═════════════════════════ */}
                {activeTab === 'pdfs' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewingPdf ? '1fr 1fr' : '1fr',
                        gap: '24px',
                        alignItems: 'start'
                    }}>
                        <div>
                            {/* Upload Zone */}
                            <label style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px dashed ${uploading ? 'var(--blue)' : 'var(--border)'}`,
                                borderRadius: 'var(--r-lg)',
                                padding: '36px',
                                cursor: 'pointer',
                                marginBottom: '20px',
                                background: uploading ? 'var(--blue-soft)' : 'var(--surface)',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.background = 'var(--blue-soft)'; } }}
                                onMouseLeave={e => { if (!uploading) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; } }}
                            >
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={handlePdfUpload}
                                    disabled={uploading}
                                />
                                <span style={{ fontSize: '36px', marginBottom: '8px' }}>{uploading ? '⏳' : '📄'}</span>
                                <span style={{ fontWeight: 700, color: 'var(--ink-2)', fontSize: '15px' }}>
                                    {uploading ? 'Uploading…' : 'Click to Upload PDF'}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                                    Textbooks, slides, past papers — max 20MB
                                </span>
                                {uploadError && (
                                    <span style={{ color: 'var(--red)', fontSize: '12px', marginTop: '8px', fontWeight: 500 }}>
                                        {uploadError}
                                    </span>
                                )}
                            </label>

                            {/* PDF List */}
                            {pdfs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px', animation: 'fadeInUp 0.3s var(--ease-out) both' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--ink)', marginBottom: '8px' }}>
                                        No PDFs uploaded yet
                                    </h3>
                                    <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Upload your first PDF above</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {pdfs.map(pdf => (
                                        <PdfItem
                                            key={pdf.id}
                                            pdf={pdf}
                                            viewingPdf={viewingPdf}
                                            setViewingPdf={setViewingPdf}
                                            summarizingPdf={summarizingPdf}
                                            onSummarize={handlePdfSummarize}
                                            onDelete={handlePdfDelete}
                                            summary={pdfSummaries[pdf.id] || pdf.summary}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PDF Viewer */}
                        {viewingPdf && (
                            <div style={{
                                position: 'sticky',
                                top: '80px',
                                background: 'var(--surface)',
                                borderRadius: 'var(--r-lg)',
                                border: '1.5px solid var(--border)',
                                overflow: 'hidden',
                                boxShadow: 'var(--s3)',
                                animation: 'scaleIn 0.2s var(--ease-out) both',
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'var(--sunken)',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        📄 {pdfs.find(p => p.id === viewingPdf)?.original_name}
                                    </span>
                                    <button
                                        onClick={() => setViewingPdf(null)}
                                        style={{
                                            width: '28px', height: '28px', borderRadius: 'var(--r-sm)', border: 'none',
                                            background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'var(--muted)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.13s ease',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <iframe
                                    src={`${API}/uploads/${pdfs.find(p => p.id === viewingPdf)?.filename}`}
                                    title="PDF Viewer"
                                    style={{ width: '100%', height: 'calc(100vh - 160px)', border: 'none' }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

function PdfItem({ pdf, viewingPdf, setViewingPdf, summarizingPdf, onSummarize, onDelete, summary }) {
    const [hovered, setHovered] = useState(false);
    const isViewing = viewingPdf === pdf.id;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: isViewing ? 'var(--blue-soft)' : 'var(--surface)',
                border: `1.5px solid ${isViewing ? 'var(--blue)' : hovered ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: 'var(--r-md)',
                padding: '18px 22px',
                transition: 'all 0.17s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: 700, fontSize: '14px', color: 'var(--ink)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                        {pdf.original_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--subtle)', marginTop: '2px' }}>
                        {(pdf.size / 1024 / 1024).toFixed(2)} MB · {new Date(pdf.uploaded_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <Button
                    variant={isViewing ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewingPdf(isViewing ? null : pdf.id)}
                >
                    {isViewing ? '✕ Close' : '👁️ View'}
                </Button>
                <Button
                    variant="ai"
                    size="sm"
                    onClick={() => onSummarize(pdf.id)}
                    disabled={summarizingPdf === pdf.id}
                    loading={summarizingPdf === pdf.id}
                >
                    {summarizingPdf === pdf.id ? 'Summarizing…' : '✨ Summarize'}
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(pdf.id)}>
                    🗑️ Delete
                </Button>
            </div>

            {/* AI Summary */}
            {summary && (
                <div style={{
                    background: 'linear-gradient(135deg, var(--purple-soft), var(--blue-soft))',
                    border: '1.5px solid #ddd6fe',
                    borderRadius: 'var(--r)',
                    padding: '16px',
                    marginTop: '14px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--purple)', marginBottom: '10px', fontSize: '13px' }}>
                        ✨ AI Summary
                    </div>
                    {summary.split('\n').filter(l => l.trim()).map((line, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px',
                            color: 'var(--ink-2)', lineHeight: 1.6,
                            animation: `bulletStagger 0.3s var(--ease-out) ${i * 0.05}s both`,
                        }}>
                            <span style={{ color: 'var(--purple)', flexShrink: 0 }}>✦</span>
                            <span>{line.replace(/^•\s*/, '')}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CoursePage;
