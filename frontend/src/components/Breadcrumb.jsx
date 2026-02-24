// components/Breadcrumb.jsx — Redesigned breadcrumb navigation
import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            animation: 'fadeIn 0.3s ease both',
        }}>
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <span style={{
                                color: 'var(--subtle)',
                                fontSize: '12px',
                                userSelect: 'none',
                            }}>
                                /
                            </span>
                        )}
                        {item.path && !isLast ? (
                            <Link
                                to={item.path}
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: 'var(--muted)',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--font-body)',
                                    transition: 'color 0.15s ease',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--r-sm)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.background = 'var(--blue-soft)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--ink-2)',
                                fontFamily: 'var(--font-body)',
                                padding: '4px 8px',
                            }}>
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
