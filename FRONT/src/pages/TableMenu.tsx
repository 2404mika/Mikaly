import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMeals, useCategories } from '../hooks/useMeals';
import { useTableCart } from '../context/TableCartContext';
import { createOrder, getOrder } from '../services/orders';
import api from '../services/api';
import AnimatedSection from '../components/ui/AnimatedSection';
import type { Meal, Category } from '../services/meals';
import type { Order } from '../services/orders';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  received: { label: 'Reçue', color: 'text-blue-700', bg: 'bg-blue-50', icon: 'receipt_long' },
  preparing: { label: 'En préparation', color: 'text-amber-700', bg: 'bg-amber-50', icon: 'restaurant' },
  ready: { label: 'Prête', color: 'text-green-700', bg: 'bg-green-50', icon: 'check_circle' },
  served: { label: 'Servie', color: 'text-green-700', bg: 'bg-green-50', icon: 'check_circle' },
  paid: { label: 'Payée', color: 'text-green-700', bg: 'bg-green-50', icon: 'check_circle' },
};

interface TableInfo {
  id: number;
  table_number: string;
  capacity: number;
  status: string;
  location: string;
}

const TableMenu = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');

  const [clientName, setClientName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

  const { meals, isLoading } = useMeals(selectedCategory || undefined);
  const { categories } = useCategories();
  const { items, addToCart, removeFromCart, updateQuantity, subtotal, totalItems, clearCart } = useTableCart();

  const [groupedMeals, setGroupedMeals] = useState<Record<string, Meal[]>>({});

  useEffect(() => {
    const grouped: Record<string, Meal[]> = {};
    meals.forEach((meal) => {
      const catName = meal.category_name || 'Autres';
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(meal);
    });
    setGroupedMeals(grouped);
  }, [meals]);

  // Poll orders every 10 seconds to update statuses
  useEffect(() => {
    if (showNameModal || showReceipt) return;
    const interval = setInterval(async () => {
      if (myOrders.length === 0) return;
      const updated = await Promise.all(
        myOrders.map(async (o) => {
          try { return await getOrder(o.id); } catch { return o; }
        })
      );
      setMyOrders(updated);
    }, 10000);
    return () => clearInterval(interval);
  }, [myOrders.length, showNameModal, showReceipt]);

  // Fetch table info to get the real table_number
  useEffect(() => {
    if (!tableId) return;
    const fetchTableInfo = async () => {
      try {
        const res = await api.get(`/tables/${tableId}`);
        setTableInfo(res.data.data);
      } catch {
        console.error('Erreur lors de la récupération des infos de table');
      }
    };
    fetchTableInfo();
  }, [tableId]);

  const getImage = (meal: Meal) => {
    if (meal.image && meal.image.startsWith('/')) return meal.image;
    return '/images/home/scallops-menu.jpg';
  };

  const handleNameSubmit = async () => {
    if (!clientName.trim()) return;
    setShowNameModal(false);
    // Marquer la table comme occupée
    if (tableId) {
      try {
        await api.patch(`/tables/${tableId}/status`, { status: 'occupied' });
      } catch {}
    }
  };

  const handleOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setError('');

    try {
      const orderData = {
        order_type: 'dine_in' as const,
        table_id: tableId ? Number(tableId) : undefined,
        client_name: clientName || 'Client anonyme',
        delivery_fee: 0,
        items: items.map((item) => ({
          meal_id: item.meal.id,
          quantity: item.quantity,
          unit_price: item.meal.price,
          notes: item.notes,
        })),
      };

      const result = await createOrder(orderData);
      setLastOrderId(result.id);

      // Fetch the created order with items
      const newOrder = await getOrder(result.id);
      setMyOrders((prev) => [...prev, newOrder]);

      clearCart();
      setCartOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAllOrders = myOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const handleLeaveTable = async () => {
    if (myOrders.length === 0) {
      if (tableId) {
        try {
          await api.patch(`/tables/${tableId}/status`, { status: 'free' });
        } catch {}
      }
      navigate('/');
    } else {
      setShowReceipt(true);
    }
  };

  const downloadReceipt = () => {
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reçu - Mikaly</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: auto; }
    h1 { text-align: center; font-size: 18px; }
    .info { margin-bottom: 15px; }
    .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
    .item { margin: 10px 0; }
    .item-row { display: flex; justify-content: space-between; }
    .total { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>🍽️ MIKALY</h1>
  <p style="text-align:center;">Merci de votre visite!</p>
  <div class="info">
    <div class="info-row"><span>Table:</span><span>${tableInfo?.table_number || tableId || 'N/A'}</span></div>
    <div class="info-row"><span>Client:</span><span>${clientName}</span></div>
    <div class="info-row"><span>Date:</span><span>${new Date().toLocaleDateString('fr-FR')}</span></div>
    <div class="info-row"><span>Heure:</span><span>${new Date().toLocaleTimeString('fr-FR')}</span></div>
  </div>
  <hr>
  ${myOrders.map(order => `
    <div class="item">
      <strong>Commande #${order.id}</strong> - ${order.status}
      ${order.items?.map((item: any) => `
        <div class="item-row">
          <span>${item.quantity}x ${item.meal_name}</span>
          <span>${Number(item.total_price).toLocaleString()} Ar</span>
        </div>
      `).join('')}
    </div>
  `).join('')}
  <div class="total">
    <div class="item-row"><span>TOTAL:</span><span>${totalAllOrders.toLocaleString()} Ar</span></div>
  </div>
  <div class="footer">
    <p>Présentez ce reçu au caissier pour le paiement.</p>
    <p>© 2024 Mikaly Restaurant</p>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recu-mikaly-table-${tableInfo?.table_number || tableId}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Name Modal
  if (showNameModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AnimatedSection animation="scaleIn">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 ambient-shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
            </div>
            <h1 className="font-headline text-headline-md text-on-surface mb-2">Bienvenue !</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              {tableInfo ? `Table ${tableInfo.table_number} — ` : tableId ? `Table ${tableId} — ` : ''}Entrez votre nom pour commander.
            </p>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Votre nom (optionnel)"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            />
            <button onClick={handleNameSubmit} className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md font-bold shadow-sm hover:bg-primary-dark transition-all duration-150 active:scale-[0.96]">
              Commencer à commander
            </button>
            <button onClick={async () => { setClientName('Client anonyme'); setShowNameModal(false); if (tableId) { try { await api.patch(`/tables/${tableId}/status`, { status: 'occupied' }); } catch {} } }} className="w-full mt-2 text-on-surface-variant font-label-sm text-label-sm py-2 hover:bg-surface-container rounded-lg transition-all duration-150">
              Rester anonyme
            </button>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  // Final Receipt (after quitting the table)
  if (showReceipt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AnimatedSection animation="scaleIn">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 ambient-shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
              </div>
              <h1 className="font-headline text-headline-md text-primary mb-1">Merci !</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Voici votre reçu de consommation.</p>
            </div>

            {/* Receipt */}
            <div className="bg-surface-container rounded-xl p-4 mb-4 text-left">
              <div className="border-b border-outline-variant/30 pb-3 mb-3">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Table</span>
                  <span className="font-medium text-on-surface">{tableInfo?.table_number || tableId || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Client</span>
                  <span className="font-medium text-on-surface">{clientName}</span>
                </div>
              </div>

              {myOrders.map((order) => {
                const st = statusConfig[order.status] || { label: order.status, color: 'text-gray-700', bg: 'bg-gray-50', icon: 'help' };
                return (
                  <div key={order.id} className="mb-3 pb-3 border-b border-outline-variant/20 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-sm text-label-sm text-on-surface font-medium">Commande #{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${st.bg} ${st.color}`}>
                        <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </div>
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-body-sm mb-1">
                        <span className="text-on-surface-variant">{item.quantity}x {item.meal_name}</span>
                        <span className="text-on-surface tabular-nums">{Number(item.total_price).toLocaleString()} Ar</span>
                      </div>
                    ))}
                  </div>
                );
              })}

              <div className="border-t border-outline-variant/30 pt-3 flex justify-between font-headline text-headline-sm">
                <span className="text-on-surface">Total</span>
                <span className="text-primary tabular-nums">{totalAllOrders.toLocaleString()} Ar</span>
              </div>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant text-center mb-4">
              Présentez ce reçu au caissier pour le paiement.
            </p>

            <button onClick={downloadReceipt} className="w-full bg-surface-container hover:bg-primary-container text-primary py-3 rounded-lg font-label-md text-label-md font-bold shadow-sm hover:bg-primary-dark transition-all duration-150 active:scale-[0.96] flex items-center justify-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Télécharger le reçu
            </button>

            <button onClick={() => { setShowReceipt(false); setMyOrders([]); setLastOrderId(null); if (tableId) { api.patch(`/tables/${tableId}/status`, { status: 'free' }); } navigate('/'); }} className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md font-bold shadow-sm hover:bg-primary-dark transition-all duration-150 active:scale-[0.96]">
              Fermer
            </button>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-4 py-3">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="font-headline text-headline-sm text-primary">Mikaly</h1>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Table {tableInfo?.table_number || tableId || '?'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant mr-1">{clientName}</span>
            {/* Quitter la table */}
            <button
              onClick={handleLeaveTable}
              className="p-2 rounded-full transition-all duration-150 text-error hover:bg-error/10"
              title="Quitter la table"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[52px] z-30 bg-background/80 backdrop-blur-xl py-2 px-4 border-b border-outline-variant/20 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2">
          <button onClick={() => setSelectedCategory(null)} className={`whitespace-nowrap px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all duration-150 ${selectedCategory === null ? 'bg-primary-container text-on-primary-container shadow-sm' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
            Tous
          </button>
          {categories.map((cat: Category) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`whitespace-nowrap px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all duration-150 ${selectedCategory === cat.id ? 'bg-primary-container text-on-primary-container shadow-sm' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden animate-pulse flex">
                <div className="w-24 h-24 bg-surface-container" />
                <div className="flex-1 p-3 space-y-2"><div className="h-4 bg-surface-container rounded w-2/3" /><div className="h-3 bg-surface-container rounded w-1/2" /><div className="h-8 bg-surface-container rounded-lg w-20" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMeals).map(([categoryName, categoryMeals]) => (
              <div key={categoryName}>
                <h2 className="font-headline text-headline-sm text-on-surface mb-3 sticky top-[88px] bg-background/95 backdrop-blur-sm py-1 z-20">{categoryName}</h2>
                <div className="space-y-3">
                  {categoryMeals.map((meal) => {
                    const inCart = items.find((i) => i.meal.id === meal.id);
                    return (
                      <div key={meal.id} className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow-sm flex">
                        <div className="w-24 h-24 flex-shrink-0 bg-surface-container">
                          <img alt={meal.name} className="w-full h-full object-cover" src={getImage(meal)} onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }} />
                        </div>
                        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-headline text-headline-sm text-on-surface truncate">{meal.name}</h3>
                              <span className="font-label-md text-label-md text-primary font-semibold whitespace-nowrap tabular-nums">{Number(meal.price).toLocaleString()} Ar</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">{meal.description}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {inCart ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(meal.id, inCart.quantity - 1)} className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center active:scale-90 transition-transform duration-150"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                                <span className="font-label-md text-label-md tabular-nums min-w-[20px] text-center">{inCart.quantity}</span>
                                <button onClick={() => addToCart(meal)} className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center active:scale-90 transition-transform duration-150"><span className="material-symbols-outlined text-[16px]">add</span></button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(meal)} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-medium active:scale-95 transition-all duration-150">
                                <span className="material-symbols-outlined text-[16px]">add</span>Ajouter
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface-container-lowest shadow-[-8px_0_24px_rgba(48,109,41,0.1)] flex flex-col">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
              <h2 className="font-headline text-headline-sm text-on-surface">Panier</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12"><span className="material-symbols-outlined text-5xl text-outline-variant mb-2 block">shopping_cart</span><p className="font-body-sm text-body-sm text-on-surface-variant">Panier vide</p></div>
              ) : items.map((item) => (
                <div key={item.meal.id} className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container flex-shrink-0"><img alt={item.meal.name} className="w-full h-full object-cover" src={getImage(item.meal)} onError={(e) => { (e.target as HTMLImageElement).src = '/images/home/scallops-menu.jpg'; }} /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-label-md text-label-md text-on-surface truncate">{item.meal.name}</h4>
                    <div className="font-body-sm text-body-sm text-on-surface-variant tabular-nums">{Number(item.meal.price).toLocaleString()} Ar</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQuantity(item.meal.id, item.quantity - 1)} className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-[14px]">remove</span></button>
                      <span className="font-label-sm text-label-sm tabular-nums min-w-[16px] text-center">{item.quantity}</span>
                      <button onClick={() => addToCart(item.meal)} className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-[14px]">add</span></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.meal.id)} className="text-error/60 hover:text-error p-1 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest">
                <div className="flex justify-between font-headline text-headline-sm text-on-surface mb-3"><span>Total</span><span className="text-primary tabular-nums">{subtotal.toLocaleString()} Ar</span></div>
                {error && <div className="bg-error-container text-on-error-container px-3 py-2 rounded-lg text-sm mb-3">{error}</div>}
                <button onClick={handleOrder} disabled={isSubmitting} className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md font-bold shadow-sm hover:bg-primary-dark transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.96] disabled:opacity-50">
                  {isSubmitting ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>Envoi...</> : <><span className="material-symbols-outlined text-[18px]">send</span>Commander</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Drawer */}
      {ordersOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setOrdersOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface-container-lowest shadow-[-8px_0_24px_rgba(48,109,41,0.1)] flex flex-col">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
              <h2 className="font-headline text-headline-sm text-on-surface">Mes commandes ({myOrders.length})</h2>
              <button onClick={() => setOrdersOpen(false)} className="p-1 rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {myOrders.length === 0 ? (
                <div className="text-center py-12"><span className="material-symbols-outlined text-5xl text-outline-variant mb-2 block">receipt_long</span><p className="font-body-sm text-body-sm text-on-surface-variant">Aucune commande</p></div>
              ) : myOrders.map((order) => {
                const st = statusConfig[order.status] || { label: order.status, color: 'text-gray-700', bg: 'bg-gray-50', icon: 'help' };
                return (
                  <div key={order.id} className="bg-surface-container rounded-xl p-3 ambient-shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-sm text-label-sm text-on-surface font-medium">Commande #{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${st.bg} ${st.color}`}>
                        <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </div>
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-body-sm mb-1">
                        <span className="text-on-surface-variant">{item.quantity}x {item.meal_name}</span>
                        <span className="text-on-surface tabular-nums">{Number(item.total_price).toLocaleString()} Ar</span>
                      </div>
                    ))}
                    <div className="border-t border-outline-variant/20 mt-2 pt-2 flex justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Sous-total</span>
                      <span className="font-label-sm text-label-sm text-primary font-medium tabular-nums">{Number(order.total).toLocaleString()} Ar</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {myOrders.length > 0 && (
              <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest">
                <div className="flex justify-between font-headline text-headline-sm text-on-surface mb-3"><span>Total général</span><span className="text-primary tabular-nums">{totalAllOrders.toLocaleString()} Ar</span></div>
                <button onClick={() => { setOrdersOpen(false); handleLeaveTable(); }} className="w-full bg-error/10 text-error py-3 rounded-lg font-label-md text-label-md font-bold hover:bg-error/20 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.96]">
                  <span className="material-symbols-outlined text-[18px]">logout</span>Quitter la table
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3 items-end">
        {/* Quitter la table */}
        {myOrders.length > 0 && (
          <button onClick={handleLeaveTable} className="w-12 h-12 bg-error/10 text-error rounded-full shadow-lg flex items-center justify-center hover:bg-error/20 transition-all duration-150 active:scale-95" title="Quitter la table">
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        )}
        {/* Mes commandes */}
        <button onClick={() => setOrdersOpen(true)} className="relative w-12 h-12 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-full shadow-lg flex items-center justify-center hover:bg-surface-container transition-all duration-150 active:scale-95">
          <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          {myOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold tabular-nums">{myOrders.length}</span>
          )}
        </button>
        {/* Panier */}
        <button onClick={() => setCartOpen(true)} className="relative w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-all duration-150 active:scale-95">
          <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-error text-on-error text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold tabular-nums">{totalItems}</span>
          )}
        </button>
      </div>

      {/* Bottom Bar (Cart Summary) */}
      {totalItems > 0 && !cartOpen && !ordersOpen && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
          <button onClick={() => setCartOpen(true)} className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.96]">
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            Panier ({totalItems}) — {subtotal.toLocaleString()} Ar
          </button>
        </div>
      )}
    </div>
  );
};

export default TableMenu;
