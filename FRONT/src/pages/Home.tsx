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
  { id: 1, name: 'Coquilles St-Jacques', description: 'Noix de Saint-Jacques poêlées, purée de petits pois à la menthe.', price: 25000, image: '/images/home/scallops.jpg', is_featured: 1 },
  { id: 2, name: 'Burrata Crémeuse', description: 'Burrata fraîche des Pouilles, tomates rôties, pesto de basilic maison.', price: 22000, image: '/images/home/burrata.jpg', is_featured: 1 },
  { id: 3, name: 'Tarte Chocolat Valrhona', description: 'Pâte sablée croustillante, ganache chocolat noir Valrhona.', price: 16000, image: '/images/home/chocolate-tart.jpg', is_featured: 1 },
];

const Home = () => {
  const { meals, isLoading } = useFeaturedMeals();
  const featuredMeals = meals.length >= 3 ? meals.slice(0, 3) : (meals.length > 0 ? meals : fallbackMeals);

  const getImage = (meal: any) => {
    if (meal.image && meal.image.startsWith('/')) return meal.image;
    return defaultImages[meal.name] || '/images/home/scallops.jpg';
  };

  return (
    <main className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[819px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Restaurant elegant"
            className="w-full h-full object-cover"
            src="/images/home/hero-restaurant.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-on-background/60 via-on-background/30 to-on-background/70"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-16">
          <AnimatedSection animation="fadeUp" delay={100}>
            <span className="inline-block bg-primary/90 text-on-primary px-4 py-1.5 rounded-full font-label-sm text-label-sm mb-6 backdrop-blur-sm">
              Restaurant & Bar
            </span>
          </AnimatedSection>
          <AnimatedSection animation="fadeUp" delay={200}>
            <h1 className="font-headline text-headline-lg-mobile md:text-display-lg text-inverse-on-surface mb-4 leading-tight">
              Bienvenue chez
            </h1>
            <h2 className="font-headline text-display-lg-mobile md:text-display-xl text-primary font-bold mb-6">
              Mikaly
            </h2>
          </AnimatedSection>
          <AnimatedSection animation="fadeUp" delay={300}>
            <p className="font-body-lg text-body-lg text-inverse-on-surface/90 max-w-lg mb-8">
              Une aventure culinaire inoubliable où chaque détail est pensé pour vous ravir.
            </p>
          </AnimatedSection>
          <AnimatedSection animation="fadeUp" delay={400}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/reservations"
                className="bg-primary text-on-primary px-6 py-3.5 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                Réserver une Table
              </Link>
              <Link
                to="/menu"
                className="bg-surface/80 backdrop-blur-md text-on-surface px-6 py-3.5 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl hover:bg-surface transition-all duration-200 flex items-center justify-center gap-2 border border-outline/20 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                Voir le Menu
              </Link>
            </div>
          </AnimatedSection>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <span className="material-symbols-outlined text-inverse-on-surface/60 text-3xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <AnimatedSection animation="fadeUp">
          <div className="text-center mb-8">
            <h2 className="font-headline text-headline-lg-mobile md:text-headline-xl text-on-surface mb-2">
              Nos Créations
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sélectionnées par notre chef exécutif
            </p>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-surface-container animate-pulse">
                <div className="h-56 bg-surface-container" />
                <div className="p-4 space-y-2"><div className="h-5 bg-surface-container rounded w-2/3" /><div className="h-4 bg-surface-container rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {featuredMeals.map((meal, index) => (
              <AnimatedSection key={meal.id} animation="fadeUp" delay={index * 100}>
                <Link to="/menu" className="block h-full group">
                  <div className="h-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <img
                        alt={meal.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={getImage(meal)}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-on-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {Number(meal.is_featured) === 1 && (
                        <div className="absolute top-3 left-3 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-label-xs text-label-xs font-medium backdrop-blur-sm">
                          Chef's Pick
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline text-headline-sm text-on-surface font-bold">{meal.name}</h3>
                        <span className="font-label-lg text-label-lg text-primary font-bold whitespace-nowrap ml-2">
                          {Number(meal.price).toLocaleString()} Ar
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 flex-1">
                        {meal.description}
                      </p>
                      <button className="mt-4 w-full py-2.5 bg-surface-container group-hover:bg-primary group-hover:text-on-primary text-on-surface rounded-lg font-label-md text-label-md transition-all duration-200 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        Commander
                      </button>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            Voir Tout le Menu
          </Link>
        </div>
      </section>

      {/* Experience Section */}
      <section className="bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-low py-12 md:py-20 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <AnimatedSection animation="fadeLeft">
              <div className="order-2 lg:order-1">
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-label-xs text-label-xs font-medium mb-4">
                  Notre Histoire
                </span>
                <h2 className="font-headline text-headline-lg-mobile md:text-headline-xl text-on-surface mb-4">
                  Une Atmosphère d'Élégance
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                  Bien plus qu'un restaurant, Mikaly est une expérience sensorielle. De l'éclairage tamisé à la musique d'ambiance, chaque détail est conçu pour éveiller vos sens et créer des souvenirs inoubliables.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface">Ouvert 7j/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface">Antsirabe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">star</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface">Noté 4.9/5</span>
                  </div>
                </div>
                <Link
                  to="/reservations"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-md hover:shadow-lg hover:bg-primary-dark transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  Réserver Maintenant
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeRight">
              <div className="order-1 lg:order-2 grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-3 md:space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg h-32 md:h-48">
                    <img alt="Interior" className="w-full h-full object-cover" src="/images/home/table-setting.jpg" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg h-40 md:h-56">
                    <img alt="Chef" className="w-full h-full object-cover" src="/images/home/chef-plating.jpg" />
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4 pt-6 md:pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg h-40 md:h-56">
                    <img alt="Food" className="w-full h-full object-cover" src="/images/home/scallops.jpg" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg h-32 md:h-48">
                    <img alt="Restaurant" className="w-full h-full object-cover" src="/images/home/burrata.jpg" />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-12 md:py-16 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection animation="scaleIn">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            </div>
            <p className="font-headline text-headline-md-mobile md:text-headline-lg text-on-surface mb-6 italic leading-relaxed">
              "Une expérience culinaire exceptionnelle. Chaque plat est une œuvre d'art, et le service est impeccable. Mikaly redefine l'art de dining à Antsirabe."
            </p>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-tertiary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="font-label-md text-label-md text-on-surface font-medium">Marie-Claire R.</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Food Blogger, Antananarivo</p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-12 md:py-16 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fadeUp">
            <h2 className="font-headline text-headline-lg-mobile md:text-headline-xl text-on-primary mb-4">
              Prêt pour une Aventure Culinaire?
            </h2>
            <p className="font-body-md text-body-md text-on-primary/80 mb-8 max-w-2xl mx-auto">
              Réservez votre table ou commandez en ligne. Vivez l'expérience Mikaly dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/reservations"
                className="bg-on-primary text-primary px-8 py-3.5 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                Réserver
              </Link>
              <Link
                to="/menu"
                className="bg-primary-container/30 text-on-primary px-8 py-3.5 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl hover:bg-primary-container/50 transition-all duration-200 flex items-center justify-center gap-2 border border-on-primary/20"
              >
                <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                Commander en Ligne
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Home;