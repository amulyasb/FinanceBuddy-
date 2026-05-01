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
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, Menu, Filter, X } from 'lucide-react'

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16',
    '#ec4899', '#14b8a6',
]

const getMonthKey = (dateValue) => {
    try {
        return format(parseISO(dateValue), 'yyyy-MM')
    } catch {
        return String(dateValue || '').slice(0, 7)
    }
}

const formatMonthKey = (monthKey, short = false) => {
    if (!monthKey) return 'Recent month'
    try {
        return format(parseISO(`${monthKey}-01`), short ? 'MMM yyyy' : 'MMMM yyyy')
    } catch {
        return monthKey
    }
}

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
    const [selectedYear, setSelectedYear] = useState('')
    const [selectedMonthKey, setSelectedMonthKey] = useState('')
    const [showExpenseFilterModal, setShowExpenseFilterModal] = useState(false)
    const [draftYear, setDraftYear] = useState('')
    const [draftMonthKey, setDraftMonthKey] = useState('')

    useEffect(() => {
        if (!selectedAccount) return
        fetchTransactions(selectedAccount.id)
    }, [selectedAccount, fetchTransactions])

    const monthlyData = useMemo(
        () => groupByMonth(transactions),
        [transactions]
    )

    const monthOptions = useMemo(() => {
        return Array.from(
            new Set(
                transactions
                    .filter(t => t.type === 'debit')
                    .map(t => getMonthKey(t.date))
                    .filter(Boolean)
            )
        )
            .sort((a, b) => b.localeCompare(a))
            .map(key => {
                const [year, month] = key.split('-')
                return { key, year, month }
            })
    }, [transactions])

    const yearOptions = useMemo(() => {
        return Array.from(new Set(monthOptions.map(m => m.year))).sort((a, b) => b.localeCompare(a))
    }, [monthOptions])

    const filteredMonthOptions = useMemo(() => {
        if (!selectedYear) return monthOptions
        return monthOptions.filter(m => m.year === selectedYear)
    }, [monthOptions, selectedYear])

    const draftFilteredMonthOptions = useMemo(() => {
        if (!draftYear) return monthOptions
        return monthOptions.filter(m => m.year === draftYear)
    }, [monthOptions, draftYear])

    useEffect(() => {
        if (!selectedMonthKey) return
        if (!filteredMonthOptions.some(m => m.key === selectedMonthKey)) {
            setSelectedMonthKey('')
        }
    }, [filteredMonthOptions, selectedMonthKey])

    useEffect(() => {
        if (!draftMonthKey) return
        if (!draftFilteredMonthOptions.some(m => m.key === draftMonthKey)) {
            setDraftMonthKey('')
        }
    }, [draftFilteredMonthOptions, draftMonthKey])

    const effectiveMonthKey = selectedMonthKey || filteredMonthOptions[0]?.key || ''
    const selectedPeriodLabel = formatMonthKey(effectiveMonthKey)

    const openExpenseFilterModal = () => {
        setDraftYear(selectedYear)
        setDraftMonthKey(selectedMonthKey)
        setShowExpenseFilterModal(true)
    }

    const applyExpenseFilter = () => {
        setSelectedYear(draftYear)
        setSelectedMonthKey(draftMonthKey)
        setShowExpenseFilterModal(false)
    }

    const expensePie = useMemo(() => {
        const catMap = {}
        transactions
            .filter(t => t.type === 'debit')
            .filter(t => !effectiveMonthKey || getMonthKey(t.date) === effectiveMonthKey)
            .forEach(t => {
                const name = t.categories?.name || 'Uncategorized'
                catMap[name] = (catMap[name] || 0) + parseFloat(t.amount)
            })
        return Object.entries(catMap).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
        }))
    }, [transactions, effectiveMonthKey])

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
                                    <div style={{
                                        marginBottom: 'clamp(12px, 3vw, 16px)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        flexWrap: 'wrap',
                                    }}>
                                        <div>
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
                                                By category • {selectedPeriodLabel}
                                            </p>
                                        </div>

                                        <button
                                            onClick={openExpenseFilterModal}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                border: '1px solid #dbeafe',
                                                background: '#eff6ff',
                                                color: '#1e40af',
                                                borderRadius: '9px',
                                                padding: '6px 10px',
                                                fontSize: 'clamp(0.68rem, 1.6vw, 0.74rem)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Filter size={14} />
                                            Filter
                                        </button>
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
                                            No expenses recorded for {selectedPeriodLabel}
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

            {showExpenseFilterModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1100,
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                        width: '100%',
                        maxWidth: '520px',
                        padding: '20px',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            marginBottom: '14px',
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                                    Filter Expense Breakdown
                                </h3>
                                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                                    Select year and month
                                </p>
                            </div>
                            <button
                                onClick={() => setShowExpenseFilterModal(false)}
                                style={{
                                    background: '#f1f5f9',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '9px',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    padding: '6px',
                                    display: 'flex',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <button
                                    onClick={() => {
                                        setDraftYear('')
                                        setDraftMonthKey('')
                                    }}
                                    style={{
                                        border: !draftYear ? '1px solid #93c5fd' : '1px solid #e5e7eb',
                                        background: !draftYear ? '#eff6ff' : '#fff',
                                        color: !draftYear ? '#1e40af' : '#64748b',
                                        borderRadius: '999px',
                                        padding: '5px 10px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Recent
                                </button>
                                {yearOptions.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => {
                                            setDraftYear(year)
                                            setDraftMonthKey('')
                                        }}
                                        style={{
                                            border: draftYear === year ? '1px solid #93c5fd' : '1px solid #e5e7eb',
                                            background: draftYear === year ? '#eff6ff' : '#fff',
                                            color: draftYear === year ? '#1e40af' : '#64748b',
                                            borderRadius: '999px',
                                            padding: '5px 10px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {draftFilteredMonthOptions.map(option => (
                                    <button
                                        key={option.key}
                                        onClick={() => {
                                            setDraftYear(option.year)
                                            setDraftMonthKey(option.key)
                                        }}
                                        style={{
                                            border: draftMonthKey === option.key ? '1px solid #93c5fd' : '1px solid #e5e7eb',
                                            background: draftMonthKey === option.key ? '#eff6ff' : '#fff',
                                            color: draftMonthKey === option.key ? '#1e40af' : '#64748b',
                                            borderRadius: '999px',
                                            padding: '5px 10px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {formatMonthKey(option.key, true)}
                                    </button>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                marginTop: '4px',
                            }}>
                                <button
                                    onClick={() => setShowExpenseFilterModal(false)}
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        background: '#fff',
                                        color: '#374151',
                                        borderRadius: '9px',
                                        padding: '8px 14px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyExpenseFilter}
                                    style={{
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                        color: '#fff',
                                        borderRadius: '9px',
                                        padding: '8px 14px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
