import React, { useState } from 'react';

const paddingMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
};

export default function Card({
    padding = 'md',
    hover = false,
    bordered = true,
    children,
    style,
    onClick,
    ...props
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--surface)',
                border: bordered ? `1.5px solid ${hovered && hover ? 'var(--blue)' : 'var(--border)'}` : 'none',
                borderRadius: 'var(--r-lg)',
                padding: paddingMap[padding] || paddingMap.md,
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                ...(hover && hovered ? {
                    transform: 'translateY(-4px)',
                    boxShadow: 'var(--s4)',
                } : {}),
                ...(onClick ? { cursor: 'pointer' } : {}),
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
}
