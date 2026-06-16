import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/apiAdmin';

interface DashboardStats {
  revenue: { total_revenue: number; total_orders: number; dine_in_orders: number; online_orders: number; takeaway_orders: number };
  popularMeals: { name: string; id: number; total_sold: number }[];
  categoryStats: { name: string; revenue: number }[];
  activeTables: { occupied: number; total: number };
  recentOrders: { id: number; total: number; order_type: string; status: string; created_at: string; table_number: string }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try { const res = await api.get('/dashboard/stats'); setStats(res.data.data || res.data); }
      catch {} finally { setIsLoading(false); }
    };
    fetchStats();
  }, []);

  const getTimeSince = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    return `il y a ${Math.floor(diffMin / 60)}h${diffMin % 60}`;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-surface rounded-xl border border-outline-variant/30 p-6 animate-pulse h-36" />)}
        </div>
      </div>
    );
  }

  const revenue = stats?.revenue?.total_revenue || 0;
  const totalOrders = stats?.revenue?.total_orders || 0;
  const popularMeal = stats?.popularMeals?.[0];
  const activeTables = stats?.activeTables || { occupied: 0, total: 0 };
  const recentOrders = stats?.recentOrders || [];
  const categoryStats = stats?.categoryStats || [];
  const totalCategoryRevenue = categoryStats.reduce((sum, c) => sum + Number(c.revenue || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-8 h-16 flex items-center justify-between sticky top-0 z-20">
        <h1 className="font-headline text-2xl text-on-surface font-bold">Tableau de bord</h1>
        <div className="flex bg-surface-container rounded-lg p-1">
          <button className="px-4 py-1.5 rounded-md bg-surface-container-lowest shadow-sm font-label-md text-label-md text-primary font-bold">Aujourd'hui</button>
          <button className="px-4 py-1.5 rounded-md font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors">Semaine</button>
          <button className="px-4 py-1.5 rounded-md font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors">Mois</button>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-2 shadow-[0_4px_12px_rgba(48,109,41,0.04)] hover:shadow-md transition-shadow animate-[fadeUp_0.5s_ease_both]">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-on-surface-variant">Chiffre d'affaires</span>
              <span className="material-symbols-outlined text-primary">payments</span>
            </div>
            <h3 className="font-headline text-primary font-bold mt-2 tabular-nums text-3xl">{Number(revenue).toLocaleString()} Ar</h3>
          </div>
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-2 shadow-[0_4px_12px_rgba(48,109,41,0.04)] hover:shadow-md transition-shadow animate-[fadeUp_0.5s_ease_both] [animation-delay:100ms]">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-on-surface-variant">Commandes totales</span>
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <h3 className="font-headline text-primary font-bold mt-2 tabular-nums text-3xl">{totalOrders}</h3>
          </div>
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-2 shadow-[0_4px_12px_rgba(48,109,41,0.04)] hover:shadow-md transition-shadow animate-[fadeUp_0.5s_ease_both] [animation-delay:200ms]">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-on-surface-variant">Plat populaire</span>
              <span className="material-symbols-outlined text-tertiary-container">star</span>
            </div>
            {popularMeal && (
              <div className="mt-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                  <img alt={popularMeal.name} className="w-full h-full object-cover" src={`/api/meals/${popularMeal.id}/image`} onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }} />
                </div>
                <div>
                  <h3 className="font-headline text-headline-sm text-primary font-bold truncate">{popularMeal.name}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{popularMeal.total_sold} commandes</p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-2 shadow-[0_4px_12px_rgba(48,109,41,0.04)] hover:shadow-md transition-shadow animate-[fadeUp_0.5s_ease_both] [animation-delay:300ms]">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-on-surface-variant">Tables actives</span>
              <span className="material-symbols-outlined text-primary">table_restaurant</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="font-headline text-primary font-bold tabular-nums text-3xl">{activeTables.occupied}</h3>
              <span className="font-body-lg text-on-surface-variant">/ {activeTables.total}</span>
            </div>
            <div className="mt-auto pt-2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-sm ${i < Math.round((activeTables.occupied / (activeTables.total || 1)) * 5) ? 'bg-primary' : 'bg-surface-container-high'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-[0_4px_12px_rgba(48,109,41,0.04)]">
            <h3 className="font-headline text-headline-sm text-on-surface mb-1">Tendances des revenus</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Répartition horaire</p>
            <div className="relative min-h-[200px] flex items-end justify-between gap-2 pt-8">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(4)].map((_, i) => <div key={i} className="border-t border-outline-variant/20 w-full" />)}
              </div>
              {[30, 45, 60, 85, 75, 95, 65, 40].map((h, i) => (
                <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all duration-300" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-on-surface-variant font-label-sm text-label-sm">
              <span>11h</span><span>13h</span><span>15h</span><span>17h</span><span>19h</span><span>21h</span><span>23h</span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-[0_4px_12px_rgba(48,109,41,0.04)]">
            <h3 className="font-headline text-headline-sm text-on-surface mb-4">Répartition par catégorie</h3>
            <div className="flex flex-col gap-4">
              {categoryStats.map((cat, i) => {
                const pct = totalCategoryRevenue > 0 ? Math.round((Number(cat.revenue) / totalCategoryRevenue) * 100) : 0;
                const colors = ['bg-tertiary-container', 'bg-tertiary-container/80', 'bg-tertiary-container/60', 'bg-tertiary-container/40'];
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-label-md text-label-md text-on-surface">{cat.name}</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">{pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className={`${colors[i] || colors[0]} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 shadow-[0_4px_12px_rgba(48,109,41,0.04)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
            <h3 className="font-headline text-headline-sm text-on-surface">Commandes récentes</h3>
            <Link to="/admin/orders" className="font-label-sm text-label-sm text-primary hover:text-primary/80">Voir tout</Link>
          </div>
          <div className="flex flex-col max-h-[300px] overflow-y-auto">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4 border-b border-outline-variant/10 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="font-label-md text-label-md">{order.table_number || '—'}</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Commande #{order.id}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{order.order_type} • {getTimeSince(order.created_at)}</p>
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
