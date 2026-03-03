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
import { Plus, Activity, Menu } from 'lucide-react'

export default function Transactions() {
    const { selectedAccount } = useAccount()
    const { fetchAccounts } = useAccounts()
    const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactions()
    const [showForm, setShowForm] = useState(false)
    const [editTx, setEditTx] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [activeFilters, setActiveFilters] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [showAccountPanel, setShowAccountPanel] = useState(false)
    const itemsPerPage = 10
    const prevFiltersRef = useRef(activeFilters)

    useEffect(() => { fetchAccounts() }, [fetchAccounts])

    const loadTransactions = useCallback(() => {
        if (selectedAccount) fetchTransactions(selectedAccount.id, activeFilters)
    }, [selectedAccount, fetchTransactions, activeFilters])
    
    const indexOfLastTransaction = currentPage * itemsPerPage
    const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
    const totalPages = Math.ceil(transactions.length / itemsPerPage)

    useEffect(() => { 
        loadTransactions(); 
    }, [loadTransactions])
    
    // Reset page when filters change
    useEffect(() => {
        const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(activeFilters)
        if (filtersChanged && currentPage !== 1) {
            prevFiltersRef.current = activeFilters
            // Use setTimeout to avoid setState in effect
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

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px',
            fontFamily: "'Inter', -apple-system, sans-serif",
        }}>
            {/* Mobile Account Toggle Button */}
            <button
                onClick={() => setShowAccountPanel(!showAccountPanel)}
                className="mobile-account-toggle"
                style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    marginBottom: '16px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    width: '100%',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                }}
            >
                <Menu size={18} />
                {selectedAccount ? selectedAccount.account_name : 'Select Account'}
            </button>

            {/* Page Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 1.65rem)', 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    marginBottom: '4px',
                    wordBreak: 'break-word',
                }}>
                    Transactions
                </h1>
                <p style={{ 
                    color: '#94a3b8', 
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    wordBreak: 'break-word',
                }}>
                    {selectedAccount
                        ? `${selectedAccount.account_name} — ${transactions.length} records`
                        : 'Select an account to view transactions'}
                </p>
            </div>

            <div className="tx-layout" style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: '24px',
                alignItems: 'start',
            }}>
                {/* Left: Accounts Panel */}
                <div 
                    className={`account-panel ${showAccountPanel ? 'show' : ''}`}
                    style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                        position: 'sticky',
                        top: '24px',
                    }}
                >
                    <AccountSelector />
                </div>

                {/* Overlay for mobile */}
                {showAccountPanel && (
                    <div
                        className="mobile-overlay"
                        onClick={() => setShowAccountPanel(false)}
                        style={{
                            display: 'none',
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            zIndex: 999,
                        }}
                    />
                )}

                {/* Right: Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
                    {!selectedAccount ? (
                        <div style={{
                            textAlign: 'center',
                            padding: 'clamp(32px, 8vw, 56px)',
                            background: '#fff',
                            borderRadius: '16px',
                            border: '1.5px dashed #e5e7eb',
                        }}>
                            <div style={{
                                width: 'clamp(48px, 10vw, 56px)',
                                height: 'clamp(48px, 10vw, 56px)',
                                borderRadius: '50%',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 14px',
                            }}>
                                <Activity size={24} color="#94a3b8" />
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
                                fontWeight: 600, 
                                color: '#475569' 
                            }}>
                                No account selected
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', 
                                color: '#94a3b8', 
                                marginTop: '6px',
                                padding: '0 16px',
                            }}>
                                Create or select an account from the left panel
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                background: '#fff',
                                borderRadius: '14px',
                                padding: 'clamp(12px, 3vw, 18px)',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                                        <div style={{ 
                                            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', 
                                            fontWeight: 700, 
                                            color: '#1e293b',
                                            wordBreak: 'break-word',
                                        }}>
                                            All Transactions
                                        </div>
                                        <div style={{ 
                                            fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)', 
                                            color: '#94a3b8', 
                                            marginTop: '2px' 
                                        }}>
                                            {transactions.length} records found
                                        </div>
                                    </div>
                                    <div className="toolbar-actions" style={{ 
                                        display: 'flex', 
                                        gap: '10px', 
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
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
                                        <button
                                            onClick={() => { setEditTx(null); setShowForm(true) }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '7px',
                                                padding: 'clamp(8px, 2vw, 9px) clamp(12px, 3vw, 16px)',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                                color: '#fff',
                                                border: 'none',
                                                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                                transition: 'opacity 0.2s',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            <Plus size={16} />
                                            <span className="btn-text">Add Transaction</span>
                                            <span className="btn-text-short" style={{ display: 'none' }}>Add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Table with Pagination */}
                            <div style={{
                                background: '#fff',
                                borderRadius: '16px',
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
                                                            
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                                        borderTop: '1px solid #e5e7eb',
                                        backgroundColor: '#f9fafb',
                                    }}>
                                        <div style={{
                                            fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                                            color: '#64748b',
                                            textAlign: 'center',
                                        }}>
                                            Showing {(indexOfFirstTransaction + 1)}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                        }}>
                                            <button
                                                style={{
                                                    padding: '6px clamp(10px, 2.5vw, 12px)',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
                                                    color: '#374151',
                                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                    fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                                                    fontWeight: '500',
                                                }}
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <span style={{
                                                padding: '6px 12px',
                                                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                                                fontWeight: '500',
                                                color: '#1e293b',
                                            }}>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                style={{
                                                    padding: '6px clamp(10px, 2.5vw, 12px)',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
                                                    color: '#374151',
                                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                    fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
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
                        </>
                    )}
                </div>
            </div>

            {/* Transaction Form Modal */}
            {showForm && (
                <TransactionForm
                    account={selectedAccount}
                    editTransaction={editTx}
                    onClose={() => { setShowForm(false); setEditTx(null) }}
                    onSuccess={() => { setShowForm(false); setEditTx(null); loadTransactions(); fetchAccounts(); }}
                    onRefreshAccounts={fetchAccounts}
                />
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: 'clamp(20px, 5vw, 28px)',
                        maxWidth: '380px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                        }}>
                            <Activity size={20} color="#ef4444" />
                        </div>
                        <h3 style={{ 
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
                            fontWeight: 700, 
                            color: '#1e293b', 
                            marginBottom: '8px' 
                        }}>
                            Delete Transaction?
                        </h3>
                        <p style={{ 
                            color: '#64748b', 
                            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', 
                            marginBottom: '6px', 
                            lineHeight: 1.6 
                        }}>
                            {confirmDelete.type === 'credit' ? '↑ Credit' : '↓ Debit'} of{' '}
                            <strong style={{ color: '#1e293b' }}>{formatCurrency(confirmDelete.amount)}</strong>
                        </p>
                        <p style={{ 
                            color: '#94a3b8', 
                            fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)', 
                            marginBottom: '24px', 
                            lineHeight: 1.6 
                        }}>
                            Balances will be automatically recalculated.
                        </p>
                        <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap',
                        }}>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: '9px',
                                    border: '1px solid #e5e7eb',
                                    background: '#fff',
                                    color: '#374151',
                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    flex: '1',
                                    minWidth: '80px',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: '9px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff',
                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                                    flex: '1',
                                    minWidth: '80px',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 1024px) {
                    .tx-layout { 
                        grid-template-columns: 1fr !important; 
                    }
                }
                
                @media (max-width: 768px) {
                    .mobile-account-toggle {
                        display: flex !important;
                    }
                    
                    .account-panel {
                        position: fixed !important;
                        top: 0 !important;
                        left: -100% !important;
                        height: 100vh !important;
                        width: 280px !important;
                        z-index: 1000 !important;
                        transition: left 0.3s ease !important;
                        overflow-y: auto !important;
                        border-radius: 0 !important;
                    }
                    
                    .account-panel.show {
                        left: 0 !important;
                    }
                    
                    .mobile-overlay {
                        display: block !important;
                    }
                    
                    .btn-text {
                        display: none !important;
                    }
                    
                    .btn-text-short {
                        display: inline !important;
                    }
                    
                    .toolbar-actions {
                        width: 100%;
                        justify-content: stretch !important;
                    }
                    
                    .toolbar-actions > * {
                        flex: 1;
                    }
                }
                
                @media (max-width: 480px) {
                    .toolbar-actions {
                        flex-direction: column !important;
                    }
                }
            `}</style>
        </div>
    )
}