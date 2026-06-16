/**
 * reservationController.js - Gestion des réservations de tables.
 * Permet aux clients de réserver (nom, téléphone, date, heure, nombre de personnes)
 * et à l'admin de valider/refuser les réservations. Notifie via Socket.io.
 */
const db = require('../config/db');
const { getIO, socketEvents } = require('../socket/socketHandler');

// Récupération de toutes les réservations (pour l'admin)
const getAll = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT r.*, t.table_number FROM reservations r LEFT JOIN tables t ON r.table_id = t.id ORDER BY r.reservation_date DESC, r.reservation_time`
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Création d'une nouvelle réservation
const create = async (req, res, next) => {
  try {
    const { client_name, client_phone, client_email, reservation_date, reservation_time, number_of_guests, notes } = req.body;
    const user_id = req.user ? req.user.id : null;
    
    // Insertion de la réservation avec conversion de la date
    const result = await db.execute(
      `INSERT INTO reservations (client_name, client_phone, client_email, reservation_date, reservation_time, number_of_guests, notes, user_id) 
       VALUES (:client_name, :client_phone, :client_email, TO_DATE(:reservation_date, 'YYYY-MM-DD'), :reservation_time, :number_of_guests, :notes, :user_id) 
       RETURNING id INTO :id`,
      { client_name, client_phone, client_email, reservation_date, reservation_time, number_of_guests, notes, user_id, id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } }
    );
    
    // Notification Socket.io à l'admin
    const io = getIO();
    io.emit(socketEvents.NEW_RESERVATION, { reservationId: result.outBinds.id[0] });
    
    res.status(201).json({ success: true, data: { id: result.outBinds.id[0] } });
  } catch (error) {
    next(error);
  }
};

// Mise à jour du statut d'une réservation (pending, confirmed, cancelled, completed)
const updateStatus = async (req, res, next) => {
  try {
    const { status, table_id } = req.body;
    await db.execute(
      'UPDATE reservations SET status = :status, table_id = :table_id WHERE id = :id',
      [status, table_id || null, req.params.id]
    );
    
    // Notification Socket.io
    const io = getIO();
    io.emit(socketEvents.RESERVATION_STATUS_CHANGED, { reservationId: req.params.id, status });
    
    res.status(200).json({ success: true, message: 'Reservation status updated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, updateStatus };
