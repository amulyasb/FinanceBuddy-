import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../hooks/useAuth'
import { useAccount } from '../hooks/useAccount'
import CategoryForm from '../components/Categories/CategoryForm'
import AccountSelector from '../components/Accounts/AccountSelector'
import {
    Tag, Trash2, Edit, PlusCircle, ArrowUpRight, ArrowDownLeft, X, Menu
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Categories() {
    useAuth()
    const { categories, loading, fetchCategories, deleteCategory } = useCategories()
    const { selectedAccount } = useAccount()
    const [showForm, setShowForm] = useState(false)
    const [editCat, setEditCat] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [showAccountPanel, setShowAccountPanel] = useState(false)

    useEffect(() => { fetchCategories() }, [fetchCategories])

    const creditCat = categories.filter(c => c.type === 'credit')
    const debitCat = categories.filter(c => c.type === 'debit')

    const handleDelete = async () => {
        if (!confirmDelete) return
        const { error } = await deleteCategory(confirmDelete.id)
        if (error) toast.error(error.message)
        else {
            toast.success('Category deleted')
            fetchCategories()
        }
        setConfirmDelete(null)
    }

    const CategoryCard = ({ cat }) => (
        <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
            width: '100%',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
                e.currentTarget.style.borderColor = cat.type === 'credit' ? '#bbf7d0' : '#fecaca'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)'
                e.currentTarget.style.borderColor = '#f1f5f9'
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0,
                width: '4px',
                background: cat.type === 'credit' ? '#10b981' : '#ef4444',
                opacity: 0.8
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1, paddingLeft: '8px' }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: cat.type === 'credit' ? '#ecfdf5' : '#fef2f2',
                    color: cat.type === 'credit' ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {cat.type === 'credit'
                        ? <ArrowUpRight size={20} />
                        : <ArrowDownLeft size={20} />
                    }
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        fontSize: 'clamp(0.9rem, 2vw, 0.95rem)',
                        fontWeight: 700,
                        color: '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {cat.name}
                    </div>
                    <div style={{
                        fontSize: 'clamp(0.75rem, 1.6vw, 0.8rem)',
                        color: '#64748b',
                        marginTop: '4px',
                        fontWeight: 500,
                    }}>
                        {cat.type === 'credit' ? 'Income Stream' : 'Expense Category'}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                    onClick={() => { setEditCat(cat); setShowForm(true) }}
                    style={{
                        padding: '8px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        color: '#3b82f6',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                    title="Edit Category"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => setConfirmDelete(cat)}
                    style={{
                        padding: '8px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        color: '#ef4444',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                    title="Delete Category"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'clamp(12px, 3vw, 24px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            boxSizing: 'border-box',
            width: '100%',
            overflowX: 'hidden',
        }}>
            {/* Mobile Account Toggle */}
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
                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                    fontWeight: '600',
                    color: '#374151',
                }}
            >
                <Menu size={18} />
                {selectedAccount ? selectedAccount.account_name : 'Select Account'}
            </button>

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'clamp(20px, 5vw, 28px)',
                gap: '12px',
                flexWrap: 'wrap',
            }}>
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 1.65rem)',
                        fontWeight: 800,
                        color: '#1e293b',
                        marginBottom: '4px',
                        wordBreak: 'break-word',
                    }}>
                        Categories
                    </h1>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        wordBreak: 'break-word',
                    }}>
                        Organize your transactions
                    </p>
                </div>
                <button
                    onClick={() => { setEditCat(null); setShowForm(true) }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: 'clamp(9px, 2vw, 10px) clamp(14px, 3.5vw, 18px)',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        color: '#fff',
                        border: 'none',
                        fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.3)'
                    }}
                >
                    <PlusCircle size={18} />
                    <span className="btn-text">Add Category</span>
                    <span className="btn-text-short" style={{ display: 'none' }}>Add</span>
                </button>
            </div>

            <div className="analytics-layout" style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: 'clamp(16px, 4vw, 24px)', 
                alignItems: 'start',
            }}>
                {/* Account Selector Panel */}
                <div
                    className={`account-panel ${showAccountPanel ? 'show' : ''}`}
                    style={{
                        background: '#fff', 
                        borderRadius: '16px',
                        padding: 'clamp(16px, 4vw, 20px)', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
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
                            background: 'rgba(15,23,42,0.4)',
                            zIndex: 999,
                            backdropFilter: 'blur(4px)',
                        }}
                    />
                )}

                {/* Categories Content Panel */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'clamp(16px, 4vw, 24px)',
                    minWidth: 0,
                }}>
                    {/* Income Categories */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: 'clamp(16px, 4vw, 24px)',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        boxSizing: 'border-box',
                        width: '100%',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginBottom: 'clamp(16px, 3.5vw, 20px)',
                            paddingBottom: '16px',
                            borderBottom: '2px solid #f8fafc',
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: '#ecfdf5',
                                border: '1px solid #d1fae5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <ArrowUpRight size={22} color="#10b981" />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: 'clamp(1rem, 2.2vw, 1.1rem)',
                                    fontWeight: 800,
                                    color: '#1e293b',
                                }}>
                                    Income Categories
                                </h3>
                                <p style={{
                                    fontSize: 'clamp(0.75rem, 1.6vw, 0.8rem)',
                                    color: '#64748b',
                                    marginTop: '4px',
                                    fontWeight: 500,
                                }}>
                                    {creditCat.length} {creditCat.length === 1 ? 'category' : 'categories'} configured
                                </p>
                            </div>
                        </div>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', 
                            gap: '14px' 
                        }}>
                            {loading ? (
                                <div style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                                    gridColumn: '1 / -1',
                                }}>
                                    Loading...
                                </div>
                            ) : creditCat.length === 0 ? (
                                <div style={{
                                    padding: '30px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                                    gridColumn: '1 / -1',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px dashed #cbd5e1'
                                }}>
                                    No income categories yet
                                </div>
                            ) : (
                                creditCat.map(cat => <CategoryCard key={cat.id} cat={cat} />)
                            )}
                        </div>
                    </div>

                    {/* Expense Categories */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: 'clamp(16px, 4vw, 24px)',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        boxSizing: 'border-box',
                        width: '100%',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginBottom: 'clamp(16px, 3.5vw, 20px)',
                            paddingBottom: '16px',
                            borderBottom: '2px solid #f8fafc',
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <ArrowDownLeft size={22} color="#ef4444" />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: 'clamp(1rem, 2.2vw, 1.1rem)',
                                    fontWeight: 800,
                                    color: '#1e293b',
                                }}>
                                    Expense Categories
                                </h3>
                                <p style={{
                                    fontSize: 'clamp(0.75rem, 1.6vw, 0.8rem)',
                                    color: '#64748b',
                                    marginTop: '4px',
                                    fontWeight: 500,
                                }}>
                                    {debitCat.length} {debitCat.length === 1 ? 'category' : 'categories'} configured
                                </p>
                            </div>
                        </div>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', 
                            gap: '14px' 
                        }}>
                            {loading ? (
                                <div style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                                    gridColumn: '1 / -1',
                                }}>
                                    Loading...
                                </div>
                            ) : debitCat.length === 0 ? (
                                <div style={{
                                    padding: '30px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                                    gridColumn: '1 / -1',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px dashed #cbd5e1'
                                }}>
                                    No expense categories yet
                                </div>
                            ) : (
                                debitCat.map(cat => <CategoryCard key={cat.id} cat={cat} />)
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Form Modal */}
            {showForm && (
                <CategoryForm
                    editCategory={editCat}
                    onClose={() => { setShowForm(false); setEditCat(null) }}
                    onSuccess={() => { setShowForm(false); setEditCat(null); fetchCategories() }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    background: 'rgba(15,23,42,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    backdropFilter: 'blur(6px)',
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        padding: 'clamp(24px, 5vw, 32px)',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                        border: '1px solid #f1f5f9',
                        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}>
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: '#fef2f2',
                            border: '4px solid #fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}>
                            <Trash2 size={24} color="#ef4444" />
                        </div>
                        <h3 style={{
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.2rem)',
                            fontWeight: 800,
                            color: '#1e293b',
                            marginBottom: '10px',
                        }}>
                            Delete Category?
                        </h3>
                        <p style={{
                            color: '#475569',
                            fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                            marginBottom: '8px',
                            lineHeight: 1.6,
                        }}>
                            Are you sure you want to delete <strong style={{ color: '#0f172a' }}>"{confirmDelete.name}"</strong>?
                        </p>
                        <p style={{
                            color: '#64748b',
                            fontSize: 'clamp(0.8rem, 1.8vw, 0.85rem)',
                            marginBottom: '28px',
                            lineHeight: 1.6,
                            background: '#f8fafc',
                            padding: '12px',
                            borderRadius: '8px',
                            borderLeft: '4px solid #cbd5e1',
                        }}>
                            Existing transactions will keep this category reference safely.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap',
                        }}>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    color: '#475569',
                                    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    flex: '1',
                                    minWidth: '80px',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff',
                                    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                                    flex: '1',
                                    minWidth: '80px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239,68,68,0.4)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)'
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
                    .btn-text { display: none !important; }
                    .btn-text-short { display: inline !important; }
                }
                
                @media (max-width: 900px) {
                    .analytics-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .account-panel {
                        position: fixed !important;
                        top: 0 !important;
                        left: -280px;
                        bottom: 0 !important;
                        width: 280px !important;
                        z-index: 1000 !important;
                        border-radius: 0 !important;
                        height: 100vh !important;
                        border-right: 1px solid #e5e7eb !important;
                        border-left: none !important;
                        border-top: none !important;
                        border-bottom: none !important;
                        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        overflow-y: auto;
                    }
                    .account-panel.show {
                        left: 0;
                    }
                    .mobile-account-toggle {
                        display: flex !important;
                    }
                    .mobile-overlay {
                        display: block !important;
                        animation: fadeIn 0.3s ease;
                    }
                }
                
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    )
}