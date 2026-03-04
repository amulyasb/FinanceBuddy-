import { useEffect, useState, useCallback, useRef } from 'react'
import { useAccount } from '../hooks/useAccount'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../lib/utils'
import TransactionTable from '../components/Transactions/TransactionTable'
import TransactionForm from '../components/Transactions/TransactionForm'
import FilterBar from '../components/Transactions/FilterBar'
import AccountSelector from '../components/Accounts/AccountSelector'
import toast from 'react-hot-toast'
import { Plus, Activity, Wallet, Filter } from 'lucide-react'

export default function Transactions() {
    const { selectedAccount, setSelectedAccount } = useAccount()
    const { accounts, fetchAccounts } = useAccounts()
    const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactions()
    const [showForm, setShowForm] = useState(false)
    const [editTx, setEditTx] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [activeFilters, setActiveFilters] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [showAccountPanel, setShowAccountPanel] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [isInitializing, setIsInitializing] = useState(true)
    const hasRestoredAccount = useRef(false)
    const itemsPerPage = 10
    const prevFiltersRef = useRef(activeFilters)

    // Fetch accounts on mount
    useEffect(() => { 
        fetchAccounts()
    }, [fetchAccounts])

    useEffect(() => {
        if (accounts.length > 0 && !hasRestoredAccount.current) {
            hasRestoredAccount.current = true
            
            // Use setTimeout to avoid synchronous setState in effect
            setTimeout(() => {
                // If no account is selected, try to restore from localStorage
                if (!selectedAccount) {
                    const savedAccountId = localStorage.getItem('selectedAccountId')
                    const savedAccount = localStorage.getItem('selectedAccount')
                    
                    if (savedAccountId) {
                        // First try to find the account in the loaded accounts list
                        const account = accounts.find(acc => acc.id === savedAccountId)
                        
                        if (account) {
                            console.log('✅ Restored account:', account.account_name)
                            setSelectedAccount(account)
                        } else if (savedAccount) {
                            // Fallback: use the saved account object
                            try {
                                const parsedAccount = JSON.parse(savedAccount)
                                console.log('✅ Restored account from backup:', parsedAccount.account_name)
                                setSelectedAccount(parsedAccount)
                            } catch (e) {
                                console.error('❌ Failed to restore account:', e)
                            }
                        }
                    }
                }
                
                setIsInitializing(false)
            }, 0)
        } else if (accounts.length > 0 && isInitializing) {
            setTimeout(() => setIsInitializing(false), 0)
        }
    }, [accounts, selectedAccount, setSelectedAccount, isInitializing])

    const loadTransactions = useCallback(() => {
        if (selectedAccount) {
            fetchTransactions(selectedAccount.id, activeFilters)
        }
    }, [selectedAccount, fetchTransactions, activeFilters])
    
    // Sort transactions by ID (highest first)
    const sortedTransactions = [...transactions].reverse()    
    const indexOfLastTransaction = currentPage * itemsPerPage
    const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage
    const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)

    useEffect(() => { 
        if (!isInitializing) {
            loadTransactions()
        }
    }, [loadTransactions, isInitializing])
    
    // Reset page when filters change
    useEffect(() => {
        const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(activeFilters)
        if (filtersChanged && currentPage !== 1) {
            prevFiltersRef.current = activeFilters
            setTimeout(() => setCurrentPage(1), 0)
        } else {
            prevFiltersRef.current = activeFilters
        }
    }, [activeFilters, currentPage])

    const handleDelete = async () => {
        if (!confirmDelete || !selectedAccount) return
        const { error } = await deleteTransaction(
            confirmDelete.id, selectedAccount.id, selectedAccount.opening_balance
        )
        if (error) toast.error(error.message)
        else { 
            toast.success('Transaction deleted'); 
            loadTransactions(); 
            fetchAccounts();
        }
        setConfirmDelete(null)
    }

    // Show loading state while initializing
    if (isInitializing && accounts.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                fontFamily: "'Inter', -apple-system, sans-serif",
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #e5e7eb',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <div style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        fontWeight: 500,
                    }}>
                        Loading accounts...
                    </div>
                </div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: 'clamp(12px, 3vw, 16px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
        }}>
            {/* Page Header with Actions */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: 'clamp(16px, 4vw, 20px)',
                gap: 'clamp(12px, 3vw, 16px)',
                flexWrap: 'wrap',
            }}>
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(1.3rem, 4vw, 1.65rem)', 
                        fontWeight: 800, 
                        color: '#1e293b', 
                        marginBottom: '4px',
                        wordBreak: 'break-word',
                    }}>
                        Transactions
                    </h1>
                    <p style={{ 
                        color: '#94a3b8', 
                        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                        wordBreak: 'break-word',
                    }}>
                        {selectedAccount
                            ? `${selectedAccount.account_name} — ${sortedTransactions.length} records`
                            : 'Select an account to view transactions'}
                    </p>
                </div>

                {/* Header Actions */}
                <div style={{ 
                    display: 'flex', 
                    gap: 'clamp(8px, 2vw, 10px)', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}>
                    {/* My Accounts Toggle Button */}
                    <button
                        onClick={() => setShowAccountPanel(!showAccountPanel)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: 'clamp(7px, 2vw, 9px) clamp(12px, 3vw, 14px)',
                            borderRadius: '10px',
                            border: showAccountPanel ? '1.5px solid #93c5fd' : '1px solid #e5e7eb',
                            background: showAccountPanel ? '#eff6ff' : '#fff',
                            color: showAccountPanel ? '#1e40af' : '#374151',
                            fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap',
                            maxWidth: '250px',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
                        onMouseLeave={e => {
                            if (!showAccountPanel) e.currentTarget.style.borderColor = '#e5e7eb'
                        }}
                    >
                        <Wallet size={16} style={{ flexShrink: 0 }} />
                        <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {selectedAccount ? selectedAccount.account_name : 'My Accounts'}
                        </span>
                    </button>

                    {selectedAccount && (
                        <>
                            {/* Filters Toggle Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: 'clamp(7px, 2vw, 9px) clamp(10px, 2.5vw, 14px)',
                                    borderRadius: '10px',
                                    border: showFilters ? '1.5px solid #93c5fd' : '1px solid #e5e7eb',
                                    background: showFilters ? '#eff6ff' : '#fff',
                                    color: showFilters ? '#1e40af' : '#374151',
                                    fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
                                onMouseLeave={e => {
                                    if (!showFilters) e.currentTarget.style.borderColor = '#e5e7eb'
                                }}
                            >
                                <Filter size={14} />
                                <span className="filter-text">Filters</span>
                            </button>

                            <button
                                onClick={() => { setEditTx(null); setShowForm(true) }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: 'clamp(7px, 2vw, 9px) clamp(12px, 3vw, 16px)',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                    color: '#fff',
                                    border: 'none',
                                    fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                    transition: 'opacity 0.2s',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <Plus size={14} />
                                <span className="add-btn-text">Add Transaction</span>
                                <span className="add-btn-text-short" style={{ display: 'none' }}>Add</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && selectedAccount && (
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: 'clamp(12px, 3vw, 16px)',
                    marginBottom: 'clamp(12px, 3vw, 16px)',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                    <FilterBar
                        onFilter={(f) => {
                            setActiveFilters(f)
                            fetchTransactions(selectedAccount.id, f)
                        }}
                        onClear={() => {
                            setActiveFilters({})
                            fetchTransactions(selectedAccount.id, {})
                        }}
                    />
                </div>
            )}

            {/* Account Panel Modal */}
            {showAccountPanel && (
                <>
                    <div
                        onClick={() => setShowAccountPanel(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 999,
                            background: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(4px)',
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#fff',
                        borderRadius: '16px',
                        padding: 'clamp(16px, 4vw, 20px)',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        width: 'calc(100vw - 32px)',
                        maxWidth: '360px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}>
                        <AccountSelector />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div style={{ width: '100%' }}>
                {!selectedAccount ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 'clamp(28px, 7vw, 56px)',
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1.5px dashed #e5e7eb',
                    }}>
                        <div style={{
                            width: 'clamp(44px, 9vw, 56px)',
                            height: 'clamp(44px, 9vw, 56px)',
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                        }}>
                            <Activity size={22} color="#94a3b8" />
                        </div>
                        <div style={{ 
                            fontSize: 'clamp(0.85rem, 2.2vw, 1rem)', 
                            fontWeight: 600, 
                            color: '#475569' 
                        }}>
                            No account selected
                        </div>
                        <div style={{ 
                            fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)', 
                            color: '#94a3b8', 
                            marginTop: '6px',
                            padding: '0 clamp(12px, 3vw, 16px)',
                        }}>
                            Click the account button above to select an account
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: '#fff',
                        borderRadius: 'clamp(12px, 3vw, 16px)',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                    }}>
                        <TransactionTable
                            transactions={currentTransactions}
                            loading={loading}
                            onEdit={(tx) => { setEditTx(tx); setShowForm(true) }}
                            onDelete={(tx) => setConfirmDelete(tx)}
                        />
                                                    
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'clamp(8px, 2vw, 12px)',
                                padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                                borderTop: '1px solid #e5e7eb',
                                backgroundColor: '#f9fafb',
                            }}>
                                <div style={{
                                    fontSize: 'clamp(0.65rem, 1.6vw, 0.8rem)',
                                    color: '#64748b',
                                    textAlign: 'center',
                                }}>
                                    Showing {(indexOfFirstTransaction + 1)}-{Math.min(indexOfLastTransaction, sortedTransactions.length)} of {sortedTransactions.length}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: 'clamp(6px, 1.5vw, 8px)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                }}>
                                    <button
                                        style={{
                                            padding: 'clamp(5px, 1.5vw, 6px) clamp(8px, 2vw, 12px)',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
                                            color: '#374151',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: 'clamp(0.65rem, 1.6vw, 0.8rem)',
                                            fontWeight: '500',
                                        }}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span style={{
                                        padding: 'clamp(5px, 1.5vw, 6px) clamp(8px, 2vw, 12px)',
                                        fontSize: 'clamp(0.65rem, 1.6vw, 0.8rem)',
                                        fontWeight: '500',
                                        color: '#1e293b',
                                    }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        style={{
                                            padding: 'clamp(5px, 1.5vw, 6px) clamp(8px, 2vw, 12px)',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
                                            color: '#374151',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            fontSize: 'clamp(0.65rem, 1.6vw, 0.8rem)',
                                            fontWeight: '500',
                                        }}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showForm && (
                <TransactionForm
                    account={selectedAccount}
                    editTransaction={editTx}
                    onClose={() => { setShowForm(false); setEditTx(null) }}
                    onSuccess={() => { setShowForm(false); setEditTx(null); loadTransactions(); fetchAccounts(); }}
                    onRefreshAccounts={fetchAccounts}
                />
            )}

            {confirmDelete && (
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
                        borderRadius: 'clamp(12px, 3vw, 16px)',
                        padding: 'clamp(18px, 4.5vw, 28px)',
                        maxWidth: '380px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{
                            width: 'clamp(40px, 9vw, 46px)',
                            height: 'clamp(40px, 9vw, 46px)',
                            borderRadius: '50%',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 'clamp(12px, 3vw, 16px)',
                        }}>
                            <Activity size={18} color="#ef4444" />
                        </div>
                        <h3 style={{ 
                            fontSize: 'clamp(0.85rem, 2.2vw, 1rem)', 
                            fontWeight: 700, 
                            color: '#1e293b', 
                            marginBottom: '8px' 
                        }}>
                            Delete Transaction?
                        </h3>
                        <p style={{ 
                            color: '#64748b', 
                            fontSize: 'clamp(0.75rem, 1.9vw, 0.875rem)', 
                            marginBottom: '6px', 
                            lineHeight: 1.6 
                        }}>
                            {confirmDelete.type === 'credit' ? '↑ Credit' : '↓ Debit'} of{' '}
                            <strong style={{ color: '#1e293b' }}>{formatCurrency(confirmDelete.amount)}</strong>
                        </p>
                        <p style={{ 
                            color: '#94a3b8', 
                            fontSize: 'clamp(0.7rem, 1.7vw, 0.8rem)', 
                            marginBottom: 'clamp(18px, 4vw, 24px)', 
                            lineHeight: 1.6 
                        }}>
                            Balances will be automatically recalculated.
                        </p>
                        <div style={{ 
                            display: 'flex', 
                            gap: 'clamp(8px, 2vw, 10px)', 
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap',
                        }}>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                style={{
                                    padding: 'clamp(8px, 2vw, 9px) clamp(14px, 3.5vw, 18px)',
                                    borderRadius: '9px',
                                    border: '1px solid #e5e7eb',
                                    background: '#fff',
                                    color: '#374151',
                                    fontSize: 'clamp(0.75rem, 1.9vw, 0.875rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    flex: '1',
                                    minWidth: '70px',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: 'clamp(8px, 2vw, 9px) clamp(14px, 3.5vw, 18px)',
                                    borderRadius: '9px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff',
                                    fontSize: 'clamp(0.75rem, 1.9vw, 0.875rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                                    flex: '1',
                                    minWidth: '70px',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 640px) {
                    .filter-text {
                        display: none !important;
                    }
                    
                    .add-btn-text {
                        display: none !important;
                    }
                    
                    .add-btn-text-short {
                        display: inline !important;
                    }
                }
            `}</style>
        </div>
    )
}