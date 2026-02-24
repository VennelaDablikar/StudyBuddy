// components/SearchBar.jsx — Redesigned search with ⌘K hint and styled dropdown
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ courses: [], notes: [], pdfs: [] });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ⌘K shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults({ courses: [], notes: [], pdfs: [] });
            setOpen(false);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API}/courses/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
                setOpen(true);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const totalResults = results.courses.length + results.notes.length + results.pdfs.length;

    const handleResultClick = (type, item) => {
        setOpen(false);
        setQuery('');
        if (type === 'course') navigate(`/courses/${item.id}`);
        if (type === 'note') navigate(`/courses/${item.course_id}/notes/${item.id}`);
        if (type === 'pdf') navigate(`/courses/${item.course_id}`);
    };

    const highlight = (text) => {
        if (!text) return '';
        return text.length > 80 ? text.substring(0, 80) + '…' : text;
    };

    const ResultItem = ({ onClick, children }) => (
        <div
            onClick={onClick}
            style={{
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                transition: 'background 0.13s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sunken)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {children}
        </div>
    );

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
                <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '14px',
                    pointerEvents: 'none',
                    color: focused ? 'var(--blue)' : 'var(--subtle)',
                    transition: 'color 0.15s ease',
                }}>
                    🔍
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => { setFocused(true); if (totalResults > 0) setOpen(true); }}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
                    placeholder="Search courses, notes, PDFs…"
                    style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 60px 0 38px',
                        borderRadius: 'var(--r)',
                        border: `1.5px solid ${focused ? 'var(--blue)' : 'var(--border)'}`,
                        fontSize: '14px',
                        outline: 'none',
                        background: focused ? 'var(--surface)' : 'var(--sunken)',
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s ease',
                        boxShadow: focused ? '0 0 0 3px var(--blue-glow)' : 'none',
                        boxSizing: 'border-box',
                    }}
                />
                {/* ⌘K hint */}
                {!query && (
                    <span style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--subtle)',
                        background: 'var(--ground)',
                        border: '1px solid var(--border)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-body)',
                        pointerEvents: 'none',
                    }}>
                        ⌘K
                    </span>
                )}
                {loading && (
                    <span style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}>
                        <span className="sb-spinner sb-spinner--sm" />
                    </span>
                )}
            </div>

            {/* Results Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    boxShadow: 'var(--s4)',
                    zIndex: 1000,
                    maxHeight: '420px',
                    overflowY: 'auto',
                    animation: 'dropdownIn 0.15s var(--ease-out) both',
                    transformOrigin: 'top center',
                }}>
                    {totalResults === 0 ? (
                        <div style={{
                            padding: '28px',
                            textAlign: 'center',
                            color: 'var(--subtle)',
                            fontSize: '14px',
                        }}>
                            No results for "{query}"
                        </div>
                    ) : (
                        <div style={{ padding: '8px' }}>
                            {/* Courses */}
                            {results.courses.length > 0 && (
                                <>
                                    <div className="section-label" style={{ padding: '6px 14px 2px', margin: 0, fontSize: '10px' }}>
                                        📚 Courses ({results.courses.length})
                                    </div>
                                    {results.courses.map(course => (
                                        <ResultItem key={course.id} onClick={() => handleResultClick('course', course)}>
                                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{course.name}</div>
                                            {course.description && (
                                                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{highlight(course.description)}</div>
                                            )}
                                        </ResultItem>
                                    ))}
                                </>
                            )}

                            {results.courses.length > 0 && results.notes.length > 0 && (
                                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 8px' }} />
                            )}

                            {/* Notes */}
                            {results.notes.length > 0 && (
                                <>
                                    <div className="section-label" style={{ padding: '6px 14px 2px', margin: 0, fontSize: '10px' }}>
                                        📝 Notes ({results.notes.length})
                                    </div>
                                    {results.notes.map(note => (
                                        <ResultItem key={note.id} onClick={() => handleResultClick('note', note)}>
                                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{note.title}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <span style={{
                                                    background: 'var(--blue-soft)',
                                                    color: 'var(--blue)',
                                                    padding: '1px 8px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                }}>
                                                    {note.course_name}
                                                </span>
                                                <span>{highlight(note.body)}</span>
                                            </div>
                                        </ResultItem>
                                    ))}
                                </>
                            )}

                            {results.notes.length > 0 && results.pdfs.length > 0 && (
                                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 8px' }} />
                            )}

                            {/* PDFs */}
                            {results.pdfs.length > 0 && (
                                <>
                                    <div className="section-label" style={{ padding: '6px 14px 2px', margin: 0, fontSize: '10px' }}>
                                        📄 PDFs ({results.pdfs.length})
                                    </div>
                                    {results.pdfs.map(pdf => (
                                        <ResultItem key={pdf.id} onClick={() => handleResultClick('pdf', pdf)}>
                                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{pdf.original_name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                                                <span style={{
                                                    background: 'var(--green-soft)',
                                                    color: 'var(--green)',
                                                    padding: '1px 8px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                }}>
                                                    {pdf.course_name}
                                                </span>
                                            </div>
                                        </ResultItem>
                                    ))}
                                </>
                            )}

                            {/* Footer */}
                            <div style={{
                                borderTop: '1px solid var(--border)',
                                padding: '8px 14px',
                                fontSize: '12px',
                                color: 'var(--subtle)',
                                textAlign: 'center',
                                marginTop: '4px',
                            }}>
                                {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
