import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import apiStaff from '../services/apiStaff';
import AnimatedSection from '../components/ui/AnimatedSection';

interface KitchenOrder {
  id: number;
  order_type: string;
  status: string;
  created_at: string;
  table_number: string;
  client_name: string;
  client_phone: string;
  delivery_address: string;
  total: number;
  items: { quantity: number; notes: string; meal_name: string; meal_image: string }[];
}

const Kitchen = () => {
  const { staffLogout, staff } = useStaffAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'online'>('table');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiStaff.get('/orders/kitchen');
      setOrders(response.data.data || []);
    } catch {
      console.error('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await apiStaff.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch {
      console.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `${diffMin} min`;
    return `${Math.floor(diffMin / 60)}h${diffMin % 60}`;
  };

  const tableOrders = orders.filter((o) => o.order_type === 'dine_in').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const onlineOrders = orders.filter((o) => o.order_type === 'online' || o.order_type === 'takeaway').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const currentOrders = activeTab === 'table' ? tableOrders : onlineOrders;

  const urgentCount = orders.filter((o) => {
    const diff = (new Date().getTime() - new Date(o.created_at).getTime()) / 60000;
    return diff > 15 && o.status === 'preparing';
  }).length;

  const handleLogout = () => {
    staffLogout();
    navigate('/login');
  };

  const getMealImage = (mealImage: string | null, mealId: number) => {
    if (mealImage && !mealImage.startsWith('/')) return `/api/meals/${mealId}/image`;
    return mealImage || '/images/home/scallops-menu.jpg';
  };

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Compact Top Bar */}
      <header className="sticky top-0 z-20 bg-surface border-b border-outline-variant/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">restaurant</span>
            </div>
            <div>
              <h1 className="font-headline text-headline-sm font-bold text-on-surface">Mikaly Cuisine</h1>
              <p className="font-label-xs text-label-xs text-on-surface-variant">
                {staff?.name || 'Cuisinier'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span className="font-label-md text-label-md font-bold tabular-nums">{currentTime.toLocaleTimeString('fr-FR')}</span>
            </div>
            {urgentCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-full">
                <span className="material-symbols-outlined text-[16px] animate-pulse">warning</span>
                <span className="font-label-sm text-label-sm font-medium">{urgentCount} urgente{urgentCount > 1 ? 's' : ''}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
              title="Déconnexion"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="sticky top-[68px] z-10 bg-surface-container-low border-b border-outline-variant/10 px-4 py-3">
        <div className="flex gap-2 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-label-md text-label-md font-medium transition-all ${
              activeTab === 'table'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
            Sur place
            {tableOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === 'table' ? 'bg-white/25' : 'bg-surface-container'}`}>
                {tableOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-label-md text-label-md font-medium transition-all ${
              activeTab === 'online'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            En ligne
            {onlineOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === 'online' ? 'bg-white/25' : 'bg-surface-container'}`}>
                {onlineOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-surface-container rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-surface-container rounded w-20" />
                    <div className="h-4 bg-surface-container rounded w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-surface-container rounded w-full" />
                  <div className="h-4 bg-surface-container rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : currentOrders.length === 0 ? (
          <AnimatedSection animation="scaleIn">
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-surface-container mx-auto mb-6 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">restaurant_menu</span>
              </div>
              <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune commande</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {activeTab === 'table' ? 'Aucune commande sur place.' : 'Aucune commande en ligne.'}
              </p>
            </div>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentOrders.map((order, index) => {
              const timeSince = getTimeSince(order.created_at);
              const isUrgent = (new Date().getTime() - new Date(order.created_at).getTime()) / 60000 > 15;
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <AnimatedSection key={order.id} animation="fadeUp" delay={index * 40}>
                  <div className={`bg-surface rounded-2xl overflow-hidden shadow-lg transition-all hover:shadow-xl ${
                    isUrgent ? 'ring-2 ring-error ring-offset-2 ring-offset-surface-container-low' : ''
                  } ${order.status === 'received' ? 'ring-2 ring-amber-400' : ''}`}>
                    
                    {/* Order Header */}
                    <div className="p-4 border-b border-outline-variant/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {activeTab === 'table' ? (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                              <span className="font-headline text-headline-lg text-white font-bold tabular-nums">
                                {order.table_number || '?'}
                              </span>
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg shadow-secondary/20">
                              <span className="material-symbols-outlined text-white text-2xl">
                                {order.order_type === 'takeaway' ? 'storefront' : 'local_shipping'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
                              {activeTab === 'table' ? 'Table' : order.order_type === 'takeaway' ? 'À récupérer' : 'Livraison'}
                            </p>
                            <h3 className="font-headline text-headline-sm text-on-surface font-bold">
                              #{order.id}
                            </h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm font-bold ${
                            order.status === 'received' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status === 'received' ? 'Nouvelle' : 'En cours'}
                          </span>
                          <span className={`font-label-sm text-label-sm flex items-center gap-1 ${
                            isUrgent ? 'text-error font-bold animate-pulse' : 'text-on-surface-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {timeSince}
                          </span>
                        </div>
                      </div>

                      {/* Client Info */}
                      {activeTab === 'online' && (
                        <div className="bg-surface-container rounded-xl p-3 space-y-1.5">
                          <p className="font-label-sm text-label-sm text-on-surface font-medium truncate">
                            {order.client_name || 'Anonyme'}
                          </p>
                          {order.client_phone && (
                            <p className="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">phone</span>
                              {order.client_phone}
                            </p>
                          )}
                          {order.delivery_address && (
                            <p className="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1 truncate">
                              <span className="material-symbols-outlined text-[12px]">location_on</span>
                              {order.delivery_address}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 shadow-md">
                            <img
                              src={getMealImage(item.meal_image, 0)}
                              alt={item.meal_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-body-md text-body-md text-on-surface font-medium leading-tight">
                                  {item.meal_name}
                                </p>
                                {item.notes && (
                                  <p className="font-label-xs text-label-xs text-on-surface-variant italic mt-0.5">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-headline text-headline-sm font-bold flex-shrink-0">
                                {item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Items Count Badge */}
                    <div className="px-4 pb-3">
                      <div className="bg-surface-container rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Total articles</span>
                        <span className="font-headline text-headline-sm text-primary font-bold tabular-nums">{totalItems}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 pt-2">
                      {order.status === 'received' ? (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-label-md text-label-md font-bold shadow-lg shadow-amber-500/25 hover:bg-amber-600 hover:shadow-amber-500/30 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                          Commencer la préparation
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="w-full py-3.5 bg-green-600 text-white rounded-xl font-label-md text-label-md font-bold shadow-lg shadow-green-600/25 hover:bg-green-700 hover:shadow-green-600/30 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          Marquer comme prêt
                        </button>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Kitchen;