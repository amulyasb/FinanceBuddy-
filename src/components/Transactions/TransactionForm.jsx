import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { todayDate } from '../../lib/utils'
import toast from 'react-hot-toast'
import { X, ArrowUpRight, ArrowDownLeft, Tag, Calendar, DollarSign, FileText } from 'lucide-react'
import { useAccount } from '../../hooks/useAccount'

export default function TransactionForm({ account, onClose, onSuccess, onRefreshAccounts, editTransaction }) {
    const navigate = useNavigate()
    const { addTransaction, updateTransaction } = useTransactions()
    const { categories, fetchCategories } = useCategories()
    const { triggerAccountRefresh } = useAccount()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState(() => {
        if (editTransaction && editTransaction.id) {
            return {
                date: editTransaction.date || todayDate(),
                type: editTransaction.type && ['credit', 'debit'].includes(editTransaction.type) ? editTransaction.type : 'credit',
                category_id: editTransaction.category_id || '',
                amount: editTransaction.amount || '',
                remark: editTransaction.remark || '',
            }
        }
        return {
            date: todayDate(),
            type: 'credit',
            category_id: '',
            amount: '',
            remark: '',
        }
    })

    useEffect(() => { fetchCategories() }, [fetchCategories])

    const filteredCategories = categories.filter(c => c.type === form.type)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!account) { toast.error('Please select an account first.'); return }
        if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Amount must be greater than 0.'); return }
        setLoading(true)
        
        const payload = {
            account_id: account.id,
            date: form.date,
            type: form.type,
            category_id: form.category_id || null,
            amount: parseFloat(form.amount),
            remark: form.remark.trim() || null,
        }
        
        let error
        if (editTransaction) {
            const res = await updateTransaction(editTransaction.id, payload, account.id, account.opening_balance)
            error = res?.error
        } else {
            const res = await addTransaction(payload, account.opening_balance)
            error = res?.error
        }
        
        if (error) {
            toast.error(error.message)
        } else { 
            toast.success(editTransaction ? 'Transaction updated!' : 'Transaction added!')
            
            // Trigger account balance refresh
            if (triggerAccountRefresh) {
                triggerAccountRefresh()
            }
            
            // Legacy callback support
            if (onRefreshAccounts) {
                onRefreshAccounts()
            }
            
            onSuccess()
        }
        
        setLoading(false)
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(12px, 3vw, 16px)',
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 'clamp(14px, 3vw, 18px)',
                padding: 'clamp(20px, 4vw, 28px)',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                border: '1px solid #e5e7eb',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'clamp(18px, 4vw, 24px)',
                    gap: '12px',
                }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ 
                            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', 
                            fontWeight: 800, 
                            color: '#1e293b', 
                            marginBottom: '4px',
                            wordBreak: 'break-word',
                        }}>
                            {editTransaction ? 'Edit Transaction' : 'New Transaction'}
                        </h3>
                        <p style={{ 
                            fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)', 
                            color: '#94a3b8',
                            wordBreak: 'break-word',
                        }}>
                            {account?.account_name || 'No account'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9',
                            border: '1px solid #e5e7eb',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '7px',
                            display: 'flex',
                            transition: 'background 0.15s',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'clamp(14px, 3vw, 18px)' 
                }}>

                    {/* Type Toggle */}
                    <div>
                        <label style={labelStyle}>Transaction Type *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                            {['credit', 'debit'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, type: t, category_id: '' }))}
                                    style={{
                                        padding: 'clamp(9px, 2vw, 11px) clamp(10px, 2.5vw, 14px)',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontWeight: 700,
                                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                        transition: 'all 0.2s ease',
                                        border: form.type === t
                                            ? `2px solid ${t === 'credit' ? '#10b981' : '#ef4444'}`
                                            : '2px solid #e5e7eb',
                                        background: form.type === t
                                            ? (t === 'credit' ? '#f0fdf4' : '#fef2f2')
                                            : '#f8fafc',
                                        color: form.type === t
                                            ? (t === 'credit' ? '#059669' : '#dc2626')
                                            : '#94a3b8',
                                    }}
                                >
                                    {t === 'credit'
                                        ? <ArrowUpRight size={16} />
                                        : <ArrowDownLeft size={16} />
                                    }
                                    <span className="type-text">{t === 'credit' ? 'Credit (Income)' : 'Debit (Expense)'}</span>
                                    <span className="type-text-short" style={{ display: 'none' }}>
                                        {t === 'credit' ? 'Credit' : 'Debit'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date & Amount */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(10px, 2.5vw, 14px)' }}>
                        <div>
                            <label style={labelStyle}>
                                <Calendar size={13} style={{ display: 'inline', marginRight: '5px' }} />
                                Date *
                            </label>
                            <input
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                style={{ ...inputStyle, marginTop: '7px', borderColor: form.date ? '#3b82f6' : '#e5e7eb' }}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>
                                <DollarSign size={13} style={{ display: 'inline', marginRight: '5px' }} />
                                Amount *
                            </label>
                            <input
                                name="amount"
                                type="number"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                required
                                style={{ ...inputStyle, marginTop: '7px', borderColor: form.amount ? '#3b82f6' : '#e5e7eb' }}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '7px',
                            gap: '8px',
                            flexWrap: 'wrap',
                        }}>
                            <label style={labelStyle}>
                                <Tag size={13} style={{ display: 'inline', marginRight: '5px' }} />
                                Category
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate('/categories')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#3b82f6',
                                    fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '2px',
                                    padding: 0,
                                }}
                            >
                                Manage →
                            </button>
                        </div>
                        <select
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="">Select category</option>
                            {filteredCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Remark */}
                    <div>
                        <label style={{ ...labelStyle, marginBottom: '7px', display: 'block' }}>
                            <FileText size={13} style={{ display: 'inline', marginRight: '5px' }} />
                            Remark / Description
                        </label>
                        <input
                            name="remark"
                            placeholder="Optional note..."
                            value={form.remark}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end',
                        marginTop: '4px',
                        flexWrap: 'wrap',
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb',
                                background: '#fff',
                                color: '#374151',
                                fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                flex: '1',
                                minWidth: '100px',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                background: loading
                                    ? '#93c5fd'
                                    : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                color: '#fff',
                                fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                transition: 'opacity 0.2s',
                                flex: '1',
                                minWidth: '100px',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                    Saving...
                                </>
                            ) : (
                                editTransaction ? 'Update' : 'Add Transaction'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @media (max-width: 480px) {
                    .type-text {
                        display: none !important;
                    }
                    .type-text-short {
                        display: inline !important;
                    }
                }
            `}</style>
        </div>
    )
}

const labelStyle = {
    fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)',
    fontWeight: 600,
    color: '#374151',
    display: 'block',
}

const inputStyle = {
    width: '100%',
    padding: 'clamp(9px, 2vw, 10px) clamp(11px, 2.5vw, 13px)',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    caretColor: '#3b82f6',
}