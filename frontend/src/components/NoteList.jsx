// components/NoteList.jsx — Redesigned note list with hover states and badges
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from './ui/Badge';

function NoteItem({ note, courseId, onEdit, onDelete }) {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);

    const preview = note.body
        ? note.body.replace(/[#*`_\[\]]/g, '').slice(0, 120) + (note.body.length > 120 ? '…' : '')
        : 'No content yet';

    return (
        <div
            onClick={() => navigate(`/courses/${courseId}/notes/${note.id}`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/courses/${courseId}/notes/${note.id}`)}
            style={{
                background: 'var(--surface)',
                border: `1.5px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: 'var(--r-md)',
                padding: '18px 22px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.17s ease',
                transform: hovered ? 'translateX(3px)' : 'none',
                boxShadow: hovered ? 'var(--s2)' : 'none',
                marginBottom: '10px',
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-body)',
                }}>
                    {note.title}
                </p>
                <p style={{
                    fontSize: '13px',
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '8px',
                }}>
                    {preview}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--subtle)' }}>
                        {note.created_at ? new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                    {note.summary && (
                        <Badge variant="purple" size="sm">✨ AI Summary</Badge>
                    )}
                    {note.is_reviewed === 1 && (
                        <Badge variant="green" size="sm">✅ Reviewed</Badge>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: 'flex',
                    gap: '6px',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                    flexShrink: 0,
                }}
            >
                <button
                    onClick={() => onEdit(note)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--muted)',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={() => onDelete(note)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid #fecaca',
                        background: 'var(--red-soft)',
                        color: 'var(--red)',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s ease',
                    }}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}

export default function NoteList({ notes, courseId, onEdit, onDelete }) {
    if (notes.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                animation: 'fadeInUp 0.3s var(--ease-out) both',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    color: 'var(--ink)',
                    marginBottom: '8px',
                }}>
                    No notes yet
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--muted)' }}>
                    Add your first note to start capturing your study material.
                </p>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeInUp 0.3s var(--ease-out) both' }}>
            {notes.map((note) => (
                <NoteItem
                    key={note.id}
                    note={note}
                    courseId={courseId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
