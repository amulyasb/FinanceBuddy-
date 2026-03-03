import { createContext, useState, useCallback, useContext } from 'react'

export const AccountContext = createContext()

export function AccountProvider({ children }) {
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    
    const triggerAccountRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1)
    }, [])
    
    return (
        <AccountContext.Provider value={{ 
            selectedAccount, 
            setSelectedAccount,
            refreshTrigger,
            triggerAccountRefresh 
        }}>
            {children}
        </AccountContext.Provider>
    )
}

export const useAccount = () => {
    const context = useContext(AccountContext)
    if (!context) {
        throw new Error('useAccount must be used within AccountProvider')
    }
    return context
}