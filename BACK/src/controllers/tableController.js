/**
 * tableController.js - Gestion des tables du restaurant.
 * Permet de créer des tables avec QR code auto-généré, changer leur statut
 * (libre/occupée/réservée) et notifier via Socket.io les changements de statut.
 */
const db = require('../config/db');
const { getIO, socketEvents } = require('../socket/socketHandler');

// Récupération de toutes les tables
const getAll = async (req, res, next) => {
  try {
    const result = await db.execute('SELECT * FROM tables ORDER BY table_number');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Récupération d'une table par son ID
const getById = async (req, res, next) => {
  try {
    const result = await db.execute('SELECT * FROM tables WHERE id = :id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Table not found.' });
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Création d'une nouvelle table avec génération automatique du QR code
const create = async (req, res, next) => {
  try {
    const { table_number, capacity, location } = req.body;
    // Génération du QR code unique pour la table
    const qr_code = `TABLE_${table_number}_${Date.now()}`;
    const result = await db.execute(
      `INSERT INTO tables (table_number, capacity, location, qr_code) 
       VALUES (:table_number, :capacity, :location, :qr_code) 
       RETURNING id INTO :id`,
      { table_number, capacity, location, qr_code, id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } }
    );
    res.status(201).json({ success: true, data: { id: result.outBinds.id[0], table_number, qr_code } });
  } catch (error) {
    next(error);
  }
};

// Mise à jour d'une table (statut, numéro, capacité)
const updateStatus = async (req, res, next) => {
  try {
    const { status, table_number, capacity } = req.body;
    
    // Construire la requête dynamiquement
    let sql = 'UPDATE tables SET';
    const binds = [];
    const updates = [];
    
    if (status !== undefined) { updates.push(' status = :status'); binds.push(status); }
    if (table_number !== undefined) { updates.push(' table_number = :table_number'); binds.push(table_number); }
    if (capacity !== undefined) { updates.push(' capacity = :capacity'); binds.push(Number(capacity)); }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }
    
    sql += updates.join(',') + ' WHERE id = :id';
    binds.push(req.params.id);
    
    await db.execute(sql, binds);
    
    // Notification temps réel
    const io = getIO();
    io.emit(socketEvents.TABLE_STATUS_CHANGED, { tableId: req.params.id, status: status || 'updated' });
    
    res.status(200).json({ success: true, message: 'Table updated.' });
  } catch (error) {
    next(error);
  }
};

// Suppression d'une table
const remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM tables WHERE id = :id', [req.params.id]);
    res.status(200).json({ success: true, message: 'Table deleted.' });
  } catch (error) {
    next(error);
  }
};

// Récupération des tables disponibles
const getAvailable = async (req, res, next) => {
  try {
    const { date, time } = req.query;
    
    // Si pas de date/heure, retourner toutes les tables libres
    if (!date || !time || date === 'all') {
      const result = await db.execute(
        `SELECT * FROM tables WHERE status = 'free' ORDER BY table_number`
      );
      return res.status(200).json({ success: true, data: result.rows });
    }

    // Sinon, filtrer par date/heure (exclure les réservations existantes)
    const result = await db.execute(
      `SELECT t.* FROM tables t 
       WHERE t.id NOT IN (
         SELECT r.table_id FROM reservations r 
         WHERE r.table_id IS NOT NULL
         AND r.reservation_date = TO_DATE(:date, 'YYYY-MM-DD')
         AND r.reservation_time = :time
         AND r.status IN ('pending', 'confirmed')
       )
       AND t.status != 'occupied'
       ORDER BY t.table_number`,
      [date, time]
    );
    
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, updateStatus, remove, getAvailable };
