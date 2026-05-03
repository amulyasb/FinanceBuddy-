import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, Wallet, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user } = useAuth()

    const displayName = user?.user_metadata?.full_name
        || user?.email?.split('@')[0]
        || 'User'

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#f8fafc',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div style={{
                flex: 1,
                marginLeft: 240,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s ease',
            }}
                className="main-content"
            >
                {/* Mobile Top Bar */}
                <header
                    className="mobile-header"
                    style={{
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#ffffff',
                        position: 'sticky', top: 0, zIndex: 30,
                        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    }}
                >
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            background: '#f1f5f9',
                            border: '1px solid #e5e7eb',
                            borderRadius: 9,
                            color: '#374151',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Menu size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Wallet size={14} color="white" />
                        </div>
                        <span style={{
                            fontWeight: 800, fontSize: '0.9rem',
                            color: '#1e293b',
                        }}>
                            FinanceBuddy
                        </span>
                    </div>

                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 800, color: 'white',
                            boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
                        }}>
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    </Link>
                </header>

                {/* Desktop Top Bar */}
                <header
                    className="desktop-header"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '14px 32px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#ffffff',
                        position: 'sticky', top: 0, zIndex: 30,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                        gap: 12,
                    }}
                >
                    <div style={{
                        fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500,
                    }}>
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long', year: 'numeric',
                            month: 'long', day: 'numeric'
                        })}
                    </div>

                    <div style={{
                        width: 1, height: 20,
                        background: '#e5e7eb', margin: '0 4px',
                    }} />

                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 12px',
                            background: '#f8fafc',
                            border: '1px solid #e5e7eb',
                            borderRadius: 10,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                        >
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.65rem', fontWeight: 800, color: 'white',
                                flexShrink: 0,
                            }}>
                                {displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{
                                fontSize: '0.8rem', fontWeight: 600,
                                color: '#1e293b',
                            }}>
                                {displayName}
                            </span>
                        </div>
                    </Link>
                </header>

                {/* Page Content */}
                <main
                    style={{ flex: 1, padding: '28px 32px' }}
                    className="page-content"
                >
                    <Outlet />
                </main>

                {/* Footer */}
                <footer style={{
                    padding: '14px 32px',
                    borderTop: '1px solid #e5e7eb',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
                    className="app-footer"
                >
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 500 }}>
                        © 2026 FinanceBuddy. All rights reserved.
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                        v1.0.0
                    </span>
                </footer>
            </div>

            <style>{`
                @media (max-width: 1023px) {
                    .main-content { margin-left: 0 !important; }
                    .mobile-header { display: flex !important; }
                    .desktop-header { display: none !important; }
                    .page-content { padding: 16px !important; }
                    .app-footer { padding: 12px 16px !important; }
                }
                @media (max-width: 480px) {
                    .page-content { padding: 12px !important; }
                }
            `}</style>
        </div>
    )
}