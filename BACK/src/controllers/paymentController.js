/**
 * paymentController.js - Module de caisse et paiements.
 * Traite les paiements (espèces, mobile money, carte), calcule le rendu monnaie,
 * marque la commande comme payée et libère la table. Notifie via Socket.io.
 */
const db = require('../config/db');
const { getIO, socketEvents } = require('../socket/socketHandler');

// Traitement d'un paiement avec calcul du rendu monnaie
const processPayment = async (req, res, next) => {
  try {
    const { order_id: rawOrderId, amount, payment_method, amount_received: rawAmountReceived, transaction_ref } = req.body;
    const order_id = Number(rawOrderId);
    const amount_received = Number(rawAmountReceived);
    const cashier_id = req.user ? req.user.id : null;

    // Récupération du total de la commande
    const orderResult = await db.execute('SELECT total FROM orders WHERE id = :id', [order_id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });

    const orderTotal = Number(orderResult.rows[0].total);
    // Calcul du rendu monnaie
    const change_amount = amount_received - orderTotal;

    // Vérification que le montant reçu est suffisant
    if (amount_received < orderTotal) {
      return res.status(400).json({ success: false, message: 'Amount received is less than order total.' });
    }

    // Insertion du paiement dans la base de données
    const result = await db.execute(
      `INSERT INTO payments (order_id, amount, payment_method, amount_received, change_amount, transaction_ref, cashier_id) 
       VALUES (:order_id, :amount, :payment_method, :amount_received, :change_amount, :transaction_ref, :cashier_id) 
       RETURNING id INTO :id`,
      { order_id, amount: orderTotal, payment_method, amount_received, change_amount, transaction_ref: transaction_ref || null, cashier_id, id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } }
    );

    // Mise à jour du statut de la commande à 'paid'
    await db.execute(`UPDATE orders SET status = 'paid', cashier_id = :cashier_id, paid_at = CURRENT_TIMESTAMP WHERE id = :id`, [cashier_id, order_id]);

    // Libération de la table associée
    const tableResult = await db.execute('SELECT table_id FROM orders WHERE id = :id', [order_id]);
    if (tableResult.rows.length > 0 && tableResult.rows[0].TABLE_ID) {
      await db.execute('UPDATE tables SET status = \'free\' WHERE id = :id', [tableResult.rows[0].TABLE_ID]);
    }

    // Notification Socket.io
    const io = getIO();
    io.emit(socketEvents.PAYMENT_COMPLETED, { paymentId: result.outBinds.id[0], orderId: order_id });
    io.emit(socketEvents.ORDER_STATUS_CHANGED, { orderId: order_id, status: 'paid' });

    res.status(201).json({ success: true, data: { paymentId: result.outBinds.id[0], change_amount } });
  } catch (error) {
    next(error);
  }
};

// Récupération des paiements d'une commande
const getByOrderId = async (req, res, next) => {
  try {
    const result = await db.execute('SELECT * FROM payments WHERE order_id = :order_id', [req.params.orderId]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment, getByOrderId };
