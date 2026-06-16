/**
 * orderController.js - Gestion complète des commandes.
 * Crée les commandes (dine_in/online/takeaway), gère les statuts (reçue→préparation→prête→servie),
 * fournit les vues cuisine et livraison, et notifie via Socket.io les changements de statut.
 */
const db = require('../config/db');
const { getIO, socketEvents } = require('../socket/socketHandler');

// Récupération des commandes avec items
const getAll = async (req, res, next) => {
  try {
    const userRole = req.user ? req.user.role : null;
    const userId = req.user ? req.user.id : null;
    const { status, order_type } = req.query;
    
    let sql = `SELECT o.*, u.name as client_name_user, t.table_number 
               FROM orders o 
               LEFT JOIN users u ON o.user_id = u.id 
               LEFT JOIN tables t ON o.table_id = t.id WHERE 1=1`;
    const binds = [];
    
    // Les clients ne voient que leurs propres commandes
    if (userRole === 'client') {
      sql += ' AND o.user_id = :userId';
      binds.push(userId);
    }
    
    if (status) { sql += ' AND o.status = :status'; binds.push(status); }
    if (order_type) { sql += ' AND o.order_type = :order_type'; binds.push(order_type); }
    sql += ' ORDER BY o.created_at DESC';
    const result = await db.execute(sql, binds);
    
    // Récupérer les items pour chaque commande
    const orders = [];
    for (const order of result.rows) {
      const orderId = Number(order.id || order.ID);
      const itemsResult = await db.execute(
        `SELECT oi.*, m.name as meal_name, m.image as meal_image 
         FROM order_items oi 
         JOIN meals m ON oi.meal_id = m.id 
         WHERE oi.order_id = :order_id`,
        [orderId]
      );
      orders.push({ ...order, items: itemsResult.rows });
    }
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Récupération d'une commande avec ses items
const getById = async (req, res, next) => {
  try {
    const orderResult = await db.execute(
      `SELECT o.*, u.name as client_name_user, t.table_number 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       LEFT JOIN tables t ON o.table_id = t.id 
       WHERE o.id = :id`,
      [req.params.id]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });
    
    // Récupération des items de la commande
    const itemsResult = await db.execute(
      `SELECT oi.*, m.name as meal_name, m.image as meal_image 
       FROM order_items oi 
       JOIN meals m ON oi.meal_id = m.id 
       WHERE oi.order_id = :order_id`,
      [req.params.id]
    );
    
    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Création d'une nouvelle commande (sur place, en ligne ou à emporter)
const create = async (req, res, next) => {
  try {
    const { order_type, table_id, client_name, client_phone, delivery_address, delivery_time, delivery_fee, items, notes } = req.body;
    const user_id = req.user ? req.user.id : null;

    // Calcul du sous-total et du total
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.unit_price * item.quantity;
    }
    const total = subtotal + (delivery_fee || 0);

    // Insertion de la commande dans la base de données
    const orderResult = await db.execute(
      `INSERT INTO orders (order_type, user_id, table_id, client_name, client_phone, delivery_address, delivery_time, delivery_fee, subtotal, total, notes)
       VALUES (:order_type, :user_id, :table_id, :client_name, :client_phone, :delivery_address, :delTime, :delivery_fee, :subtotal, :total, :notes)
       RETURNING id INTO :id`,
      { order_type, user_id, table_id: table_id || null, client_name, client_phone, delivery_address, delTime: delivery_time || null, delivery_fee: delivery_fee || 0, subtotal, total, notes, id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } }
    );
    const orderId = orderResult.outBinds.id[0];

    // Insertion des items de la commande
    for (const item of items) {
      const itemTotal = item.unit_price * item.quantity;
      await db.execute(
        `INSERT INTO order_items (order_id, meal_id, quantity, unit_price, total_price, notes) 
         VALUES (:order_id, :meal_id, :quantity, :unit_price, :total_price, :notes)`,
        { order_id: orderId, meal_id: item.meal_id, quantity: item.quantity, unit_price: item.unit_price, total_price: itemTotal, notes: item.notes }
      );
    }

    // Mise à jour du statut de la table si commande sur place
    if (table_id) {
      await db.execute('UPDATE tables SET status = \'occupied\' WHERE id = :id', [table_id]);
    }

    // Notification Socket.io à la cuisine
    const io = getIO();
    io.emit(socketEvents.ORDER_CREATED, { orderId, order_type, table_id });
    io.to('kitchen').emit(socketEvents.ORDER_CREATED, { orderId, order_type, table_id });

    res.status(201).json({ success: true, data: { id: orderId, total } });
  } catch (error) {
    next(error);
  }
};

// Mise à jour du statut d'une commande avec notification Socket.io
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updates = { status };
    
    // Enregistrement des timestamps selon le statut
    if (status === 'ready') updates.ready_at = new Date();
    if (status === 'en_route') updates.delivered_at = new Date();
    if (status === 'delivered') updates.delivered_at = new Date();
    if (status === 'paid') updates.paid_at = new Date();

    let sql = 'UPDATE orders SET status = :status';
    const binds = [status];
    
    if (updates.ready_at) { sql += ', ready_at = :ready_at'; binds.push(updates.ready_at); }
    if (updates.delivered_at) { sql += ', delivered_at = :delivered_at'; binds.push(updates.delivered_at); }
    if (updates.paid_at) { sql += ', paid_at = :paid_at'; binds.push(updates.paid_at); }
    
    sql += ' WHERE id = :id';
    binds.push(req.params.id);

    await db.execute(sql, binds);

    // Notification Socket.io globale et à la table spécifique
    const io = getIO();
    io.emit(socketEvents.ORDER_STATUS_CHANGED, { orderId: req.params.id, status });
    
    if (req.params.id) {
      const orderResult = await db.execute('SELECT table_id FROM orders WHERE id = :id', [req.params.id]);
      if (orderResult.rows.length > 0 && orderResult.rows[0].TABLE_ID) {
        io.to(`table_${orderResult.rows[0].TABLE_ID}`).emit(socketEvents.ORDER_STATUS_CHANGED, { orderId: req.params.id, status });
      }
    }

    res.status(200).json({ success: true, message: 'Order status updated.' });
  } catch (error) {
    next(error);
  }
};

// Récupération des commandes pour la cuisine (en attente ou en préparation)
const getKitchenOrders = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT o.id, o.order_type, o.status, o.created_at, t.table_number, o.client_name, o.client_phone,
              o.delivery_address, o.total
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       WHERE o.status IN ('received', 'preparing')
       ORDER BY o.created_at ASC`
    );
    
    // Récupérer les items détaillés pour chaque commande
    const orders = [];
    for (const order of result.rows) {
      const orderId = Number(order.id || order.ID);
      const itemsResult = await db.execute(
        `SELECT oi.quantity, oi.notes, m.name as meal_name
         FROM order_items oi
         JOIN meals m ON oi.meal_id = m.id
         WHERE oi.order_id = :order_id
         ORDER BY oi.id`,
        [orderId]
      );
      orders.push({ ...order, items: itemsResult.rows });
    }
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Récupération des commandes pour les livreurs (prêtes à livrer)
const getDeliveryOrders = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT o.id, o.order_type, o.status, o.created_at, o.client_name, o.client_phone,
              o.delivery_address, o.delivery_fee, o.total, o.delivery_id
       FROM orders o
       WHERE o.order_type = 'online' AND o.status IN ('ready', 'en_route') AND o.delivery_id IS NULL
       ORDER BY o.created_at ASC`
    );
    
    // Récupérer les items pour chaque commande
    const orders = [];
    for (const order of result.rows) {
      const orderId = Number(order.id);
      const itemsResult = await db.execute(
        `SELECT oi.quantity, oi.notes, m.name as meal_name
         FROM order_items oi
         JOIN meals m ON oi.meal_id = m.id
         WHERE oi.order_id = :order_id
         ORDER BY oi.id`,
        [orderId]
      );
      orders.push({ ...order, items: itemsResult.rows });
    }
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Acceptation d'une livraison par un livreur (status → en_route)
const acceptDelivery = async (req, res, next) => {
  try {
    await db.execute('UPDATE orders SET delivery_id = :delivery_id, status = \'en_route\' WHERE id = :id', 
      [req.user.id, req.params.id]);
    
    // Notification Socket.io
    const io = getIO();
    io.emit(socketEvents.ORDER_STATUS_CHANGED, { orderId: req.params.id, status: 'en_route', deliveryId: req.user.id });
    
    res.status(200).json({ success: true, message: 'Delivery accepted.' });
  } catch (error) {
    next(error);
  }
};

// Marquer une commande comme livrée
const markDelivered = async (req, res, next) => {
  try {
    await db.execute('UPDATE orders SET status = \'delivered\', delivered_at = CURRENT_TIMESTAMP WHERE id = :id',
      [req.params.id]);

    const io = getIO();
    io.emit(socketEvents.ORDER_STATUS_CHANGED, { orderId: req.params.id, status: 'delivered' });

    res.status(200).json({ success: true, message: 'Order marked as delivered.' });
  } catch (error) {
    next(error);
  }
};

// Récupération des commandes livrées par le livreur connecté
const getMyDeliveries = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT o.id, o.order_type, o.status, o.created_at, o.client_name, o.client_phone,
              o.delivery_address, o.delivery_fee, o.total, o.delivery_id, o.delivered_at
       FROM orders o
       WHERE o.order_type = 'online' AND o.status = 'delivered' AND o.delivery_id = :delivery_id
       ORDER BY o.delivered_at DESC`,
      [req.user.id]
    );

    const orders = [];
    for (const order of result.rows) {
      const orderId = Number(order.id);
      const itemsResult = await db.execute(
        `SELECT oi.quantity, oi.notes, m.name as meal_name
         FROM order_items oi
         JOIN meals m ON oi.meal_id = m.id
         WHERE oi.order_id = :order_id
         ORDER BY oi.id`,
        [orderId]
      );
      orders.push({ ...order, items: itemsResult.rows });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Récupération des commandes en cours de livraison pour le livreur connecté
const getMyActiveDeliveries = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT o.id, o.order_type, o.status, o.created_at, o.client_name, o.client_phone,
              o.delivery_address, o.delivery_fee, o.total, o.delivery_id
       FROM orders o
       WHERE o.order_type = 'online' AND o.status = 'en_route' AND o.delivery_id = :delivery_id
       ORDER BY o.created_at ASC`,
      [req.user.id]
    );

    const orders = [];
    for (const order of result.rows) {
      const orderId = Number(order.id);
      const itemsResult = await db.execute(
        `SELECT oi.quantity, oi.notes, m.name as meal_name
         FROM order_items oi
         JOIN meals m ON oi.meal_id = m.id
         WHERE oi.order_id = :order_id
         ORDER BY oi.id`,
        [orderId]
      );
      orders.push({ ...order, items: itemsResult.rows });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, updateStatus, getKitchenOrders, getDeliveryOrders, acceptDelivery, markDelivered, getMyDeliveries, getMyActiveDeliveries };
