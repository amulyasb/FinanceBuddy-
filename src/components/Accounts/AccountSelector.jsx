import { useState, useEffect } from 'react'
import { useAccounts } from '../../hooks/useAccounts'
import { useAccount } from '../../hooks/useAccount'
import AccountForm from './AccountForm'
import { formatCurrency } from '../../lib/utils'
import { Plus, Wallet, Settings, Trash2, AlertTriangle, X } from 'lucide-react'

export default function AccountSelector() {
    const { accounts, loading, fetchAccounts, deleteAccount, updateAccount } = useAccounts()
    const { selectedAccount, setSelectedAccount, refreshTrigger } = useAccount()
    const [showForm, setShowForm] = useState(false)
    const [editAccount, setEditAccount] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [showThreshold, setShowThreshold] = useState(null)
    const [thresholdVal, setThresholdVal] = useState('')

    useEffect(() => { 
        fetchAccounts() 
    }, [fetchAccounts, refreshTrigger])
    
    useEffect(() => {
        if (!selectedAccount && accounts.length > 0) setSelectedAccount(accounts[0])
        if (selectedAccount) {
            const updated = accounts.find(a => a.id === selectedAccount.id)
            if (updated) setSelectedAccount(updated)
        }
    }, [accounts])

    const handleDelete = async (id) => {
        await deleteAccount(id)
        if (selectedAccount?.id === id) {
            const remaining = accounts.filter(a => a.id !== id)
            setSelectedAccount(remaining[0] || null)
        }
        setConfirmDelete(null)
    }

    const handleThresholdSave = async () => {
        if (!showThreshold) return
        await updateAccount(showThreshold.id, { min_balance_threshold: parseFloat(thresholdVal) || 0 })
        await fetchAccounts()
        setShowThreshold(null)
    }

    const gradients = [
        'linear-gradient(135deg, #3b82f6, #6366f1)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
    ]

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 16,
            }}>
                <div>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                        My Accounts
                    </h2>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                        {accounts.length}/3 accounts
                    </p>
                </div>
                {accounts.length < 3 && (
                    <button
                        onClick={() => { setEditAccount(null); setShowForm(true) }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8,
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            color: '#fff', border: 'none',
                            fontSize: '0.75rem', fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                        }}
                    >
                        <Plus size={13} /> New
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                    <div style={{
                        width: 22, height: 22,
                        border: '2.5px solid #e5e7eb',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                    }} />
                </div>
            )}

            {/* Account Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {accounts.map((account, i) => {
                    const isSelected = selectedAccount?.id === account.id
                    const isLow = account.current_balance < account.min_balance_threshold
                        && account.min_balance_threshold > 0
                    return (
                        <div
                            key={account.id}
                            onClick={() => setSelectedAccount(account)}
                            style={{
                                background: isSelected ? '#eff6ff' : '#f8fafc',
                                border: `1.5px solid ${isSelected ? '#93c5fd' : '#e5e7eb'}`,
                                borderRadius: 12,
                                padding: '14px 16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 2px 12px rgba(59,130,246,0.12)' : 'none',
                            }}
                            onMouseEnter={e => {
                                if (!isSelected) e.currentTarget.style.borderColor = '#bfdbfe'
                            }}
                            onMouseLeave={e => {
                                if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb'
                            }}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', marginBottom: 10,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 9,
                                        background: gradients[i % 3],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    }}>
                                        <Wallet size={15} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                                            {account.account_name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                            Opening: {formatCurrency(account.opening_balance)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation()
                                            setShowThreshold(account)
                                            setThresholdVal(account.min_balance_threshold || '')
                                        }}
                                        style={{
                                            background: 'none', border: 'none',
                                            cursor: 'pointer', color: '#94a3b8',
                                            padding: 4, borderRadius: 6,
                                            transition: 'color 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                        title="Set balance threshold"
                                    >
                                        <Settings size={13} />
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); setConfirmDelete(account) }}
                                        style={{
                                            background: 'none', border: 'none',
                                            cursor: 'pointer', color: '#94a3b8',
                                            padding: 4, borderRadius: 6,
                                            transition: 'color 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                        title="Delete account"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                fontSize: '1.2rem', fontWeight: 800,
                                color: '#1e293b',
                            }}>
                                {formatCurrency(account.current_balance)}
                            </div>

                            {isLow && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    fontSize: '0.7rem', color: '#f59e0b',
                                    marginTop: 6, fontWeight: 600,
                                }}>
                                    <AlertTriangle size={11} />
                                    Below minimum limit
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Empty state */}
                {accounts.length === 0 && !loading && (
                    <div style={{
                        textAlign: 'center', padding: 28,
                        border: '1.5px dashed #e5e7eb', borderRadius: 12,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px',
                        }}>
                            <Wallet size={20} color="#94a3b8" />
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                            No accounts yet
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                            Create your first account
                        </div>
                    </div>
                )}
            </div>

            {/* Account Form Modal */}
            {showForm && (
                <AccountForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => { fetchAccounts(); setShowForm(false) }}
                    existing={editAccount}
                    currentCount={accounts.length}
                />
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16,
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16,
                        padding: 28, maxWidth: 380, width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16,
                        }}>
                            <Trash2 size={20} color="#ef4444" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                            Delete Account?
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
                            Are you sure you want to delete{' '}
                            <strong style={{ color: '#1e293b' }}>{confirmDelete.account_name}</strong>?
                            All transactions will be permanently deleted.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                style={{
                                    padding: '9px 18px', borderRadius: 9,
                                    border: '1px solid #e5e7eb',
                                    background: '#fff', color: '#374151',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDelete.id)}
                                style={{
                                    padding: '9px 18px', borderRadius: 9,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Threshold Modal */}
            {showThreshold && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16,
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16,
                        padding: 28, maxWidth: 360, width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: 8,
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                                Minimum Balance Alert
                            </h3>
                            <button
                                onClick={() => setShowThreshold(null)}
                                style={{
                                    background: '#f1f5f9', border: 'none',
                                    borderRadius: 7, cursor: 'pointer',
                                    color: '#64748b', padding: 6,
                                    display: 'flex',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 16, lineHeight: 1.6 }}>
                            Get alerted when balance drops below this amount.
                        </p>
                        <input
                            type="number"
                            value={thresholdVal}
                            onChange={e => setThresholdVal(e.target.value)}
                            placeholder="e.g. 5000"
                            min="0"
                            style={{
                                width: '100%', padding: '10px 14px',
                                borderRadius: 9, border: '1.5px solid #e5e7eb',
                                fontSize: '0.9rem', color: '#1e293b',
                                background: '#f9fafb', outline: 'none',
                                marginBottom: 16, boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowThreshold(null)}
                                style={{
                                    padding: '9px 18px', borderRadius: 9,
                                    border: '1px solid #e5e7eb',
                                    background: '#fff', color: '#374151',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleThresholdSave}
                                style={{
                                    padding: '9px 18px', borderRadius: 9,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                    color: '#fff',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}