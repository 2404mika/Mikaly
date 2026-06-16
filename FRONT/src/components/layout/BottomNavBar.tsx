import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Accueil', path: '/', icon: 'home' },
    { name: 'Menu', path: '/menu', icon: 'list_alt' },
    { name: 'Commandes', path: user ? '/my-orders' : '/login', icon: 'receipt_long' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-[0_-4px_12px_rgba(48,109,41,0.04)] rounded-t-xl animate-[slideUp_0.4s_ease_both]">
      {navItems.map((item, index) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex flex-col items-center justify-center rounded-lg p-2 active:scale-90 transition-[transform,background-color,color] duration-150 ease-out relative ${
            location.pathname === item.path
              ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === item.path ? "'FILL' 1" : "'FILL' 0" }}>
            {item.icon}
          </span>
          <span className="font-label-sm text-label-sm mt-1">{item.name}</span>
          {item.name === 'Menu' && totalItems > 0 && (
            <span className="absolute -top-0.5 right-0 bg-error text-on-error text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold tabular-nums">
              {totalItems}
            </span>
          )}
        </Link>
      ))}

      {/* Login / Logout Button */}
      {user ? (
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center rounded-lg p-2 active:scale-90 transition-[transform,background-color,color] duration-150 ease-out text-error"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-sm text-label-sm mt-1">Déconnexion</span>
        </button>
      ) : (
        <Link
          to="/login"
          className="flex flex-col items-center justify-center rounded-lg p-2 active:scale-90 transition-[transform,background-color,color] duration-150 ease-out text-on-surface-variant hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined">login</span>
          <span className="font-label-sm text-label-sm mt-1">Connexion</span>
        </Link>
      )}
    </nav>
  );
};

export default BottomNavBar;
