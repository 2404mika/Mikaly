import { useState, useEffect } from 'react';
import apiAdmin from '../../services/apiAdmin';

interface OrderItem {
  id: number;
  meal_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
}

interface Order {
  id: number;
  order_type: string;
  status: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  delivery_address: string;
  delivery_fee: number;
  total: number;
  table_number: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  received: { label: 'Reçue', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'receipt_long' },
  preparing: { label: 'En préparation', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'restaurant' },
  ready: { label: 'Prête', bg: 'bg-purple-50', text: 'text-purple-700', icon: 'check_circle' },
  en_route: { label: 'En route', bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'local_shipping' },
  delivered: { label: 'Livrée', bg: 'bg-green-50', text: 'text-green-700', icon: 'done_all' },
  served: { label: 'Servie', bg: 'bg-green-50', text: 'text-green-700', icon: 'where_to_vote' },
  paid: { label: 'Payée', bg: 'bg-green-50', text: 'text-green-700', icon: 'paid' },
  cancelled: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-700', icon: 'cancel' },
};

const typeConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  dine_in: { label: 'Sur table', bg: 'bg-primary/10', text: 'text-primary', icon: 'table_restaurant' },
  online: { label: 'Commande en ligne', bg: 'bg-secondary/10', text: 'text-secondary', icon: 'shopping_cart' },
  takeaway: { label: 'À récupérer', bg: 'bg-tertiary/10', text: 'text-tertiary', icon: 'takeout_dining' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'dine_in' | 'online' | 'takeaway'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiAdmin.get('/orders/');
      setOrders(res.data.data || []);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.order_type === filter);
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="font-headline text-2xl text-on-surface font-bold">Commandes</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Toutes les commandes du restaurant</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-xl">schedule</span>
          <span className="font-label-lg text-label-lg font-bold tabular-nums">{currentTime.toLocaleTimeString('fr-FR')}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'dine_in', 'online', 'takeaway'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${
                filter === f
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {f === 'all' ? 'Tout' : typeConfig[f]?.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">receipt_long</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Aucune commande</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedOrders.map((order) => {
              const st = statusConfig[order.status] || { label: order.status, bg: 'bg-gray-50', text: 'text-gray-700', icon: 'help' };
              const tp = typeConfig[order.order_type] || { label: order.order_type, bg: 'bg-gray-50', text: 'text-gray-700', icon: 'restaurant' };
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className={`h-2 ${tp.bg}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${tp.bg} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined ${tp.text} text-lg`}>{tp.icon}</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{tp.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-label-xs text-label-xs ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-headline text-headline-md text-on-surface font-bold">#{order.id}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{formatTime(order.created_at)}</span>
                    </div>
                    <p className="font-label-md text-label-md text-on-surface mb-1">{order.client_name || 'Anonyme'}</p>
                    <p className="font-label-xs text-label-xs text-on-surface-variant mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">restaurant</span>
                      {order.items?.length || 0} plat(s)
                      {order.table_number && <> · {order.table_number}</>}
                      {order.delivery_address && <> · {order.delivery_address.substring(0, 20)}...</>}
                    </p>
                    <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                      <span className="font-headline text-headline-sm text-primary font-bold">
                        {Number(order.total).toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto animate-[scaleIn_0.2s_ease_both]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-headline-md text-on-surface">Commande #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${typeConfig[selectedOrder.order_type]?.bg} ${typeConfig[selectedOrder.order_type]?.text}`}>
                  {typeConfig[selectedOrder.order_type]?.label}
                </span>
                <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.text}`}>
                  {statusConfig[selectedOrder.status]?.label}
                </span>
              </div>

              <div className="bg-surface-container rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Client</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">{selectedOrder.client_name || 'Anonyme'}</span>
                </div>
                {selectedOrder.client_phone && (
                  <div className="flex justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Téléphone</span>
                    <span className="font-label-sm text-label-sm text-on-surface">{selectedOrder.client_phone}</span>
                  </div>
                )}
                {selectedOrder.table_number && (
                  <div className="flex justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Table</span>
                    <span className="font-label-sm text-label-sm text-on-surface">{selectedOrder.table_number}</span>
                  </div>
                )}
                {selectedOrder.delivery_address && (
                  <div className="flex justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Adresse</span>
                    <span className="font-label-sm text-label-sm text-on-surface">{selectedOrder.delivery_address}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Date</span>
                  <span className="font-label-sm text-label-sm text-on-surface">{formatDate(selectedOrder.created_at)} à {formatTime(selectedOrder.created_at)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-2">Articles</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-container rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary text-on-primary w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold">
                          {item.quantity}
                        </span>
                        <span className="font-label-md text-label-md text-on-surface">{item.meal_name}</span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface">{Number(item.total_price).toLocaleString()} Ar</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                <span className="font-headline text-headline-sm text-on-surface">Total</span>
                <span className="font-headline text-headline-md text-primary font-bold">{Number(selectedOrder.total).toLocaleString()} Ar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
