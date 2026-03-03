import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, User, Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react'

const features = [
    { Icon: TrendingUp, label: 'Real-time Balance Tracking' },
    { Icon: Shield, label: 'Secure & Private Data' },
    { Icon: Zap, label: 'Powerful Analytics' },
]

const labelStyle = {
    fontSize: '0.82rem', fontWeight: 600,
    color: '#374151', display: 'block',
}

const inputStyle = {
    width: '100%',
    padding: '11px 13px 11px 40px',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: '0.9rem',
    color: '#1e293b', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
}

export default function Auth() {
    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()
    const [mode, setMode] = useState('login')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState({ email: '', password: '', fullName: '' })

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        if (mode === 'login') {
            const { error } = await signIn(form.email, form.password)
            if (error) toast.error(error.message)
            else { toast.success('Welcome back!'); navigate('/') }
        } else {
            if (!form.fullName.trim()) {
                toast.error('Please enter your full name')
                setLoading(false)
                return
            }
            const { data, error } = await signUp(form.email, form.password, form.fullName)
            if (error) toast.error(error.message)
            else if (data.user && data.session) {
                toast.success('Account created! Welcome!')
                navigate('/')
            } else {
                toast.success('Account created! Please check your email to verify.')
                setMode('login')
            }
        }
        setLoading(false)
    }

    const onFocus = (e) => {
        e.target.style.borderColor = '#93c5fd'
        e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
    }
    const onBlur = (e) => {
        e.target.style.borderColor = '#e5e7eb'
        e.target.style.boxShadow = 'none'
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'stretch',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            {/* Left Panel */}
            <div className="auth-left-panel" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 56px',
                background: 'linear-gradient(145deg, #1e3a8a 0%, #1e40af 40%, #3b82f6 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{
                    position: 'absolute', top: -140, right: -140,
                    width: 420, height: 420, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: -100, left: -100,
                    width: 340, height: 340, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', top: '45%', right: '8%',
                    width: 180, height: 180, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', maxWidth: 460 }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
                        <div style={{
                            width: 50, height: 50, borderRadius: 15,
                            background: 'rgba(255,255,255,0.18)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Wallet size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                                FinanceBuddy
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>
                                BUSINESS FINANCE
                            </div>
                        </div>
                    </div>

                    <h1 style={{
                        fontSize: '2.7rem', fontWeight: 800,
                        color: '#fff', lineHeight: 1.18, marginBottom: 18,
                    }}>
                        Your Business.<br />
                        Your Finances.
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.72)', fontSize: '1rem',
                        lineHeight: 1.8, marginBottom: 48,
                    }}>
                        Track every transaction, analyze cash flow, and generate
                        professional statements — all in one place.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {features.map(({label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 11,
                                    background: 'rgba(255,255,255,0.14)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Icon size={18} color="white" />
                                </div>
                                <span style={{
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.92rem', fontWeight: 500,
                                }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-right-panel" style={{
                width: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 36px',
                background: '#fff',
                boxShadow: '-4px 0 40px rgba(0,0,0,0.06)',
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>

                    {/* Mobile Brand */}
                    <div className="auth-mobile-brand" style={{
                        display: 'none', alignItems: 'center',
                        gap: 10, marginBottom: 36,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 13,
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        }}>
                            <Wallet size={21} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>FinanceBuddy</div>
                            <div style={{ fontSize: '0.63rem', color: '#94a3b8', letterSpacing: '0.08em' }}>BUSINESS FINANCE</div>
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: '1.75rem', fontWeight: 800,
                        color: '#1e293b', marginBottom: 6,
                    }}>
                        {mode === 'login' ? 'Welcome back 👋' : 'Create account'}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 32 }}>
                        {mode === 'login'
                            ? 'Sign in to continue to your dashboard'
                            : 'Start managing your finances today'}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {mode === 'register' && (
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <div style={{ position: 'relative', marginTop: 7 }}>
                                    <User size={15} style={{
                                        position: 'absolute', left: 13, top: '50%',
                                        transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none',
                                    }} />
                                    <input
                                        name="fullName" type="text"
                                        placeholder="John Doe"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: 'relative', marginTop: 7 }}>
                                <Mail size={15} style={{
                                    position: 'absolute', left: 13, top: '50%',
                                    transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none',
                                }} />
                                <input
                                    name="email" type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative', marginTop: 7 }}>
                                <Lock size={15} style={{
                                    position: 'absolute', left: 13, top: '50%',
                                    transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none',
                                }} />
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={6} required
                                    style={{ ...inputStyle, paddingRight: 44 }}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 13, top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', color: '#9ca3af',
                                        display: 'flex', padding: 0,
                                        transition: 'color 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            style={{
                                width: '100%', padding: '13px',
                                marginTop: 4,
                                background: loading
                                    ? '#93c5fd'
                                    : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                color: '#fff', border: 'none',
                                borderRadius: 11, fontSize: '0.95rem', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.92' }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 16, height: 16,
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                    Processing...
                                </>
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: 12, margin: '24px 0',
                    }}>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                        <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        </span>
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login')
                                setForm({ email: '', password: '', fullName: '' })
                            }}
                            style={{
                                background: 'none', border: 'none',
                                cursor: 'pointer', color: '#3b82f6',
                                fontWeight: 700, fontSize: '0.875rem',
                                textDecoration: 'underline',
                                textUnderlineOffset: 2,
                            }}
                        >
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>

                    <p style={{
                        textAlign: 'center', marginTop: 32,
                        fontSize: '0.75rem', color: '#d1d5db',
                    }}>
                        © 2026 FinanceBuddy. All rights reserved.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    .auth-left-panel { display: none !important; }
                    .auth-right-panel {
                        width: 100% !important;
                        padding: 32px 20px !important;
                        box-shadow: none !important;
                        background: #f8fafc !important;
                    }
                    .auth-mobile-brand { display: flex !important; }
                }
                @media (max-width: 480px) {
                    .auth-right-panel { padding: 24px 16px !important; }
                }
            `}</style>
        </div>
    )
}