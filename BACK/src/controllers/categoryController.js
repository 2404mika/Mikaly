/**
 * categoryController.js - CRUD des catégories de repas.
 * Permet de gérer les catégories (Entrées, Plats, Desserts, Boissons).
 * Les clients voient uniquement les catégories actives, l'admin voit tout.
 */
const db = require('../config/db');

// Récupération des catégories actives (pour les clients)
const getAll = async (req, res, next) => {
  try {
    const result = await db.execute(
      'SELECT * FROM categories WHERE status = \'active\' ORDER BY display_order'
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Récupération de toutes les catégories (pour l'admin)
const getAllAdmin = async (req, res, next) => {
  try {
    const result = await db.execute(
      'SELECT * FROM categories ORDER BY display_order'
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Récupération d'une catégorie par son ID
const getById = async (req, res, next) => {
  try {
    const result = await db.execute('SELECT * FROM categories WHERE id = :id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Création d'une nouvelle catégorie
const create = async (req, res, next) => {
  try {
    const { name, description, image, display_order } = req.body;
    const result = await db.execute(
      `INSERT INTO categories (name, description, image, display_order) 
       VALUES (:name, :description, :image, :display_order) 
       RETURNING id INTO :id`,
      { name, description, image, display_order: display_order || 0, id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } }
    );
    res.status(201).json({ success: true, data: { id: result.outBinds.id[0], name } });
  } catch (error) {
    next(error);
  }
};

// Mise à jour d'une catégorie
const update = async (req, res, next) => {
  try {
    const { name, description, image, status, display_order } = req.body;
    await db.execute(
      `UPDATE categories SET name = :name, description = :description, image = :image, status = :status, display_order = :display_order WHERE id = :id`,
      [name, description, image, status, display_order, req.params.id]
    );
    res.status(200).json({ success: true, message: 'Category updated.' });
  } catch (error) {
    next(error);
  }
};

// Suppression d'une catégorie
const remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM categories WHERE id = :id', [req.params.id]);
    res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getAllAdmin, getById, create, update, remove };
