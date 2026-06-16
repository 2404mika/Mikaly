/**
 * userController.js - CRUD des utilisateurs (réservé à l'admin).
 * Permet de lister, créer, modifier et supprimer les utilisateurs
 * (clients, cuisiniers, livreurs, caissiers, admins).
 */
const db = require('../config/db');

// Récupération de tous les utilisateurs (triés par date de création)
const getAll = async (req, res, next) => {
  try {
    const result = await db.execute(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Récupération d'un utilisateur par son ID
const getById = async (req, res, next) => {
  try {
    const result = await db.execute(
      'SELECT * FROM users WHERE id = :id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Création d'un nouvel utilisateur avec hash du mot de passe
const create = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion dans la base de données avec récupération de l'ID généré
    const result = await db.execute(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES (:name, :email, :password, :phone, :role) 
       RETURNING id INTO :id`,
      {
        name, email, password: hashedPassword, phone, role,
        id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT }
      }
    );
    res.status(201).json({ success: true, data: { id: result.outBinds.id[0], name, email, role } });
  } catch (error) {
    next(error);
  }
};

// Mise à jour des informations d'un utilisateur
const update = async (req, res, next) => {
  try {
    const { name, phone, role, status } = req.body;
    await db.execute(
      `UPDATE users SET name = :name, phone = :phone, role = :role, status = :status WHERE id = :id`,
      [name, phone, role, status, req.params.id]
    );
    res.status(200).json({ success: true, message: 'User updated.' });
  } catch (error) {
    next(error);
  }
};

// Suppression d'un utilisateur
const remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM users WHERE id = :id', [req.params.id]);
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
