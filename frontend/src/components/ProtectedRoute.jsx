import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontSize: '18px', color: '#6b7280'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px', height: '40px', border: '3px solid #e5e7eb',
                        borderTop: '3px solid #2563eb', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 12px'
                    }} />
                    Loading...
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
}
