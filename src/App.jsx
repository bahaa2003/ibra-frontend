import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wallet from './pages/Wallet';
import ApiSandbox from './pages/ApiSandbox';
import Settings from './pages/Settings';
import Account from './pages/Account';
import AccountSecurity from './pages/AccountSecurity';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGroups from './pages/admin/AdminGroups';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTopups from './pages/admin/AdminTopups';
import AdminCurrencies from './pages/admin/AdminCurrencies';
import AdminPayments from './pages/admin/AdminPayments';
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods';
import AdminSupervisors from './pages/admin/AdminSupervisors';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AddBalance from './pages/AddBalance';
import PaymentDetails from './pages/PaymentDetails';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FloatingWhatsApp from './components/ui/FloatingWhatsApp';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        
        <Route element={<Layout />}>
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roles={['customer']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute roles={['customer']}>
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/:id" 
            element={
              <ProtectedRoute roles={['customer']}>
                <ProductDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wallet" 
            element={
              <ProtectedRoute roles={['customer']}>
                <Wallet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wallet/add-balance" 
            element={
              <ProtectedRoute roles={['customer']}>
                <AddBalance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wallet/payment-details/:methodId" 
            element={
              <ProtectedRoute roles={['customer']}>
                <PaymentDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/api-sandbox" 
            element={
              <ProtectedRoute roles={['admin']}>
                <ApiSandbox />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account-security"
            element={
              <ProtectedRoute>
                <AccountSecurity />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/supervisors"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminSupervisors />
              </ProtectedRoute>
            }
          />
          <Route             path="/admin/groups" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminGroups />
              </ProtectedRoute>
            } 
          />
          <Route             path="/admin/products" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminProducts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/topups" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminTopups />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payment-methods"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPaymentMethods />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/currencies"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminCurrencies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminSuppliers />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
            <FloatingWhatsApp />
          </BrowserRouter>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
