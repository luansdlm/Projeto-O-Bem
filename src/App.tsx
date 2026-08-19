/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Shield, Smartphone } from 'lucide-react';
import { AuthProvider, useAuth } from './presentation/hooks/useAuth';
import AuthPage from './presentation/pages/AuthPage';
import ProfileSelectionPage from './presentation/pages/ProfileSelectionPage';
import CreateProfilePage from './presentation/pages/CreateProfilePage';
import HistoryPage from './presentation/pages/HistoryPage';
import ScannerPage from './presentation/pages/ScannerPage';
import DashboardPage from './presentation/pages/DashboardPage';
import SearchPage from './presentation/pages/SearchPage';

import { AdminLayout } from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';

function AppContent() {
  const { user, loading, appUser } = useAuth();


  useEffect(() => {
    const savedTheme = localStorage.getItem('safelabel_theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // A user is verified if:
  // 1. They are logged in
  // 2. AND they either used Google (or another federated provider), OR their email is verified, OR they bypassed verification for testing
  const isEmailAuth = user?.providerData.some(p => p.providerId === 'password');
  const isVerified = user && (
    !isEmailAuth || 
    user.emailVerified || 
    localStorage.getItem('safelabel_email_verified_bypass') === 'true'
  );

  // Consideramos o cadastro completo se appUser existe e tem fullName, phone e nationality preenchidos.
  const isProfileComplete = !user || (
    appUser && 
    appUser.fullName && 
    appUser.phone && 
    appUser.nationality
  );

  const isFullyAuthorized = isVerified && isProfileComplete;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={!user ? <AuthPage /> : (isFullyAuthorized ? <DashboardPage /> : <AuthPage />)} 
      />
      <Route 
        path="/profiles" 
        element={isFullyAuthorized ? <ProfileSelectionPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/create-profile" 
        element={isFullyAuthorized ? <CreateProfilePage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/history" 
        element={isFullyAuthorized ? <HistoryPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/search" 
        element={isFullyAuthorized ? <SearchPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/scan" 
        element={isFullyAuthorized ? <ScannerPage /> : <Navigate to="/" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - completely isolated from Firebase AuthProvider */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="login" element={<AdminLogin />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        
        {/* Main App Routes */}
        <Route path="/*" element={
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        } />
      </Routes>
      <DevToolsLink />
    </Router>
  );
}

function DevToolsLink() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Link 
        to={isAdmin ? '/' : '/admin'}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-2xl hover:bg-slate-800 transition-colors border border-slate-700/50"
        title={isAdmin ? "Voltar para o Aplicativo" : "Acessar Painel Admin"}
      >
        {isAdmin ? (
          <>
            <Smartphone size={14} />
            <span className="hidden sm:inline">Ver App</span>
          </>
        ) : (
          <>
            <Shield size={14} />
            <span className="hidden sm:inline">Painel Admin</span>
          </>
        )}
      </Link>
    </div>
  );
}
