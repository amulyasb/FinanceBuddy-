import { createContext, useState, useCallback, useContext, useEffect } from 'react'
// eslint-disable-next-line react-refresh/only-export-components
export const AccountContext = createContext()

export function AccountProvider({ children }) {
const [selectedAccount, setSelectedAccount] = useState(() => {
    const saved = localStorage.getItem('selectedAccountId');
    return saved ? JSON.parse(saved) : null;
});
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    
    const triggerAccountRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1)
    }, [])

    useEffect(() => {
    if (selectedAccount) {
        localStorage.setItem('selectedAccountId', JSON.stringify(selectedAccount));
    } else {
        localStorage.removeItem('selectedAccountId');
    }
}, [selectedAccount]);
    
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
// eslint-disable-next-line react-refresh/only-export-components
export const useAccount = () => {
    const context = useContext(AccountContext)
    if (!context) {
        throw new Error('useAccount must be used within AccountProvider')
    }
    return context
}