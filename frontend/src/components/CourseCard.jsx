// components/CourseCard.jsx — Redesigned course card with color stripe & progress
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ui/ProgressBar';

const gradients = [
    'linear-gradient(90deg, #2563eb, #0ea5e9)',
    'linear-gradient(90deg, #7c3aed, #6366f1)',
    'linear-gradient(90deg, #059669, #0ea5e9)',
    'linear-gradient(90deg, #d97706, #f59e0b)',
    'linear-gradient(90deg, #dc2626, #f43f5e)',
    'linear-gradient(90deg, #0891b2, #06b6d4)',
];

const iconBgs = [
    { bg: 'var(--blue-soft)', color: 'var(--blue)' },
    { bg: 'var(--purple-soft)', color: 'var(--purple)' },
    { bg: 'var(--green-soft)', color: 'var(--green)' },
    { bg: 'var(--gold-soft)', color: 'var(--gold)' },
    { bg: 'var(--red-soft)', color: 'var(--red)' },
    { bg: '#ecfeff', color: '#0891b2' },
];

const courseIcons = ['📚', '🧬', '💻', '📐', '🎨', '🧪', '📖', '🌍'];

export default function CourseCard({ course, onEdit, onDelete, progress }) {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);

    const idx = (course.id || 0) % gradients.length;
    const gradient = gradients[idx];
    const icon = iconBgs[idx];
    const emoji = courseIcons[course.id % courseIcons.length];

    const reviewed = progress?.reviewed || 0;
    const total = progress?.total || 0;
    const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/courses/${course.id}`)}
            style={{
                background: 'var(--surface)',
                border: `1.5px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: hovered ? 'translateY(-4px)' : 'none',
                boxShadow: hovered ? 'var(--s4)' : 'none',
            }}
        >
            {/* Color stripe */}
            <div style={{ height: '4px', background: gradient }} />

            {/* Card body */}
            <div style={{ padding: '24px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '13px',
                    background: icon.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    marginBottom: '16px',
                }}>
                    {emoji}
                </div>

                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    color: 'var(--ink)',
                    marginBottom: '6px',
                    lineHeight: 1.3,
                }}>
                    {course.name}
                </h3>

                {course.description && (
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        lineHeight: 1.6,
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {course.description}
                    </p>
                )}

                {/* Progress */}
                {total > 0 && (
                    <div style={{ marginTop: course.description ? '0' : '16px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                        }}>
                            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>Progress</span>
                            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{reviewed} of {total} reviewed</span>
                        </div>
                        <ProgressBar value={pct} color={gradient} />
                        {pct >= 100 && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--green)',
                                marginTop: '8px',
                            }}>
                                ✅ Complete!
                            </span>
                        )}
                    </div>
                )}

                {/* Note count badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '16px',
                }}>
                    <span style={{
                        fontSize: '12px',
                        background: 'var(--sunken)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        color: 'var(--muted)',
                        fontWeight: 500,
                    }}>
                        📝 {course.note_count || 0} notes
                    </span>
                    {(course.pdf_count > 0) && (
                        <span style={{
                            fontSize: '12px',
                            background: 'var(--sunken)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            color: 'var(--muted)',
                            fontWeight: 500,
                        }}>
                            📄 {course.pdf_count} PDFs
                        </span>
                    )}
                </div>
            </div>

            {/* Card footer */}
            <div style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                    {course.note_count || 0} notes · {course.pdf_count || 0} PDFs
                </span>
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        display: 'flex',
                        gap: '4px',
                        opacity: hovered ? 1 : 0,
                        transition: 'opacity 0.15s ease',
                    }}
                >
                    <button
                        onClick={() => onEdit(course)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--r-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--muted)',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={() => onDelete(course)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--r-sm)',
                            border: '1px solid #fecaca',
                            background: 'var(--red-soft)',
                            color: 'var(--red)',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}
