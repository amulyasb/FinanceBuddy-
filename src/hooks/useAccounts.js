import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function useAccounts() {
    const { user, isAdmin } = useAuth()
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [maxAllowed, setMaxAllowed] = useState(1)

    const fetchAccountLimit = useCallback(async () => {
        if (isAdmin) {
            setMaxAllowed(Number.POSITIVE_INFINITY)
            return { maxAllowed: Number.POSITIVE_INFINITY, tier: 'admin' }
        }
        if (!user) return { maxAllowed: 1, tier: null }
        const { data, error } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .eq('status', 'active')

        if (error) {
            setError(error.message)
            return { maxAllowed: 1, tier: null }
        }

        if (!data || data.length === 0) {
            return { maxAllowed: 1, tier: null }
        }

        const tierPriority = { pro: 1, vip: 2, luxury: 3 }
        const tier = data.reduce((bestTier, item) => {
            const currentTier = item?.tier || 'pro'
            if ((tierPriority[currentTier] || 0) > (tierPriority[bestTier] || 0)) {
                return currentTier
            }
            return bestTier
        }, 'pro')
        const tierLimits = { pro: 3, vip: 5, luxury: 8 }
        const maxAllowed = tierLimits[tier] || 1

        setMaxAllowed(maxAllowed)
        return { maxAllowed, tier }
    }, [user, isAdmin])

    const fetchAccounts = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const [accountsRes] = await Promise.all([
            supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true }),
            fetchAccountLimit(),
        ])

        if (accountsRes.error) setError(accountsRes.error.message)
        else setAccounts(accountsRes.data || [])
        setLoading(false)
    }, [user, fetchAccountLimit])

    const createAccount = async (payload) => {
        if (!user) return { error: { message: 'Not authenticated.' } }

        const [countRes, limitInfo] = await Promise.all([
            supabase
                .from('accounts')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id),
            fetchAccountLimit(),
        ])

        if (countRes.error) {
            return { error: countRes.error }
        }

        const currentCount = countRes.count || 0
        if (currentCount >= limitInfo.maxAllowed) {
            return { error: { message: `Account limit reached (${limitInfo.maxAllowed}).` } }
        }

        const { data, error } = await supabase
            .from('accounts')
            .insert({ ...payload, user_id: user.id, current_balance: payload.opening_balance })
            .select()
            .single()
        if (!error) setAccounts((prev) => [...prev, data])
        return { data, error }
    }

    const updateAccount = async (id, payload) => {
        const { data, error } = await supabase
            .from('accounts')
            .update(payload)
            .eq('id', id)
            .select()
            .single()
        if (!error) setAccounts((prev) => prev.map((a) => (a.id === id ? data : a)))
        return { data, error }
    }

    const deleteAccount = async (id) => {
        const { error } = await supabase.from('accounts').delete().eq('id', id)
        if (!error) setAccounts((prev) => prev.filter((a) => a.id !== id))
        return { error }
    }

    return { accounts, loading, error, maxAllowed, isAdmin, fetchAccounts, createAccount, updateAccount, deleteAccount }
}
