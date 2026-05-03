import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { ShieldCheck, Users, BadgeCheck, Clock3, XCircle, UserX } from 'lucide-react'

const getStatusColor = (status) => {
    if (status === 'active') return { bg: '#dcfce7', text: '#166534' }
    if (status === 'pending') return { bg: '#fef3c7', text: '#92400e' }
    if (status === 'rejected') return { bg: '#fee2e2', text: '#991b1b' }
    return { bg: '#e2e8f0', text: '#334155' }
}

const getStatusWeight = (status) => {
    const weights = { pending: 0, active: 1, rejected: 2, none: 3 }
    return weights[status] ?? 4
}

export default function AdminSubscriptions() {
    const { isAdmin } = useAuth()
    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState([])
    const [updatingId, setUpdatingId] = useState(null)
    const [selectedDetail, setSelectedDetail] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)

        const [subscriptionsRes, accountsRes] = await Promise.all([
            supabase
                .from('subscriptions')
                .select('id,user_id,user_email,user_name,status,tier,payment_method,payment_screenshot_url,created_at')
                .order('created_at', { ascending: false }),
            supabase
                .from('accounts')
                .select('user_id'),
        ])

        if (subscriptionsRes.error) {
            toast.error(subscriptionsRes.error.message)
            setLoading(false)
            return
        }

        if (accountsRes.error) {
            toast.error(accountsRes.error.message)
            setLoading(false)
            return
        }

        const accountCountByUser = new Map()
        accountsRes.data.forEach((account) => {
            accountCountByUser.set(account.user_id, (accountCountByUser.get(account.user_id) || 0) + 1)
        })

        const subscriptionRows = (subscriptionsRes.data || []).map((item) => ({
            subscriptionId: item.id,
            userId: item.user_id,
            userName: item.user_name || `User ${String(item.user_id).slice(0, 8)}`,
            userEmail: item.user_email || 'N/A',
            status: item.status || 'none',
            tier: item.tier || 'pro',
            paymentMethod: item.payment_method || 'khalti',
            paymentScreenshotUrl: item.payment_screenshot_url || null,
            accountCount: accountCountByUser.get(item.user_id) || 0,
            updatedAt: item.created_at || null,
        }))

        const usersWithSubscriptions = new Set(subscriptionRows.map((item) => item.userId))
        const noneRows = Array.from(accountCountByUser.entries())
            .filter(([userId]) => !usersWithSubscriptions.has(userId))
            .map(([userId, accountCount]) => ({
                subscriptionId: null,
                userId,
                userName: `User ${String(userId).slice(0, 8)}`,
                userEmail: 'N/A',
                status: 'none',
                tier: 'none',
                paymentMethod: 'none',
                paymentScreenshotUrl: null,
                accountCount,
                updatedAt: null,
            }))

        const builtRows = [...subscriptionRows, ...noneRows]
            .sort((a, b) => {
                const dateCompare = new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
                if (dateCompare !== 0) return dateCompare
                return getStatusWeight(a.status) - getStatusWeight(b.status)
            })

        setRows(builtRows)
        setLoading(false)
    }, [])

    useEffect(() => {
        if (!isAdmin) {
            setLoading(false)
            return
        }
        load()
    }, [isAdmin, load])

    const handleStatusChange = async (subscriptionId, status) => {
        if (!subscriptionId) return
        setUpdatingId(subscriptionId)
        const { error } = await supabase
            .from('subscriptions')
            .update({ status })
            .eq('id', subscriptionId)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success(`Subscription ${status}.`)
            await load()
        }
        setUpdatingId(null)
    }

    const stats = useMemo(() => {
        const uniqueUsers = new Set(rows.map((row) => row.userId)).size
        const active = rows.filter((row) => row.status === 'active').length
        const pending = rows.filter((row) => row.status === 'pending').length
        const rejected = rows.filter((row) => row.status === 'rejected').length
        const notSubscribed = rows.filter((row) => row.status === 'none').length
        return { uniqueUsers, active, pending, rejected, notSubscribed }
    }, [rows])

    if (!isAdmin) {
        return (
            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 24,
                color: '#64748b',
                textAlign: 'center',
            }}>
                This page is visible only for admin users.
            </div>
        )
    }

    if (loading) {
        return <div style={{ padding: 24, color: '#64748b' }}>Loading subscription analysis...</div>
    }

    return (
        <div
            className="admin-subscriptions-page"
            style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 clamp(8px, 3vw, 16px)', boxSizing: 'border-box' }}
        >
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                    Subscription Analysis
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Track subscription requests and account coverage across users.
                </p>
            </div>

            <div className="admin-subscriptions-stats" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: 18,
            }}>
                {[
                    { label: 'Total Users', value: stats.uniqueUsers, icon: Users, color: '#2563eb' },
                    { label: 'Active', value: stats.active, icon: BadgeCheck, color: '#16a34a' },
                    { label: 'Pending', value: stats.pending, icon: Clock3, color: '#d97706' },
                    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#dc2626' },
                    { label: 'Not Subscribed', value: stats.notSubscribed, icon: UserX, color: '#64748b' },
                ].map(({ label, value, icon: IconComponent, color }) => (
                    <div
                        key={label}
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            border: '1px solid #e5e7eb',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                {label}
                            </div>
                            <div style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>{value}</div>
                        </div>
                        <IconComponent size={20} color={color} />
                    </div>
                ))}
            </div>

            <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <ShieldCheck size={18} color="#2563eb" />
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>Subscription Requests</span>
                </div>

                <div className="admin-subscriptions-table-wrap" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>User</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Accounts</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Tier</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Payment</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Proof</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Request Time</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const statusColor = getStatusColor(row.status)
                                const rowKey = row.subscriptionId || `${row.userId}-none`

                                return (
                                    <tr key={rowKey} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600 }}>{row.userName}</td>
                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.userEmail}</td>
                                        <td style={{ padding: '12px 16px', color: '#1e293b' }}>{row.accountCount}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: 999,
                                                background: statusColor.bg,
                                                color: statusColor.text,
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                textTransform: 'capitalize',
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {row.tier === 'none' ? (
                                                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>-</span>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedDetail(row)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#1e40af',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        textTransform: 'capitalize',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                    }}
                                                >
                                                    {row.tier}
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600 }}>
                                            {row.paymentMethod === 'none'
                                                ? '-'
                                                : row.paymentMethod === 'esewa'
                                                    ? 'eSewa'
                                                    : 'Khalti'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {row.paymentScreenshotUrl ? (
                                                <button
                                                    onClick={() => setSelectedDetail(row)}
                                                    style={{
                                                        border: 'none',
                                                        borderRadius: 8,
                                                        padding: '6px 10px',
                                                        cursor: 'pointer',
                                                        background: '#e2e8f0',
                                                        color: '#1e293b',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                                            {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {row.status === 'pending' && row.subscriptionId ? (
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button
                                                        onClick={() => handleStatusChange(row.subscriptionId, 'active')}
                                                        disabled={updatingId === row.subscriptionId}
                                                        style={{
                                                            border: 'none',
                                                            borderRadius: 8,
                                                            padding: '6px 10px',
                                                            cursor: updatingId === row.subscriptionId ? 'not-allowed' : 'pointer',
                                                            background: '#16a34a',
                                                            color: '#fff',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Done
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(row.subscriptionId, 'rejected')}
                                                        disabled={updatingId === row.subscriptionId}
                                                        style={{
                                                            border: 'none',
                                                            borderRadius: 8,
                                                            padding: '6px 10px',
                                                            cursor: updatingId === row.subscriptionId ? 'not-allowed' : 'pointer',
                                                            background: '#dc2626',
                                                            color: '#fff',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="admin-subscriptions-mobile-list" style={{ display: 'none', padding: 12, gap: 10 }}>
                    {rows.map((row) => {
                        const statusColor = getStatusColor(row.status)
                        const rowKey = row.subscriptionId || `${row.userId}-mobile-none`
                        return (
                            <div
                                key={rowKey}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    padding: 12,
                                    background: '#fff',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8, marginBottom: 8 }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '0.88rem', overflowWrap: 'anywhere' }}>{row.userName}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', overflowWrap: 'anywhere' }}>{row.userEmail}</div>
                                    </div>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: 999,
                                        background: statusColor.bg,
                                        color: statusColor.text,
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        textTransform: 'capitalize',
                                        flexShrink: 0,
                                    }}>
                                        {row.status}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 10 }}>
                                    <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Accounts: <span style={{ color: '#0f172a', fontWeight: 700 }}>{row.accountCount}</span></div>
                                    <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Tier: <span style={{ color: '#0f172a', fontWeight: 700, textTransform: 'capitalize' }}>{row.tier}</span></div>
                                    <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Payment: <span style={{ color: '#0f172a', fontWeight: 700 }}>{row.paymentMethod === 'none' ? '-' : row.paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}</span></div>
                                    <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Time: <span style={{ color: '#0f172a', fontWeight: 700 }}>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {row.tier !== 'none' && (
                                        <button
                                            onClick={() => setSelectedDetail(row)}
                                            style={{
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '6px 10px',
                                                cursor: 'pointer',
                                                background: '#e2e8f0',
                                                color: '#1e293b',
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            View Detail
                                        </button>
                                    )}
                                    {row.status === 'pending' && row.subscriptionId && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(row.subscriptionId, 'active')}
                                                disabled={updatingId === row.subscriptionId}
                                                style={{
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    padding: '6px 10px',
                                                    cursor: updatingId === row.subscriptionId ? 'not-allowed' : 'pointer',
                                                    background: '#16a34a',
                                                    color: '#fff',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Done
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(row.subscriptionId, 'rejected')}
                                                disabled={updatingId === row.subscriptionId}
                                                style={{
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    padding: '6px 10px',
                                                    cursor: updatingId === row.subscriptionId ? 'not-allowed' : 'pointer',
                                                    background: '#dc2626',
                                                    color: '#fff',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {selectedDetail && (
                <div
                    onClick={() => setSelectedDetail(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15,23,42,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1200,
                        padding: 20,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 760,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: '#fff',
                            borderRadius: 16,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 24px 48px rgba(15,23,42,0.2)',
                            padding: 24,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>Subscription Detail</h3>
                            <button
                                onClick={() => setSelectedDetail(null)}
                                style={{
                                    border: 'none',
                                    background: '#f1f5f9',
                                    color: '#334155',
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                }}
                            >
                                Close
                            </button>
                        </div>

                        <div className="admin-subscriptions-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
                            <div style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>User:</strong> {selectedDetail.userName}</div>
                            <div style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Email:</strong> {selectedDetail.userEmail}</div>
                            <div style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Tier:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedDetail.tier}</span></div>
                            <div style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedDetail.status}</span></div>
                            <div style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Payment:</strong> {selectedDetail.paymentMethod === 'esewa' ? 'eSewa' : selectedDetail.paymentMethod === 'khalti' ? 'Khalti' : '-'}</div>
                            <div style={{ color: '#334155' }}><strong style={{ color: '#0f172a' }}>Request Time:</strong> {selectedDetail.updatedAt ? new Date(selectedDetail.updatedAt).toLocaleString() : '-'}</div>
                        </div>

                        {selectedDetail.paymentScreenshotUrl ? (
                            <div>
                                <div style={{ marginBottom: 8, fontWeight: 700, color: '#0f172a' }}>Payment Screenshot</div>
                                <img
                                    src={selectedDetail.paymentScreenshotUrl}
                                    alt="Payment proof"
                                    style={{
                                        width: '100%',
                                        borderRadius: 12,
                                        border: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ color: '#64748b' }}>No screenshot uploaded.</div>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                @media (max-width: 900px) {
                    .admin-subscriptions-stats {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 640px) {
                    .admin-subscriptions-page {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    .admin-subscriptions-stats {
                        grid-template-columns: minmax(0, 1fr) !important;
                    }
                    .admin-subscriptions-table-wrap {
                        display: none;
                    }
                    .admin-subscriptions-mobile-list {
                        display: grid !important;
                    }
                    .admin-subscriptions-detail-grid {
                        grid-template-columns: minmax(0, 1fr) !important;
                    }
                }
            `}</style>
        </div>
    )
}
