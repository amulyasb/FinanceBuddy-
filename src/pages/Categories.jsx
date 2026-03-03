import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../hooks/useAuth'
import CategoryForm from '../components/Categories/CategoryForm'
import {
    Tag, Trash2, Edit, PlusCircle, ArrowUpRight, ArrowDownLeft, X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Categories() {
    useAuth()
    const { categories, loading, fetchCategories, deleteCategory } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editCat, setEditCat] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

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
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            transition: 'all 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = '#cbd5e1'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
                e.currentTarget.style.borderColor = '#e5e7eb'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: cat.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${cat.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {cat.type === 'credit'
                        ? <ArrowUpRight size={18} color="#10b981" />
                        : <ArrowDownLeft size={18} color="#ef4444" />
                    }
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                        fontWeight: 600,
                        color: '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {cat.name}
                    </div>
                    <div style={{
                        fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                        color: '#94a3b8',
                        marginTop: '2px',
                    }}>
                        {cat.type === 'credit' ? 'Income' : 'Expense'}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                    onClick={() => { setEditCat(cat); setShowForm(true) }}
                    style={{
                        padding: '7px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        color: '#3b82f6',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#eff6ff'
                        e.currentTarget.style.borderColor = '#bfdbfe'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                    }}
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => setConfirmDelete(cat)}
                    style={{
                        padding: '7px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        color: '#ef4444',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#fef2f2'
                        e.currentTarget.style.borderColor = '#fecaca'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                    }}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )

    return (
        <div style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: 'clamp(16px, 4vw, 24px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
        }}>
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
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        color: '#fff',
                        border: 'none',
                        fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        transition: 'opacity 0.2s',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    <PlusCircle size={18} />
                    <span className="btn-text">Add Category</span>
                    <span className="btn-text-short" style={{ display: 'none' }}>Add</span>
                </button>
            </div>

            {/* Categories Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(16px, 4vw, 24px)',
            }}>
                {/* Income Categories */}
                <div style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: 'clamp(18px, 4vw, 22px)',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: 'clamp(14px, 3.5vw, 18px)',
                        paddingBottom: '12px',
                        borderBottom: '2px solid #f1f5f9',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '9px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <ArrowUpRight size={18} color="#10b981" />
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
                                fontWeight: 700,
                                color: '#1e293b',
                            }}>
                                Income
                            </h3>
                            <p style={{
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                color: '#94a3b8',
                                marginTop: '2px',
                            }}>
                                {creditCat.length} categories
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {loading ? (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                            }}>
                                Loading...
                            </div>
                        ) : creditCat.length === 0 ? (
                            <div style={{
                                padding: '24px',
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
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
                    padding: 'clamp(18px, 4vw, 22px)',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: 'clamp(14px, 3.5vw, 18px)',
                        paddingBottom: '12px',
                        borderBottom: '2px solid #f1f5f9',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '9px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <ArrowDownLeft size={18} color="#ef4444" />
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
                                fontWeight: 700,
                                color: '#1e293b',
                            }}>
                                Expenses
                            </h3>
                            <p style={{
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                color: '#94a3b8',
                                marginTop: '2px',
                            }}>
                                {debitCat.length} categories
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {loading ? (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                            }}>
                                Loading...
                            </div>
                        ) : debitCat.length === 0 ? (
                            <div style={{
                                padding: '24px',
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                            }}>
                                No expense categories yet
                            </div>
                        ) : (
                            debitCat.map(cat => <CategoryCard key={cat.id} cat={cat} />)
                        )}
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
                            <Trash2 size={20} color="#ef4444" />
                        </div>
                        <h3 style={{
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '8px',
                        }}>
                            Delete Category?
                        </h3>
                        <p style={{
                            color: '#64748b',
                            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                            marginBottom: '6px',
                            lineHeight: 1.6,
                        }}>
                            Are you sure you want to delete <strong style={{ color: '#1e293b' }}>"{confirmDelete.name}"</strong>?
                        </p>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)',
                            marginBottom: '24px',
                            lineHeight: 1.6,
                        }}>
                            Existing transactions will keep this category reference.
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
                @media (max-width: 640px) {
                    .btn-text { display: none !important; }
                    .btn-text-short { display: inline !important; }
                }
            `}</style>
        </div>
    )
}