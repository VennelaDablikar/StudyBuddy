import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
}

const variantStyles = {
    success: { background: 'var(--green-soft)', color: 'var(--green)', border: '1.5px solid #a7f3d0', icon: '✓' },
    error: { background: 'var(--red-soft)', color: 'var(--red)', border: '1.5px solid #fecaca', icon: '✕' },
    info: { background: 'var(--blue-soft)', color: 'var(--blue)', border: '1.5px solid #bfdbfe', icon: 'ℹ' },
};

function ToastItem({ toast, onDismiss }) {
    const v = variantStyles[toast.variant] || variantStyles.info;
    const [exiting, setExiting] = React.useState(false);

    React.useEffect(() => {
        const t = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 3000);
        return () => clearTimeout(t);
    }, [toast.id, onDismiss]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: 'var(--r-md)',
            background: v.background,
            color: v.color,
            border: v.border,
            boxShadow: 'var(--s4)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            animation: exiting ? 'toastSlideOut 0.3s ease forwards' : 'toastSlideIn 0.3s var(--ease-out) both',
            minWidth: '280px',
            maxWidth: '400px',
        }}>
            <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: v.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
            }}>
                {v.icon}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
                onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: v.color,
                    opacity: 0.6,
                    fontSize: '16px',
                    padding: '2px',
                }}
            >
                ✕
            </button>
        </div>
    );
}

let toastIdCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, variant = 'info') => {
        const id = ++toastIdCounter;
        setToasts(prev => [...prev, { id, message, variant }]);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback({
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    }, [addToast]);

    // Fix: useCallback can't return object, use useMemo pattern
    const toastMethods = React.useMemo(() => ({
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    }), [addToast]);

    return (
        <ToastContext.Provider value={toastMethods}>
            {children}
            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '8px',
            }}>
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
