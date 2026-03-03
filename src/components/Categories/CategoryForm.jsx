import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import toast from 'react-hot-toast'
import { X, Plus, Edit3, TrendingUp, TrendingDown } from 'lucide-react'

export default function CategoryForm({ onClose, onSuccess, editCategory }) {
    const { addCategory, updateCategory } = useCategories()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState(() => 
        editCategory 
            ? { name: editCategory.name || '', type: editCategory.type || 'credit' }
            : { name: '', type: 'credit' }
    )

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) { toast.error('Category name is required'); return }
        setLoading(true)
        const result = editCategory
            ? await updateCategory(editCategory.id, form.name.trim(), form.type)
            : await addCategory(form.name.trim(), form.type)
        if (result.error) toast.error(result.error.message)
        else { toast.success(editCategory ? 'Category updated!' : 'Category added!'); onSuccess() }
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
                padding: 'clamp(20px, 5vw, 28px)',
                width: '100%',
                maxWidth: '420px',
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
                    marginBottom: 'clamp(20px, 4vw, 24px)',
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
                            {editCategory ? 'Edit Category' : 'New Category'}
                        </h3>
                        <p style={{
                            fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)',
                            color: '#94a3b8',
                            wordBreak: 'break-word',
                        }}>
                            {editCategory ? 'Update category details' : 'Create a new category'}
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
                    gap: 'clamp(14px, 3vw, 18px)',
                }}>

                    {/* Type Toggle */}
                    <div>
                        <label style={labelStyle}>Category Type *</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginTop: '8px',
                        }}>
                            {[
                                { key: 'credit', label: 'Income', fullLabel: 'Credit (Income)', icon: <TrendingUp size={15} /> },
                                { key: 'debit', label: 'Expense', fullLabel: 'Debit (Expense)', icon: <TrendingDown size={15} /> },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, type: t.key }))}
                                    style={{
                                        padding: 'clamp(9px, 2vw, 11px) clamp(8px, 2vw, 10px)',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '7px',
                                        fontWeight: 700,
                                        fontSize: 'clamp(0.75rem, 2vw, 0.82rem)',
                                        transition: 'all 0.2s ease',
                                        border: form.type === t.key
                                            ? `2px solid ${t.key === 'credit' ? '#10b981' : '#ef4444'}`
                                            : '2px solid #e5e7eb',
                                        background: form.type === t.key
                                            ? (t.key === 'credit' ? '#f0fdf4' : '#fef2f2')
                                            : '#f8fafc',
                                        color: form.type === t.key
                                            ? (t.key === 'credit' ? '#059669' : '#dc2626')
                                            : '#94a3b8',
                                    }}
                                >
                                    {t.icon}
                                    <span className="type-full-label">{t.fullLabel}</span>
                                    <span className="type-short-label" style={{ display: 'none' }}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label style={{ ...labelStyle, marginBottom: '7px', display: 'block' }}>
                            Category Name *
                        </label>
                        <input
                            name="name"
                            placeholder="e.g. Salary, Rent, Groceries..."
                            value={form.name}
                            onChange={handleChange}
                            required
                            autoFocus
                            style={{
                                width: '100%',
                                padding: 'clamp(9px, 2vw, 11px) clamp(11px, 2.5vw, 13px)',
                                background: '#f9fafb',
                                border: '1.5px solid #e5e7eb',
                                borderRadius: '10px',
                                fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                color: '#1e293b',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                                caretColor: '#3b82f6',
                            }}
                            onFocus={e => e.target.style.borderColor = '#93c5fd'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    {/* Preview */}
                    {form.name.trim() && (
                        <div style={{
                            padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
                            background: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(8px, 2vw, 10px)',
                            flexWrap: 'wrap',
                        }}>
                            <div style={{
                                width: 'clamp(32px, 7vw, 34px)',
                                height: 'clamp(32px, 7vw, 34px)',
                                borderRadius: '9px',
                                background: form.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${form.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {form.type === 'credit'
                                    ? <TrendingUp size={15} color="#10b981" />
                                    : <TrendingDown size={15} color="#ef4444" />
                                }
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{
                                    fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                    color: '#94a3b8',
                                    marginBottom: '2px',
                                }}>
                                    Preview
                                </div>
                                <div style={{
                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {form.name}
                                </div>
                            </div>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)',
                                fontWeight: 700,
                                background: form.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                color: form.type === 'credit' ? '#059669' : '#dc2626',
                                border: `1px solid ${form.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                whiteSpace: 'nowrap',
                            }}>
                                {form.type === 'credit' ? '↑ Credit' : '↓ Debit'}
                            </span>
                        </div>
                    )}

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
                                flex: '1',
                                minWidth: '100px',
                                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)',
                                borderRadius: '10px',
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
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: '1',
                                minWidth: '100px',
                                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 22px)',
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
                                    <span className="loading-text">{editCategory ? 'Updating...' : 'Adding...'}</span>
                                    <span className="loading-text-short" style={{ display: 'none' }}>...</span>
                                </>
                            ) : (
                                <>
                                    {editCategory ? <Edit3 size={15} /> : <Plus size={15} />}
                                    <span className="submit-text">{editCategory ? 'Update Category' : 'Add Category'}</span>
                                    <span className="submit-text-short" style={{ display: 'none' }}>
                                        {editCategory ? 'Update' : 'Add'}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @media (max-width: 480px) {
                    .type-full-label {
                        display: none !important;
                    }
                    .type-short-label {
                        display: inline !important;
                    }
                    .submit-text, .loading-text {
                        display: none !important;
                    }
                    .submit-text-short, .loading-text-short {
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