import { Link } from 'react-router-dom';
import { useFeaturedMeals } from '../hooks/useMeals';
import AnimatedSection from '../components/ui/AnimatedSection';

const defaultImages: Record<string, string> = {
  'Coquilles St-Jacques': '/images/home/scallops-menu.jpg',
  'Burrata Crémeuse': '/images/home/burrata-menu.jpg',
  'Burger Signature': '/images/home/burger-menu.jpg',
  'Pizza Tartufo': '/images/home/pizza-menu.jpg',
  'Coquilles St-Jacques': '/images/home/scallops.jpg',
  'Burrata Crémeuse': '/images/home/burrata.jpg',
  'Tarte Chocolat Valrhona': '/images/home/chocolate-tart.jpg',
};

const fallbackMeals = [
  {
    id: 1,
    name: 'Coquilles St-Jacques',
    description: 'Noix de Saint-Jacques poêlées, purée de petits pois à la menthe, éclats de noisettes torréfiées et émulsion au citron yuzu.',
    price: 25000,
    image: '/images/home/scallops.jpg',
    is_featured: 1,
  },
  {
    id: 2,
    name: 'Burrata Crémeuse',
    description: 'Burrata fraîche des Pouilles, tomates d\'antan rôties, pesto de basilic maison, pignons de pin et focaccia toastée.',
    price: 22000,
    image: '/images/home/burrata.jpg',
    is_featured: 1,
  },
  {
    id: 3,
    name: 'Tarte Chocolat Valrhona',
    description: 'Pâte sablée croustillante, ganache chocolat noir Valrhona, caramel au beurre salé, feuille d\'or et framboise fraîche.',
    price: 16000,
    image: '/images/home/chocolate-tart.jpg',
    is_featured: 1,
  },
];

const Home = () => {
  const { meals, isLoading } = useFeaturedMeals();

  const featuredMeals = meals.length >= 3 ? meals.slice(0, 3) : (meals.length > 0 ? meals : fallbackMeals);

  const getImage = (meal: any) => {
    // Si l'image est un chemin local (commence par /), l'utiliser directement
    if (meal.image && meal.image.startsWith('/')) return meal.image;
    // Sinon fallback sur les images locales
    return defaultImages[meal.name] || '/images/home/scallops.jpg';
  };

  return (
    <main className="flex-grow flex flex-col">
      {/* Opening Hours Badge - Glassmorphism */}
      <div className="fixed top-4 right-4 z-50 backdrop-blur-md bg-white/30 border border-white/40 rounded-2xl shadow-2xl">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">schedule</span>
            <span className="font-label-sm text-label-sm text-on-surface font-bold">Horaires</span>
          </div>
          <div className="font-label-xs text-label-xs text-on-surface-variant space-y-1">
            <p>Lun - Ven: 11h00 - 22h00</p>
            <p>Sam - Dim: 10h00 - 23h00</p>
          </div>
          <div className="border-t border-white/20 pt-2 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            <span className="font-label-xs text-label-xs text-on-surface-variant">Zoda, Anstenakely, Antsirabe</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-[819px] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Elegant restaurant interior"
            className="w-full h-full object-cover animate-[scaleIn_1.5s_cubic-bezier(0.4,0,0.2,1)_both]"
            src="/images/home/hero-restaurant.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-bright/90 to-surface-bright/40 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-8 lg:col-span-6 flex flex-col gap-6 w-2xl">
            <AnimatedSection animation="fadeUp" delay={100}>
              <h2 className="font-label-md text-label-md text-primary tracking-widest uppercase text-6xl">
                Bienvenue chez Mikaly
              </h2>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={200}>
              <h1 className="font-headline text-display-lg text-on-surface text-3xl">
                L'art de la table, réinventé
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={300}>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md text-2xl">
                Découvrez une harmonie de saveurs créées avec passion. Une aventure culinaire inoubliable où chaque détail est pensé pour vous ravir.
              </p>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link
                  to="/reservations"
                  className="bg-tertiary-container text-on-tertiary px-6 py-2.5 rounded-lg font-label-md text-label-md shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Réserver une Table
                </Link>
                <Link
                  to="/menu"
                  className="bg-primary-container text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md shadow-md hover:bg-surface-tint transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">local_mall</span>
                  Commander en Ligne
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <AnimatedSection animation="fadeUp">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline text-headline-lg text-on-surface mb-1">Plats Signature</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Sélections de notre chef exécutif.
              </p>
            </div>
            <Link to="/menu" className="text-primary font-label-md text-label-md hover:underline hidden md:block">
              Voir le Menu Complet
            </Link>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[250px]">
            <div className="md:col-span-8 row-span-2 rounded-2xl overflow-hidden bg-surface-container animate-pulse" />
            <div className="md:col-span-4 row-span-1 rounded-2xl overflow-hidden bg-surface-container animate-pulse" />
            <div className="md:col-span-4 row-span-1 rounded-2xl overflow-hidden bg-surface-container animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[250px]">
            {/* Large Feature Card */}
            {featuredMeals[0] && (
              <AnimatedSection animation="fadeLeft" delay={100} className="md:col-span-8 row-span-2">
                <Link to="/menu" className="block h-full">
                  <div className="h-full rounded-2xl overflow-hidden relative group ambient-shadow-sm border border-outline-variant/30 cursor-pointer">
                    <img
                      alt={featuredMeals[0].name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={getImage(featuredMeals[0])}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-end">
                      <div className="text-inverse-on-surface">
                        <div className="bg-secondary/20 text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded backdrop-blur-sm inline-block mb-2">
                          Plat du Chef
                        </div>
                        <h3 className="font-headline text-headline-md mb-1">{featuredMeals[0].name}</h3>
                        <p className="font-body-sm text-body-sm opacity-90 max-w-sm">{featuredMeals[0].description}</p>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-primary-fixed bg-inverse-surface/80 px-4 py-2 rounded-lg backdrop-blur-md whitespace-nowrap">
                        {Number(featuredMeals[0].price).toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            )}

            {/* Small Card 1 */}
            {featuredMeals[1] && (
              <AnimatedSection animation="fadeRight" delay={200} className="md:col-span-4 row-span-1">
                <Link to="/menu" className="block h-full">
                  <div className="h-full rounded-2xl overflow-hidden relative group ambient-shadow-sm border border-outline-variant/30 bg-surface cursor-pointer">
                    <div className="absolute top-0 right-0 m-2 z-10 bg-surface/90 backdrop-blur-sm rounded-full p-1">
                      <span className="material-symbols-outlined text-outline text-[20px]">favorite</span>
                    </div>
                    <img
                      alt={featuredMeals[1].name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      src={getImage(featuredMeals[1])}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/burrata.jpg'; }}
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-headline text-headline-sm text-on-surface">{featuredMeals[1].name}</h4>
                        <span className="font-label-md text-label-md text-primary font-semibold whitespace-nowrap">
                          {Number(featuredMeals[1].price).toLocaleString()} Ar
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{featuredMeals[1].description}</p>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            )}

            {/* Small Card 2 */}
            {featuredMeals[2] && (
              <AnimatedSection animation="fadeRight" delay={300} className="md:col-span-4 row-span-1">
                <Link to="/menu" className="block h-full">
                  <div className="h-full rounded-2xl overflow-hidden relative group ambient-shadow-sm border border-outline-variant/30 bg-surface cursor-pointer">
                    <div className="absolute top-0 right-0 m-2 z-10 bg-surface/90 backdrop-blur-sm rounded-full p-1">
                      <span className="material-symbols-outlined text-outline text-[20px]">favorite</span>
                    </div>
                    <img
                      alt={featuredMeals[2].name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      src={getImage(featuredMeals[2])}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/chocolate-tart.jpg'; }}
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-headline text-headline-sm text-on-surface">{featuredMeals[2].name}</h4>
                        <span className="font-label-md text-label-md text-primary font-semibold whitespace-nowrap">
                          {Number(featuredMeals[2].price).toLocaleString()} Ar
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{featuredMeals[2].description}</p>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            )}
          </div>
        )}

        <div className="mt-4 text-center md:hidden">
          <Link to="/menu" className="text-primary font-label-md text-label-md hover:underline">
            Voir le Menu Complet
          </Link>
        </div>
      </section>

      {/* Experience / Testimonials */}
      <section className="bg-surface-container-low py-16 px-margin-mobile md:px-margin-desktop border-y border-outline-variant/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <AnimatedSection animation="fadeLeft">
            <div>
              <h2 className="font-headline text-headline-lg text-on-surface mb-4">
                Une Atmosphere d'Élégance Sous-Entendue
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Au-delà de l'assiette, nous orchestrons un environnement qui anticipe vos besoins. De l'éclairage à l'acoustique, chaque élément est conçu pour favoriser la connexion et la célébration.
              </p>
              <div className="flex gap-6 border-l-2 border-primary-container pl-4 py-1 mt-8">
                <div className="flex flex-col">
                  <div className="flex text-tertiary-container mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="font-headline text-headline-sm text-on-surface italic mb-2">
                    "Un chef-d'œuvre d'hospitalité. L'attention aux détails est inégalée, et les saveurs tout simplement sublimes."
                  </p>
                  <span className="font-label-md text-label-md text-on-surface-variant">— Le Critique Culinaire</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="fadeRight">
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div className="rounded-xl overflow-hidden mt-12 ambient-shadow-md">
                <img
                  alt="Table setting"
                  className="w-full h-full object-cover"
                  src="/images/home/table-setting.jpg"
                />
              </div>
              <div className="rounded-xl overflow-hidden mb-12 ambient-shadow-md">
                <img
                  alt="Chef plating"
                  className="w-full h-full object-cover"
                  src="/images/home/chef-plating.jpg"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Home;
