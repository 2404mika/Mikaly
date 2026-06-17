import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../context/StaffAuthContext';
import Button from '../../components/ui/Button';

const roleConfig: Record<string, { label: string; icon: string }> = {
  cook: { label: 'Cuisinier', icon: 'restaurant' },
  cashier: { label: 'Caissier', icon: 'point_of_sale' },
  delivery: { label: 'Livreur', icon: 'local_shipping' },
};

const StaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { staff, staffLogin } = useStaffAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (staff && ['cook', 'cashier', 'delivery'].includes(staff.role)) {
      if (staff.role === 'cook') navigate('/kitchen');
      else if (staff.role === 'cashier') navigate('/cashier');
      else if (staff.role === 'delivery') navigate('/delivery');
    }
  }, [staff, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await staffLogin({ email, password });
      navigate('/kitchen');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_12px_24px_rgba(48,109,41,0.08)] animate-[scaleIn_0.3s_ease_both]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-3xl">group</span>
            </div>
            <h1 className="font-headline text-headline-lg text-on-surface font-bold">Espace Staff</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Cuisinier, Caissier ou Livreur</p>
          </div>

          {/* Role indicators */}
          <div className="flex justify-center gap-4 mb-6">
            {Object.entries(roleConfig).map(([role, config]) => (
              <div key={role} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface text-xl">{config.icon}</span>
                </div>
                <span className="font-label-xs text-label-xs text-on-surface-variant">{config.label}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm animate-[slideDown_0.3s_ease_both]">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@mikaly.com"
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-11 pr-4 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant">Mot de passe</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2.5 pl-11 pr-10 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-6">
          <a href="/login" className="text-secondary hover:underline">← Retour au site client</a>
        </p>
      </div>
    </div>
  );
};

export default StaffLogin;
