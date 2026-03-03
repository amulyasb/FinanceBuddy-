import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function useCategories() {
    const { user } = useAuth()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchCategories = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name')
        if (!error) setCategories(data || [])
        setLoading(false)
        return { data, error }
    }, [user])

    const addCategory = async (name, type) => {
        if (!user) return { data: null, error: { message: 'User not authenticated' } }
        const { data, error } = await supabase
            .from('categories')
            .insert({ name, type, user_id: user.id, is_default: false })
            .select()
            .single()
        if (!error) setCategories((prev) => [...prev, data])
        return { data, error }
    }

    const updateCategory = async (id, name, type) => {
        if (!user) return { data: null, error: { message: 'User not authenticated' } }
        const { data, error } = await supabase
            .from('categories')
            .update({ name, type })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()
        if (!error) {
            setCategories((prev) => prev.map(c => c.id === id ? data : c))
        }
        return { data, error }
    }

    const deleteCategory = async (id) => {
        if (!user) return { data: null, error: { message: 'User not authenticated' } }
        // Check if category is used in any transactions
        const { data: transactions } = await supabase
            .from('transactions')
            .select('id')
            .eq('category_id', id)
            .limit(1)
        
        if (transactions && transactions.length > 0) {
            return { data: null, error: { message: 'Cannot delete category: it is used in transactions' } }
        }
        
        const { data, error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        if (!error) {
            setCategories((prev) => prev.filter(c => c.id !== id))
        }
        return { data, error }
    }

    const creditCategories = categories.filter((c) => c.type === 'credit')
    const debitCategories = categories.filter((c) => c.type === 'debit')
    const userCategories = categories.filter((c) => c.user_id === user?.id)

    return { 
        categories, 
        creditCategories, 
        debitCategories, 
        userCategories,
        loading, 
        fetchCategories, 
        addCategory, 
        updateCategory, 
        deleteCategory 
    }
}
