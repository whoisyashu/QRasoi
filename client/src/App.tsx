import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ChefLayout } from './layouts/ChefLayout';

// Protected Route Guard
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { Skeleton } from './components/ui/Skeleton';

// Lazy Loaded Pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PublicMenuPage = lazy(() => import('./pages/PublicMenuPage').then(m => ({ default: m.PublicMenuPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderStatusPage = lazy(() => import('./pages/OrderStatusPage').then(m => ({ default: m.OrderStatusPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));

// Paytm Merchant Compliance Pages
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage').then(m => ({ default: m.RefundPolicyPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const DownloadAppPage = lazy(() => import('./pages/DownloadAppPage').then(m => ({ default: m.DownloadAppPage })));

// Chef Auth & Dashboard Pages
const ChefLoginPage = lazy(() => import('./pages/ChefLoginPage').then(m => ({ default: m.ChefLoginPage })));
const ChefDashboardPage = lazy(() => import('./pages/ChefDashboardPage').then(m => ({ default: m.ChefDashboardPage })));

// Admin Auth & Dashboard Pages (Obscured Routes)
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

// Owner Dashboard Pages
const DashboardHomePage = lazy(() => import('./pages/DashboardHomePage').then(m => ({ default: m.DashboardHomePage })));
const OrdersManagementPage = lazy(() => import('./pages/OrdersManagementPage').then(m => ({ default: m.OrdersManagementPage })));
const MenuManagementPage = lazy(() => import('./pages/MenuManagementPage').then(m => ({ default: m.MenuManagementPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const QrDownloadPage = lazy(() => import('./pages/QrDownloadPage').then(m => ({ default: m.QrDownloadPage })));
const ChefManagementPage = lazy(() => import('./pages/ChefManagementPage').then(m => ({ default: m.ChefManagementPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoader = () => (
  <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6">
    <div className="space-y-4 text-center max-w-sm">
      <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </div>
);

export const App: React.FC = () => {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public & Customer Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/download-app" element={<DownloadAppPage />} />

            <Route path="/r/:restaurantSlug" element={<PublicMenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Chef Login Route */}
            <Route path="/chef/login" element={<ChefLoginPage />} />

            {/* Obscured System Admin Login Route */}
            <Route path="/system/portal/auth" element={<AdminLoginPage />} />
          </Route>

          {/* Protected Restaurant Owner Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHomePage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="menu" element={<MenuManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="qr" element={<QrDownloadPage />} />
            <Route path="chefs" element={<ChefManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Protected Chef Dashboard Route */}
          <Route
            path="/chef/dashboard"
            element={
              <ProtectedRoute allowedRoles={['chef']}>
                <ChefLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ChefDashboardPage />} />
          </Route>
          {/* Fallback legacy redirect for /chef */}
          <Route path="/chef" element={<Navigate to="/chef/dashboard" replace />} />

          {/* Protected Super Admin Dashboard Route (Obscured) */}
          <Route
            path="/system/portal/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
