import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
    LayoutDashboard, ArrowLeftRight, BarChart3,
    FileText, LogOut, Wallet, Package, X
} from 'lucide-react'

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/categories', label: 'Categories', icon: Package },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/statements', label: 'Statements', icon: FileText },
]

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await logout()
        navigate('/auth')
    }

    const email = user?.email || ''
    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.slice(0, 2).toUpperCase()
        : email.slice(0, 2).toUpperCase()
    const displayName = user?.user_metadata?.full_name || email.split('@')[0]

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        zIndex: 40,
                        backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            <aside style={{
                position: 'fixed',
                top: 0, left: 0,
                height: '100vh',
                width: 240,
                background: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                boxShadow: '2px 0 16px rgba(0,0,0,0.06)',
                transition: 'transform 0.3s ease',
            }}
                className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
            >
                {/* Logo */}
                <div style={{
                    padding: '22px 20px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
                            flexShrink: 0,
                        }}>
                            <Wallet size={18} color="white" />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.95rem', fontWeight: 800,
                                color: '#1e293b', lineHeight: 1.1,
                            }}>
                                FinanceBuddy
                            </div>
                            <div style={{
                                fontSize: '0.62rem', color: '#94a3b8',
                                marginTop: 2, letterSpacing: '0.06em',
                            }}>
                                BUSINESS FINANCE
                            </div>
                        </div>
                    </div>

                    {/* Close btn (mobile only) */}
                    <button
                        onClick={onClose}
                        className="sidebar-close-btn"
                        style={{
                            display: 'none',
                            background: '#f1f5f9',
                            border: 'none', borderRadius: 8,
                            padding: 6, cursor: 'pointer',
                            color: '#64748b',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Nav Label */}
                <div style={{
                    padding: '16px 20px 8px',
                }}>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700,
                        color: '#cbd5e1', letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Navigation
                    </span>
                </div>

                {/* Nav Items */}
                <nav style={{
                    flex: 1,
                    padding: '0 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    overflowY: 'auto',
                }}>
                    {navItems.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={onClose}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 10,
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#1e40af' : '#64748b',
                                background: isActive
                                    ? 'linear-gradient(135deg, #eff6ff, #dbeafe)'
                                    : 'transparent',
                                border: isActive
                                    ? '1px solid #bfdbfe'
                                    : '1px solid transparent',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                            })}
                            onMouseEnter={e => {
                                if (!e.currentTarget.style.background.includes('gradient')) {
                                    e.currentTarget.style.background = '#f8fafc'
                                    e.currentTarget.style.color = '#1e293b'
                                }
                            }}
                            onMouseLeave={e => {
                                if (!e.currentTarget.style.background.includes('gradient')) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = '#64748b'
                                }
                            }}
                        >
                            {({ isActive }) => {
                                const item = navItems.find(i => i.to === to);
                                const IconComponent = item?.icon;
                                return (
                                    <>
                                        <div style={{
                                            width: 30, height: 30, borderRadius: 8,
                                            background: isActive ? '#dbeafe' : '#f1f5f9',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'background 0.15s',
                                        }}>
                                            <IconComponent size={15} color={isActive ? '#1e40af' : '#94a3b8'} />
                                        </div>
                                        <span style={{ flex: 1 }}>{label}</span>
                                        {isActive && (
                                            <div style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: '#3b82f6',
                                            }} />
                                        )}
                                    </>
                                );
                            }}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom: User + Signout */}
                <div style={{
                    padding: '14px 12px 18px',
                    borderTop: '1px solid #f1f5f9',
                }}>
                    {/* User Info */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        marginBottom: 8,
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 800, color: 'white',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
                        }}>
                            {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: '0.8rem', fontWeight: 700,
                                color: '#1e293b',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {displayName}
                            </div>
                            <div style={{
                                fontSize: '0.65rem', color: '#94a3b8',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {email}
                            </div>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 8,
                            padding: '9px 14px',
                            borderRadius: 10,
                            border: '1px solid #fecaca',
                            background: '#fff5f5',
                            color: '#ef4444',
                            fontSize: '0.83rem', fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#fee2e2'
                            e.currentTarget.style.borderColor = '#fca5a5'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = '#fff5f5'
                            e.currentTarget.style.borderColor = '#fecaca'
                        }}
                    >
                        <LogOut size={15} />
                        Sign Out
                    </button>
                </div>
            </aside>

            <style>{`
                .sidebar {
                    font-family: 'Inter', -apple-system, sans-serif;
                }
                @media (min-width: 1024px) {
                    .sidebar {
                        transform: translateX(0) !important;
                    }
                }
                @media (max-width: 1023px) {
                    .sidebar {
                        transform: translateX(-100%);
                        box-shadow: 4px 0 24px rgba(0,0,0,0.1);
                    }
                    .sidebar-open {
                        transform: translateX(0) !important;
                    }
                    .sidebar-close-btn {
                        display: flex !important;
                    }
                }
            `}</style>
        </>
    )
}