import { format, parseISO } from 'date-fns'

/**
 * Format currency (NPR)
 */
export function formatCurrency(amount, currency = 'NPR') {
    if (amount === null || amount === undefined) return `${currency} 0.00`
    const num = parseFloat(amount)
    return `${currency} ${Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format a date string to display format
 */
export function formatDate(dateStr) {
    if (!dateStr) return ''
    try {
        return format(parseISO(dateStr), 'dd MMM yyyy')
    } catch {
        return dateStr
    }
}

/**
 * Format date for input fields
 */
export function formatDateInput(dateStr) {
    if (!dateStr) return ''
    try {
        return format(parseISO(dateStr), 'yyyy-MM-dd')
    } catch {
        return dateStr
    }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function todayDate() {
    return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Recalculate running balances for a list of transactions
 * Transactions should be sorted by date ASC, created_at ASC
 */
export function recalculateBalances(transactions, openingBalance) {
    let balance = parseFloat(openingBalance) || 0
    return transactions.map((tx) => {
        const amount = parseFloat(tx.amount) || 0
        if (tx.type === 'credit') {
            balance += amount
        } else {
            balance -= amount
        }
        return { ...tx, running_balance: parseFloat(balance.toFixed(2)) }
    })
}

/**
 * Calculate summary stats for a list of transactions
 */
export function calcSummary(transactions) {
    let totalCredit = 0
    let totalDebit = 0
    transactions.forEach((tx) => {
        const amount = parseFloat(tx.amount) || 0
        if (tx.type === 'credit') {
            totalCredit += amount
        } else {
            totalDebit += amount
        }
    })
    return {
        totalCredit: parseFloat(totalCredit.toFixed(2)),
        totalDebit: parseFloat(totalDebit.toFixed(2)),
        profit: parseFloat((totalCredit - totalDebit).toFixed(2)),
    }
}

/**
 * Group transactions by month (for charts)
 */
export function groupByMonth(transactions) {
    const map = {}
    transactions.forEach((tx) => {
        const month = format(parseISO(tx.date), 'MMM yyyy')
        if (!map[month]) map[month] = { month, credit: 0, debit: 0 }
        if (tx.type === 'credit') map[month].credit += parseFloat(tx.amount)
        else map[month].debit += parseFloat(tx.amount)
    })
    return Object.values(map).slice(-12)
}

/**
 * Generate statement number: STAT-YYYY-NNNN
 */
export function generateStatementNumber(year, sequence) {
    return `STAT-${year}-${String(sequence).padStart(4, '0')}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, n = 30) {
    if (!str) return ''
    return str.length > n ? str.slice(0, n) + '…' : str
}

/**
 * Color for profit/loss
 */
export function profitColor(value) {
    if (value > 0) return '#10b981'
    if (value < 0) return '#ef4444'
    return '#64748b'
}
