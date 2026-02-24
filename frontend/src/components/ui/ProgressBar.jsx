import React, { useEffect, useState } from 'react';

export default function ProgressBar({
    value = 0,
    color = 'var(--blue)',
    animated = true,
    height = 7,
    style,
}) {
    const [width, setWidth] = useState(animated ? 0 : value);

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => setWidth(value), 200);
            return () => clearTimeout(timer);
        } else {
            setWidth(value);
        }
    }, [value, animated]);

    const clamp = Math.max(0, Math.min(100, width));

    return (
        <div style={{
            width: '100%',
            height: `${height}px`,
            background: 'var(--sunken)',
            borderRadius: '20px',
            overflow: 'hidden',
            ...style,
        }}>
            <div style={{
                height: '100%',
                width: `${clamp}%`,
                background: clamp >= 100 ? 'var(--green)' : color,
                borderRadius: '20px',
                transition: animated ? 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }} />
        </div>
    );
}
