import { useEffect, useState } from 'react'
import { useAccount } from '../hooks/useAccount'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate, generateStatementNumber } from '../lib/utils'
import AccountSelector from '../components/Accounts/AccountSelector'
import toast from 'react-hot-toast'
import { FileText, Plus, X, Eye, Trash2, Calendar, Menu } from 'lucide-react'
import PrintStatement from './PrintStatement'

export default function Statements() {
    const { user } = useAuth()
    const { selectedAccount } = useAccount()
    const [statements, setStatements] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [previewStatement, setPreviewStatement] = useState(null)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ start_date: '', end_date: '' })
    const [showAccountPanel, setShowAccountPanel] = useState(false)

    useEffect(() => {
        if (!selectedAccount) return
        let cancelled = false

        const load = async () => {
            const { data } = await supabase
                .from('statements').select('*')
                .eq('account_id', selectedAccount.id)
                .order('created_at', { ascending: false })
            if (!cancelled) setStatements(data || [])
        }

        load()

        return () => { cancelled = true }
    }, [selectedAccount])

    const fetchStatements = async () => {
        if (!selectedAccount) return
        const { data } = await supabase
            .from('statements').select('*')
            .eq('account_id', selectedAccount.id)
            .order('created_at', { ascending: false })
        setStatements(data || [])
    }

    const handleGenerate = async (e) => {
        e.preventDefault()
        if (!selectedAccount) { toast.error('Select an account first'); return }
        if (!form.start_date || !form.end_date) { toast.error('Select date range'); return }
        if (form.start_date > form.end_date) { toast.error('Start date must be before end date'); return }
        setLoading(true)

        const { data: txData } = await supabase
            .from('transactions')
            .select('*, categories!left(name, type)')
            .eq('account_id', selectedAccount.id)
            .gte('date', form.start_date)
            .lte('date', form.end_date)
            .order('date')

        const { data: prevTx } = await supabase
            .from('transactions').select('running_balance')
            .eq('account_id', selectedAccount.id)
            .lt('date', form.start_date)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)

        const openingBalance = prevTx?.length > 0
            ? prevTx[0].running_balance
            : selectedAccount.opening_balance

        const closingBalance = txData?.length > 0
            ? txData[txData.length - 1].running_balance
            : openingBalance

        const year = new Date().getFullYear()
        const { count } = await supabase
            .from('statements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        const statNumber = generateStatementNumber(year, (count || 0) + 1)

        const { data: stmt, error } = await supabase
            .from('statements')
            .insert({
                user_id: user.id,
                account_id: selectedAccount.id,
                statement_number: statNumber,
                start_date: form.start_date,
                end_date: form.end_date,
                opening_balance: openingBalance,
                closing_balance: closingBalance,
            })
            .select().single()

        if (error) {
            toast.error(error.message)
        } else {
            toast.success(`Statement ${statNumber} generated!`)
            setShowForm(false)
            setForm({ start_date: '', end_date: '' })
            await fetchStatements()
            setPreviewStatement({
                ...stmt,
                transactions: txData || [],
                account: selectedAccount,
                user: user?.user_metadata?.full_name || user?.email,
            })
        }
        setLoading(false)
    }

    const handlePreview = async (stmt) => {
        const { data: txData } = await supabase
            .from('transactions')
            .select('*, categories!left(name, type)')
            .eq('account_id', stmt.account_id)
            .gte('date', stmt.start_date)
            .lte('date', stmt.end_date)
            .order('date')
        setPreviewStatement({
            ...stmt,
            transactions: txData || [],
            account: selectedAccount,
            user: user?.user_metadata?.full_name || user?.email,
        })
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this statement?')) return
        await supabase.from('statements').delete().eq('id', id)
        await fetchStatements()
        toast.success('Statement deleted')
    }

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'clamp(16px, 4vw, 24px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
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
                    fontSize: '0.875rem',
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
                    Statements
                </h1>
                <p style={{
                    color: '#94a3b8',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    wordBreak: 'break-word',
                }}>
                    Generate and manage bank-style financial statements
                </p>
            </div>

            <div className="stmt-layout" style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: 'clamp(16px, 4vw, 24px)',
                alignItems: 'start',
            }}>
                {/* Accounts Panel */}
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

                {/* Right */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(12px, 3vw, 16px)',
                    minWidth: 0,
                }}>
                    {!selectedAccount ? (
                        <div style={{
                            textAlign: 'center',
                            padding: 'clamp(32px, 8vw, 56px) clamp(16px, 4vw, 24px)',
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
                                <FileText size={24} color="#94a3b8" />
                            </div>
                            <div style={{
                                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                                fontWeight: 600,
                                color: '#475569',
                            }}>
                                No account selected
                            </div>
                            <div style={{
                                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                                color: '#94a3b8',
                                marginTop: '6px',
                            }}>
                                Select an account to manage statements
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'clamp(10px, 2.5vw, 12px)',
                                background: '#fff',
                                borderRadius: 'clamp(12px, 2.5vw, 14px)',
                                padding: 'clamp(12px, 3vw, 18px)',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                                        <div style={{
                                            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            wordBreak: 'break-word',
                                        }}>
                                            {selectedAccount.account_name}
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(0.7rem, 1.8vw, 0.75rem)',
                                            color: '#94a3b8',
                                            marginTop: '2px',
                                        }}>
                                            {statements.length} statement{statements.length !== 1 ? 's' : ''} generated
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '7px',
                                            padding: 'clamp(8px, 2vw, 9px) clamp(12px, 3vw, 16px)',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                            color: '#fff',
                                            border: 'none',
                                            fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
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
                                        <span className="btn-text-full">Generate Statement</span>
                                        <span className="btn-text-short" style={{ display: 'none' }}>Generate</span>
                                    </button>
                                </div>
                            </div>

                            {/* Empty */}
                            {statements.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: 'clamp(32px, 8vw, 52px) clamp(16px, 4vw, 24px)',
                                    background: '#fff',
                                    borderRadius: 'clamp(14px, 3vw, 16px)',
                                    border: '1.5px dashed #e5e7eb',
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
                                        <FileText size={22} color="#94a3b8" />
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
                                        fontWeight: 600,
                                        color: '#475569',
                                        marginBottom: '6px',
                                    }}>
                                        No statements yet
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)',
                                        color: '#94a3b8',
                                        marginBottom: '20px',
                                        maxWidth: '300px',
                                        margin: '0 auto 20px',
                                    }}>
                                        Generate a statement for any date range
                                    </div>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '7px',
                                            padding: 'clamp(8px, 2vw, 9px) clamp(14px, 3vw, 18px)',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                            color: '#fff',
                                            border: 'none',
                                            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                                        }}
                                    >
                                        <Plus size={15} /> Generate First Statement
                                    </button>
                                </div>
                            )}

                            {/* Statements List */}
                            {statements.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'clamp(8px, 2vw, 10px)',
                                }}>
                                    {statements.map(stmt => (
                                        <div key={stmt.id} className="statement-card" style={{
                                            background: '#fff',
                                            borderRadius: 'clamp(12px, 2.5vw, 14px)',
                                            padding: 'clamp(14px, 3vw, 20px)',
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'clamp(10px, 2.5vw, 12px)',
                                            transition: 'box-shadow 0.2s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '12px',
                                                flexWrap: 'wrap',
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'clamp(10px, 2.5vw, 14px)',
                                                    flex: '1 1 auto',
                                                    minWidth: 0,
                                                }}>
                                                    <div style={{
                                                        width: 'clamp(40px, 8vw, 44px)',
                                                        height: 'clamp(40px, 8vw, 44px)',
                                                        borderRadius: 'clamp(10px, 2vw, 12px)',
                                                        flexShrink: 0,
                                                        background: '#eff6ff',
                                                        border: '1px solid #bfdbfe',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <FileText size={20} color="#3b82f6" />
                                                    </div>
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <div style={{
                                                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                                            fontWeight: 700,
                                                            color: '#1e293b',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}>
                                                            {stmt.statement_number}
                                                        </div>
                                                        <div style={{
                                                            fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)',
                                                            color: '#94a3b8',
                                                            marginTop: '2px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            flexWrap: 'wrap',
                                                        }}>
                                                            <Calendar size={11} />
                                                            <span className="date-full">
                                                                {formatDate(stmt.start_date)} — {formatDate(stmt.end_date)}
                                                            </span>
                                                            <span className="date-short" style={{ display: 'none' }}>
                                                                {formatDate(stmt.start_date).split(',')[0]} — {formatDate(stmt.end_date).split(',')[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'clamp(10px, 2.5vw, 20px)',
                                                    flexWrap: 'wrap',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                }}>
                                                    <div style={{ textAlign: 'left', flex: '1 1 auto' }}>
                                                        <div style={{
                                                            fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)',
                                                            color: '#94a3b8',
                                                            marginBottom: '2px',
                                                        }}>
                                                            Closing Balance
                                                        </div>
                                                        <div style={{
                                                            fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
                                                            fontWeight: 800,
                                                            color: '#1e293b',
                                                        }}>
                                                            {formatCurrency(stmt.closing_balance)}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                        flexShrink: 0,
                                                    }}>
                                                        <button
                                                            onClick={() => handlePreview(stmt)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '5px',
                                                                padding: 'clamp(6px, 1.5vw, 7px) clamp(10px, 2.5vw, 12px)',
                                                                borderRadius: '9px',
                                                                background: '#eff6ff',
                                                                border: '1px solid #bfdbfe',
                                                                color: '#3b82f6',
                                                                fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                                                        >
                                                            <Eye size={13} />
                                                            <span className="action-text">View</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(stmt.id)}
                                                            style={{
                                                                width: 'clamp(28px, 6vw, 32px)',
                                                                height: 'clamp(28px, 6vw, 32px)',
                                                                borderRadius: '9px',
                                                                background: '#fef2f2',
                                                                border: '1px solid #fecaca',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.15s',
                                                                flexShrink: 0,
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Generate Form Modal */}
            {showForm && (
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
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 'clamp(18px, 4vw, 22px)',
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
                                    Generate Statement
                                </h3>
                                <p style={{
                                    fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)',
                                    color: '#94a3b8',
                                    wordBreak: 'break-word',
                                }}>
                                    Select a date range for the statement
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    background: '#f1f5f9',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '9px',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    padding: '7px',
                                    display: 'flex',
                                    flexShrink: 0,
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Account info pill */}
                        <div style={{
                            padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 14px)',
                            borderRadius: '10px',
                            marginBottom: '18px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                        }}>
                            <FileText size={14} color="#3b82f6" />
                            <span style={{
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.82rem)',
                                color: '#1e40af',
                                fontWeight: 600,
                                wordBreak: 'break-word',
                            }}>
                                {selectedAccount?.account_name}
                            </span>
                        </div>

                        <form onSubmit={handleGenerate} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(14px, 3vw, 16px)',
                        }}>
                            <div className="date-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 'clamp(10px, 2.5vw, 12px)',
                            }}>
                                <div>
                                    <label style={labelStyle}>From Date *</label>
                                    <input
                                        type="date"
                                        value={form.start_date}
                                        onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                                        required
                                        style={{ ...inputStyle, marginTop: '7px' }}
                                        onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>To Date *</label>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                                        required
                                        style={{ ...inputStyle, marginTop: '7px' }}
                                        onFocus={e => e.target.style.borderColor = '#93c5fd'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end',
                                marginTop: '4px',
                                flexWrap: 'wrap',
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
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
                                        background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                        color: '#fff',
                                        fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                    }}
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
                                            <span className="loading-text">Generating...</span>
                                            <span className="loading-text-short" style={{ display: 'none' }}>...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={15} />
                                            <span className="submit-text">Generate</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewStatement && (
                <PrintStatement
                    statement={previewStatement}
                    onClose={() => setPreviewStatement(null)}
                />
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @media (max-width: 1024px) {
                    .stmt-layout {
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
                    
                    .btn-text-full {
                        display: none !important;
                    }
                    
                    .btn-text-short {
                        display: inline !important;
                    }
                    
                    .date-full {
                        display: none !important;
                    }
                    
                    .date-short {
                        display: inline !important;
                    }
                    
                    .statement-card {
                        padding: 12px !important;
                    }
                }
                
                @media (max-width: 640px) {
                    .date-grid {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .action-text {
                        display: none !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .loading-text {
                        display: none !important;
                    }
                    
                    .loading-text-short {
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

const inputStyle = {
    width: '100%',
    padding: 'clamp(9px, 2vw, 10px) clamp(11px, 2.5vw, 13px)',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
}