import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function useAccounts() {
    const { user } = useAuth()
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchAccounts = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
        if (error) setError(error.message)
        else setAccounts(data || [])
        setLoading(false)
    }, [user])

    const createAccount = async (payload) => {
        if (accounts.length >= 3) {
            return { error: { message: 'Maximum 3 accounts allowed.' } }
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

    return { accounts, loading, error, fetchAccounts, createAccount, updateAccount, deleteAccount }
}
