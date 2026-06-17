import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface DailyStats {
  date: string;
  dayLabel: string;
  revenue: number;
  orders: number;
  height?: number;
}

interface DashboardStats {
  revenue: { total_revenue: number; total_orders: number; dine_in_orders: number; online_orders: number; takeaway_orders: number };
  popularMeals: { name: string; id: number; total_sold: number }[];
  categoryStats: { name: string; revenue: number }[];
  activeTables: { occupied: number; total: number };
  recentOrders: { id: number; total: number; order_type: string; status: string; created_at: string; table_number: string }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          apiAdmin.get('/dashboard/stats'),
          apiAdmin.get('/orders/')
        ]);
        setStats(statsRes.data.data || statsRes.data);
        const allOrders = ordersRes.data.data || [];
        setOrders(allOrders);

        const todayStr = new Date().toISOString().split('T')[0];
        const todayOrders = allOrders.filter((o: Order) => {
          if (!o.created_at) return false;
          const orderDate = new Date(o.created_at);
          return !isNaN(orderDate.getTime()) && orderDate.toISOString().split('T')[0] === todayStr;
        });

        const hourly: Record<number, DailyStats> = {};
        for (let h = 0; h < 24; h++) {
          hourly[h] = { date: '', dayLabel: `${h}h`, revenue: 0, orders: 0 };
        }
        todayOrders.forEach((o: Order) => {
          const orderDate = new Date(o.created_at);
          if (isNaN(orderDate.getTime())) return;
          const h = orderDate.getHours();
          if (hourly[h] !== undefined) {
            hourly[h].revenue += Number(o.total || 0);
            hourly[h].orders += 1;
          }
        });
        const hourlyArray = Object.values(hourly);
        const maxRevenue = Math.max(...hourlyArray.map(h => h.revenue), 1);
        setDailyData(hourlyArray.map(h => ({ ...h, height: (h.revenue / maxRevenue) * 100 })));
      } catch {} finally { setIsLoading(false); }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeSince = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    return `il y a ${Math.floor(diffMin / 60)}h${diffMin % 60}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o: Order) => {
    if (!o.created_at) return false;
    const orderDate = new Date(o.created_at);
    return !isNaN(orderDate.getTime()) && orderDate.toISOString().split('T')[0] === todayStr;
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const todayDineIn = todayOrders.filter(o => o.order_type === 'dine_in').length;
  const todayOnline = todayOrders.filter(o => o.order_type === 'online').length;
  const todayTakeaway = todayOrders.filter(o => o.order_type === 'takeaway').length;

  const mealCounts: Record<string, { name: string; count: number }> = {};
  todayOrders.forEach((o: Order) => {
    o.items?.forEach((item: OrderItem) => {
      if (!mealCounts[item.meal_name]) mealCounts[item.meal_name] = { name: item.meal_name, count: 0 };
      mealCounts[item.meal_name].count += item.quantity;
    });
  });
  const todayPopularMeal = Object.values(mealCounts).sort((a, b) => b.count - a.count)[0];

  const activeTables = stats?.activeTables || { occupied: 0, total: 0 };
  const recentOrders = (stats?.recentOrders || []).slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-surface rounded-xl border border-outline-variant/30 p-6 animate-pulse h-36" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center justify-between sticky top-0 z-20">
        <h1 className="font-headline text-2xl text-on-surface font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-xl">schedule</span>
          <span className="font-label-lg text-label-lg font-bold tabular-nums">{currentTime.toLocaleTimeString('fr-FR')}</span>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-6">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border border-green-200/50 p-5 shadow-[0_4px_12px_rgba(48,109,41,0.06)] hover:shadow-lg transition-all animate-[fadeUp_0.5s_ease_both]">
            <div className="flex justify-between items-start">
              <span className="font-label-sm text-label-sm text-green-700/80">Chiffre d'affaires</span>
              <span className="material-symbols-outlined text-green-600">payments</span>
            </div>
            <h3 className="font-headline text-black font-bold mt-2 tabular-nums text-3xl">{todayRevenue.toLocaleString()} Ar</h3>
            <p className="font-label-xs text-label-xs text-green-600/70 mt-1">{todayOrders.length} commandes aujourd'hui</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 rounded-2xl border border-emerald-200/50 p-5 shadow-[0_4px_12px_rgba(48,109,41,0.06)] hover:shadow-lg transition-all animate-[fadeUp_0.5s_ease_both] [animation-delay:100ms]">
            <div className="flex justify-between items-start">
              <span className="font-label-sm text-label-sm text-emerald-700/80">Sur table</span>
              <span className="material-symbols-outlined text-emerald-600">table_restaurant</span>
            </div>
            <h3 className="font-headline text-black font-bold mt-2 tabular-nums text-3xl">{todayDineIn}</h3>
            <p className="font-label-xs text-label-xs text-emerald-600/70 mt-1">commandes</p>
          </div>
          <div className="bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 rounded-2xl border border-lime-200/50 p-5 shadow-[0_4px_12px_rgba(48,109,41,0.06)] hover:shadow-lg transition-all animate-[fadeUp_0.5s_ease_both] [animation-delay:200ms]">
            <div className="flex justify-between items-start">
              <span className="font-label-sm text-label-sm text-lime-700/80">En ligne</span>
              <span className="material-symbols-outlined text-lime-600">shopping_cart</span>
            </div>
            <h3 className="font-headline text-black font-bold mt-2 tabular-nums text-3xl">{todayOnline}</h3>
            <p className="font-label-xs text-label-xs text-lime-600/70 mt-1">à livrer</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 rounded-2xl border border-teal-200/50 p-5 shadow-[0_4px_12px_rgba(48,109,41,0.06)] hover:shadow-lg transition-all animate-[fadeUp_0.5s_ease_both] [animation-delay:300ms]">
            <div className="flex justify-between items-start">
              <span className="font-label-sm text-label-sm text-teal-700/80">À récupérer</span>
              <span className="material-symbols-outlined text-teal-600">takeout_dining</span>
            </div>
            <h3 className="font-headline text-black font-bold mt-2 tabular-nums text-3xl">{todayTakeaway}</h3>
            <p className="font-label-xs text-label-xs text-teal-600/70 mt-1">commandes</p>
          </div>
        </div>

        {/* Second Row: Graph + Popular Meal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-[0_4px_12px_rgba(48,109,41,0.04)]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-headline text-headline-sm text-on-surface">Revenus horaires (aujourd'hui)</h3>
              </div>
              <span className="font-label-md text-label-md text-primary font-bold">{dailyData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} Ar</span>
            </div>
            <div className="relative min-h-[180px] flex items-end justify-between gap-2">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-right pr-2 pointer-events-none">
                <span className="font-label-xs text-label-xs text-on-surface-variant">{Math.max(...dailyData.map(d => d.revenue), 1).toLocaleString()}</span>
                <span className="font-label-xs text-label-xs text-on-surface-variant">{Math.round(Math.max(...dailyData.map(d => d.revenue), 1) / 2).toLocaleString()}</span>
                <span className="font-label-xs text-label-xs text-on-surface-variant">0</span>
              </div>
              <div className="flex-1 flex items-end justify-between gap-2 pl-10">
                {dailyData.map((d, i) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isToday = d.date === today;
                  const hasOrders = d.orders > 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${hasOrders ? (isToday ? 'bg-primary' : 'bg-primary/50 hover:bg-primary/70') : 'bg-surface-container'}`}
                        style={{ height: `${Math.max(d.height || 0, d.orders > 0 ? 8 : 2)}%` }}
                        title={`${d.dayLabel}: ${d.revenue.toLocaleString()} Ar (${d.orders} cmd)`}
                      />
                      <span className="font-label-xs text-label-xs text-on-surface-variant font-medium">{d.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-200/50 p-6 shadow-[0_4px_12px_rgba(48,109,41,0.06)]">
            <h3 className="font-headline text-headline-sm text-amber-800 mb-4">Plat populaire du jour</h3>
            {todayPopularMeal ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-3xl">restaurant</span>
                </div>
                <div>
                  <h4 className="font-headline text-headline-sm text-amber-900 font-bold">{todayPopularMeal.name}</h4>
                  <p className="font-label-md text-label-md text-amber-700">{todayPopularMeal.count} ventes</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-5xl text-amber-300 mb-2 block">restaurant_menu</span>
                <p className="font-body-sm text-body-sm text-amber-700/70">Aucune commande aujourd'hui</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-outline-variant/20">
              <h4 className="font-label-md text-label-md text-on-surface mb-3">Statut tables</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Occupées</span>
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">{activeTables.occupied}/{activeTables.total}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${activeTables.total > 0 ? (activeTables.occupied / activeTables.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 shadow-[0_4px_12px_rgba(48,109,41,0.04)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
            <h3 className="font-headline text-headline-sm text-on-surface">Commandes récentes</h3>
            <Link to="/admin/orders" className="font-label-sm text-label-sm text-primary hover:text-primary/80 flex items-center gap-1">
              Voir tout <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
          <div className="flex flex-col max-h-[300px] overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-2 block">receipt_long</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Aucune commande récente</p>
              </div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="p-4 border-b border-outline-variant/10 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-label-md text-label-md font-bold">
                    #{order.id}
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface capitalize">{order.order_type.replace('_', ' ')}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{getTimeSince(order.created_at)}</p>
                  </div>
                </div>
                <span className="font-label-md text-label-md text-primary tabular-nums font-bold">{Number(order.total).toLocaleString()} Ar</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
