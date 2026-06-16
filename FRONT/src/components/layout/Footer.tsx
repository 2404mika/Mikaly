import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-inverse-surface text-inverse-on-surface">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="font-headline text-headline-lg font-bold text-primary-fixed inline-block mb-4">
              Mikaly
            </Link>
            <p className="font-body-sm text-body-sm text-inverse-on-surface/70 max-w-xs leading-relaxed">
              L'art de la table, réinventé. Une expérience culinaire inoubliable à Antsirabe.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 rounded-lg bg-inverse-surface/50 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-inverse-surface/50 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">link</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-inverse-surface/50 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-label-md text-label-md font-bold mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="font-body-sm text-body-sm text-inverse-on-surface/70 hover:text-primary-fixed transition-colors">Accueil</Link></li>
              <li><Link to="/menu" className="font-body-sm text-body-sm text-inverse-on-surface/70 hover:text-primary-fixed transition-colors">Menu</Link></li>
              <li><Link to="/reservations" className="font-body-sm text-body-sm text-inverse-on-surface/70 hover:text-primary-fixed transition-colors">Réservations</Link></li>
              <li><Link to="/my-orders" className="font-body-sm text-body-sm text-inverse-on-surface/70 hover:text-primary-fixed transition-colors">Mes commandes</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-label-md text-label-md font-bold mb-4 uppercase tracking-wider">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-[18px]">location_on</span>
                <span className="font-body-sm text-body-sm text-inverse-on-surface/70">Zoda, Anstenakely, Antsirabe</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-[18px]">phone</span>
                <span className="font-body-sm text-body-sm text-inverse-on-surface/70">+261 34 00 000 00</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-[18px]">mail</span>
                <span className="font-body-sm text-body-sm text-inverse-on-surface/70">contact@mikaly.mg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-inverse-surface/30 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="font-body-xs text-body-xs text-inverse-on-surface/50">
            © 2025 Mikaly. Tous droits réservés.
          </p>
          <p className="font-body-xs text-body-xs text-inverse-on-surface/50">
            Zoda, Anstenakely · Antsirabe, Madagascar
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;