import React from 'react';

const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    borderRadius: 'var(--r)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.17s ease',
    whiteSpace: 'nowrap',
    position: 'relative',
    letterSpacing: '-0.01em',
};

const sizes = {
    sm: { height: '32px', padding: '0 12px', fontSize: '13px', borderRadius: 'var(--r-sm)' },
    md: { height: '40px', padding: '0 16px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 24px', fontSize: '15px' },
};

const variants = {
    primary: {
        background: 'var(--blue)',
        color: 'white',
        boxShadow: 'var(--s2)',
    },
    outline: {
        background: 'var(--surface)',
        color: 'var(--ink-2)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--s1)',
    },
    ghost: {
        background: 'transparent',
        color: 'var(--muted)',
    },
    danger: {
        background: 'var(--red-soft)',
        color: 'var(--red)',
        border: '1.5px solid #fecaca',
    },
    ai: {
        background: 'linear-gradient(135deg, var(--purple), var(--blue))',
        color: 'white',
        boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
    },
};

const hoverMap = {
    primary: { background: 'var(--blue-hover)', transform: 'translateY(-1px)', boxShadow: 'var(--s3)' },
    outline: { borderColor: 'var(--blue)', color: 'var(--ink)', transform: 'translateY(-1px)', boxShadow: 'var(--s2)' },
    ghost: { background: 'var(--sunken)', color: 'var(--ink)' },
    danger: { background: '#fee2e2', transform: 'translateY(-1px)' },
    ai: { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(124,58,237,0.3)' },
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    style,
    disabled,
    ...props
}) {
    const [hovered, setHovered] = React.useState(false);

    const computedStyle = {
        ...baseStyles,
        ...sizes[size],
        ...variants[variant],
        ...(hovered && !disabled && !loading ? hoverMap[variant] : {}),
        ...(disabled || loading ? { opacity: 0.6, cursor: 'not-allowed', transform: 'none' } : {}),
        ...(loading ? { pointerEvents: 'none' } : {}),
        ...style,
    };

    return (
        <button
            style={computedStyle}
            disabled={disabled || loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
            onMouseUp={e => { if (!disabled) e.currentTarget.style.transform = hovered ? 'translateY(-1px)' : 'none'; }}
            {...props}
        >
            {loading && (
                <span style={{
                    width: size === 'sm' ? '14px' : '16px',
                    height: size === 'sm' ? '14px' : '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'currentColor',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                    flexShrink: 0,
                }} />
            )}
            {icon && !loading && <span style={{ fontSize: size === 'sm' ? '14px' : '16px', flexShrink: 0 }}>{icon}</span>}
            {children}
        </button>
    );
}
