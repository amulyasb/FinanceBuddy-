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
        <div style={{ overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontFamily: "'Inter', sans-serif",
                minWidth: '600px',
            }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        {[
                            { key: '#', hide: 'mobile' },
                            { key: 'Date', hide: false },
                            { key: 'Type', hide: false },
                            { key: 'Category', hide: 'tablet' },
                            { key: 'Remark', hide: 'desktop-only' },
                            { key: 'Amount', hide: false },
                            { key: 'Balance', hide: 'mobile' },
                            { key: 'Actions', hide: false },
                        ].map((h) => (
                            <th
                                key={h.key}
                                className={h.hide ? `hide-${h.hide}` : ''}
                                style={{
                                    padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)',
                                    textAlign: ['Amount', 'Balance'].includes(h.key) ? 'right' : 
                                              h.key === 'Actions' ? 'center' : 'left',
                                    fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.07em',
                                    background: '#fafafa',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {h.key}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, idx) => (
                        <tr
                            key={tx.id}
                            style={{
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* # */}
                            <td className="hide-mobile" style={{ 
                                padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)', 
                                color: '#cbd5e1', 
                                fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)', 
                                fontWeight: 600 
                            }}>
                                {idx + 1}
                            </td>

                            {/* Date */}
                            <td style={{ 
                                padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)', 
                                color: '#64748b', 
                                whiteSpace: 'nowrap', 
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)' 
                            }}>
                                {formatDate(tx.date)}
                            </td>

                            {/* Type */}
                            <td style={{ padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px clamp(8px, 2vw, 10px)',
                                    borderRadius: '20px',
                                    fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)',
                                    fontWeight: 700,
                                    background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                    color: tx.type === 'credit' ? '#059669' : '#dc2626',
                                    border: `1px solid ${tx.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {tx.type === 'credit'
                                        ? <ArrowUpRight size={11} />
                                        : <ArrowDownLeft size={11} />
                                    }
                                    <span className="hide-mobile">{tx.type === 'credit' ? 'Credit' : 'Debit'}</span>
                                </span>
                            </td>

                            {/* Category */}
                            <td className="hide-tablet" style={{ 
                                padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)', 
                                color: '#64748b', 
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)' 
                            }}>
                                {tx.categories?.name ? (
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '3px 9px',
                                        borderRadius: '6px',
                                        background: '#f1f5f9',
                                        fontSize: 'clamp(0.7rem, 1.6vw, 0.78rem)',
                                        fontWeight: 500,
                                        color: '#475569',
                                    }}>
                                        {tx.categories.name}
                                    </span>
                                ) : (
                                    <span style={{ color: '#cbd5e1' }}>—</span>
                                )}
                            </td>

                            {/* Remark */}
                            <td className="hide-desktop-only" style={{
                                padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)',
                                color: '#94a3b8',
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)',
                                maxWidth: '180px',
                            }}>
                                <span style={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }} title={tx.remark || ''}>
                                    {tx.remark || <span style={{ color: '#e2e8f0' }}>—</span>}
                                </span>
                            </td>

                            {/* Amount */}
                            <td style={{ 
                                padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)', 
                                textAlign: 'right', 
                                whiteSpace: 'nowrap' 
                            }}>
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                    color: tx.type === 'credit' ? '#10b981' : '#ef4444',
                                }}>
                                    {tx.type === 'credit' ? '+' : '−'}{formatCurrency(tx.amount)}
                                </span>
                            </td>

                            {/* Balance */}
                            <td className="hide-mobile" style={{
                                padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)',
                                textAlign: 'right',
                                fontWeight: 700,
                                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                            }}>
                                {formatCurrency(tx.running_balance)}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: 'clamp(10px, 2.5vw, 13px) clamp(8px, 2vw, 16px)', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => onEdit(tx)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 'clamp(28px, 6vw, 30px)',
                                            height: 'clamp(28px, 6vw, 30px)',
                                            borderRadius: '8px',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            cursor: 'pointer',
                                            color: '#3b82f6',
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
                                        <Edit2 size={13} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(tx)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 'clamp(28px, 6vw, 30px)',
                                            height: 'clamp(28px, 6vw, 30px)',
                                            borderRadius: '8px',
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            cursor: 'pointer',
                                            color: '#ef4444',
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile {
                        display: none !important;
                    }
                }
                
                @media (max-width: 1024px) {
                    .hide-tablet {
                        display: none !important;
                    }
                }
                
                @media (min-width: 1025px) {
                    .hide-desktop-only {
                        display: table-cell !important;
                    }
                }
                
                @media (max-width: 1024px) {
                    .hide-desktop-only {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}