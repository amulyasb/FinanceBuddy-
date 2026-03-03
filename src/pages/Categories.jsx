import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'
import CategoryForm from '../components/Categories/CategoryForm'
import toast from 'react-hot-toast'
import {
    Plus, Edit3, Trash2, TrendingUp, TrendingDown,
    Package, AlertCircle, Tag
} from 'lucide-react'

export default function Categories() {
    const {
        userCategories,
        creditCategories,
        debitCategories,
        loading,
        fetchCategories,
        deleteCategory
    } = useCategories()

    const [showForm, setShowForm] = useState(false)
    const [editCategory, setEditCategory] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => { fetchCategories() }, [fetchCategories])

    const handleDelete = async () => {
        if (!confirmDelete) return
        const result = await deleteCategory(confirmDelete.id)
        if (result.error) toast.error(result.error.message)
        else toast.success('Category deleted!')
        setConfirmDelete(null)
    }

    const filteredCategories = activeTab === 'all'
        ? userCategories
        : userCategories.filter(c => c.type === activeTab)

    const tabs = [
        { key: 'all', label: 'All', count: userCategories.length },
        { key: 'credit', label: 'Income', count: creditCategories.length },
        { key: 'debit', label: 'Expense', count: debitCategories.length },
    ]

    const statCards = [
        {
            label: 'Total Categories',
            value: userCategories.length,
            icon: <Package size={18} color="#3b82f6" />,
            iconBg: '#eff6ff', iconBorder: '#bfdbfe',
            valueColor: '#1e293b',
        },
        {
            label: 'Income Categories',
            value: creditCategories.length,
            icon: <TrendingUp size={18} color="#10b981" />,
            iconBg: '#f0fdf4', iconBorder: '#bbf7d0',
            valueColor: '#10b981',
        },
        {
            label: 'Expense Categories',
            value: debitCategories.length,
            icon: <TrendingDown size={18} color="#ef4444" />,
            iconBg: '#fef2f2', iconBorder: '#fecaca',
            valueColor: '#ef4444',
        },
    ]

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
                flexWrap: 'wrap',
                gap: 'clamp(10px, 2.5vw, 12px)',
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
                        Manage your transaction categories
                    </p>
                </div>
                <button
                    onClick={() => { setEditCategory(null); setShowForm(true) }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3vw, 18px)',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        color: '#fff',
                        border: 'none',
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        transition: 'opacity 0.2s',
                        whiteSpace: 'nowrap',
                        minWidth: 'fit-content',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    <Plus size={16} />
                    <span className="btn-text">Add Category</span>
                    <span className="btn-text-short" style={{ display: 'none' }}>Add</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="cat-stat-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'clamp(12px, 3vw, 16px)',
                marginBottom: 'clamp(20px, 4vw, 24px)',
            }}>
                {statCards.map(card => (
                    <div key={card.label} style={{
                        background: '#fff',
                        borderRadius: 'clamp(12px, 2.5vw, 14px)',
                        padding: 'clamp(14px, 3vw, 18px) clamp(16px, 3.5vw, 20px)',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(10px, 2.5vw, 14px)',
                        transition: 'box-shadow 0.2s',
                        minWidth: 0,
                    }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'}
                    >
                        <div style={{
                            width: 'clamp(40px, 8vw, 44px)',
                            height: 'clamp(40px, 8vw, 44px)',
                            borderRadius: 'clamp(10px, 2vw, 12px)',
                            background: card.iconBg,
                            border: `1px solid ${card.iconBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {card.icon}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                                fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)',
                                fontWeight: 700,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                marginBottom: '4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {card.label}
                            </div>
                            <div style={{
                                fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                                fontWeight: 800,
                                color: card.valueColor,
                                lineHeight: 1,
                            }}>
                                {card.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Card */}
            <div style={{
                background: '#fff',
                borderRadius: 'clamp(14px, 3vw, 16px)',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
            }}>
                {/* Card Header with Tabs */}
                <div style={{
                    padding: 'clamp(14px, 3vw, 18px) clamp(16px, 4vw, 24px)',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'clamp(10px, 2.5vw, 12px)',
                }}>
                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                        <h2 style={{
                            fontSize: 'clamp(0.9rem, 2.2vw, 1rem)',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '2px',
                            wordBreak: 'break-word',
                        }}>
                            Your Categories
                        </h2>
                        <p style={{
                            fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)',
                            color: '#94a3b8',
                            wordBreak: 'break-word',
                        }}>
                            {filteredCategories.length} {activeTab === 'all' ? 'total' : activeTab} categories
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="cat-tabs" style={{
                        display: 'flex',
                        gap: '4px',
                        background: '#f1f5f9',
                        borderRadius: '10px',
                        padding: '4px',
                        flexWrap: 'wrap',
                        width: '100%',
                        maxWidth: '400px',
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    flex: '1 1 0',
                                    minWidth: 'fit-content',
                                    padding: 'clamp(5px, 1.5vw, 6px) clamp(10px, 2.5vw, 14px)',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: 'clamp(0.72rem, 1.8vw, 0.8rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    background: activeTab === tab.key ? '#fff' : 'transparent',
                                    color: activeTab === tab.key ? '#1e40af' : '#64748b',
                                    boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span className="tab-label">{tab.label}</span>
                                <span className="tab-label-short" style={{ display: 'none' }}>
                                    {tab.label.charAt(0)}
                                </span>
                                <span style={{
                                    background: activeTab === tab.key ? '#dbeafe' : '#e2e8f0',
                                    color: activeTab === tab.key ? '#1e40af' : '#94a3b8',
                                    borderRadius: '20px',
                                    padding: '1px 7px',
                                    fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)',
                                    fontWeight: 700,
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'clamp(32px, 8vw, 48px)',
                        gap: '12px',
                    }}>
                        <div style={{
                            width: 'clamp(24px, 5vw, 28px)',
                            height: 'clamp(24px, 5vw, 28px)',
                            border: '3px solid #e5e7eb',
                            borderTopColor: '#3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite',
                        }} />
                        <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: '#94a3b8' }}>
                            Loading categories...
                        </span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredCategories.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 'clamp(40px, 10vw, 56px) clamp(20px, 5vw, 24px)',
                    }}>
                        <div style={{
                            width: 'clamp(48px, 10vw, 56px)',
                            height: 'clamp(48px, 10vw, 56px)',
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <Tag size={24} color="#94a3b8" />
                        </div>
                        <div style={{
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '8px',
                        }}>
                            No categories yet
                        </div>
                        <div style={{
                            fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                            color: '#94a3b8',
                            marginBottom: '24px',
                            maxWidth: '280px',
                            margin: '0 auto 24px',
                            lineHeight: 1.5,
                        }}>
                            Create your first category to organize your transactions
                        </div>
                        <button
                            onClick={() => { setEditCategory(null); setShowForm(true) }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                color: '#fff',
                                border: 'none',
                                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                            }}
                        >
                            <Plus size={15} /> Create Category
                        </button>
                    </div>
                )}

                {/* Categories Grid */}
                {!loading && filteredCategories.length > 0 && (
                    <div className="cat-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
                        gap: 'clamp(10px, 2.5vw, 14px)',
                        padding: 'clamp(16px, 4vw, 20px)',
                    }}>
                        {filteredCategories.map(category => (
                            <div
                                key={category.id}
                                style={{
                                    background: '#f8fafc',
                                    borderRadius: 'clamp(10px, 2vw, 12px)',
                                    padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3vw, 18px)',
                                    border: '1px solid #e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 'clamp(8px, 2vw, 12px)',
                                    transition: 'all 0.2s ease',
                                    minWidth: 0,
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#bfdbfe'
                                    e.currentTarget.style.background = '#f0f7ff'
                                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(59,130,246,0.08)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#e5e7eb'
                                    e.currentTarget.style.background = '#f8fafc'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'clamp(8px, 2vw, 12px)',
                                    flex: 1,
                                    minWidth: 0,
                                }}>
                                    <div style={{
                                        width: 'clamp(36px, 7vw, 40px)',
                                        height: 'clamp(36px, 7vw, 40px)',
                                        borderRadius: 'clamp(8px, 2vw, 10px)',
                                        flexShrink: 0,
                                        background: category.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                        border: `1px solid ${category.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {category.type === 'credit'
                                            ? <TrendingUp size={17} color="#10b981" />
                                            : <TrendingDown size={17} color="#ef4444" />
                                        }
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{
                                            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {category.name}
                                        </div>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '2px 8px',
                                            borderRadius: '20px',
                                            marginTop: '4px',
                                            fontSize: 'clamp(0.65rem, 1.5vw, 0.68rem)',
                                            fontWeight: 700,
                                            background: category.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                            color: category.type === 'credit' ? '#059669' : '#dc2626',
                                            border: `1px solid ${category.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {category.type === 'credit' ? '↑ Credit' : '↓ Debit'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    <button
                                        onClick={() => { setEditCategory(category); setShowForm(true) }}
                                        style={{
                                            width: 'clamp(28px, 6vw, 30px)',
                                            height: 'clamp(28px, 6vw, 30px)',
                                            borderRadius: '8px',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            color: '#3b82f6',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = '#dbeafe'
                                            e.currentTarget.style.borderColor = '#93c5fd'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = '#eff6ff'
                                            e.currentTarget.style.borderColor = '#bfdbfe'
                                        }}
                                        title="Edit"
                                    >
                                        <Edit3 size={13} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(category)}
                                        style={{
                                            width: 'clamp(28px, 6vw, 30px)',
                                            height: 'clamp(28px, 6vw, 30px)',
                                            borderRadius: '8px',
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = '#fee2e2'
                                            e.currentTarget.style.borderColor = '#fca5a5'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = '#fef2f2'
                                            e.currentTarget.style.borderColor = '#fecaca'
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Form Modal */}
            {showForm && (
                <CategoryForm
                    editCategory={editCategory}
                    onClose={() => { setShowForm(false); setEditCategory(null) }}
                    onSuccess={() => { setShowForm(false); setEditCategory(null); fetchCategories() }}
                />
            )}

            {/* Delete Confirm Modal */}
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
                        borderRadius: 'clamp(14px, 3vw, 16px)',
                        padding: 'clamp(20px, 5vw, 28px)',
                        maxWidth: '380px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{
                            width: 'clamp(42px, 8vw, 46px)',
                            height: 'clamp(42px, 8vw, 46px)',
                            borderRadius: '50%',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                        }}>
                            <AlertCircle size={22} color="#ef4444" />
                        </div>
                        <h3 style={{
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '8px',
                            wordBreak: 'break-word',
                        }}>
                            Delete Category?
                        </h3>
                        <p style={{
                            color: '#64748b',
                            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                            marginBottom: '6px',
                            lineHeight: 1.6,
                            wordBreak: 'break-word',
                        }}>
                            Are you sure you want to delete{' '}
                            <strong style={{ color: '#1e293b' }}>"{confirmDelete.name}"</strong>?
                        </p>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)',
                            marginBottom: '24px',
                            lineHeight: 1.6,
                        }}>
                            Categories used in transactions cannot be deleted.
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
                                    flex: '1',
                                    minWidth: '100px',
                                    padding: 'clamp(8px, 2vw, 9px) clamp(14px, 3vw, 18px)',
                                    borderRadius: '9px',
                                    border: '1px solid #e5e7eb',
                                    background: '#fff',
                                    color: '#374151',
                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    flex: '1',
                                    minWidth: '100px',
                                    padding: 'clamp(8px, 2vw, 9px) clamp(14px, 3vw, 18px)',
                                    borderRadius: '9px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff',
                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                    fontWeight: 600,
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

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @media (max-width: 768px) {
                    .btn-text { display: none !important; }
                    .btn-text-short { display: inline !important; }
                }
                
                @media (max-width: 640px) {
                    .cat-stat-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .cat-stat-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .tab-label {
                        display: none !important;
                    }
                    .tab-label-short {
                        display: inline !important;
                    }
                    .cat-tabs {
                        justify-content: stretch !important;
                    }
                }
            `}</style>
        </div>
    )
}