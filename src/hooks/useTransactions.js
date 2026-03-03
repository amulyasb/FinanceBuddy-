import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { recalculateBalances } from '../lib/utils'

export function useTransactions() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchTransactions = useCallback(async (accountId, filters = {}) => {
        if (!user || !accountId) return
        setLoading(true)
        let query = supabase
            .from('transactions')
            .select('*, categories!left(name, type)')
            .eq('account_id', accountId)
            .eq('user_id', user.id)
            .order('date', { ascending: true })
            .order('created_at', { ascending: true })

        if (filters.start_date) query = query.gte('date', filters.start_date)
        if (filters.end_date) query = query.lte('date', filters.end_date)
        if (filters.type) query = query.eq('type', filters.type)
        if (filters.category_id) query = query.eq('category_id', filters.category_id)
        if (filters.remark) query = query.ilike('remark', `%${filters.remark}%`)
        if (filters.min_amount) query = query.gte('amount', filters.min_amount)
        if (filters.max_amount) query = query.lte('amount', filters.max_amount)

        const { data, error } = await query
        if (!error) setTransactions(data || [])
        setLoading(false)
        return { data, error }
    }, [user])

    // After any CUD op, recompute all running_balance values and update account balance
    const recomputeBalances = async (accountId, openingBalance) => {
        const { data: allTx } = await supabase
            .from('transactions')
            .select('*')
            .eq('account_id', accountId)
            .order('date', { ascending: true })
            .order('created_at', { ascending: true })

        if (!allTx) return

        const recalculated = recalculateBalances(allTx, openingBalance)
        const lastBalance = recalculated.length > 0
            ? recalculated[recalculated.length - 1].running_balance
            : parseFloat(openingBalance)

        // Batch update running balances
        for (const tx of recalculated) {
            await supabase
                .from('transactions')
                .update({ running_balance: tx.running_balance })
                .eq('id', tx.id)
        }

        // Update account current_balance
        await supabase
            .from('accounts')
            .update({ current_balance: lastBalance })
            .eq('id', accountId)

        return lastBalance
    }

    const addTransaction = async (payload, openingBalance) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...payload, user_id: user.id })
            .select()
            .single()
        if (!error) {
            await recomputeBalances(payload.account_id, openingBalance)
        }
        return { data, error }
    }

    const updateTransaction = async (id, payload, accountId, openingBalance) => {
        const { data, error } = await supabase
            .from('transactions')
            .update(payload)
            .eq('id', id)
            .select()
            .single()
        if (!error) {
            await recomputeBalances(accountId, openingBalance)
        }
        return { data, error }
    }

    const deleteTransaction = async (id, accountId, openingBalance) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
        if (!error) {
            await recomputeBalances(accountId, openingBalance)
        }
        return { error }
    }

    return {
        transactions,
        loading,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
    }
}
