import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const navItems = [
  { name: 'Tableau de bord', path: '/admin', icon: 'dashboard', end: true },
  { name: 'Commandes', path: '/admin/orders', icon: 'receipt_long' },
  { name: 'Tables', path: '/admin/tables', icon: 'table_restaurant' },
  { name: 'Catégories', path: '/admin/categories', icon: 'category' },
  { name: 'Repas', path: '/admin/meals', icon: 'lunch_dining' },
  { name: 'Utilisateurs', path: '/admin/users', icon: 'group' },
];

const AdminLayout = () => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const handleLogout = () => { adminLogout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 bg-surface-container-lowest border-r border-outline-variant/20 flex-col justify-between fixed h-full z-30">
        <div>
          <div className="p-6 border-b border-outline-variant/20">
            <h1 className="font-headline text-xl font-bold text-primary">Mikaly</h1>
            <p className="text-sm text-on-surface-variant mt-1">Suite de Gestion</p>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold text-base'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface text-base'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="material-symbols-outlined text-[24px] text-primary">person</span>
            <span className="text-base font-medium text-on-surface">{admin?.name || 'Administrateur'}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
            <span className="material-symbols-outlined text-[24px]">logout</span>
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 md:ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
