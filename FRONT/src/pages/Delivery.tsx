import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AnimatedSection from '../components/ui/AnimatedSection';

interface DeliveryOrder {
  id: number;
  order_type: string;
  status: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  delivery_address: string;
  delivery_fee: number;
  total: number;
  delivery_id: number | null;
  delivered_at: string;
  delivery_time: string;
  notes: string;
  items: { quantity: number; notes: string; meal_name: string }[];
}

const Delivery = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [myActiveOrders, setMyActiveOrders] = useState<DeliveryOrder[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'delivered'>('available');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/delivery');
      setOrders(response.data.data || []);
    } catch {
      console.error('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyActiveOrders = async () => {
    try {
      const response = await api.get('/orders/my-active-deliveries');
      setMyActiveOrders(response.data.data || []);
    } catch {
      console.error('Erreur lors du chargement des commandes en cours');
    }
  };

  const fetchDeliveredOrders = async () => {
    try {
      const response = await api.get('/orders/my-deliveries');
      setDeliveredOrders(response.data.data || []);
    } catch {
      console.error('Erreur lors du chargement des commandes livrées');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMyActiveOrders();
    fetchDeliveredOrders();
    const interval = setInterval(() => {
      fetchOrders();
      fetchMyActiveOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (orderId: number) => {
    try {
      await api.post(`/orders/${orderId}/accept-delivery`);
      fetchOrders();
      fetchMyActiveOrders();
      fetchDeliveredOrders();
    } catch {
      console.error("Erreur lors de l'acceptation");
    }
  };

  const handleDelivered = async (orderId: number) => {
    try {
      await api.patch(`/orders/${orderId}/delivered`);
      fetchOrders();
      fetchMyActiveOrders();
      fetchDeliveredOrders();
    } catch {
      console.error("Erreur lors de la livraison");
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `${diffMin} min`;
    return `${Math.floor(diffMin / 60)}h${diffMin % 60}`;
  };

  const formatDeliveryTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        const parts = dateStr.split(/[T:]/);
        if (parts.length >= 4) {
          const [year, month, day, hour, minute] = parts;
          return `${hour}:${minute}`;
        }
        return null;
      }
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Compact Top Bar */}
      <header className="sticky top-0 z-20 bg-surface border-b border-outline-variant/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">local_shipping</span>
            </div>
            <div>
              <h1 className="font-headline text-headline-sm font-bold text-on-surface">Mikaly Delivery</h1>
              <p className="font-label-xs text-label-xs text-on-surface-variant">
                {user?.name || 'Livreur'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
            title="Déconnexion"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="sticky top-[68px] z-10 bg-surface-container-low border-b border-outline-variant/10 px-4 py-3">
        <div className="flex gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-label-md text-label-md font-medium transition-all ${
              activeTab === 'available'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'bg-surface text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            À livrer
            {orders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === 'available' ? 'bg-white/25' : 'bg-surface-container'}`}>
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-label-md text-label-md font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'bg-surface text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">directions_bike</span>
            En cours
            {myActiveOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === 'active' ? 'bg-white/25' : 'bg-surface-container'}`}>
                {myActiveOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-label-md text-label-md font-medium transition-all ${
              activeTab === 'delivered'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'bg-surface text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Livrées
            {deliveredOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === 'delivered' ? 'bg-white/25' : 'bg-surface-container'}`}>
                {deliveredOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="p-4">
        {activeTab === 'available' ? (
          isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
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
          ) : orders.length === 0 ? (
            <AnimatedSection animation="scaleIn">
              <div className="text-center py-20">
                <div className="w-24 h-24 rounded-full bg-surface-container mx-auto mb-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant">local_shipping</span>
                </div>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune commande</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Aucune commande à livrer pour le moment.</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order, index) => (
                <AnimatedSection key={order.id} animation="fadeUp" delay={index * 40}>
                  <div className="bg-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                    <div className="p-4 border-b border-outline-variant/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg shadow-secondary/20">
                            <span className="material-symbols-outlined text-white text-2xl">shopping_bag</span>
                          </div>
                          <div>
                            <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Commande</p>
                            <h3 className="font-headline text-headline-sm text-on-surface font-bold">#{order.id}</h3>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 font-label-sm text-label-sm font-bold">
                          Prête
                        </span>
                      </div>
                      <div className="bg-surface-container rounded-xl p-3 space-y-1.5">
                        <p className="font-label-sm text-label-sm text-on-surface font-medium truncate">{order.client_name || 'Anonyme'}</p>
                        <p className="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">phone</span>
                          {order.client_phone}
                        </p>
                        <p className="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {order.delivery_address}
                        </p>
                        {order.delivery_time && (
                          <p className="font-label-xs text-label-xs text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            Livrer à: {formatDeliveryTime(order.delivery_time)}
                          </p>
                        )}
                        {order.notes && (
                          <p className="font-label-xs text-label-xs text-on-surface-variant flex items-start gap-1">
                            <span className="material-symbols-outlined text-[12px]">info</span>
                            <span className="italic">Instruction: {order.notes}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-headline text-headline-sm font-bold">
                              {item.quantity}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface">{item.meal_name}</span>
                          </div>
                          {item.notes && <span className="text-xs text-on-surface-variant italic">{item.notes}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-3">
                      <div className="bg-surface-container rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                        <span className="font-headline text-headline-sm text-secondary font-bold tabular-nums">
                          {Number(order.total).toLocaleString()} Ar
                        </span>
                      </div>
                    </div>
                    <div className="p-4 pt-2">
                      <button
                        onClick={() => handleAccept(order.id)}
                        className="w-full py-3.5 bg-secondary text-white rounded-xl font-label-md text-label-md font-bold shadow-lg shadow-secondary/25 hover:bg-secondary/90 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                        Accepter la livraison
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )
        ) : activeTab === 'active' ? (
          myActiveOrders.length === 0 ? (
            <AnimatedSection animation="scaleIn">
              <div className="text-center py-20">
                <div className="w-24 h-24 rounded-full bg-surface-container mx-auto mb-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant">directions_bike</span>
                </div>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune livraison en cours</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Vous n'avez pas de livraison en cours.</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myActiveOrders.map((order, index) => (
                <AnimatedSection key={order.id} animation="fadeUp" delay={index * 40}>
                  <div className="bg-surface rounded-2xl overflow-hidden shadow-lg ring-2 ring-secondary/30 hover:shadow-xl transition-all">
                    <div className="p-4 border-b border-outline-variant/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-bounce-subtle">
                            <span className="material-symbols-outlined text-white text-2xl">directions_bike</span>
                          </div>
                          <div>
                            <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">En route</p>
                            <h3 className="font-headline text-headline-sm text-on-surface font-bold">#{order.id}</h3>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {getTimeSince(order.created_at)}
                        </span>
                      </div>
                      <div className="bg-surface-container rounded-xl p-3 space-y-1.5">
                        <p className="font-label-sm text-label-sm text-on-surface font-medium truncate">{order.client_name || 'Anonyme'}</p>
                        <p className="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">phone</span>
                          {order.client_phone}
                        </p>
                        <p className="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-headline text-headline-sm font-bold">
                              {item.quantity}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface">{item.meal_name}</span>
                          </div>
                          {item.notes && <span className="text-xs text-on-surface-variant italic">{item.notes}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-3">
                      <div className="bg-surface-container rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                        <span className="font-headline text-headline-sm text-secondary font-bold tabular-nums">
                          {Number(order.total).toLocaleString()} Ar
                        </span>
                      </div>
                    </div>
                    <div className="p-4 pt-2">
                      <button
                        onClick={() => handleDelivered(order.id)}
                        className="w-full py-3.5 bg-green-600 text-white rounded-xl font-label-md text-label-md font-bold shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-[20px]">where_to_vote</span>
                        Marquer comme livrée
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )
        ) : (
          deliveredOrders.length === 0 ? (
            <AnimatedSection animation="scaleIn">
              <div className="text-center py-20">
                <div className="w-24 h-24 rounded-full bg-surface-container mx-auto mb-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant">check_circle</span>
                </div>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune commande livrée</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Vous n'avez pas encore livré de commande.</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveredOrders.map((order, index) => (
                <AnimatedSection key={order.id} animation="fadeUp" delay={index * 40}>
                  <div className="bg-surface rounded-2xl overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-outline-variant/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                            <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
                          </div>
                          <div>
                            <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">Livrée</p>
                            <h3 className="font-headline text-headline-sm text-on-surface font-bold">#{order.id}</h3>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {order.delivered_at ? getTimeSince(order.delivered_at) : ''}
                        </span>
                      </div>
                      <div className="bg-surface-container rounded-xl p-3 space-y-1.5">
                        <p className="font-label-sm text-label-sm text-on-surface font-medium truncate">{order.client_name || 'Anonyme'}</p>
                        <p className="font-label-xs text-label-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-headline text-headline-sm font-bold">
                              {item.quantity}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface">{item.meal_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-4">
                      <div className="bg-surface-container rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                        <span className="font-headline text-headline-sm text-green-600 font-bold tabular-nums">
                          {Number(order.total).toLocaleString()} Ar
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Delivery;