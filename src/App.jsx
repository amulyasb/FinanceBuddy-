import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AccountProvider } from './contexts/AccountContext'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Statements from './pages/Statements'
import Categories from './pages/Categories'
import Profile from './pages/Profile'
import AdminSubscriptions from './pages/AdminSubscriptions'
import Subscription from './pages/Subscription'

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AccountProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#ffffff',
                                color: '#1e293b',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            },
                            success: {
                                iconTheme: { primary: '#10b981', secondary: '#fff' },
                            },
                            error: {
                                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                            },
                        }}
                    />
                    <Routes>
                        <Route path="/auth" element={<Auth />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="transactions" element={<Transactions />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="statements" element={<Statements />} />
                            <Route path="categories" element={<Categories />} />
                            <Route path="subscription" element={<Subscription />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="admin-subscriptions" element={<AdminSubscriptions />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AccountProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
