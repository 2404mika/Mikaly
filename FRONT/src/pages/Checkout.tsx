import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orders';
import AnimatedSection from '../components/ui/AnimatedSection';
import mvolaLogo from '../assets/mvola.png';
import orangeLogo from '../assets/orange_money.png';
import airtelLogo from '../assets/airtel_money.png';

const DELIVERY_FEE = 4000;

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mvola' | 'orange' | 'airtel' | 'card'>('mvola');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = deliveryMode === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const getImage = (meal: any) => {
    if (meal.image && meal.image.startsWith('/')) return meal.image;
    return '/images/home/scallops-menu.jpg';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Votre panier est vide');
      return;
    }

    if (deliveryMode === 'delivery' && !deliveryAddress.trim()) {
      setError('Veuillez entrer une adresse de livraison');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: any = {
        order_type: deliveryMode === 'delivery' ? 'online' : 'takeaway',
        client_name: user?.name || '',
        client_phone: phoneNumber,
        delivery_fee: deliveryFee,
        items: items.map((item) => ({
          meal_id: item.meal.id,
          quantity: item.quantity,
          unit_price: item.meal.price,
          notes: item.notes,
        })),
      };

      if (deliveryMode === 'delivery') {
        orderData.delivery_address = deliveryAddress;
        if (deliveryTime) orderData.delivery_time = deliveryTime;
      }
      if (deliveryInstructions) {
        orderData.notes = deliveryInstructions;
      }

      console.log('[CHECKOUT] Sending order:', JSON.stringify(orderData, null, 2));
      const result = await createOrder(orderData);
      console.log('[CHECKOUT] Order created:', result);
      clearCart();
      navigate(`/order-tracking/${result.id}`);
    } catch (err: any) {
      console.error('[CHECKOUT] Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AnimatedSection animation="scaleIn">
          <div className="text-center">
            <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">shopping_cart</span>
            <h1 className="font-headline text-headline-lg text-on-surface mb-4">Panier vide</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Ajoutez des plats au panier avant de passer commande.
            </p>
            <Link
              to="/menu"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary-dark transition-[background-color] duration-150 ease-out inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
              Voir le Menu
            </Link>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Fixed Back Button */}
      <Link
        to="/menu"
        className="fixed top-20 left-4 md:left-8 z-40 w-10 h-10 bg-surface-container-lowest border border-outline-variant/30 rounded-full shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:shadow-lg transition-[color,box-shadow,border-color] duration-200 ease-out active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </Link>

      <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-6 md:py-8 pb-24 md:pb-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Checkout Form */}
        <div className="md:col-span-7 space-y-6">
          <AnimatedSection animation="fadeUp" delay={100}>
            <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6">
              Validation de commande
            </h1>
          </AnimatedSection>

          {error && (
            <AnimatedSection animation="fadeUp">
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </AnimatedSection>
          )}

          {/* Delivery / Pickup Toggle */}
          <AnimatedSection animation="fadeUp" delay={200}>
            <section className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow-sm">
              <h2 className="font-headline text-headline-md text-on-surface mb-4 font-semibold">Mode de réception</h2>
              <div className="flex p-1 bg-surface-container-low rounded-lg">
                <button
                  onClick={() => setDeliveryMode('delivery')}
                  className={`flex-1 py-2.5 px-4 rounded-md font-label-md text-label-md transition-[background-color,color,box-shadow] duration-200 ease-out flex items-center justify-center gap-2 ${
                    deliveryMode === 'delivery'
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  Livraison
                </button>
                <button
                  onClick={() => setDeliveryMode('pickup')}
                  className={`flex-1 py-2.5 px-4 rounded-md font-label-md text-label-md transition-[background-color,color,box-shadow] duration-200 ease-out flex items-center justify-center gap-2 ${
                    deliveryMode === 'pickup'
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  À récupérer
                </button>
              </div>

                  {/* Address Details (Visible only for delivery) */}
              {deliveryMode === 'delivery' && (
                <div className="mt-4 space-y-4 animate-[fadeSlideIn_0.3s_ease_both]">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Adresse de livraison
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="123 Rue de la Gastronomie, Antananarivo"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Heure de livraison souhaitée (Optionnel)
                    </label>
                    <input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Instructions pour le livreur (Optionnel)
                    </label>
                    <textarea
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Code porte, étage..."
                      rows={2}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out resize-none"
                    />
                  </div>
                </div>
              )}
            </section>
          </AnimatedSection>

          {/* Personal Details */}
          <AnimatedSection animation="fadeUp" delay={300}>
            <section className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow-sm">
              <h2 className="font-headline text-headline-md text-on-surface mb-4 font-semibold">Vos coordonnées</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant rounded-lg px-4 py-2.5 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+261 34 00 000 00"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out"
                  />
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* Payment Method */}
          <AnimatedSection animation="fadeUp" delay={400}>
            <section className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow-sm">
              <h2 className="font-headline text-headline-md text-on-surface mb-4 font-semibold">Moyen de paiement</h2>
              <div className="space-y-2">
                {/* Mobile Money Options */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => setPaymentMethod('mvola')}
                    className={`p-3 rounded-lg border transition-[border-color,background-color] duration-150 ease-out flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'mvola'
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/30 hover:bg-surface-container-low'
                    }`}
                  >
                    <img src={mvolaLogo} alt="Mvola" className="h-7 object-contain" />
                    <span className="font-label-sm text-label-sm text-on-surface">Mvola</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('orange')}
                    className={`p-3 rounded-lg border transition-[border-color,background-color] duration-150 ease-out flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'orange'
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/30 hover:bg-surface-container-low'
                    }`}
                  >
                    <img src={orangeLogo} alt="Orange Money" className="h-7 object-contain" />
                    <span className="font-label-sm text-label-sm text-on-surface">Orange</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('airtel')}
                    className={`p-3 rounded-lg border transition-[border-color,background-color] duration-150 ease-out flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'airtel'
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/30 hover:bg-surface-container-low'
                    }`}
                  >
                    <img src={airtelLogo} alt="Airtel Money" className="h-7 object-contain" />
                    <span className="font-label-sm text-label-sm text-on-surface">Airtel</span>
                  </button>
                </div>

                {/* Mobile Money Phone Input */}
                {(paymentMethod === 'mvola' || paymentMethod === 'orange' || paymentMethod === 'airtel') && (
                  <div className="animate-[fadeSlideIn_0.2s_ease_both]">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Numéro de téléphone pour le paiement
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+261 34 00 000 00"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out"
                    />
                  </div>
                )}

                {/* Credit Card Option */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 rounded-lg border transition-[border-color,background-color] duration-150 ease-out flex items-center justify-between ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">credit_card</span>
                    <span className="font-body-md text-body-md text-on-surface">Carte Bancaire / En ligne</span>
                  </div>
                </button>

                {/* Credit Card Form */}
                {paymentMethod === 'card' && (
                  <div className="animate-[fadeSlideIn_0.2s_ease_both] space-y-3">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                        Numéro de carte
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out tabular-nums"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                          Date d'expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-[border-color,box-shadow] duration-200 ease-out tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </AnimatedSection>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5">
          <div className="sticky top-24">
            <AnimatedSection animation="fadeRight" delay={200}>
              <section className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow-sm flex flex-col h-full">
                <h2 className="font-headline text-headline-md text-on-surface border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined">receipt_long</span>
                  Résumé de la commande
                </h2>

                {/* Articles */}
                <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 max-h-[300px]">
                  {items.map((item) => (
                    <div key={item.meal.id} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                          <img
                            alt={item.meal.name}
                            className="object-cover w-full h-full"
                            src={getImage(item.meal)}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }}
                          />
                        </div>
                        <div>
                          <h3 className="font-body-sm text-body-sm font-semibold text-on-surface">{item.meal.name}</h3>
                          {item.notes && (
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{item.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-body-sm text-body-sm text-on-surface tabular-nums">
                          {(item.meal.price * item.quantity).toLocaleString()} Ar
                        </span>
                        <div className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                          Qté: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-outline-variant/30 pt-3 space-y-2 mb-4">
                  <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>Sous-total</span>
                    <span className="tabular-nums">{subtotal.toLocaleString()} Ar</span>
                  </div>
                  {deliveryMode === 'delivery' && (
                    <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span>Frais de livraison</span>
                      <span className="tabular-nums">{DELIVERY_FEE.toLocaleString()} Ar</span>
                    </div>
                  )}
                  <div className="flex justify-between font-headline text-headline-md text-on-surface mt-2 pt-2 border-t border-outline-variant/20 font-semibold">
                    <span>Total</span>
                    <span className="text-primary tabular-nums">{total.toLocaleString()} Ar</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-on-primary font-label-md text-label-md font-bold py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-[background-color,box-shadow,transform] duration-150 ease-out flex items-center justify-center gap-2 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      Confirmer et Payer
                    </>
                  )}
                </button>
                <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-3 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Paiement 100% sécurisé
                </p>
              </section>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/20 w-full py-4 px-margin-desktop text-center mt-auto">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2025 Mikaly. Tous droits réservés.</p>
      </footer>
    </main>
  );
};

export default Checkout;
