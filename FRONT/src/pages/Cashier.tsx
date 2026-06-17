import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';
import apiStaff from '../services/apiStaff';

interface TableData { id: number; table_number: string; capacity: number; status: string; location: string; }
interface OrderItem { quantity: number; meal_name: string; unit_price: number; total_price: number; notes: string; }
interface OrderData { id: number; order_type: string; status: string; created_at: string; table_id: number; client_name: string; total: number; items: OrderItem[]; }

const Cashier = () => {
  const { staffLogout } = useStaffAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableData[]>([]);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        apiStaff.get('/tables'),
        apiStaff.get('/orders'),
      ]);
      setTables(tablesRes.data.data || []);
      setAllOrders(ordersRes.data.data || []);
    } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTableOrders = (tableId: number) =>
    allOrders.filter((o) => o.table_id === tableId && o.status !== 'paid');

  const getTableTotal = (tableId: number) =>
    getTableOrders(tableId).reduce((sum, o) => sum + Number(o.total || 0), 0);

  const activeTables = tables.filter((t) => getTableTotal(t.id) > 0);

  const filteredTables = activeTables.filter((t) =>
    t.table_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOrders = selectedTable ? getTableOrders(selectedTable.id) : [];
  const total = selectedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const changeAmount = amountReceived ? Math.max(0, Number(amountReceived.replace(/\s/g, '')) - total) : 0;

  const handleSelectTable = (table: TableData) => {
    setSelectedTable(table);
    setAmountReceived('');
    setPaymentSuccess(false);
  };

  const handlePayment = async () => {
    if (!selectedTable || !amountReceived) return;
    const received = Number(amountReceived.replace(/\s/g, ''));
    if (received < total) return;

    setIsProcessing(true);
    try {
      for (const order of selectedOrders) {
        await apiStaff.post('/payments', {
          order_id: order.id,
          amount: order.total,
          payment_method: 'cash',
          amount_received: received,
        });
      }
      await apiStaff.patch(`/tables/${selectedTable.id}/status`, { status: 'free' });
      setPaymentSuccess(true);
      setTimeout(() => {
        setSelectedTable(null);
        setAmountReceived('');
        setPaymentSuccess(false);
        fetchData();
      }, 2500);
    } catch (err) {
      console.error('Erreur paiement:', err);
    } finally { setIsProcessing(false); }
  };

  const handleLogout = () => { staffLogout(); navigate('/login'); };

  return (
    <div className="bg-background h-screen overflow-hidden flex flex-col font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-8 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_12px_rgba(48,109,41,0.02)]">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-headline-md font-bold text-primary">Mikaly</h1>
          <span className="px-2.5 py-1 bg-surface-container-high rounded-md text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Terminal de PDV 1</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl">
            <span className="material-symbols-outlined text-lg">schedule</span>
            <span className="font-label-md text-label-md font-bold tabular-nums">{currentTime.toLocaleTimeString('fr-FR')}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={handleLogout} title="Déconnexion">
            <span className="material-symbols-outlined text-on-surface-variant text-[22px] flex items-center justify-center h-full">person</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Tables */}
        <aside className="w-80 border-r border-outline-variant/30 bg-surface flex flex-col h-full shadow-[4px_0_12px_rgba(48,109,41,0.02)]">
          <div className="p-4 border-b border-outline-variant/20">
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-body-sm text-body-sm" placeholder="Rechercher une table..." />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tables actives</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-label-sm text-label-sm font-bold tabular-nums">{filteredTables.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isLoading ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-lg p-4 animate-pulse border border-outline-variant/20">
                <div className="h-5 bg-surface-container rounded w-20 mb-2" /><div className="h-3 bg-surface-container rounded w-24" />
              </div>
            )) : filteredTables.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">check_circle</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Aucune table active</p>
              </div>
            ) : filteredTables.map((table) => {
              const tableTotal = getTableTotal(table.id);
              const orderCount = getTableOrders(table.id).length;
              const isSelected = selectedTable?.id === table.id;

              return (
                <button key={table.id} onClick={() => handleSelectTable(table)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/5 shadow-[0_4px_12px_rgba(48,109,41,0.06)] scale-[0.99]'
                      : 'border border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low hover:shadow-sm'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-headline text-headline-sm ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {table.table_number}
                      </h3>
                      <p className={`font-body-sm text-body-sm mt-0.5 ${isSelected ? 'text-primary/80' : 'text-on-surface-variant'}`}>
                        {orderCount} commande{orderCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`font-label-md text-label-md font-semibold tabular-nums ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                      {tableTotal.toLocaleString()} Ar
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: Order Details */}
        <section className="flex-1 flex flex-col bg-surface-container-lowest border-r border-outline-variant/30 relative">
          {selectedTable ? (
            <>
              <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface">
                <div>
                  <h2 className="font-headline text-headline-lg text-on-surface">{selectedTable.table_number}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">person</span> {selectedTable.location}
                  </p>
                </div>
                <button onClick={fetchData} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" title="Rafraîchir">
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {selectedOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">receipt_long</span>
                    <p className="font-body-md text-body-md text-on-surface-variant">Aucune commande en attente</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {selectedOrders.map((order) => (
                      <div key={order.id} className="bg-surface rounded-xl p-4 border border-outline-variant/20">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant/10">
                          <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                          <span className="font-label-sm text-label-sm text-on-surface font-medium">Commande #{order.id}</span>
                          <span className="text-outline-variant">•</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{order.client_name}</span>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 py-2 border-b border-outline-variant/10 last:border-0 items-start">
                              <div className="col-span-1 text-on-surface-variant font-label-md text-label-md pt-0.5">{item.quantity}x</div>
                              <div className="col-span-7">
                                <h4 className="font-label-md text-label-md text-on-surface font-semibold">{item.meal_name}</h4>
                                {item.notes && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 italic">{item.notes}</p>}
                              </div>
                              <div className="col-span-2 text-right text-on-surface-variant font-body-sm text-body-sm pt-0.5 tabular-nums">{Number(item.unit_price).toLocaleString()} Ar</div>
                              <div className="col-span-2 text-right font-label-md text-label-md text-on-surface font-semibold pt-0.5 tabular-nums">{Number(item.total_price).toLocaleString()} Ar</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-8xl text-outline-variant/50 mb-4 block">table_restaurant</span>
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Sélectionnez une table</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Choisissez une table avec des commandes en attente.</p>
              </div>
            </div>
          )}
        </section>

        {/* Right Panel: Payment */}
        <aside className="w-96 bg-surface-container-low flex flex-col overflow-y-auto">
          {selectedTable && (
            <div className="flex flex-col h-full">
              {/* Grand Total en haut */}
              <div className="px-6 pt-6 pb-4 border-b border-outline-variant/20">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total à payer</p>
                <p className="font-headline text-4xl text-primary font-bold tabular-nums leading-none">
                  {total.toLocaleString()} <span className="text-lg font-label-md">Ar</span>
                </p>
              </div>

              {/* Espèces reçues + Monnaie */}
              <div className="px-6 py-5 border-b border-outline-variant/20 space-y-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Espèces reçues</label>
                  <div className="relative">
                    <input type="text" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} placeholder="0"
                      className="w-full pl-4 pr-12 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-headline text-headline-md text-on-surface text-right tabular-nums" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-lg text-body-lg text-on-surface-variant">Ar</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface-variant">Monnaie à rendre</span>
                  <span className="font-headline text-headline-md text-primary tabular-nums font-bold">{changeAmount.toLocaleString()} Ar</span>
                </div>
              </div>

              {/* Valider le paiement */}
              <div className="px-6 py-5">
                {paymentSuccess ? (
                  <div className="w-full py-4 bg-green-600 text-white rounded-xl font-headline text-headline-sm flex items-center justify-center gap-2 animate-[scaleIn_0.3s_ease_both]">
                    <span className="material-symbols-outlined">check_circle</span> Paiement confirmé !
                  </div>
                ) : (
                  <button onClick={handlePayment}
                    disabled={!amountReceived || Number(amountReceived.replace(/\s/g, '')) < total || isProcessing}
                    className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline text-headline-sm shadow-[0_4px_12px_rgba(48,109,41,0.2)] hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined">payments</span> {isProcessing ? 'Traitement...' : 'Valider le paiement'}
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Cashier;
