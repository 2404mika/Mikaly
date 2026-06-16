import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiAdmin from '../services/apiAdmin';
import type { User, LoginData } from '../services/auth';

interface AdminAuthContextType {
  admin: User | null;
  adminToken: string | null;
  adminLogin: (data: LoginData) => Promise<void>;
  adminLogout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<User | null>(() => {
    const cached = localStorage.getItem('admin_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      if (adminToken) {
        try {
          const response = await apiAdmin.get('/auth/profile');
          const userData = response.data.data;
          if (userData.role !== 'admin') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setAdminToken(null);
            setAdmin(null);
          } else {
            setAdmin(userData);
            localStorage.setItem('admin_user', JSON.stringify(userData));
          }
        } catch {
          const cached = localStorage.getItem('admin_user');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.role !== 'admin') {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              setAdminToken(null);
              setAdmin(null);
            } else {
              setAdmin(parsed);
            }
          } else {
            localStorage.removeItem('admin_token');
            setAdminToken(null);
          }
        }
      }
      setIsLoading(false);
    };
    loadAdmin();
  }, [adminToken]);

  const adminLogin = async (data: LoginData) => {
    const response = await apiAdmin.post('/auth/login', data);
    const { token, user } = response.data.data;
    if (user.role !== 'admin') {
      throw new Error('Accès réservé aux administrateurs');
    }
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setAdminToken(token);
    setAdmin(user);
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, adminLogin, adminLogout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
