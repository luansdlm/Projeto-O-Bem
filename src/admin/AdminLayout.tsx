import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

interface AdminContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  token: null,
  login: () => {},
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminContext);

export function AdminLayout() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('safelabel_admin_token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  const login = (newToken: string) => {
    localStorage.setItem('safelabel_admin_token', newToken);
    setToken(newToken);
    navigate('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('safelabel_admin_token');
    setToken(null);
    navigate('/admin/login');
  };

  return (
    <AdminContext.Provider value={{ token, login, logout }}>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        {token && (
          <header className="bg-slate-900 text-white shadow-md z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">SL</div>
                  <span className="font-semibold text-lg tracking-tight">Governance Backoffice</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-300">Admin</span>
                  <button onClick={logout} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AdminContext.Provider>
  );
}
