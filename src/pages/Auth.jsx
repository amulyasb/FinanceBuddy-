import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Wallet, Mail, Lock, User, Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react'

const features = [
    { icon: TrendingUp, label: 'Real-time Balance Tracking' },
    { icon: Shield, label: 'Secure & Private Data' },
    { icon: Zap, label: 'Powerful Analytics' },
]

const labelStyle = {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#374151',
    display: 'block',
    marginBottom: '7px',
}

const inputStyle = {
    width: '100%',
    padding: '11px 13px',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '0.875rem',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    caretColor: '#3b82f6',
}

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState({ email: '', password: '', full_name: '' })
    const [loading, setLoading] = useState(false)
    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (isLogin) {
            const { error } = await signIn(form.email, form.password)
            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Welcome back!')
                navigate('/')
            }
        } else {
            const { error } = await signUp(form.email, form.password, form.full_name)
            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Account created! Please check your email to verify.')
                setIsLogin(true)
            }
        }
        setLoading(false)
    }

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, sans-serif",
            background: '#f8fafc',
        }}>
            {/* Left Panel - Brand & Features */}
            <div className="auth-left-panel" style={{
                flex: '1 1 50%',
                background: 'linear-gradient(145deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 8s ease infinite',
                padding: 'clamp(32px, 6vw, 64px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative Blobs */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    filter: 'blur(80px)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    filter: 'blur(100px)',
                }} />

                {/* Content */}
                <div style={{ position: 'relative', maxWidth: 460 }}>
                    {/* Brand */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 'clamp(28px, 5vw, 40px)',
                    }}>
                        <div style={{
                            width: 'clamp(48px, 10vw, 54px)',
                            height: 'clamp(48px, 10vw, 54px)',
                            borderRadius: 14,
                            background: 'rgba(255,255,255,0.18)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        }}>
                            <Wallet size={26} color="white" />
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                            }}>
                                FinanceBuddy
                            </div>
                            <div style={{
                                fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                                color: 'rgba(255,255,255,0.75)',
                                marginTop: 2,
                                letterSpacing: '0.08em',
                                fontWeight: 600,
                            }}>
                                BUSINESS FINANCE
                            </div>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                        fontWeight: 900,
                        color: 'white',
                        marginBottom: 14,
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                    }}>
                        Manage Your Business Finances with Ease
                    </h1>

                    <p style={{
                        fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                        color: 'rgba(255,255,255,0.85)',
                        lineHeight: 1.7,
                        marginBottom: 'clamp(32px, 6vw, 42px)',
                    }}>
                        Track accounts, monitor transactions, and gain insights into your financial health — all in one powerful platform.
                    </p>

                    {/* Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {features.map(({ icon: IconComponent, label }) => ( // eslint-disable-line no-unused-vars
                            <div key={label} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 11,
                                    background: 'rgba(255,255,255,0.14)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <IconComponent size={18} color="white" />
                                </div>
                                <span style={{
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.92rem',
                                    fontWeight: 500,
                                }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="auth-right-panel" style={{
                flex: '1 1 50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(24px, 5vw, 48px)',
                background: '#ffffff',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 420,
                    padding: 'clamp(28px, 6vw, 40px)',
                    background: '#fff',
                    borderRadius: 'clamp(16px, 3vw, 20px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                }}>
                    {/* Form Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 36px)' }}>
                        <h2 style={{
                            fontSize: 'clamp(1.4rem, 3vw, 1.7rem)',
                            fontWeight: 800,
                            color: '#1e293b',
                            marginBottom: 8,
                            letterSpacing: '-0.02em',
                        }}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p style={{
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                            color: '#64748b',
                            lineHeight: 1.5,
                        }}>
                            {isLogin
                                ? 'Sign in to access your financial dashboard'
                                : 'Get started with your free account today'
                            }
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(16px, 3vw, 20px)',
                    }}>
                        {/* Full Name (signup only) */}
                        {!isLogin && (
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="full_name"
                                        placeholder="John Doe"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            ...inputStyle,
                                            paddingLeft: '42px',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                    <User
                                        size={16}
                                        color="#94a3b8"
                                        style={{
                                            position: 'absolute',
                                            left: 14,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        ...inputStyle,
                                        paddingLeft: '42px',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <Mail
                                    size={16}
                                    color="#94a3b8"
                                    style={{
                                        position: 'absolute',
                                        left: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        ...inputStyle,
                                        paddingLeft: '42px',
                                        paddingRight: '42px',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <Lock
                                    size={16}
                                    color="#94a3b8"
                                    style={{
                                        position: 'absolute',
                                        left: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 4,
                                        display: 'flex',
                                        color: '#94a3b8',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {!isLogin && (
                                <div style={{
                                    fontSize: '0.72rem',
                                    color: '#94a3b8',
                                    marginTop: 6,
                                }}>
                                    Must be at least 6 characters
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: 'clamp(11px, 2.5vw, 13px)',
                                marginTop: 8,
                                borderRadius: 11,
                                border: 'none',
                                background: loading
                                    ? '#93c5fd'
                                    : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                color: '#fff',
                                fontSize: 'clamp(0.9rem, 2vw, 0.95rem)',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)'
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.4)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 16,
                                        height: 16,
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                    {isLogin ? 'Signing in...' : 'Creating account...'}
                                </>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Toggle Link */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: 'clamp(20px, 4vw, 28px)',
                        fontSize: 'clamp(0.82rem, 2vw, 0.88rem)',
                        color: '#64748b',
                    }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setForm({ email: '', password: '', full_name: '' })
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 'inherit',
                                textDecoration: 'underline',
                                padding: 0,
                            }}
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @media (max-width: 1023px) {
                    .auth-left-panel {
                        display: none !important;
                    }
                    .auth-right-panel {
                        flex: 1 !important;
                    }
                }
            `}</style>
        </div>
    )
}
