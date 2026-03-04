import { useState, useEffect } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react'

export default function FilterBar({ onFilter, onClear }) {
    const { categories, fetchCategories } = useCategories()
    const [filters, setFilters] = useState({
        start_date: '', end_date: '', type: '',
        category_id: '', remark: '', min_amount: '', max_amount: '',
    })
    const [expanded, setExpanded] = useState(false)

    useEffect(() => { fetchCategories() }, [fetchCategories])

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

    const handleApply = () => {
        const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
        onFilter(active)
        if (window.innerWidth <= 768) setExpanded(false)
    }

    const handleClear = () => {
        setFilters({
            start_date: '', end_date: '', type: '',
            category_id: '', remark: '', min_amount: '', max_amount: '',
        })
        onClear()
    }

    const activeCount = Object.values(filters).filter(v => v !== '').length

    return (
        <div style={{ width: '100%' }}>
            {/* Filter Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'clamp(12px, 3vw, 16px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)' }}>
                    <div style={{
                        width: 'clamp(28px, 7vw, 32px)',
                        height: 'clamp(28px, 7vw, 32px)',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Filter size={14} color="#3b82f6" />
                    </div>
                    <span style={{ 
                        fontSize: 'clamp(0.85rem, 2.2vw, 1rem)', 
                        fontWeight: 700, 
                        color: '#1e293b',
                    }}>
                        Filter Transactions
                    </span>
                    {activeCount > 0 && (
                        <span style={{
                            background: '#3b82f6',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 'clamp(18px, 4.5vw, 22px)',
                            height: 'clamp(18px, 4.5vw, 22px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'clamp(0.65rem, 1.6vw, 0.7rem)',
                            fontWeight: 700,
                        }}>
                            {activeCount}
                        </span>
                    )}
                </div>

                {/* Mobile Toggle Button */}
                <button
                    className="mobile-filter-toggle"
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: expanded ? '#eff6ff' : '#fff',
                        color: expanded ? '#3b82f6' : '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    {expanded ? (
                        <>
                            <ChevronUp size={14} />
                            <span>Hide</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown size={14} />
                            <span>Show</span>
                        </>
                    )}
                </button>
            </div>

            {/* Filter Content */}
            <div className="filter-content" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: 'clamp(10px, 2.5vw, 16px)',
            }}>
                {/* Date Range */}
                <div className="filter-date-range">
                    <label style={labelStyle}>Date Range</label>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: 'clamp(6px, 1.5vw, 8px)', 
                        marginTop: '6px' 
                    }}>
                        <input
                            name="start_date"
                            type="date"
                            value={filters.start_date}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Start Date"
                        />
                        <input
                            name="end_date"
                            type="date"
                            value={filters.end_date}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="End Date"
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
                <div className="filter-remark">
                    <label style={labelStyle}>Search Remark</label>
                    <div style={{ position: 'relative', marginTop: '6px' }}>
                        <Search size={13} style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                        }} />
                        <input
                            name="remark"
                            placeholder="Search in remarks..."
                            value={filters.remark}
                            onChange={handleChange}
                            style={{ ...inputStyle, paddingLeft: 'clamp(32px, 8vw, 36px)' }}
                        />
                    </div>
                </div>

                {/* Amount Range */}
                <div>
                    <label style={labelStyle}>Min Amount</label>
                    <input
                        name="min_amount"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={filters.min_amount}
                        onChange={handleChange}
                        style={{ ...inputStyle, marginTop: '6px' }}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Max Amount</label>
                    <input
                        name="max_amount"
                        type="number"
                        placeholder="∞"
                        min="0"
                        value={filters.max_amount}
                        onChange={handleChange}
                        style={{ ...inputStyle, marginTop: '6px' }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="filter-actions" style={{ 
                display: 'flex', 
                gap: 'clamp(8px, 2vw, 10px)', 
                marginTop: 'clamp(16px, 4vw, 20px)',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
            }}>
                <button
                    onClick={handleClear}
                    style={{
                        flex: '0 1 auto',
                        padding: 'clamp(8px, 2vw, 10px) clamp(14px, 3.5vw, 18px)',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        color: '#374151',
                        fontSize: 'clamp(0.75rem, 1.9vw, 0.875rem)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        minWidth: 'clamp(80px, 20vw, 100px)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                    Clear All
                </button>
                <button
                    onClick={handleApply}
                    style={{
                        flex: '0 1 auto',
                        padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                        color: '#fff',
                        fontSize: 'clamp(0.75rem, 1.9vw, 0.875rem)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        transition: 'opacity 0.2s',
                        minWidth: 'clamp(100px, 25vw, 120px)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    Apply Filters
                </button>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .mobile-filter-toggle {
                        display: flex !important;
                    }
                    
                    .filter-content {
                        display: ${expanded ? 'grid' : 'none'} !important;
                        grid-template-columns: 1fr !important;
                        animation: ${expanded ? 'slideDown 0.2s ease-out' : 'none'};
                    }
                    
                    .filter-date-range {
                        grid-column: span 1 !important;
                    }
                    
                    .filter-date-range > div {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .filter-remark {
                        grid-column: span 1 !important;
                    }
                    
                    .filter-actions {
                        display: ${expanded ? 'flex' : 'none'} !important;
                        flex-direction: column !important;
                    }
                    
                    .filter-actions button {
                        width: 100% !important;
                        min-width: unset !important;
                    }
                }
                
                @media (min-width: 769px) and (max-width: 1024px) {
                    .filter-date-range {
                        grid-column: span 2;
                    }
                    
                    .filter-remark {
                        grid-column: span 2;
                    }
                }
                
                @media (min-width: 1025px) {
                    .filter-date-range {
                        grid-column: span 2;
                    }
                    
                    .filter-remark {
                        grid-column: span 2;
                    }
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

const labelStyle = {
    fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
    fontWeight: 600,
    color: '#374151',
    display: 'block',
}

const inputStyle = {
    width: '100%',
    padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 13px)',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '9px',
    fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
}