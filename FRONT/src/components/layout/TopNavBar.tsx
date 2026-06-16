import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const TopNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalItems, clearCart } = useCart();
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleLogout = () => {
    clearCart();
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Réservations', path: '/reservations' },
    { name: 'Contactez-nous', action: () => setContactModalOpen(true) },
  ];

  return (
    <>
      <nav className="hidden md:flex sticky top-0 z-50 items-center w-full px-margin-desktop h-16 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30 animate-[slideDown_0.4s_ease_both]">
        {/* Logo */}
        <Link to="/" className="font-headline text-headline-md font-bold text-primary transition-[transform] duration-200 ease-out hover:scale-105">
          Mikaly
        </Link>

        {/* Centered Nav Links */}
        <div className="flex-1 flex justify-center gap-1">
          {navLinks.map((link) => (
            link.action ? (
              <button
                key={link.name}
                onClick={link.action}
                className={`font-label-md text-label-md px-4 py-2 rounded-lg transition-[color,background-color] duration-150 ease-out text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`}
              >
                {link.name}
              </button>
            ) : (
              <Link
                key={link.path}
                to={link.path!}
                className={`font-label-md text-label-md px-4 py-2 rounded-lg transition-[color,background-color] duration-150 ease-out ${
                  location.pathname === link.path
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Link to="/menu" className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-[transform,background-color] duration-150 ease-out relative hover:scale-110 active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-error text-on-error font-label-sm text-label-sm w-4 h-4 rounded-full flex items-center justify-center translate-x-1 -translate-y-1 animate-[scaleIn_0.3s_ease_both] tabular-nums">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group ml-2 animate-[fadeRight_0.3s_ease_both]">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-[background-color] duration-150 ease-out cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                <span className="font-label-md text-label-md text-on-surface">{user.name}</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant transition-[transform] duration-200 group-hover:rotate-180">expand_more</span>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface-container-lowest rounded-xl shadow-[0_12px_24px_rgba(48,109,41,0.12)] border border-outline-variant/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-[opacity,visibility] duration-200 ease-out z-50 overflow-hidden">
                <div className="p-3 border-b border-outline-variant/20">
                  <p className="font-label-md text-label-md text-on-surface font-medium">{user.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{user.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface hover:bg-surface-container-low transition-[background-color] duration-150 ease-out"
                  >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">receipt_long</span>
                    <span className="font-body-sm text-body-sm">Mes commandes</span>
                  </Link>
                </div>
                <div className="p-1.5 border-t border-outline-variant/20">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/30 transition-[background-color] duration-150 ease-out"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="font-body-sm text-body-sm">Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-primary-container text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary-dark transition-[transform,background-color,box-shadow] duration-200 ease-out flex items-center gap-1.5 hover:scale-105 active:scale-96 animate-[fadeIn_0.3s_ease_both]"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Se connecter
            </Link>
          )}
        </div>
      </nav>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/60 backdrop-blur-sm" onClick={() => setContactModalOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[scaleIn_0.3s_ease_both]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-headline-md text-on-surface">Contactez-nous</h2>
              <button onClick={() => setContactModalOpen(false)} className="p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Adresse</p>
                  <p className="font-body-md text-body-md text-on-surface">Zoda, Anstenakely, Antsirabe</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">phone</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Téléphone</p>
                  <p className="font-body-md text-body-md text-on-surface">+261 34 00 000 00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">mail</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Email</p>
                  <p className="font-body-md text-body-md text-on-surface">contact@mikaly.mg</p>
                </div>
              </div>
              <div className="border-t border-outline-variant/20 pt-4 mt-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-3">Suivez-nous</p>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">share</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">link</span>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">chat</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavBar;
