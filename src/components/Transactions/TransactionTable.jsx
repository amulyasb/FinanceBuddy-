import { formatCurrency, formatDate } from '../../lib/utils'
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react'

export default function TransactionTable({ transactions, onEdit, onDelete, loading }) {

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(32px, 8vw, 48px)',
                gap: '12px',
            }}>
                <div style={{
                    width: '28px',
                    height: '28px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                }} />
                <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: '#94a3b8' }}>
                    Loading transactions...
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 'clamp(32px, 8vw, 52px) clamp(16px, 4vw, 24px)',
            }}>
                <div style={{
                    width: 'clamp(48px, 10vw, 52px)',
                    height: 'clamp(48px, 10vw, 52px)',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                }}>
                    <Activity size={22} color="#94a3b8" />
                </div>
                <div style={{ 
                    fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', 
                    fontWeight: 600, 
                    color: '#475569' 
                }}>
                    No transactions found
                </div>
                <div style={{ 
                    fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)', 
                    color: '#94a3b8', 
                    marginTop: '6px' 
                }}>
                    Add your first transaction or adjust filters
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                            {['Date', 'Type', 'Category', 'Remark', 'Amount', 'Balance', 'Actions'].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: '12px 16px',
                                        textAlign: ['Amount', 'Balance'].includes(h) ? 'right' : 
                                                h === 'Actions' ? 'center' : 'left',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        background: '#fafafa',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr
                                key={tx.id}
                                style={{
                                    borderBottom: '1px solid #f1f5f9',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                    {formatDate(tx.date)}
                                </td>

                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 8px',
                                        borderRadius: '16px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                        color: tx.type === 'credit' ? '#059669' : '#dc2626',
                                        border: `1px solid ${tx.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                    }}>
                                        {tx.type === 'credit' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                                        {tx.type === 'credit' ? 'Credit' : 'Debit'}
                                    </span>
                                </td>

                                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                                    {tx.categories?.name ? (
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 7px',
                                            borderRadius: '5px',
                                            background: '#f1f5f9',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            color: '#475569',
                                        }}>
                                            {tx.categories.name}
                                        </span>
                                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                </td>

                                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem', maxWidth: '200px' }}>
                                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.remark || ''}>
                                        {tx.remark || <span style={{ color: '#e2e8f0' }}>—</span>}
                                    </span>
                                </td>

                                <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <span style={{
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        color: tx.type === 'credit' ? '#10b981' : '#ef4444',
                                    }}>
                                        {tx.type === 'credit' ? '+' : '−'}{formatCurrency(tx.amount)}
                                    </span>
                                </td>

                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap' }}>
                                    {formatCurrency(tx.running_balance)}
                                </td>

                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        <button onClick={() => onEdit(tx)} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: '28px', height: '28px', borderRadius: '6px',
                                            background: '#eff6ff', border: '1px solid #bfdbfe',
                                            cursor: 'pointer', color: '#3b82f6', transition: 'all 0.15s',
                                        }}>
                                            <Edit2 size={12} />
                                        </button>
                                        <button onClick={() => onDelete(tx)} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: '28px', height: '28px', borderRadius: '6px',
                                            background: '#fef2f2', border: '1px solid #fecaca',
                                            cursor: 'pointer', color: '#ef4444', transition: 'all 0.15s',
                                        }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-card-view" style={{ display: 'none' }}>
                {transactions.map((tx) => (
                    <div key={tx.id} style={{
                        padding: '14px',
                        borderBottom: '1px solid #f1f5f9',
                        background: '#fff',
                    }}>
                        {/* Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>
                                    {formatDate(tx.date)}
                                </div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 7px',
                                    borderRadius: '12px',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                    color: tx.type === 'credit' ? '#059669' : '#dc2626',
                                    border: `1px solid ${tx.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                }}>
                                    {tx.type === 'credit' ? <ArrowUpRight size={9} /> : <ArrowDownLeft size={9} />}
                                    {tx.type === 'credit' ? 'Credit' : 'Debit'}
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    color: tx.type === 'credit' ? '#10b981' : '#ef4444',
                                }}>
                                    {tx.type === 'credit' ? '+' : '−'}{formatCurrency(tx.amount)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                                    Bal: {formatCurrency(tx.running_balance)}
                                </div>
                            </div>
                        </div>

                        {/* Details Row */}
                        {(tx.categories?.name || tx.remark) && (
                            <div style={{ marginBottom: '10px' }}>
                                {tx.categories?.name && (
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: '#f1f5f9',
                                        fontSize: '0.68rem',
                                        fontWeight: 500,
                                        color: '#475569',
                                        marginRight: '6px',
                                    }}>
                                        {tx.categories.name}
                                    </span>
                                )}
                                {tx.remark && (
                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                        {tx.remark}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Actions Row */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => onEdit(tx)} style={{
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                padding: '7px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                cursor: 'pointer',
                                color: '#3b82f6',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                            }}>
                                <Edit2 size={11} />
                                Edit
                            </button>
                            <button onClick={() => onDelete(tx)} style={{
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                padding: '7px',
                                borderRadius: '6px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                cursor: 'pointer',
                                color: '#ef4444',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                            }}>
                                <Trash2 size={11} />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <style>{`
                @media (max-width: 768px) {
                    .desktop-table-view {
                        display: none !important;
                    }
                    .mobile-card-view {
                        display: block !important;
                    }
                }
            `}</style>
        </>
    )
}