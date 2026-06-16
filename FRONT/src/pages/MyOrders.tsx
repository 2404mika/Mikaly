import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orders';
import { getMyReservations } from '../services/reservations';
import AnimatedSection from '../components/ui/AnimatedSection';
import type { Order } from '../services/orders';
import type { Reservation } from '../services/reservations';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  received: { label: 'Reçue', color: 'text-blue-700', bg: 'bg-blue-50', icon: 'receipt_long' },
  preparing: { label: 'En préparation', color: 'text-amber-700', bg: 'bg-amber-50', icon: 'restaurant' },
  ready: { label: 'Prête', color: 'text-purple-700', bg: 'bg-purple-50', icon: 'check_circle' },
  en_route: { label: 'En route', color: 'text-indigo-700', bg: 'bg-indigo-50', icon: 'local_shipping' },
  served: { label: 'Servie', color: 'text-green-700', bg: 'bg-green-50', icon: 'where_to_vote' },
  delivered: { label: 'Livrée', color: 'text-green-700', bg: 'bg-green-50', icon: 'where_to_vote' },
  paid: { label: 'Payée', color: 'text-green-700', bg: 'bg-green-50', icon: 'check_circle' },
  cancelled: { label: 'Annulée', color: 'text-red-700', bg: 'bg-red-50', icon: 'cancel' },
};

const reservationStatusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50', icon: 'schedule' },
  confirmed: { label: 'Confirmée', color: 'text-green-700', bg: 'bg-green-50', icon: 'check_circle' },
  cancelled: { label: 'Annulée', color: 'text-red-700', bg: 'bg-red-50', icon: 'cancel' },
  completed: { label: 'Terminée', color: 'text-gray-700', bg: 'bg-gray-50', icon: 'done_all' },
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, reservationsData] = await Promise.all([
          getMyOrders(),
          getMyReservations()
        ]);
        setOrders(ordersData);
        setReservations(reservationsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMealImage = (mealImage: string | null, mealId: number) => {
    if (mealImage && !mealImage.startsWith('/')) return `/api/meals/${mealId}/image`;
    return mealImage || '/images/home/scallops-menu.jpg';
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <AnimatedSection animation="fadeUp">
          <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6">
            Mon historique
          </h1>
        </AnimatedSection>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'orders'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Commandes
            {orders.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums">{orders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'reservations'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">event_seat</span>
            Réservations
            {reservations.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums">{reservations.length}</span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow-sm animate-pulse">
                <div className="flex">
                  <div className="w-24 h-24 bg-surface-container" />
                  <div className="flex-1 p-4 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-24" />
                    <div className="h-3 bg-surface-container rounded w-32" />
                    <div className="h-3 bg-surface-container rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <AnimatedSection animation="scaleIn">
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-error/30 mb-4 block">error</span>
              <p className="font-body-md text-body-md text-on-surface-variant">{error}</p>
            </div>
          </AnimatedSection>
        ) : activeTab === 'reservations' ? (
          reservations.length === 0 ? (
            <AnimatedSection animation="scaleIn">
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-surface-container mx-auto mb-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant">event_seat</span>
                </div>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune réservation</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Vous n'avez pas encore réservé de table.
                </p>
                <Link
                  to="/reservations"
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md text-label-md shadow-lg hover:shadow-xl hover:bg-primary-dark transition-all duration-150 inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Réserver une table
                </Link>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res, index) => {
                const status = reservationStatusConfig[res.status] || { label: res.status, color: 'text-gray-700', bg: 'bg-gray-50', icon: 'help' };
                const formatDate = (dateStr: string) => {
                  const date = new Date(dateStr);
                  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                };
                const isPending = res.status === 'pending';
                const isConfirmed = res.status === 'confirmed';
                const isCancelled = res.status === 'cancelled';
                
                return (
                  <AnimatedSection key={res.id} animation="fadeUp" delay={index * 60}>
                    <div className={`bg-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${isPending ? 'ring-2 ring-amber-400' : ''} ${isConfirmed ? 'ring-2 ring-green-400' : ''} ${isCancelled ? 'opacity-60' : ''}`}>
                      {/* Header with gradient */}
                      <div className={`p-4 ${isPending ? 'bg-gradient-to-r from-amber-50 to-amber-100' : isConfirmed ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${isPending ? 'bg-amber-500' : isConfirmed ? 'bg-green-500' : 'bg-gray-400'}`}>
                              <span className="material-symbols-outlined text-white text-2xl">event_seat</span>
                            </div>
                            <div>
                              <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Réservation</p>
                              <h3 className="font-headline text-headline-sm text-on-surface font-bold">Table {res.table_number}</h3>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl font-label-sm text-label-sm font-bold ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">calendar_today</span>
                          </div>
                          <div>
                            <p className="font-label-xs text-label-xs text-on-surface-variant">Date</p>
                            <p className="font-label-md text-label-md text-on-surface font-medium capitalize">{formatDate(res.reservation_date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">schedule</span>
                          </div>
                          <div>
                            <p className="font-label-xs text-label-xs text-on-surface-variant">Heure</p>
                            <p className="font-label-md text-label-md text-on-surface font-medium">{res.reservation_time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">group</span>
                          </div>
                          <div>
                            <p className="font-label-xs text-label-xs text-on-surface-variant">Nombre de personnes</p>
                            <p className="font-label-md text-label-md text-on-surface font-medium">
                              {res.number_of_guests} personne{res.number_of_guests > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        {res.notes && (
                          <div className="bg-surface-container rounded-xl p-3 mt-2">
                            <p className="font-label-xs text-label-xs text-on-surface-variant mb-1">Note</p>
                            <p className="font-body-sm text-body-sm text-on-surface italic">{res.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )
        ) : orders.length === 0 ? (
          <AnimatedSection animation="scaleIn">
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">receipt_long</span>
              <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune commande</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Vous n'avez pas encore passé de commande.
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
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || { label: order.status, color: 'text-gray-700', bg: 'bg-gray-50', icon: 'help' };
              const items = order.items || [];
              const firstItems = items.slice(0, 3);
              const remainingCount = items.length - 3;

              return (
                <AnimatedSection key={order.id} animation="fadeUp" delay={index * 80}>
                  <Link
                    to={`/order-tracking/${order.id}`}
                    className="block bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow-sm hover:shadow-[0_12px_24px_rgba(48,109,41,0.08)] transition-[box-shadow] duration-200 ease-out"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                          <span className="font-label-sm text-label-sm font-bold tabular-nums">{order.id}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${status.bg} ${status.color}`}>
                          <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
                          {status.label}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(order.created_at)}</span>
                    </div>

                    {/* Meal Images Grid */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex -space-x-3">
                          {firstItems.map((item: any, i: number) => (
                            <div
                              key={item.id || i}
                              className="w-12 h-12 rounded-xl overflow-hidden border-2 border-surface-container-lowest bg-surface-container flex-shrink-0"
                              style={{ zIndex: 3 - i }}
                            >
                              <img
                                alt={item.meal_name}
                                className="w-full h-full object-cover"
                                src={getMealImage(item.meal_image, item.meal_id)}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }}
                              />
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div className="w-12 h-12 rounded-xl bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center flex-shrink-0" style={{ zIndex: 0 }}>
                              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">+{remainingCount}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body-sm text-body-sm text-on-surface truncate">
                            {items.map((item: any) => item.meal_name).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                            {order.order_type === 'online' ? 'local_shipping' : order.order_type === 'takeaway' ? 'storefront' : 'table_restaurant'}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {order.order_type === 'online' ? 'Livraison' : order.order_type === 'takeaway' ? 'À récupérer' : 'Sur place'}
                          </span>
                        </div>
                        <span className="font-headline text-headline-sm text-primary tabular-nums font-semibold">
                          {Number(order.total).toLocaleString()} Ar
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOrders;
