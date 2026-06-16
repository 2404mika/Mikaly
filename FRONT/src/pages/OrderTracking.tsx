import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/orders';
import { useSocket } from '../hooks/useSocket';
import AnimatedSection from '../components/ui/AnimatedSection';
import type { Order } from '../services/orders';

const statusSteps = [
  { key: 'received', label: 'Commande reçue', icon: 'receipt_long', description: 'Votre commande a été reçue' },
  { key: 'preparing', label: 'En préparation', icon: 'restaurant', description: 'Le chef prépare votre repas' },
  { key: 'ready', label: 'Prête', icon: 'check_circle', description: 'Votre commande est prête' },
  { key: 'en_route', label: 'En route', icon: 'local_shipping', description: 'Le livreur est en chemin' },
  { key: 'delivered', label: 'Livrée', icon: 'where_to_vote', description: 'Commande livrée avec succès' },
];

const statusStepsPickup = [
  { key: 'received', label: 'Commande reçue', icon: 'receipt_long', description: 'Votre commande a été reçue' },
  { key: 'preparing', label: 'En préparation', icon: 'restaurant', description: 'Le chef prépare votre repas' },
  { key: 'ready', label: 'Prête', icon: 'check_circle', description: 'Votre commande est prête à récupérer' },
  { key: 'served', label: 'Récupérée', icon: 'where_to_vote', description: 'Commande récupérée' },
];

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const data = await getOrder(Number(id));
        setOrder(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Commande non trouvée');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.on('order:status_changed', (data: any) => {
      if (String(data.orderId) === String(id)) {
        setOrder((prev) => prev ? { ...prev, status: data.status } : null);
      }
    });

    return () => {
      socket.off('order:status_changed');
    };
  }, [socket, id]);

  const getSteps = () => {
    if (!order) return [];
    return order.order_type === 'takeaway' ? statusStepsPickup : statusSteps;
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const steps = getSteps();
    return steps.findIndex((s) => s.key === order.status);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      received: 'bg-blue-100 text-blue-700',
      preparing: 'bg-amber-100 text-amber-700',
      ready: 'bg-purple-100 text-purple-700',
      en_route: 'bg-indigo-100 text-indigo-700',
      served: 'bg-green-100 text-green-700',
      delivered: 'bg-green-100 text-green-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      received: 'Reçue',
      preparing: 'En préparation',
      ready: 'Prête',
      en_route: 'En route',
      served: 'Servie',
      delivered: 'Livrée',
      paid: 'Payée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const downloadReceipt = () => {
    if (!order) return;
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
  <p style="text-align:center;">Merci pour votre commande!</p>
  <div class="info">
    <div class="info-row"><span>N° Commande:</span><span>#${order.id}</span></div>
    <div class="info-row"><span>Type:</span><span>${order.order_type === 'online' ? 'Livraison' : order.order_type === 'takeaway' ? 'À emporter' : 'Sur place'}</span></div>
    ${order.delivery_address ? `<div class="info-row"><span>Adresse:</span><span>${order.delivery_address}</span></div>` : ''}
    <div class="info-row"><span>Client:</span><span>${order.client_name}</span></div>
    <div class="info-row"><span>Téléphone:</span><span>${order.client_phone}</span></div>
    <div class="info-row"><span>Date:</span><span>${new Date(order.created_at).toLocaleDateString('fr-FR')}</span></div>
    <div class="info-row"><span>Heure:</span><span>${new Date(order.created_at).toLocaleTimeString('fr-FR')}</span></div>
    <div class="info-row"><span>Statut:</span><span>${getStatusLabel(order.status)}</span></div>
  </div>
  <hr>
  ${order.items?.map((item: any) => `
    <div class="item-row">
      <span>${item.quantity}x ${item.meal_name}</span>
      <span>${Number(item.total_price).toLocaleString()} Ar</span>
    </div>
  `).join('')}
  <div class="total">
    <div class="info-row"><span>Sous-total:</span><span>${Number(order.subtotal).toLocaleString()} Ar</span></div>
    ${Number(order.delivery_fee) > 0 ? `<div class="info-row"><span>Livraison:</span><span>${Number(order.delivery_fee).toLocaleString()} Ar</span></div>` : ''}
    <div class="item-row"><span>TOTAL:</span><span>${Number(order.total).toLocaleString()} Ar</span></div>
  </div>
  <div class="footer">
    <p>© 2024 Mikaly Restaurant</p>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recu-mikaly-commande-${order.id}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AnimatedSection animation="scaleIn">
          <div className="text-center">
            <span className="material-symbols-outlined text-8xl text-error/30 mb-4 block">error</span>
            <h1 className="font-headline text-headline-lg text-on-surface mb-4">Commande non trouvée</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">{error}</p>
            <Link
              to="/menu"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary-dark transition-[background-color] duration-150 ease-out inline-flex items-center gap-2"
            >
              Retour au Menu
            </Link>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  const steps = getSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <main className="min-h-screen bg-background">
      {/* Fixed Back Button */}
      <Link
        to="/my-orders"
        className="fixed top-20 left-4 md:left-8 z-40 w-10 h-10 bg-surface-container-lowest border border-outline-variant/30 rounded-full shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 hover:shadow-lg transition-[color,box-shadow,border-color] duration-200 ease-out active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </Link>

      <div className="w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <AnimatedSection animation="fadeUp">
          <div className="text-center mb-8">
            <h1 className="font-headline text-headline-lg text-on-surface mb-2">
              Suivi de commande
            </h1>
            <span className={`inline-block px-3 py-1 rounded-full font-label-md text-label-md ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </AnimatedSection>

        {/* Status Progress */}
        <AnimatedSection animation="fadeUp" delay={100}>
          <section className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow-sm mb-6">
            <div className="space-y-0">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Vertical line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-outline'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isCompleted ? 'check' : step.icon}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-0.5 h-12 transition-colors duration-300 ${
                            index < currentStepIndex ? 'bg-primary' : 'bg-outline-variant'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-8">
                      <h3 className={`font-headline text-headline-sm ${
                        isCompleted ? 'text-on-surface' : 'text-outline'
                      }`}>
                        {step.label}
                      </h3>
                      <p className={`font-body-sm text-body-sm ${
                        isCompleted ? 'text-on-surface-variant' : 'text-outline'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        {/* Order Details */}
        <AnimatedSection animation="fadeUp" delay={200}>
          <section className="bg-surface-container-lowest rounded-xl p-4 ambient-shadow-sm mb-6">
            <h2 className="font-headline text-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Détails de la commande
            </h2>
            <div className="space-y-3 font-body-sm text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Type</span>
                <span className="text-on-surface font-medium">
                  {order.order_type === 'online' ? 'Livraison' : order.order_type === 'takeaway' ? 'À emporter' : 'Sur place'}
                </span>
              </div>
              {order.delivery_address && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Adresse</span>
                  <span className="text-on-surface font-medium text-right max-w-[60%]">{order.delivery_address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Téléphone</span>
                <span className="text-on-surface font-medium tabular-nums">{order.client_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Sous-total</span>
                <span className="text-on-surface font-medium tabular-nums">{Number(order.subtotal).toLocaleString()} Ar</span>
              </div>
              {Number(order.delivery_fee) > 0 && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Frais de livraison</span>
                  <span className="text-on-surface font-medium tabular-nums">{Number(order.delivery_fee).toLocaleString()} Ar</span>
                </div>
              )}
              <div className="flex justify-between border-t border-outline-variant/30 pt-3">
                <span className="text-on-surface font-headline text-headline-sm">Total</span>
                <span className="text-primary font-headline text-headline-sm tabular-nums">{Number(order.total).toLocaleString()} Ar</span>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Items */}
        <AnimatedSection animation="fadeUp" delay={300}>
          <section className="bg-surface-container-lowest rounded-xl p-4 ambient-shadow-sm mb-6">
            <h2 className="font-headline text-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">restaurant_menu</span>
              Articles commandés
            </h2>
            <div className="space-y-3">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-outline-variant/20 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-label-md text-on-surface-variant tabular-nums">
                      {item.quantity}x
                    </span>
                    <div>
                      <span className="font-body-sm text-body-sm text-on-surface">{item.meal_name}</span>
                      {item.notes && (
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface tabular-nums">
                    {Number(item.total_price).toLocaleString()} Ar
                  </span>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Back to Menu */}
        <AnimatedSection animation="fadeUp" delay={400}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={downloadReceipt}
              className="bg-surface-container hover:bg-primary-container text-primary px-6 py-2.5 rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary-dark transition-[background-color] duration-150 ease-out inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Télécharger le reçu
            </button>
            <Link
              to="/menu"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md shadow-sm hover:bg-primary-dark transition-[background-color] duration-150 ease-out inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
              Commander à nouveau
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};

export default OrderTracking;
