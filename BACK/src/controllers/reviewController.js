/**
 * reviewController.js - Gestion des avis clients.
 * Permet aux clients de noter (1-5 étoiles) et commenter après paiement,
 * et à l'admin de masquer/supprimer les avis inappropriés. Notifie via Socket.io.
 */
const db = require('../config/db');
const { getIO, socketEvents } = require('../socket/socketHandler');

// Récupération de tous les avis avec filtres (pour l'admin)
const getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `SELECT r.*, u.name as user_name, o.order_type, o.total
               FROM reviews r 
               LEFT JOIN users u ON r.user_id = u.id 
               LEFT JOIN orders o ON r.order_id = o.id WHERE 1=1`;
    const binds = [];
    if (status) {
      sql += ' AND r.status = :status';
      binds.push(status);
    }
    sql += ' ORDER BY r.created_at DESC';
    const result = await db.execute(sql, binds);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Récupération des avis d'une commande spécifique
const getByOrderId = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.order_id = :order_id`,
      [req.params.orderId]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Création d'un avis (uniquement pour les commandes payées)
const create = async (req, res, next) => {
  try {
    const { order_id, rating, comment_text } = req.body;
    const user_id = req.user ? req.user.id : null;

    // Vérification que la commande est payée
    const orderCheck = await db.execute(
      'SELECT id FROM orders WHERE id = :id AND status = \'paid\'',
      [order_id]
    );
    if (orderCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Can only review paid orders.' });
    }

    // Vérification qu'un avis n'existe pas déjà pour cette commande
    const existingReview = await db.execute(
      'SELECT id FROM reviews WHERE order_id = :order_id',
      [order_id]
    );
    if (existingReview.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Review already exists for this order.' });
    }

    // Insertion de l'avis dans la base de données
    const result = await db.execute(
      `INSERT INTO reviews (order_id, user_id, rating, comment_text) 
       VALUES (:order_id, :user_id, :rating, :comment_text) 
       RETURNING id INTO :id`,
      { order_id, user_id, rating, comment_text, id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } }
    );

    // Notification Socket.io à l'admin
    const io = getIO();
    io.emit(socketEvents.NEW_REVIEW, { reviewId: result.outBinds.id[0], order_id, rating });

    res.status(201).json({ success: true, data: { id: result.outBinds.id[0] } });
  } catch (error) {
    next(error);
  }
};

// Mise à jour du statut d'un avis (visible/hidden)
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE reviews SET status = :status WHERE id = :id', [status, req.params.id]);
    res.status(200).json({ success: true, message: 'Review status updated.' });
  } catch (error) {
    next(error);
  }
};

// Suppression d'un avis
const remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM reviews WHERE id = :id', [req.params.id]);
    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

// Statistiques des avis (note moyenne, répartition par étoiles)
const getStats = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_stars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_stars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_stars,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_stars,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews WHERE status = 'visible'`
    );
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getByOrderId, create, updateStatus, remove, getStats };
