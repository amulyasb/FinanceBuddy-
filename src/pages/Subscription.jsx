import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import khaltiQr from '../assets/khalti1.jpeg'
import esewaQr from '../assets/esewa1.jpeg'

const tiers = [
    { id: 'pro', name: 'Pro', accounts: 3, price: 'Rs. 100', description: 'Start with 3 accounts' },
    { id: 'vip', name: 'VIP', accounts: 5, price: 'Rs. 200', description: 'Upgrade to 5 accounts' },
    { id: 'luxury', name: 'Luxury', accounts: 8, price: 'Rs. 300', description: 'Premium 8 accounts' },
]
const tierOrder = ['pro', 'vip', 'luxury']
const tierPriority = { pro: 1, vip: 2, luxury: 3 }

const getTierInfo = (tierId) => tiers.find((t) => t.id === tierId) || tiers[0]

export default function Subscription() {
    const { user } = useAuth()
    const [activeSubscription, setActiveSubscription] = useState(null)
    const [pendingSubscription, setPendingSubscription] = useState(null)
    const [rejectedSubscription, setRejectedSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [selectedTier, setSelectedTier] = useState('pro')
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('khalti')
    const [paymentScreenshot, setPaymentScreenshot] = useState(null)

    const checkSubscription = async (currentUser) => {
        setLoading(true)
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })

        if (error) {
            toast.error(error.message)
            setLoading(false)
            return
        }

        const rows = (data || []).map((item) => ({
            ...item,
            tier: item.tier || 'pro',
            payment_method: item.payment_method || 'khalti',
            payment_screenshot_url: item.payment_screenshot_url || null,
        }))
        const pending = rows.find((item) => item.status === 'pending') || null
        const rejected = rows.find((item) => item.status === 'rejected') || null
        const active = rows
            .filter((item) => item.status === 'active')
            .sort((a, b) => (tierPriority[b.tier] || 0) - (tierPriority[a.tier] || 0))[0] || null

        setPendingSubscription(pending)
        setRejectedSubscription(rejected)
        setActiveSubscription(active)
        setSelectedTier((pending || active)?.tier || 'pro')
        setSelectedPaymentMethod(pending?.payment_method || 'khalti')
        setPaymentScreenshot(null)
        setLoading(false)
    }

    useEffect(() => {
        if (!user) return
        const timeoutId = setTimeout(() => {
            checkSubscription(user)
        }, 0)

        return () => clearTimeout(timeoutId)
    }, [user])

    const isActive = Boolean(activeSubscription)
    const isPending = Boolean(pendingSubscription)
    const activeTierId = activeSubscription?.tier || 'pro'
    const activeTierInfo = getTierInfo(activeTierId)
    const pendingTierInfo = getTierInfo(pendingSubscription?.tier || selectedTier)
    const rejectedTierName = !isPending && rejectedSubscription ? getTierInfo(rejectedSubscription.tier).name : null

    const handlePaid = async (tier) => {
        if (isPending) {
            toast.error('Your previous request is pending review.')
            return
        }

        const selectedIndex = tierOrder.indexOf(tier)
        const currentIndex = isActive ? tierOrder.indexOf(activeTierId) : -1
        if (selectedIndex <= currentIndex) {
            toast.error('Please select a higher plan to request an upgrade.')
            return
        }

        if (!paymentScreenshot) {
            toast.error('Please upload your payment screenshot before continuing.')
            return
        }

        setSubmitting(true)

        const safeName = paymentScreenshot.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const filePath = `${user.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage
            .from('subscription-proofs')
            .upload(filePath, paymentScreenshot, { upsert: false })

        if (uploadError) {
            if (uploadError.message?.toLowerCase().includes('bucket')) {
                toast.error('Storage bucket "subscription-proofs" not found. Please create it in Supabase Storage.')
            } else {
                toast.error(uploadError.message)
            }
            setSubmitting(false)
            return
        }

        const { data: publicUrlData } = supabase.storage
            .from('subscription-proofs')
            .getPublicUrl(filePath)
        const paymentScreenshotUrl = publicUrlData?.publicUrl || null

        const { error } = await supabase
            .from('subscriptions')
            .insert([
                {
                    user_id: user.id,
                    user_email: user.email,
                    user_name: user.user_metadata?.full_name || 'User',
                    tier,
                    payment_method: selectedPaymentMethod,
                    payment_screenshot_url: paymentScreenshotUrl,
                    status: 'pending',
                },
            ])

        if (error) {
            toast.error(error.message)
        } else {
            toast.success(`${tier.toUpperCase()} payment submitted for review!`)
            setPendingSubscription({
                tier,
                payment_method: selectedPaymentMethod,
                payment_screenshot_url: paymentScreenshotUrl,
                status: 'pending',
            })
            setSelectedTier(tier)
            setPaymentScreenshot(null)
        }

        setSubmitting(false)
    }

    if (!user) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Please sign in to view subscriptions.</div>
    }

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading subscription status...</div>
    }

    return (
        <div
            className="subscription-page"
            style={{ maxWidth: 1000, margin: '0 auto', width: '100%', padding: '0 clamp(12px, 4vw, 20px) 24px', boxSizing: 'border-box' }}
        >
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 'clamp(1.35rem, 4.2vw, 1.8rem)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                    Subscription Plans
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Choose a plan to unlock more accounts and features.
                </p>
            </div>

            {(isActive || isPending || rejectedTierName) && (
                <div className="subscription-status-grid" style={{
                    display: 'grid',
                    gap: 10,
                    marginBottom: 18,
                }}>
                    {isActive && (
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            borderRadius: 12,
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <CheckCircle size={16} color="#16a34a" />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: '#166534', fontWeight: 700, fontSize: '0.82rem' }}>
                                    Active: {activeTierInfo.name.toUpperCase()}
                                </div>
                                <div style={{ color: '#15803d', fontSize: '0.76rem' }}>
                                    {activeTierInfo.accounts} accounts
                                </div>
                            </div>
                        </div>
                    )}

                    {isPending && (
                        <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: 12,
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <Clock size={16} color="#d97706" />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: '#b45309', fontWeight: 700, fontSize: '0.82rem' }}>
                                    {pendingTierInfo.name.toUpperCase()} pending
                                </div>
                                <div style={{ color: '#b45309', fontSize: '0.76rem' }}>
                                    Via {pendingSubscription?.payment_method === 'esewa' ? 'eSewa' : 'Khalti'}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTierId !== 'luxury' && rejectedTierName && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: 12,
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <AlertCircle size={16} color="#ef4444" />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.82rem' }}>
                                    Rejected: {rejectedTierName.toUpperCase()}
                                </div>
                                <div style={{ color: '#b91c1c', fontSize: '0.76rem' }}>
                                    Please try again
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="subscription-tier-grid" style={{
                display: 'grid',
                gap: 12,
                marginBottom: 32,
            }}>
                {tiers.map((tier) => {
                    const isCurrent = isActive && activeTierId === tier.id
                    const isHigherThanCurrent = tierOrder.indexOf(tier.id) > tierOrder.indexOf(activeTierId)
                    const canRequest = !isPending && (!isActive || isHigherThanCurrent)

                    return (
                        <div
                            key={tier.id}
                            style={{
                                background: isCurrent ? '#eff6ff' : '#fff',
                                border: isCurrent ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                borderRadius: 16,
                                padding: 'clamp(12px, 3vw, 20px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div style={{ marginBottom: 12 }}>
                                <h3 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                                    {tier.name}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
                                    {tier.description}
                                </p>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16, flexGrow: 1 }}>
                                <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                                    {tier.price}
                                </div>
                                <div style={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#64748b' }}>
                                    One-time payment
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                                    ✓ {tier.accounts} total accounts
                                </div>
                                <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', color: '#64748b', lineHeight: 1.6 }}>
                                    Start with 1 free. Add {tier.accounts - 1} more after upgrade.
                                </div>
                            </div>

                            <button
                                disabled={!canRequest}
                                onClick={() => setSelectedTier(tier.id)}
                                style={{
                                    width: '100%',
                                    padding: '12px 24px',
                                    background: selectedTier === tier.id ? '#1e40af' : '#e5e7eb',
                                    color: selectedTier === tier.id ? '#fff' : '#1e293b',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontWeight: 700,
                                    cursor: canRequest ? 'pointer' : 'not-allowed',
                                    opacity: canRequest || isCurrent ? 1 : 0.55,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {isCurrent ? '✓ Current Plan' : `Select ${tier.name}`}
                            </button>
                        </div>
                    )
                })}
            </div>

            {!isPending && (
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 'clamp(12px, 3vw, 24px)',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}>
                    <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: 700, color: '#1e293b', marginBottom: 16, textAlign: 'center' }}>
                        {isActive ? 'Request Plan Upgrade' : 'Payment Method'}
                    </h2>

                    <div className="subscription-payment-grid" style={{
                        display: 'grid',
                        gap: 10,
                        marginBottom: 24,
                    }}>
                        <div style={{
                            background: '#f8fafc',
                            border: selectedPaymentMethod === 'khalti' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                            borderRadius: 14,
                            padding: 8,
                            cursor: 'pointer',
                        }}>
                            <div
                                onClick={() => setSelectedPaymentMethod('khalti')}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1 / 1',
                                    minHeight: 180,
                                    maxHeight: 320,
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    background: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    src={khaltiQr}
                                    alt="Khalti QR"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('khalti')}
                                style={{
                                    marginTop: 8,
                                    width: '100%',
                                    fontSize: '0.82rem',
                                    color: selectedPaymentMethod === 'khalti' ? '#1e40af' : '#475569',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                {selectedPaymentMethod === 'khalti' ? 'Selected: Khalti' : 'Select Khalti'}
                            </button>
                        </div>
                        <div style={{
                            background: '#f8fafc',
                            border: selectedPaymentMethod === 'esewa' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                            borderRadius: 14,
                            padding: 8,
                            cursor: 'pointer',
                        }}>
                            <div
                                onClick={() => setSelectedPaymentMethod('esewa')}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1 / 1',
                                    minHeight: 180,
                                    maxHeight: 320,
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    background: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    src={esewaQr}
                                    alt="eSewa QR"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        transform: 'scale(1.12)',
                                        transformOrigin: 'center',
                                        display: 'block',
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('esewa')}
                                style={{
                                    marginTop: 8,
                                    width: '100%',
                                    fontSize: '0.82rem',
                                    color: selectedPaymentMethod === 'esewa' ? '#1e40af' : '#475569',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                {selectedPaymentMethod === 'esewa' ? 'Selected: eSewa' : 'Select eSewa'}
                            </button>
                        </div>
                    </div>

                    <p style={{ color: '#64748b', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', marginBottom: 24, lineHeight: 1.5, textAlign: 'center' }}>
                        Scan the QR code for <strong>{getTierInfo(selectedTier).name}</strong> plan, complete payment, then click continue. An admin will verify and approve your request.
                    </p>

                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontSize: 'clamp(0.75rem, 2vw, 0.88rem)', fontWeight: 600 }}>
                            Upload payment screenshot *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                            style={{
                                width: '100%',
                                padding: 10,
                                border: '1px solid #e5e7eb',
                                borderRadius: 10,
                                background: '#f8fafc',
                                color: '#334155',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ marginTop: 6, color: '#64748b', fontSize: 'clamp(0.65rem, 1.5vw, 0.78rem)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {paymentScreenshot ? `Selected file: ${paymentScreenshot.name}` : 'No screenshot selected'}
                        </div>
                    </div>

                    <button
                        onClick={() => handlePaid(selectedTier)}
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            boxSizing: 'border-box',
                            background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!submitting) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.4)'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'I Have Paid (Continue)'}
                    </button>
                </div>
            )}
            <style>{`
                .subscription-status-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
                .subscription-tier-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
                .subscription-payment-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                @media (max-width: 1024px) {
                    .subscription-status-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                    .subscription-tier-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                @media (max-width: 640px) {
                    .subscription-page {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    .subscription-status-grid,
                    .subscription-tier-grid,
                    .subscription-payment-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                }
            `}</style>
        </div>
    )
}
