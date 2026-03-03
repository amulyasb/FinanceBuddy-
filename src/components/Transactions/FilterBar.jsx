import { useState, useEffect } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react'

export default function FilterBar({ onFilter, onClear }) {
    const { categories, fetchCategories } = useCategories()
    const [open, setOpen] = useState(false)
    const [filters, setFilters] = useState({
        start_date: '', end_date: '', type: '',
        category_id: '', remark: '', min_amount: '', max_amount: '',
    })

    useEffect(() => { fetchCategories() }, [fetchCategories])

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

    const handleApply = () => {
        const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
        onFilter(active)
        setOpen(false)
    }

    const handleClear = () => {
        setFilters({
            start_date: '', end_date: '', type: '',
            category_id: '', remark: '', min_amount: '', max_amount: '',
        })
        onClear()
        setOpen(false)
    }

    const activeCount = Object.values(filters).filter(v => v !== '').length

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    padding: 'clamp(8px, 2vw, 9px) clamp(12px, 3vw, 14px)',
                    borderRadius: '10px',
                    border: activeCount > 0 ? '1.5px solid #93c5fd' : '1px solid #e5e7eb',
                    background: activeCount > 0 ? '#eff6ff' : '#fff',
                    color: activeCount > 0 ? '#1e40af' : '#374151',
                    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
                onMouseLeave={e => {
                    if (activeCount === 0) e.currentTarget.style.borderColor = '#e5e7eb'
                }}
            >
                <SlidersHorizontal size={15} />
                <span className="filter-text">Filters</span>
                {activeCount > 0 && (
                    <span style={{
                        background: '#3b82f6',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(0.65rem, 1.5vw, 0.68rem)',
                        fontWeight: 800,
                    }}>
                        {activeCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 40,
                        }}
                    />
                    <div className="filter-dropdown" style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: 'clamp(16px, 3vw, 20px)',
                        zIndex: 50,
                        width: 'clamp(280px, 70vw, 340px)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'clamp(14px, 3vw, 18px)',
                            gap: '8px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Filter size={13} color="#3b82f6" />
                                </div>
                                <span style={{ 
                                    fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', 
                                    fontWeight: 700, 
                                    color: '#1e293b',
                                    wordBreak: 'break-word',
                                }}>
                                    Filter Transactions
                                </span>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '7px',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    padding: '5px',
                                    display: 'flex',
                                    flexShrink: 0,
                                }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 'clamp(12px, 2.5vw, 14px)' 
                        }}>
                            {/* Date Range */}
                            <div>
                                <label style={labelStyle}>Date Range</label>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '8px', 
                                    marginTop: '6px' 
                                }}>
                                    <input
                                        name="start_date"
                                        type="date"
                                        value={filters.start_date}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                    <input
                                        name="end_date"
                                        type="date"
                                        value={filters.end_date}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label style={labelStyle}>Transaction Type</label>
                                <select
                                    name="type"
                                    value={filters.type}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, marginTop: '6px' }}
                                >
                                    <option value="">All Types</option>
                                    <option value="credit">Credit (Income)</option>
                                    <option value="debit">Debit (Expense)</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select
                                    name="category_id"
                                    value={filters.category_id}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, marginTop: '6px' }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Remark */}
                            <div>
                                <label style={labelStyle}>Search Remark</label>
                                <div style={{ position: 'relative', marginTop: '6px' }}>
                                    <Search size={13} style={{
                                        position: 'absolute',
                                        left: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8',
                                    }} />
                                    <input
                                        name="remark"
                                        placeholder="Search in remarks..."
                                        value={filters.remark}
                                        onChange={handleChange}
                                        style={{ ...inputStyle, paddingLeft: '30px' }}
                                    />
                                </div>
                            </div>

                            {/* Amount Range */}
                            <div>
                                <label style={labelStyle}>Amount Range</label>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '8px', 
                                    marginTop: '6px' 
                                }}>
                                    <input
                                        name="min_amount"
                                        type="number"
                                        placeholder="Min"
                                        min="0"
                                        value={filters.min_amount}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                    <input
                                        name="max_amount"
                                        type="number"
                                        placeholder="Max"
                                        min="0"
                                        value={filters.max_amount}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            marginTop: 'clamp(14px, 3vw, 18px)',
                            flexWrap: 'wrap',
                        }}>
                            <button
                                onClick={handleClear}
                                style={{
                                    flex: 1,
                                    minWidth: '100px',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb',
                                    background: '#fff',
                                    color: '#374151',
                                    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApply}
                                style={{
                                    flex: 1,
                                    minWidth: '100px',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                    color: '#fff',
                                    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </>
            )}
            
            <style>{`
                @media (max-width: 480px) {
                    .filter-text {
                        display: none;
                    }
                    
                    .filter-dropdown {
                        left: 50% !important;
                        right: auto !important;
                        transform: translateX(-50%) !important;
                    }
                }
            `}</style>
        </div>
    )
}

const labelStyle = {
    fontSize: 'clamp(0.73rem, 1.8vw, 0.78rem)',
    fontWeight: 600,
    color: '#374151',
    display: 'block',
}

const inputStyle = {
    width: '100%',
    padding: 'clamp(8px, 2vw, 9px) clamp(10px, 2.5vw, 12px)',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '9px',
    fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
}