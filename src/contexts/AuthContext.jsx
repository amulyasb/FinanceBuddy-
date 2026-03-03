import { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true) // Add loading state

    // Check auth status on app load
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Get the current session from Supabase
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error getting session:', error);
            }
            
            if (session?.user) {
                setUser(session.user);
                setIsAuthenticated(true);
            }
            
            // Set loading to false after getting auth status
            setLoading(false);
        };
        
        checkAuthStatus();
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        });
        
        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [])

    const login = async (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
    }
    
    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
    }

    // Real sign in function using Supabase
    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                return { error };
            }
            
            setUser(data.user);
            setIsAuthenticated(true);
            setLoading(false);
            
            return { error: null };
        } catch (error) {
            return { error: { message: error.message } };
        }
    };

    // Real sign up function using Supabase
    const signUp = async (email, password, fullName) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });
            
            if (error) {
                return { data: null, error };
            }
            
            // If sign up is successful, the user might need to verify email
            // So we set the user data but the session might not be immediately available
            if (data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                setLoading(false);
            }
            
            return { data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated, 
            login, 
            logout,
            signIn, // Add signIn method
            signUp, // Add signUp method
            loading // Add loading to context value
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext }