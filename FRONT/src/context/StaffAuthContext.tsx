import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiStaff from '../services/apiStaff';
import type { User, LoginData } from '../services/auth';

interface StaffAuthContextType {
  staff: User | null;
  staffToken: string | null;
  staffLogin: (data: LoginData) => Promise<void>;
  staffLogout: () => void;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<User | null>(() => {
    const cached = localStorage.getItem('staff_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [staffToken, setStaffToken] = useState<string | null>(localStorage.getItem('staff_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStaff = async () => {
      if (staffToken) {
        try {
          const response = await apiStaff.get('/auth/profile');
          const userData = response.data.data;
          const allowedRoles = ['cook', 'cashier', 'delivery'];
          if (!allowedRoles.includes(userData.role)) {
            localStorage.removeItem('staff_token');
            localStorage.removeItem('staff_user');
            setStaffToken(null);
            setStaff(null);
          } else {
            setStaff(userData);
            localStorage.setItem('staff_user', JSON.stringify(userData));
          }
        } catch {
          const cached = localStorage.getItem('staff_user');
          if (cached) {
            const parsed = JSON.parse(cached);
            const allowedRoles = ['cook', 'cashier', 'delivery'];
            if (!allowedRoles.includes(parsed.role)) {
              localStorage.removeItem('staff_token');
              localStorage.removeItem('staff_user');
              setStaffToken(null);
              setStaff(null);
            } else {
              setStaff(parsed);
            }
          } else {
            localStorage.removeItem('staff_token');
            setStaffToken(null);
          }
        }
      }
      setIsLoading(false);
    };
    loadStaff();
  }, [staffToken]);

  const staffLogin = async (data: LoginData) => {
    const response = await apiStaff.post('/auth/login', data);
    const { token, user } = response.data.data;
    const allowedRoles = ['cook', 'cashier', 'delivery'];
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Accès réservé au staff');
    }
    localStorage.setItem('staff_token', token);
    localStorage.setItem('staff_user', JSON.stringify(user));
    setStaffToken(token);
    setStaff(user);
  };

  const staffLogout = () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    setStaffToken(null);
    setStaff(null);
  };

  return (
    <StaffAuthContext.Provider value={{ staff, staffToken, staffLogin, staffLogout, isLoading }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (!context) throw new Error('useStaffAuth must be used within StaffAuthProvider');
  return context;
};
