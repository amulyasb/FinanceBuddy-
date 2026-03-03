import { useEffect, useMemo, useState } from 'react'
import { useAccount } from '../hooks/useAccount'
import { useTransactions } from '../hooks/useTransactions'
import { groupByMonth, formatCurrency, profitColor } from '../lib/utils'
import { format, parseISO } from 'date-fns'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import AccountSelector from '../components/Accounts/AccountSelector'
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, Menu } from 'lucide-react'

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16',
    '#ec4899', '#14b8a6',
]

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: 'clamp(8px, 2vw, 10px)', 
            padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px)',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
            {label && (
                <div style={{ 
                    color: '#94a3b8', 
                    marginBottom: '6px', 
                    fontWeight: 600,
                    fontSize: 'clamp(0.7rem, 1.6vw, 0.78rem)',
                }}>
                    {label}
                </div>
            )}
            {payload.map(p => (
                <div key={p.dataKey || p.name} style={{ 
                    color: p.color, 
                    fontWeight: 700,
                    fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)',
                }}>
                    {p.name}: {formatCurrency(p.value)}
                </div>
            ))}
        </div>
    )
}

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: 'clamp(8px, 2vw, 10px)', 
            padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px)',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            maxWidth: '200px',
        }}>
            <div style={{ 
                color: '#1e293b', 
                fontWeight: 700, 
                marginBottom: '2px',
                fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)',
                wordBreak: 'break-word',
            }}>
                {payload[0].payload.name}
            </div>
            <div style={{ 
                color: '#ef4444', 
                fontWeight: 600,
                fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)',
            }}>
                {formatCurrency(payload[0].value)}
            </div>
        </div>
    )
}

export default function Analytics() {
    const { selectedAccount } = useAccount()
    const { transactions, fetchTransactions } = useTransactions()
    const [showAccountPanel, setShowAccountPanel] = useState(false)

    useEffect(() => {
        if (!selectedAccount) return
        fetchTransactions(selectedAccount.id)
    }, [selectedAccount, fetchTransactions])

    const monthlyData = useMemo(
        () => groupByMonth(transactions),
        [transactions]
    )

    const expensePie = useMemo(() => {
        const catMap = {}
        transactions
            .filter(t => t.type === 'debit')
            .forEach(t => {
                const name = t.categories?.name || 'Uncategorized'
                catMap[name] = (catMap[name] || 0) + parseFloat(t.amount)
            })
        return Object.entries(catMap).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
        }))
    }, [transactions])

    const lineData = useMemo(
        () => transactions.map(tx => ({ date: tx.date, balance: tx.running_balance })),
        [transactions]
    )

    return (
        <div style={{
            maxWidth: 1200, 
            margin: '0 auto',
            padding: 'clamp(16px, 4vw, 24px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
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
            <div style={{ marginBottom: 'clamp(20px, 5vw, 28px)' }}>
                <h1 style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 1.65rem)', 
                    fontWeight: 800, 
                    color: '#1e293b', 
                    marginBottom: '4px',
                    wordBreak: 'break-word',
                }}>
                    Analytics
                </h1>
                <p style={{ 
                    color: '#94a3b8', 
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    wordBreak: 'break-word',
                }}>
                    Financial intelligence & insights
                </p>
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

                {/* Charts Panel */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'clamp(14px, 3.5vw, 20px)',
                    minWidth: 0,
                }}>

                    {/* No account selected */}
                    {!selectedAccount && (
                        <div style={{
                            textAlign: 'center', 
                            padding: 'clamp(40px, 10vw, 56px) clamp(16px, 4vw, 24px)',
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
                                <BarChart3 size={24} color="#94a3b8" />
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
                                marginTop: '6px' 
                            }}>
                                Select an account to view analytics
                            </div>
                        </div>
                    )}

                    {/* No transactions */}
                    {selectedAccount && transactions.length === 0 && (
                        <div style={{
                            textAlign: 'center', 
                            padding: 'clamp(40px, 10vw, 56px) clamp(16px, 4vw, 24px)',
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
                                No transactions yet
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', 
                                color: '#94a3b8', 
                                marginTop: '6px' 
                            }}>
                                Add transactions to see analytics
                            </div>
                        </div>
                    )}

                    {selectedAccount && transactions.length > 0 && (
                        <>
                            {/* Monthly Bar Chart */}
                            <div style={{
                                background: '#fff', 
                                borderRadius: 'clamp(14px, 3vw, 16px)',
                                padding: 'clamp(18px, 4vw, 22px) clamp(20px, 4vw, 24px)',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                            }}>
                                <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
                                    <h3 style={{ 
                                        fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', 
                                        fontWeight: 700, 
                                        color: '#1e293b',
                                        wordBreak: 'break-word',
                                    }}>
                                        Monthly Income vs Expenses
                                    </h3>
                                    <p style={{ 
                                        fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                        color: '#94a3b8', 
                                        marginTop: '3px' 
                                    }}>
                                        <span className="chart-subtitle-full">Last 12 months overview</span>
                                        <span className="chart-subtitle-short" style={{ display: 'none' }}>
                                            Monthly overview
                                        </span>
                                    </p>
                                </div>
                                <div style={{ width: '100%', overflowX: 'auto', marginLeft: 0, marginRight: 0 }}>
                                    <div style={{ minWidth: '500px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={monthlyData} barSize={14} barCategoryGap="30%">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="month"
                                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                    axisLine={false} 
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                    axisLine={false} 
                                                    tickLine={false}
                                                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                                />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                                <Legend 
                                                    wrapperStyle={{ 
                                                        color: '#64748b', 
                                                        fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', 
                                                        paddingTop: 12 
                                                    }} 
                                                />
                                                <Bar dataKey="credit" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="debit" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Monthly P&L badges */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: 'clamp(6px, 1.5vw, 8px)', 
                                    marginTop: 'clamp(12px, 3vw, 16px)',
                                }}>
                                    {monthlyData.map(m => {
                                        const profit = m.credit - m.debit
                                        return (
                                            <div key={m.month} style={{
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '5px',
                                                padding: 'clamp(3px, 1vw, 4px) clamp(8px, 2vw, 10px)', 
                                                borderRadius: '20px',
                                                fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', 
                                                fontWeight: 600,
                                                background: profit > 0 ? '#f0fdf4' : profit < 0 ? '#fef2f2' : '#f8fafc',
                                                border: `1px solid ${profit > 0 ? '#bbf7d0' : profit < 0 ? '#fecaca' : '#e5e7eb'}`,
                                                color: profitColor(profit),
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {profit > 0
                                                    ? <TrendingUp size={10} />
                                                    : profit < 0
                                                        ? <TrendingDown size={10} />
                                                        : <Minus size={10} />
                                                }
                                                <span className="month-full">{m.month}</span>
                                                <span className="month-short" style={{ display: 'none' }}>
                                                    {m.month.substring(0, 3)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Pie + Line Row */}
                            <div className="analytics-charts-row" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1.3fr',
                                gap: 'clamp(14px, 3.5vw, 20px)',
                            }}>
                                {/* Expense Breakdown Pie */}
                                <div style={{
                                    background: '#fff', 
                                    borderRadius: 'clamp(14px, 3vw, 16px)',
                                    padding: 'clamp(18px, 4vw, 22px) clamp(20px, 4vw, 24px)',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                                    minWidth: 0,
                                }}>
                                    <div style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                                        <h3 style={{ 
                                            fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', 
                                            fontWeight: 700, 
                                            color: '#1e293b',
                                            wordBreak: 'break-word',
                                        }}>
                                            Expense Breakdown
                                        </h3>
                                        <p style={{ 
                                            fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                            color: '#94a3b8', 
                                            marginTop: '3px' 
                                        }}>
                                            By category
                                        </p>
                                    </div>

                                    {expensePie.length > 0 ? (
                                        <>
                                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                <ResponsiveContainer width="100%" height={190} maxWidth={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={expensePie}
                                                            cx="50%" 
                                                            cy="50%"
                                                            innerRadius="45%" 
                                                            outerRadius="75%"
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                        >
                                                            {expensePie.map((_, i) => (
                                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<PieTooltip />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div style={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: 'clamp(5px, 1.5vw, 7px)', 
                                                marginTop: 'clamp(8px, 2vw, 12px)',
                                            }}>
                                                {expensePie.slice(0, 6).map((item, i) => (
                                                    <div key={item.name} style={{
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        fontSize: 'clamp(0.7rem, 1.6vw, 0.78rem)',
                                                        gap: '8px',
                                                    }}>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px',
                                                            minWidth: 0,
                                                            flex: 1,
                                                        }}>
                                                            <div style={{
                                                                width: '8px', 
                                                                height: '8px', 
                                                                borderRadius: '50%',
                                                                background: COLORS[i % COLORS.length],
                                                                flexShrink: 0,
                                                            }} />
                                                            <span style={{ 
                                                                color: '#64748b',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}>
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <span style={{ 
                                                            color: '#1e293b', 
                                                            fontWeight: 700,
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {formatCurrency(item.value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{
                                            height: 190,
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: '#94a3b8', 
                                            fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', 
                                            gap: '8px',
                                        }}>
                                            <Activity size={28} color="#e5e7eb" />
                                            No expenses recorded
                                        </div>
                                    )}
                                </div>

                                {/* Balance Line Chart */}
                                <div style={{
                                    background: '#fff', 
                                    borderRadius: 'clamp(14px, 3vw, 16px)',
                                    padding: 'clamp(18px, 4vw, 22px) clamp(20px, 4vw, 24px)',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                                    minWidth: 0,
                                }}>
                                    <div style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                                        <h3 style={{ 
                                            fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)', 
                                            fontWeight: 700, 
                                            color: '#1e293b',
                                            wordBreak: 'break-word',
                                        }}>
                                            Balance Over Time
                                        </h3>
                                        <p style={{ 
                                            fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                            color: '#94a3b8', 
                                            marginTop: '3px' 
                                        }}>
                                            Running balance trend
                                        </p>
                                    </div>
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <div style={{ minWidth: '450px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height={260}>
                                                <LineChart data={lineData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                                        axisLine={false} 
                                                        tickLine={false}
                                                        tickFormatter={d => {
                                                            try { return format(parseISO(d), 'dd MMM') } catch { return d }
                                                        }}
                                                        interval="preserveStartEnd"
                                                    />
                                                    <YAxis
                                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                        axisLine={false} 
                                                        tickLine={false}
                                                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="balance"
                                                        name="Balance"
                                                        stroke="#3b82f6"
                                                        strokeWidth={2.5}
                                                        dot={false}
                                                        activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .analytics-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .analytics-charts-row {
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
                    
                    .chart-subtitle-full {
                        display: none !important;
                    }
                    
                    .chart-subtitle-short {
                        display: inline !important;
                    }
                }
                
                @media (max-width: 640px) {
                    .month-full {
                        display: none !important;
                    }
                    
                    .month-short {
                        display: inline !important;
                    }
                }
            `}</style>
        </div>
    )
}