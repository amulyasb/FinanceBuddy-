import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Wallet } from 'lucide-react'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#f8fafc',
                gap: 16,
            }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                    marginBottom: 4,
                }}>
                    <Wallet size={24} color="white" />
                </div>
                <div style={{
                    width: 32, height: 32,
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                }} />
                <p style={{
                    color: '#94a3b8', fontSize: '0.85rem',
                    fontWeight: 500, fontFamily: "'Inter', sans-serif",
                }}>
                    Loading your workspace...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (!user) return <Navigate to="/auth" replace />
    return children
}