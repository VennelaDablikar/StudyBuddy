import React, { useState } from 'react';

export default function Input({
    label,
    placeholder,
    type = 'text',
    error,
    hint,
    value,
    onChange,
    disabled,
    style,
    inputStyle,
    ...props
}) {
    const [focused, setFocused] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const isPassword = type === 'password';

    return (
        <div style={{ marginBottom: '20px', ...style }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--muted)',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-body)',
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    type={isPassword && showPw ? 'text' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: '100%',
                        height: '46px',
                        padding: isPassword ? '0 40px 0 14px' : '0 14px',
                        border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--blue)' : 'var(--border)'}`,
                        borderRadius: 'var(--r)',
                        background: focused ? 'var(--surface)' : 'var(--surface)',
                        fontSize: '15px',
                        fontFamily: 'var(--font-body)',
                        color: 'var(--ink)',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: focused ? '0 0 0 3px var(--blue-glow)' : 'none',
                        boxSizing: 'border-box',
                        ...inputStyle,
                    }}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        tabIndex={-1}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: 'var(--subtle)',
                            padding: '4px',
                        }}
                    >
                        {showPw ? '🙈' : '👁️'}
                    </button>
                )}
            </div>
            {error && (
                <p style={{
                    fontSize: '13px',
                    color: 'var(--red)',
                    marginTop: '6px',
                    fontFamily: 'var(--font-body)',
                }}>
                    {error}
                </p>
            )}
            {hint && !error && (
                <p style={{
                    fontSize: '12px',
                    color: 'var(--subtle)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-body)',
                }}>
                    {hint}
                </p>
            )}
        </div>
    );
}
