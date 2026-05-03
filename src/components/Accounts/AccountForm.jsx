import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { X, Wallet, DollarSign, AlertTriangle } from 'lucide-react'

export default function AccountForm({ onClose, onSuccess, currentCount, maxAllowed, onCreateAccount }) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        account_name: '',
        opening_balance: '',
        min_balance_threshold: '',
    })

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (Number.isFinite(maxAllowed) && currentCount >= maxAllowed) { toast.error(`Account limit reached (${maxAllowed}).`); return }
        setLoading(true)
        const payload = {
            account_name: form.account_name.trim(),
            opening_balance: parseFloat(form.opening_balance) || 0,
            min_balance_threshold: parseFloat(form.min_balance_threshold) || 0,
        }
        const { error } = await onCreateAccount(payload)
        if (error) toast.error(error.message)
        else { toast.success('Account created!'); onSuccess() }
        setLoading(false)
    }

    useEffect(() => {
        document.body.classList.add('account-modal-open')
        return () => {
            document.body.classList.remove('account-modal-open')
        }
    }, [])

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2147483647,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, backdropFilter: 'blur(4px)',
            isolation: 'isolate',
        }}>
            <div style={{
                position: 'relative',
                background: '#fff', borderRadius: 18,
                padding: 28, width: '100%', maxWidth: 440,
                boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                border: '1px solid #e5e7eb',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 24,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        }}>
                            <Wallet size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                                New Account
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                                {Number.isFinite(maxAllowed)
                                    ? `${Math.max(0, maxAllowed - currentCount)} slot${Math.max(0, maxAllowed - currentCount) !== 1 ? 's' : ''} remaining`
                                    : 'Unlimited slots'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9', border: '1px solid #e5e7eb',
                            borderRadius: 9, cursor: 'pointer',
                            color: '#64748b', padding: 7, display: 'flex',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* Account Name */}
                    <div>
                        <label style={labelStyle}>Account Name *</label>
                        <input
                            name="account_name"
                            placeholder="e.g. NIC Asia Bank, eSewa Wallet"
                            value={form.account_name}
                            onChange={handleChange}
                            required
                            autoFocus
                            style={{ ...inputStyle, marginTop: 7 }}
                            onFocus={e => e.target.style.borderColor = '#93c5fd'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    {/* Opening Balance */}
                    <div>
                        <label style={labelStyle}>
                            <DollarSign size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Opening Balance (NPR) *
                        </label>
                        <input
                            name="opening_balance"
                            type="number"
                            placeholder="0.00"
                            value={form.opening_balance}
                            onChange={handleChange}
                            min="0" step="0.01" required
                            style={{ ...inputStyle, marginTop: 7 }}
                            onFocus={e => e.target.style.borderColor = '#93c5fd'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    {/* Min Balance Threshold */}
                    <div>
                        <label style={labelStyle}>
                            <AlertTriangle size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Minimum Balance Alert (NPR)
                        </label>
                        <input
                            name="min_balance_threshold"
                            type="number"
                            placeholder="Optional – e.g. 5000"
                            value={form.min_balance_threshold}
                            onChange={handleChange}
                            min="0" step="0.01"
                            style={{ ...inputStyle, marginTop: 7 }}
                            onFocus={e => e.target.style.borderColor = '#93c5fd'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 5 }}>
                            You'll see a warning when balance drops below this amount.
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button
                            type="button" onClick={onClose}
                            style={{
                                padding: '10px 20px', borderRadius: 10,
                                border: '1px solid #e5e7eb',
                                background: '#fff', color: '#374151',
                                fontSize: '0.875rem', fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading}
                            style={{
                                padding: '10px 22px', borderRadius: 10, border: 'none',
                                background: loading
                                    ? '#93c5fd'
                                    : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 14, height: 14,
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                    Creating...
                                </>
                            ) : (
                                <><Wallet size={15} /> Create Account</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                body.account-modal-open .recharts-wrapper,
                body.account-modal-open .recharts-surface,
                body.account-modal-open .recharts-tooltip-wrapper {
                    pointer-events: none !important;
                }
                body.account-modal-open .recharts-tooltip-wrapper {
                    display: none !important;
                }
            `}</style>
        </div>
    )
}

const labelStyle = {
    fontSize: '0.8rem', fontWeight: 600,
    color: '#374151', display: 'block',
}

const inputStyle = {
    width: '100%', padding: '10px 13px',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: '0.875rem',
    color: '#1e293b', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
}
