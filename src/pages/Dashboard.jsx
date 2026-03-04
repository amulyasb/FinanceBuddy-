import { useEffect, useMemo, useState } from 'react'
import { useAccount } from '../hooks/useAccount'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { useAuth } from '../hooks/useAuth'
import AccountSelector from '../components/Accounts/AccountSelector'
import { formatCurrency, calcSummary, groupByMonth } from '../lib/utils'
import {
    TrendingUp, TrendingDown, DollarSign, Activity,
    AlertTriangle, ArrowUpRight, ArrowDownLeft, Menu,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>{label}</div>
            {payload.map(p => (
                <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {formatCurrency(p.value)}
                </div>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const { selectedAccount } = useAccount()
    const { fetchAccounts } = useAccounts()
    const { transactions, fetchTransactions } = useTransactions()
    const navigate = useNavigate()
    const [showAccountPanel, setShowAccountPanel] = useState(false)

    const summary = useMemo(() => calcSummary(transactions), [transactions])
    const monthlyData = useMemo(() => groupByMonth(transactions), [transactions])

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    }

    useEffect(() => { fetchAccounts() }, [fetchAccounts])

    useEffect(() => {
        if (!selectedAccount) return
        fetchTransactions(selectedAccount.id)
    }, [selectedAccount, fetchTransactions])

    const isLow = selectedAccount &&
        selectedAccount.current_balance < selectedAccount.min_balance_threshold &&
        selectedAccount.min_balance_threshold > 0

    const statCards = [
        {
            label: 'Current Balance',
            value: formatCurrency(selectedAccount?.current_balance ?? 0),
            sub: selectedAccount?.account_name ?? '—',
            icon: <DollarSign size={18} color="#3b82f6" />,
            iconBg: '#eff6ff',
            iconBorder: '#bfdbfe',
            valueColor: '#1e293b',
        },
        {
            label: 'Total Income',
            value: formatCurrency(summary.totalCredit),
            sub: 'All credits',
            icon: <ArrowUpRight size={18} color="#10b981" />,
            iconBg: '#f0fdf4',
            iconBorder: '#bbf7d0',
            valueColor: '#10b981',
        },
        {
            label: 'Total Expenses',
            value: formatCurrency(summary.totalDebit),
            sub: 'All debits',
            icon: <ArrowDownLeft size={18} color="#ef4444" />,
            iconBg: '#fef2f2',
            iconBorder: '#fecaca',
            valueColor: '#ef4444',
        },
        {
            label: summary.profit >= 0 ? 'Net Profit' : 'Net Loss',
            value: formatCurrency(Math.abs(summary.profit)),
            sub: 'Income − Expenses',
            icon: summary.profit >= 0
                ? <TrendingUp size={18} color="#10b981" />
                : <TrendingDown size={18} color="#ef4444" />,
            iconBg: summary.profit >= 0 ? '#f0fdf4' : '#fef2f2',
            iconBorder: summary.profit >= 0 ? '#bbf7d0' : '#fecaca',
            valueColor: summary.profit >= 0 ? '#10b981' : '#ef4444',
        },
    ]

    const quickActions = [
        { label: 'Add Transaction', icon: '➕', onClick: () => navigate('/transactions'), primary: true },
        { label: 'Statement', icon: '📄', onClick: () => navigate('/statements') },
        { label: 'Analytics', icon: '📊', onClick: () => navigate('/analytics') },
        { label: 'Categories', icon: '🏷️', onClick: () => navigate('/categories') },
    ]

    return (
        <div style={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            padding: 'clamp(16px, 4vw, 24px)',
            fontFamily: "'Inter', sans-serif" 
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
                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                    fontWeight: '600',
                    color: '#374151',
                }}
            >
                <Menu size={18} />
                {selectedAccount ? selectedAccount.account_name : 'Select Account'}
            </button>

            {/* Header */}
            <div style={{ marginBottom: 'clamp(20px, 5vw, 28px)' }}>
                <h1 style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 1.65rem)', 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    marginBottom: '4px',
                    wordBreak: 'break-word',
                }}>
                    {greeting()}, {displayName} 👋
                </h1>
                <p style={{ 
                    color: '#94a3b8', 
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    wordBreak: 'break-word',
                }}>
                    Here's your financial overview for today
                </p>
            </div>

            {/* Layout Grid */}
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: 'clamp(16px, 4vw, 24px)',
                alignItems: 'start',
            }}>
                {/* Left: Accounts Panel */}
                <div 
                    className={`account-panel ${showAccountPanel ? 'show' : ''}`}
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: 'clamp(16px, 4vw, 20px)',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                        position: 'sticky',
                        top: 24,
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

                {/* Right: Main Content */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'clamp(16px, 4vw, 24px)',
                    minWidth: 0,
                }}>

                    {/* Low Balance Alert */}
                    {isLow && (
                        <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: 'clamp(10px, 2vw, 12px)',
                            padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 18px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(10px, 2.5vw, 12px)',
                        }}>
                            <div style={{
                                width: 'clamp(32px, 7vw, 36px)', 
                                height: 'clamp(32px, 7vw, 36px)', 
                                borderRadius: '50%',
                                background: '#fef3c7',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <AlertTriangle size={18} color="#f59e0b" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ 
                                    fontWeight: 700, 
                                    color: '#92400e', 
                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                    wordBreak: 'break-word',
                                }}>
                                    Balance Alert!
                                </div>
                                <div style={{ 
                                    color: '#b45309', 
                                    fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)', 
                                    marginTop: 2,
                                    wordBreak: 'break-word',
                                }}>
                                    {selectedAccount.account_name} is below the minimum threshold of{' '}
                                    {formatCurrency(selectedAccount.min_balance_threshold)}.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No Account */}
                    {!selectedAccount && (
                        <div style={{
                            textAlign: 'center', 
                            padding: 'clamp(40px, 10vw, 56px)',
                            background: '#fff',
                            borderRadius: 'clamp(14px, 3vw, 16px)',
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
                                marginTop: 6,
                                padding: '0 16px',
                            }}>
                                Create or select an account from the left panel
                            </div>
                        </div>
                    )}

                    {selectedAccount && (
                        <>
                            {/* Stat Cards */}
                        <div className="stat-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: 'clamp(12px, 3vw, 16px)',
                            }}>
                                {statCards.map((card) => (
                                    <div key={card.label} style={{
                                        background: '#fff',
                                        borderRadius: 'clamp(12px, 2.5vw, 14px)',
                                        padding: 'clamp(14px, 3.5vw, 18px) clamp(16px, 4vw, 20px)',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                                        transition: 'box-shadow 0.2s',
                                        minWidth: 0,
                                        height: 'clamp(160px, 35vw, 180px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'}
                                    >
                                        <div style={{
                                            width: 'clamp(34px, 7vw, 38px)', 
                                            height: 'clamp(34px, 7vw, 38px)', 
                                            borderRadius: 'clamp(8px, 2vw, 10px)',
                                            background: card.iconBg,
                                            border: `1px solid ${card.iconBorder}`,
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            marginBottom: 'clamp(10px, 2.5vw, 14px)',
                                            flexShrink: 0,
                                        }}>
                                            {card.icon}
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', 
                                            fontWeight: 700,
                                            color: '#94a3b8', 
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.07em', 
                                            marginBottom: 'clamp(6px, 1.5vw, 8px)',
                                            wordBreak: 'break-word',
                                            flexShrink: 0,
                                            lineHeight: 1.2,
                                        }}>
                                            {card.label}
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(1rem, 2.5vw, 1rem)', 
                                            fontWeight: 800,
                                            color: card.valueColor, 
                                            marginBottom: 'clamp(4px, 1vw, 6px)',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            lineHeight: 1.1,
                                        }}>
                                            {card.value}
                                        </div>
                                        <div style={{ 
                                            fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                            color: '#94a3b8',
                                            wordBreak: 'break-word',
                                            flexShrink: 0,
                                            lineHeight: 1.3,
                                        }}>
                                            {card.sub}
                                        </div>
                                    </div>
                                ))}
                        </div>
                            {/* Chart + Quick Actions */}
                            <div className="chart-actions-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 180px',
                                gap: 'clamp(16px, 4vw, 20px)',
                                alignItems: 'start',
                            }}>
                                {/* Monthly Chart */}
                                <div style={{
                                    background: '#fff',
                                    borderRadius: 'clamp(14px, 3vw, 16px)',
                                    padding: 'clamp(16px, 4vw, 20px) clamp(18px, 4.5vw, 24px)',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                                    minWidth: 0,
                                }}>
                                    <div style={{
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center', 
                                        marginBottom: 'clamp(16px, 4vw, 20px)',
                                        gap: '10px',
                                        flexWrap: 'wrap',
                                    }}>
                                        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                                            <h3 style={{ 
                                                fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', 
                                                fontWeight: 700, 
                                                color: '#1e293b',
                                                wordBreak: 'break-word',
                                            }}>
                                                Monthly Overview
                                            </h3>
                                            <p style={{ 
                                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                                color: '#94a3b8', 
                                                marginTop: 2 
                                            }}>
                                                Income vs Expenses
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/analytics')}
                                            style={{
                                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                                color: '#3b82f6',
                                                background: '#eff6ff', 
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px', 
                                                padding: 'clamp(4px, 1vw, 5px) clamp(10px, 2.5vw, 12px)',
                                                cursor: 'pointer', 
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            Full Analytics →
                                        </button>
                                    </div>
                                    {monthlyData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={monthlyData} barSize={14} barCategoryGap="30%">
                                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                                                    tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                                <Bar dataKey="credit" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="debit" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{
                                            height: 200, 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: '#94a3b8', 
                                            fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', 
                                            gap: 8,
                                        }}>
                                            <Activity size={28} color="#e5e7eb" />
                                            No transactions yet
                                        </div>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="quick-actions-list" style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 'clamp(8px, 2vw, 10px)' 
                                }}>
                                    {quickActions.map(action => (
                                        <button
                                            key={action.label}
                                            onClick={action.onClick}
                                            style={{
                                                width: '100%',
                                                padding: 'clamp(9px, 2.2vw, 11px) clamp(12px, 3vw, 14px)',
                                                borderRadius: 'clamp(8px, 2vw, 10px)',
                                                border: action.primary ? 'none' : '1px solid #e5e7eb',
                                                background: action.primary
                                                    ? 'linear-gradient(135deg, #1e40af, #3b82f6)'
                                                    : '#fff',
                                                color: action.primary ? '#fff' : '#374151',
                                                fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: action.primary
                                                    ? '0 4px 12px rgba(59,130,246,0.3)'
                                                    : '0 1px 4px rgba(0,0,0,0.05)',
                                                transition: 'opacity 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            <span>{action.icon}</span> {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            {transactions.length > 0 && (
                                <div style={{
                                    background: '#fff',
                                    borderRadius: 'clamp(14px, 3vw, 16px)',
                                    padding: 'clamp(16px, 4vw, 20px) clamp(18px, 4.5vw, 24px)',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                                }}>
                                    <div style={{
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center', 
                                        marginBottom: 'clamp(12px, 3vw, 16px)',
                                        gap: '10px',
                                        flexWrap: 'wrap',
                                    }}>
                                        <h3 style={{ 
                                            fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', 
                                            fontWeight: 700, 
                                            color: '#1e293b',
                                            wordBreak: 'break-word',
                                        }}>
                                            Recent Transactions
                                        </h3>
                                        <button
                                            onClick={() => navigate('/transactions')}
                                            style={{
                                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                                color: '#3b82f6',
                                                background: '#eff6ff', 
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '8px', 
                                                padding: 'clamp(4px, 1vw, 5px) clamp(10px, 2.5vw, 12px)',
                                                cursor: 'pointer', 
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            View All →
                                        </button>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: 'clamp(6px, 1.5vw, 8px)' 
                                    }}>
                                        {[...transactions].reverse().slice(0, 5).map((tx) => (
                                            <div key={tx.id} style={{
                                                display: 'flex', 
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
                                                background: '#f8fafc',
                                                borderRadius: 'clamp(8px, 2vw, 10px)',
                                                border: '1px solid #f1f5f9',
                                                transition: 'background 0.15s',
                                                gap: '12px',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                                            >
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 'clamp(10px, 2.5vw, 12px)',
                                                    minWidth: 0,
                                                    flex: 1,
                                                }}>
                                                    <div style={{
                                                        width: 'clamp(30px, 7vw, 34px)', 
                                                        height: 'clamp(30px, 7vw, 34px)', 
                                                        borderRadius: 'clamp(7px, 1.8vw, 9px)',
                                                        background: tx.type === 'credit' ? '#f0fdf4' : '#fef2f2',
                                                        border: `1px solid ${tx.type === 'credit' ? '#bbf7d0' : '#fecaca'}`,
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        {tx.type === 'credit'
                                                            ? <ArrowUpRight size={14} color="#10b981" />
                                                            : <ArrowDownLeft size={14} color="#ef4444" />
                                                        }
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ 
                                                            fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', 
                                                            color: '#1e293b', 
                                                            fontWeight: 600,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {tx.categories?.name || 'Uncategorized'}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: 'clamp(0.7rem, 1.6vw, 0.73rem)', 
                                                            color: '#94a3b8', 
                                                            marginTop: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {tx.remark || tx.date}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontWeight: 700, 
                                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                                    color: tx.type === 'credit' ? '#10b981' : '#ef4444',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0,
                                                }}>
                                                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .dashboard-grid { 
                        grid-template-columns: 1fr !important; 
                    }
                    .stat-grid { 
                        grid-template-columns: repeat(2, 1fr) !important; 
                    }
                    .chart-actions-grid { 
                        grid-template-columns: 1fr !important; 
                    }
                    .quick-actions-list {
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                    }
                    .quick-actions-list > button {
                        flex: 1 1 calc(50% - 8px) !important;
                        min-width: 140px !important;
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
                    
                    .stat-grid { 
                        grid-template-columns: repeat(2, 1fr) !important; 
                    }
                }
                
                @media (max-width: 480px) {
                    .stat-grid { 
                        grid-template-columns: 1fr !important; 
                    }
                    .quick-actions-list {
                        flex-direction: column !important;
                    }
                    .quick-actions-list > button {
                        flex: 1 1 100% !important;
                    }
                }
            `}</style>
        </div>
    )
}