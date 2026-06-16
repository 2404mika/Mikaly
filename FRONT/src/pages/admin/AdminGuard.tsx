import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { admin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!admin || admin.role !== 'admin')) {
      navigate('/admin/login');
    }
  }, [admin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!admin || admin.role !== 'admin') return null;

  return <>{children}</>;
};

export default AdminGuard;
