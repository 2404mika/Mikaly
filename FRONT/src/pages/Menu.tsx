import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeals, useCategories } from '../hooks/useMeals';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/ui/AnimatedSection';
import type { Meal, Category } from '../services/meals';

const defaultImages: Record<string, string> = {
  'Coquilles St-Jacques': '/images/home/scallops-menu.jpg',
  'Burrata Crémeuse': '/images/home/burrata-menu.jpg',
  'Burger Signature': '/images/home/burger-menu.jpg',
  'Pizza Tartufo': '/images/home/pizza-menu.jpg',
};

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { meals, isLoading } = useMeals(selectedCategory || undefined);
  const { categories } = useCategories();
  const { items, addToCart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groupedMeals, setGroupedMeals] = useState<Record<string, Meal[]>>({});

  useEffect(() => {
    const grouped: Record<string, Meal[]> = {};
    meals.forEach((meal) => {
      const catName = meal.category_name || 'Autres';
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(meal);
    });
    setGroupedMeals(grouped);
  }, [meals]);

  const handleAddToCart = (meal: Meal) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(meal);
    setCartOpen(true);
  };

  const getImage = (meal: Meal) => {
    if (meal.image && meal.image.startsWith('/')) return meal.image;
    return defaultImages[meal.name] || '/images/home/scallops-menu.jpg';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative pb-24 md:pb-0">
      {/* Main Canvas */}
      <main className="flex-1 pb-24 md:pb-8 px-margin-mobile md:px-margin-desktop pt-6 md:pt-8 md:mr-[360px]">
        <AnimatedSection animation="fadeUp">
          <header className="mb-8">
            <h1 className="font-headline text-display-lg text-primary mb-1">Notre Menu</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Découvrez notre sélection de plats raffinés, préparés avec des ingrédients frais et locaux.
            </p>
          </header>
        </AnimatedSection>

        {/* Category Navigation */}
        <AnimatedSection animation="fadeUp" delay={100}>
          <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl py-3 mb-4 flex overflow-x-auto gap-2 border-b border-outline-variant/20 shadow-[0_4px_12px_rgba(48,109,41,0.04)]" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-4 py-2 font-label-md text-label-md rounded-full transition-[background-color,color,transform,box-shadow] duration-200 ease-out ${
                selectedCategory === null
                  ? 'bg-primary-container text-on-primary-container shadow-sm scale-105'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:scale-105'
              }`}
            >
              Tous
            </button>
            {categories.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 font-label-md text-label-md rounded-full transition-[background-color,color,transform,box-shadow] duration-200 ease-out ${
                  selectedCategory === cat.id
                    ? 'bg-primary-container text-on-primary-container shadow-sm scale-105'
                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:scale-105'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-surface-container" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 bg-surface-container rounded w-2/3" />
                    <div className="h-5 bg-surface-container rounded w-16" />
                  </div>
                  <div className="h-4 bg-surface-container rounded w-full" />
                  <div className="h-4 bg-surface-container rounded w-3/4" />
                  <div className="h-10 bg-surface-container rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(groupedMeals).map(([categoryName, categoryMeals], catIndex) => (
              <div key={categoryName} className="contents">
                <AnimatedSection animation="fadeUp" delay={catIndex * 100} className="col-span-full mt-6 mb-2">
                  <h2 className="font-headline text-headline-md text-on-surface border-b border-outline-variant/30 pb-2">
                    {categoryName}
                  </h2>
                </AnimatedSection>
                {categoryMeals.map((meal, mealIndex) => (
                  <AnimatedSection
                    key={meal.id}
                    animation="scaleIn"
                    delay={100 + mealIndex * 80}
                  >
                    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow-sm flex flex-col transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(48,109,41,0.1)] group h-full">
                      <div className="relative h-48 w-full bg-surface-container overflow-hidden">
                        <img
                          alt={meal.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          src={getImage(meal)}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }}
                        />
                        {Number(meal.is_featured) === 1 && (
                          <div className="absolute top-2 right-2 bg-tertiary-container/90 text-on-tertiary-container font-label-sm text-label-sm px-2 py-1 rounded backdrop-blur-sm animate-[scaleIn_0.3s_ease_0.5s_both]">
                            Chef's Pick
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-headline text-headline-sm text-on-surface text-2xl font-bold text-center">{meal.name}</h3>
                          <span className="font-headline-sm text-headline-sm text-primary ml-2 whitespace-nowrap tabular-nums">
                            {Number(meal.price).toLocaleString()} Ar
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex-1 line-clamp-2">
                          {meal.description}
                        </p>
                        <button
                          onClick={() => handleAddToCart(meal)}
                          className="w-full py-2.5 bg-surface-container hover:bg-primary hover:text-on-primary text-primary rounded-lg font-label-md text-label-md transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96] flex items-center justify-center gap-2 group/btn"
                        >
                          <span className="material-symbols-outlined group-hover/btn:rotate-[360deg] transition-transform duration-500 text-[20px]">
                            add_shopping_cart
                          </span>
                          {user ? 'Ajouter' : 'Se connecter pour commander'}
                        </button>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            ))}
          </div>
        )}

        {Object.keys(groupedMeals).length === 0 && !isLoading && (
          <AnimatedSection animation="scaleIn">
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">restaurant_menu</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Aucun plat disponible pour le moment.</p>
            </div>
          </AnimatedSection>
        )}
      </main>

      {/* Cart Sidebar */}
      <aside
        className={`fixed right-0 top-0 bottom-0 w-[360px] bg-surface-container-lowest border-l border-outline-variant/30 shadow-[0_12px_24px_rgba(48,109,41,0.08)] transform transition-[transform] duration-300 ease-out z-50 flex flex-col ${
          cartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined animate-[scaleIn_0.3s_ease_both]">shopping_basket</span>
            <h2 className="font-headline text-headline-sm">Votre Commande</h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="md:hidden p-1 text-on-surface-variant hover:bg-surface-variant rounded-full transition-transform duration-200 hover:rotate-90"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-[fadeIn_0.5s_ease_both]">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">shopping_cart</span>
              <p className="font-body-md text-body-md text-on-surface-variant">Votre panier est vide</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Ajoutez des plats pour commencer</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.meal.id}
                className="flex gap-3 items-start animate-[fadeSlideIn_0.3s_ease_both]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    alt={item.meal.name}
                    className="w-full h-full object-cover"
                    src={getImage(item.meal)}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">{item.meal.name}</h4>
                  <div className="font-body-sm text-body-sm text-on-surface-variant tabular-nums">
                    {Number(item.meal.price).toLocaleString()} Ar
                  </div>
                  {item.notes && (
                    <div className="text-xs text-primary/80 mt-0.5 truncate">{item.notes}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => updateQuantity(item.meal.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-[transform,background-color] duration-150 ease-out hover:scale-110 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                    <span className="font-label-md text-label-md min-w-[20px] text-center tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.meal.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-[transform,background-color] duration-150 ease-out hover:scale-110 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.meal.id)}
                  className="text-error/70 hover:text-error p-1 transition-[transform,color] duration-150 ease-out hover:scale-110 hover:rotate-12"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 animate-[fadeUp_0.3s_ease_both]">
            <div className="space-y-2 mb-4 font-body-sm text-body-sm">
              <div className="flex justify-between font-headline-sm text-headline-sm text-on-surface pt-2">
                <span>Total</span>
                <span className="text-primary tabular-nums">{subtotal.toLocaleString()} Ar</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-sm hover:shadow-md hover:bg-primary-dark transition-[transform,background-color,box-shadow] duration-150 ease-out flex justify-center items-center gap-2 active:scale-[0.96]"
            >
              Commander
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Cart Toggle Button */}
      <button
        onClick={() => setCartOpen(!cartOpen)}
        className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center transition-[transform,box-shadow] duration-150 ease-out hover:scale-110 active:scale-95 hover:shadow-xl"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-on-error font-label-sm text-label-sm w-5 h-5 rounded-full flex items-center justify-center animate-[scaleIn_0.3s_ease_both]">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
};

export default Menu;
