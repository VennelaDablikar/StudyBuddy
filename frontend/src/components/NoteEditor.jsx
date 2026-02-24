// components/NoteEditor.jsx — Redesigned editor with toolbar + word count
import React, { useState, useEffect, useMemo } from 'react';
import Button from './ui/Button';

function NoteEditor({ initialTitle = '', initialBody = '', onSave, onCancel, isLoading, submitLabel = 'Save Note' }) {
    const [title, setTitle] = useState(initialTitle);
    const [body, setBody] = useState(initialBody);
    const [error, setError] = useState('');
    const [titleFocused, setTitleFocused] = useState(false);

    useEffect(() => {
        setTitle(initialTitle);
        setBody(initialBody);
        setError('');
    }, [initialTitle, initialBody]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Please enter a note title.');
            return;
        }
        setError('');
        onSave({ title: title.trim(), body: body.trim() });
    };

    const wordCount = useMemo(() => {
        const words = body.trim().split(/\s+/).filter(w => w.length > 0).length;
        const readTime = Math.max(1, Math.ceil(words / 200));
        return { words, readTime };
    }, [body]);

    return (
        <form onSubmit={handleSubmit} noValidate style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '32px 36px',
            animation: 'fadeInUp 0.3s var(--ease-out) both',
        }}>
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

            {/* Title input */}
            <input
                type="text"
                placeholder="Untitled note..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                autoFocus
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                style={{
                    width: '100%',
                    border: 'none',
                    borderBottom: `2px solid ${titleFocused ? 'var(--blue)' : 'var(--border)'}`,
                    background: 'none',
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    color: 'var(--ink)',
                    padding: '0 0 12px 0',
                    marginBottom: '24px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box',
                }}
            />

            {/* Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                    {['B', 'I', '<>', 'H'].map((btn, i) => (
                        <button
                            key={i}
                            type="button"
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '5px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--muted)',
                                fontSize: '12px',
                                fontWeight: btn === 'B' ? 700 : 500,
                                fontStyle: btn === 'I' ? 'italic' : 'normal',
                                fontFamily: btn === '<>' ? 'monospace' : 'var(--font-body)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.13s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sunken)'; e.currentTarget.style.color = 'var(--ink)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
                        >
                            {btn === '<>' ? '{ }' : btn}
                        </button>
                    ))}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>Markdown supported</span>
            </div>

            {/* Textarea */}
            <textarea
                placeholder="Write your study notes here… Markdown is supported!"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={isLoading}
                rows={12}
                style={{
                    width: '100%',
                    minHeight: '360px',
                    background: 'var(--sunken)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r)',
                    padding: '16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    lineHeight: 1.8,
                    color: 'var(--ink)',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.background = 'var(--surface)'; e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-glow)'; }}
                onBlur={e => { e.target.style.background = 'var(--sunken)'; e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />

            {/* Footer */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '16px',
            }}>
                <span style={{ fontSize: '13px', color: 'var(--subtle)' }}>
                    {wordCount.words} words · ~{wordCount.readTime} min read
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        loading={isLoading}
                    >
                        {isLoading ? 'Saving…' : submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default NoteEditor;
