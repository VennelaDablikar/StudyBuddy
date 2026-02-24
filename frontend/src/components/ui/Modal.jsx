import React, { useEffect, useCallback } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = '480px' }) {
    const handleKey = useCallback((e) => {
        if (e.key === 'Escape') onClose?.();
    }, [onClose]);

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKey);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [open, handleKey]);

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                animation: 'overlayIn 0.2s ease both',
            }}
            onClick={onClose}
        >
            {/* Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
            }} />

            {/* Card */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'relative',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-xl)',
                    padding: '36px',
                    maxWidth,
                    width: '100%',
                    boxShadow: 'var(--s5)',
                    animation: 'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--r-sm)',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: 'var(--subtle)',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--sunken)'; e.currentTarget.style.color = 'var(--ink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--subtle)'; }}
                >
                    ✕
                </button>

                {title && (
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '24px',
                        color: 'var(--ink)',
                        marginBottom: '24px',
                        paddingRight: '32px',
                    }}>
                        {title}
                    </h2>
                )}

                {children}
            </div>
        </div>
    );
}
