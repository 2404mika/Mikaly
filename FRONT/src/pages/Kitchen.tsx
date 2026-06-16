import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
  items: { quantity: number; notes: string; meal_name: string }[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  received: { label: 'Reçue', color: 'text-amber-700', bg: 'bg-amber-50', icon: 'receipt_long' },
  preparing: { label: 'En préparation', color: 'text-blue-700', bg: 'bg-blue-50', icon: 'restaurant' },
  ready: { label: 'Prête', color: 'text-green-700', bg: 'bg-green-50', icon: 'check_circle' },
};

const Kitchen = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'online'>('table');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/kitchen');
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
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch {
      console.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'À l\'instant';
    if (diffMin < 60) return `${diffMin} min`;
    return `${Math.floor(diffMin / 60)}h${diffMin % 60}`;
  };

  const tableOrders = orders.filter((o) => o.order_type === 'dine_in');
  const onlineOrders = orders.filter((o) => o.order_type === 'online' || o.order_type === 'takeaway');
  const currentOrders = activeTab === 'table' ? tableOrders : onlineOrders;

  const urgentCount = orders.filter((o) => {
    const diff = (new Date().getTime() - new Date(o.created_at).getTime()) / 60000;
    return diff > 15 && o.status === 'preparing';
  }).length;

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
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kitchen</p>
          </div>
          <nav className="p-3 space-y-1">
            <Link to="/kitchen" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-label-md text-label-md font-medium">
              <span className="material-symbols-outlined text-[20px]">restaurant</span>
              Cuisine
            </Link>
          </nav>
        </div>
        <div className="p-3 border-t border-outline-variant/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-body-sm text-body-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">Commandes en cours</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Interface Cuisine</p>
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-error/10 text-error rounded-full font-label-sm text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {urgentCount} Urgente{urgentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Tabs: Sur place / En ligne */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'table'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
            Sur place
            {tableOrders.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums">{tableOrders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'online'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            En ligne
            {onlineOrders.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums">{onlineOrders.length}</span>
            )}
          </button>
        </div>

        {/* Orders Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-4 ambient-shadow-sm animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 bg-surface-container rounded w-20" />
                  <div className="h-6 bg-surface-container rounded-full w-24" />
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
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">restaurant_menu</span>
              <h2 className="font-headline text-headline-md text-on-surface mb-2">Aucune commande</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {activeTab === 'table' ? 'Aucune commande sur place.' : 'Aucune commande en ligne.'}
              </p>
            </div>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentOrders.map((order, index) => {
              const st = statusConfig[order.status] || statusConfig.received;
              const timeSince = getTimeSince(order.created_at);
              const isUrgent = (new Date().getTime() - new Date(order.created_at).getTime()) / 60000 > 15;

              return (
                <AnimatedSection key={order.id} animation="fadeUp" delay={index * 60}>
                  <div className={`bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow-sm ${isUrgent ? 'ring-2 ring-error/30' : ''}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-outline-variant/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {activeTab === 'table' ? (
                            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                              <span className="font-headline text-headline-md text-on-surface font-bold tabular-nums">
                                {order.table_number || '—'}
                              </span>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                            </div>
                          )}
                          <div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                              {activeTab === 'table' ? 'Table' : order.order_type === 'takeaway' ? 'À récupérer' : 'Livraison'}
                            </div>
                            <div className="font-headline text-headline-sm text-on-surface">{order.client_name || 'Anonyme'}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${st.bg} ${st.color}`}>
                            <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                            {st.label}
                          </span>
                          <span className={`font-label-sm text-label-sm flex items-center gap-1 ${isUrgent ? 'text-error font-medium' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {timeSince}
                          </span>
                        </div>
                      </div>
                      {/* Online order info */}
                      {activeTab === 'online' && (
                        <div className="mt-2 space-y-1">
                          {order.client_phone && (
                            <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px]">phone</span>
                              {order.client_phone}
                            </div>
                          )}
                          {order.delivery_address && (
                            <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {order.delivery_address}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i}>
                          <div className="font-body-md text-body-md text-on-surface font-medium">
                            {item.quantity}x {item.meal_name}
                          </div>
                          {item.notes && (
                            <div className="mt-1 ml-4 text-sm text-on-surface-variant italic">
                              • {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    <div className="p-4 pt-0">
                      {order.status === 'received' ? (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="w-full py-2.5 border-2 border-primary text-primary rounded-lg font-label-md text-label-md font-medium hover:bg-primary/5 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                          Commencer
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold shadow-sm hover:bg-primary-dark transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Marquer comme Prêt
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
