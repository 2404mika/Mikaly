import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [isLogin]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'cook') navigate('/kitchen');
      else if (userData.role === 'delivery') navigate('/delivery');
      else if (userData.role === 'cashier') navigate('/cashier');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password, phone: phone || undefined });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex w-full min-h-screen pb-20 md:pb-0">
      {/* Left Side: Visual */}
      <section className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-surface-container-high">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center animate-[scaleIn_1.5s_ease_both]"
          style={{ backgroundImage: "url('/images/auth/login-bg.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/80 via-on-secondary-fixed/30 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-margin-desktop w-full h-full pb-16">
          <div className="bg-surface/20 backdrop-blur-md border border-surface/30 rounded-xl p-6 shadow-[0_12px_24px_rgba(48,109,41,0.08)] animate-[fadeUp_0.6s_ease_0.3s_both]">
            <span className="material-symbols-outlined text-primary-fixed mb-2 text-[32px]">restaurant</span>
            <h2 className="font-headline text-headline-lg text-surface-container-lowest mb-4">
              L'art de la table, réinventé.
            </h2>
            <p className="font-body-lg text-body-lg text-surface-container-lowest/90">
              Connectez-vous pour découvrir notre nouveau menu de saison et réserver votre prochaine expérience culinaire avec facilité.
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Authentication Forms */}
      <section className="w-full lg:w-7/12 flex items-center justify-center p-margin-mobile lg:p-margin-desktop overflow-y-auto">
        <div className="w-full max-w-[440px] flex flex-col">
          {/* Brand Header */}
          <div className="flex items-center gap-2 mb-8 animate-[fadeLeft_0.5s_ease_both]">
            <span className="material-symbols-outlined text-primary text-[32px] font-bold">room_service</span>
            <span className="font-headline text-headline-md font-bold text-primary">Mikaly</span>
          </div>

          {/* Segmented Control Toggle */}
          <div className="flex bg-surface-container-highest p-1 rounded-lg mb-8 relative animate-[fadeUp_0.5s_ease_0.1s_both]">
            <div
              className="absolute top-1 bottom-1 rounded-md bg-surface-container-lowest shadow-sm transition-all duration-300 ease-in-out"
              style={{
                left: isLogin ? '4px' : 'calc(50% + 2px)',
                right: isLogin ? 'calc(50% + 2px)' : '4px',
              }}
            />
            <button
              onClick={() => { setIsLogin(true); resetForm(); }}
              className={`relative z-10 flex-1 font-label-md text-label-md py-2 px-4 rounded-md transition-colors duration-200 ${
                isLogin ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setIsLogin(false); resetForm(); }}
              className={`relative z-10 flex-1 font-label-md text-label-md py-2 px-4 rounded-md transition-colors duration-200 ${
                !isLogin ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Créer un compte
            </button>
          </div>

          {/* Animated Form Container */}
          <div key={animKey} className="animate-fadeSlideIn">
            {isLogin ? (
              /* Login Form */
              <form onSubmit={handleLogin} className="flex flex-col gap-6">
                {error && (
                  <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm animate-[slideDown_0.3s_ease_both]">
                    {error}
                  </div>
                )}
                <Input
                  label="Email"
                  type="email"
                  placeholder="jean.dupont@email.com"
                  icon="person"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-label-md text-on-surface-variant">Mot de passe</label>
                    <a href="#" className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors">
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface font-body-md text-body-md rounded-lg py-2.5 pl-11 pr-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-all duration-200 hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-surface-container-lowest transition-all duration-200"
                  />
                  <label htmlFor="remember" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer">
                    Se souvenir de moi
                  </label>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  <span>{isLoading ? 'Connexion...' : 'Se connecter'}</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="flex flex-col gap-6">
                {error && (
                  <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm animate-[slideDown_0.3s_ease_both]">
                    {error}
                  </div>
                )}
                <Input
                  label="Nom complet"
                  type="text"
                  placeholder="Jean Dupont"
                  icon="person"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="jean.dupont@email.com"
                  icon="mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Téléphone (optionnel)"
                  type="tel"
                  placeholder="+261 34 00 000 00"
                  icon="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">Mot de passe</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 text-on-surface font-body-md text-body-md rounded-lg py-2.5 pl-11 pr-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-all duration-200 hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  icon="lock"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  <span>{isLoading ? 'Création...' : 'Créer le compte'}</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Button>
              </form>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-10 text-center animate-[fadeIn_0.5s_ease_0.4s_both]">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {isLogin ? 'En vous connectant' : 'En créant un compte'}, vous acceptez nos{' '}
              <a href="#" className="text-primary hover:underline transition-colors">Conditions d'utilisation</a> et notre{' '}
              <a href="#" className="text-primary hover:underline transition-colors">Politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
