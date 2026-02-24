import React from 'react';

const colorMap = {
    blue: { bg: 'var(--blue-soft)', color: 'var(--blue)', border: '#bfdbfe' },
    green: { bg: 'var(--green-soft)', color: 'var(--green)', border: '#a7f3d0' },
    red: { bg: 'var(--red-soft)', color: 'var(--red)', border: '#fecaca' },
    purple: { bg: 'var(--purple-soft)', color: 'var(--purple)', border: '#ddd6fe' },
    gold: { bg: 'var(--gold-soft)', color: 'var(--gold)', border: '#fde68a' },
    muted: { bg: 'var(--sunken)', color: 'var(--muted)', border: 'var(--border)' },
};

const sizeMap = {
    sm: { fontSize: '11px', padding: '2px 9px', fontWeight: 600 },
    md: { fontSize: '12px', padding: '4px 12px', fontWeight: 600 },
};

export default function Badge({ variant = 'blue', size = 'sm', children, style }) {
    const c = colorMap[variant] || colorMap.blue;
    const s = sizeMap[size] || sizeMap.sm;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            borderRadius: '20px',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
            background: c.bg,
            color: c.color,
            ...s,
            ...style,
        }}>
            {children}
        </span>
    );
}
