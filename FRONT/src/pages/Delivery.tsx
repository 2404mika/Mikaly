import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  items: { quantity: number; notes: string; meal_name: string }[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ready: { label: 'Prête', color: 'text-green-700', bg: 'bg-green-50', icon: 'check_circle' },
  en_route: { label: 'En route', color: 'text-indigo-700', bg: 'bg-indigo-50', icon: 'local_shipping' },
  delivered: { label: 'Livrée', color: 'text-green-700', bg: 'bg-green-50', icon: 'where_to_vote' },
};

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
      console.error('Erreur lors de l\'acceptation');
    }
  };

  const handleDelivered = async (orderId: number) => {
    try {
      await api.patch(`/orders/${orderId}/delivered`);
      fetchOrders();
      fetchMyActiveOrders();
      fetchDeliveredOrders();
    } catch {
      console.error('Erreur lors de la livraison');
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'À l\'instant';
    if (diffMin < 60) return `${diffMin} min`;
    return `${Math.floor(diffMin / 60)}h${diffMin % 60}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 bg-surface-container-lowest border-r border-outline-variant/20 flex-col justify-between fixed h-full">
        <div>
          <div className="p-5 border-b border-outline-variant/20">
            <h1 className="font-headline text-headline-sm font-bold text-primary">Mikaly</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Delivery</p>
          </div>
          <nav className="p-3 space-y-1">
            <Link to="/delivery" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-label-md text-label-md font-medium">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              Livraisons
            </Link>
          </nav>
        </div>
        <div className="p-3 border-t border-outline-variant/20 space-y-1">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-body-sm text-body-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {activeTab === 'available' ? 'Commandes à livrer' : activeTab === 'active' ? 'Mes livraisons' : 'Commandes livrées'}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {activeTab === 'available' ? `${orders.length} commande${orders.length !== 1 ? 's' : ''} disponible${orders.length !== 1 ? 's' : ''}` :
               activeTab === 'active' ? `${myActiveOrders.length} commande${myActiveOrders.length !== 1 ? 's' : ''} en cours` :
               `${deliveredOrders.length} commande${deliveredOrders.length !== 1 ? 's' : ''} livrée${deliveredOrders.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'available'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            À livrer
            {orders.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums">{orders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'active'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            En cours
            {myActiveOrders.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums">{myActiveOrders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'delivered'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Livrées
            {deliveredOrders.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums">{deliveredOrders.length}</span>
            )}
          </button>
        </div>

        {/* Orders */}
        {activeTab === 'available' ? (
          isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-4 ambient-shadow-sm animate-pulse">
                  <div className="h-5 bg-surface-container rounded w-32 mb-3" />
                  <div className="h-4 bg-surface-container rounded w-48 mb-2" />
                  <div className="h-4 bg-surface-container rounded w-full" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <AnimatedSection animation="scaleIn">
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">inventory_2</span>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune commande</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Aucune commande à livrer pour le moment.</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order, index) => {
                const st = statusConfig[order.status] || statusConfig.ready;

                return (
                  <AnimatedSection key={order.id} animation="fadeUp" delay={index * 60}>
                    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow-sm">
                      {/* Header */}
                      <div className="p-4 border-b border-outline-variant/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-headline text-headline-sm text-on-surface"> Commande #{order.id}</span>
                            <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${st.bg} ${st.color}`}>
                              <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                              {st.label}
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{getTimeSince(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{order.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">phone</span>
                          <span className="font-body-sm text-body-sm text-on-surface tabular-nums">{order.client_phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{order.delivery_address}</span>
                        </div>

                        {/* Items */}
                        <div className="border-t border-outline-variant/20 pt-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-body-sm mb-1">
                              <span className="text-on-surface">{item.quantity}x {item.meal_name}</span>
                              {item.notes && <span className="text-on-surface-variant italic text-sm">({item.notes})</span>}
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-outline-variant/20 pt-3 flex justify-between">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                          <span className="font-headline text-headline-sm text-primary tabular-nums">{Number(order.total).toLocaleString()} Ar</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => handleAccept(order.id)}
                          className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold shadow-sm hover:bg-primary-dark transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                          Accepter la livraison
                        </button>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )
        ) : activeTab === 'active' ? (
          myActiveOrders.length === 0 ? (
            <AnimatedSection animation="scaleIn">
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">local_shipping</span>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune livraison en cours</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Vous n'avez pas de livraison en cours.</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myActiveOrders.map((order, index) => {
                const st = statusConfig[order.status] || statusConfig.en_route;

                return (
                  <AnimatedSection key={order.id} animation="fadeUp" delay={index * 60}>
                    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow-sm">
                      {/* Header */}
                      <div className="p-4 border-b border-outline-variant/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-headline text-headline-sm text-on-surface"> Commande #{order.id}</span>
                            <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${st.bg} ${st.color}`}>
                              <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                              {st.label}
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{getTimeSince(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{order.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">phone</span>
                          <span className="font-body-sm text-body-sm text-on-surface tabular-nums">{order.client_phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{order.delivery_address}</span>
                        </div>

                        {/* Items */}
                        <div className="border-t border-outline-variant/20 pt-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-body-sm mb-1">
                              <span className="text-on-surface">{item.quantity}x {item.meal_name}</span>
                              {item.notes && <span className="text-on-surface-variant italic text-sm">({item.notes})</span>}
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-outline-variant/20 pt-3 flex justify-between">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                          <span className="font-headline text-headline-sm text-primary tabular-nums">{Number(order.total).toLocaleString()} Ar</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 pt-0">
                        <button
                          onClick={() => handleDelivered(order.id)}
                          className="w-full py-2.5 bg-green-600 text-white rounded-lg font-label-md text-label-md font-bold shadow-sm hover:bg-green-700 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[18px]">where_to_vote</span>
                          Marquer comme livrée
                        </button>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )
        ) : (
          deliveredOrders.length === 0 ? (
            <AnimatedSection animation="scaleIn">
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">check_circle</span>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune commande livrée</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Vous n'avez pas encore livré de commande.</p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveredOrders.map((order, index) => {
                const st = statusConfig[order.status] || statusConfig.delivered;

                return (
                  <AnimatedSection key={order.id} animation="fadeUp" delay={index * 60}>
                    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow-sm opacity-75">
                      {/* Header */}
                      <div className="p-4 border-b border-outline-variant/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-headline text-headline-sm text-on-surface"> Commande #{order.id}</span>
                            <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${st.bg} ${st.color}`}>
                              <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                              {st.label}
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{order.delivered_at ? getTimeSince(order.delivered_at) : 'Livrée'}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{order.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">phone</span>
                          <span className="font-body-sm text-body-sm text-on-surface tabular-nums">{order.client_phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_on</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{order.delivery_address}</span>
                        </div>

                        {/* Items */}
                        <div className="border-t border-outline-variant/20 pt-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-body-sm mb-1">
                              <span className="text-on-surface">{item.quantity}x {item.meal_name}</span>
                              {item.notes && <span className="text-on-surface-variant italic text-sm">({item.notes})</span>}
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-outline-variant/20 pt-3 flex justify-between">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                          <span className="font-headline text-headline-sm text-primary tabular-nums">{Number(order.total).toLocaleString()} Ar</span>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Delivery;
