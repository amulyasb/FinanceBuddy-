import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Shield, Save } from 'lucide-react'

export default function Profile() {
    const { user, updateUser } = useAuth()
    
    const [profileForm, setProfileForm] = useState({
        full_name: ''
    })
    
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    })
    
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [loadingPassword, setLoadingPassword] = useState(false)

    useEffect(() => {
        if (user) {
            setProfileForm({
                full_name: user.user_metadata?.full_name || ''
            })
        }
    }, [user])

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoadingProfile(true)
        const { error } = await updateUser({
            data: { full_name: profileForm.full_name }
        })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Profile updated successfully!')
        }
        setLoadingProfile(false)
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoadingPassword(true)
        const { error } = await updateUser({
            password: passwordForm.newPassword
        })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Password updated successfully!')
            setPasswordForm({ newPassword: '', confirmPassword: '' })
        }
        setLoadingPassword(false)
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 14px 12px 42px',
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '0.9rem',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    }

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '8px',
    }

    const iconStyle = {
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94a3b8',
        pointerEvents: 'none',
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '0 8px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                    Profile Management
                </h1>
                <p style={{ color: '#64748b', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    Manage your account details and security preferences
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Profile Details Card */}
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 'clamp(20px, 4vw, 32px)',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={20} color="#3b82f6" />
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.2rem)', fontWeight: 700, color: '#0f172a' }}>Personal Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gap: 20 }}>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ ...inputStyle, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
                                />
                                <Mail size={18} style={iconStyle} />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 6 }}>
                                Email cannot be changed here.
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={profileForm.full_name}
                                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    required
                                />
                                <User size={18} style={iconStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button
                                type="submit"
                                disabled={loadingProfile}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 20px',
                                    background: loadingProfile ? '#93c5fd' : '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: loadingProfile ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <Save size={16} />
                                {loadingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Card */}
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 'clamp(20px, 4vw, 32px)',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Shield size={20} color="#ef4444" />
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.2rem)', fontWeight: 700, color: '#0f172a' }}>Security</h2>
                    </div>

                    <form onSubmit={handlePasswordUpdate} style={{ display: 'grid', gap: 20 }}>
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                                <Lock size={18} style={iconStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                />
                                <Lock size={18} style={iconStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button
                                type="submit"
                                disabled={loadingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 20px',
                                    background: (loadingPassword || !passwordForm.newPassword) ? '#fca5a5' : '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: (loadingPassword || !passwordForm.newPassword) ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <Shield size={16} />
                                {loadingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
