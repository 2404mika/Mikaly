/**
 * mealController.js - CRUD des repas du menu.
 */
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Sauvegarder une image base64 sur le serveur
function saveImage(base64Data, mealName) {
  if (!base64Data || !base64Data.startsWith('data:image')) return null;
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;
  const ext = matches[1];
  const data = Buffer.from(matches[2], 'base64');
  const filename = `meal_${Date.now()}_${mealName.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
  const uploadDir = path.join(__dirname, '../../uploads/meals');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, data);
  return `/uploads/meals/${filename}`;
}

const getAll = async (req, res, next) => {
  try {
    const { category_id } = req.query;
    let sql = `SELECT m.*, c.name as category_name FROM meals m JOIN categories c ON m.category_id = c.id WHERE m.status = 'available'`;
    const binds = [];
    if (category_id) { sql += ' AND m.category_id = :category_id'; binds.push(category_id); }
    sql += ' ORDER BY c.display_order, m.name';
    const result = await db.execute(sql, binds);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

const getAllAdmin = async (req, res, next) => {
  try {
    const { category_id, status } = req.query;
    let sql = 'SELECT m.*, c.name as category_name FROM meals m JOIN categories c ON m.category_id = c.id WHERE 1=1';
    const binds = [];
    if (category_id) { sql += ' AND m.category_id = :category_id'; binds.push(category_id); }
    if (status) { sql += ' AND m.status = :status'; binds.push(status); }
    sql += ' ORDER BY m.created_at DESC';
    const result = await db.execute(sql, binds);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const result = await db.execute('SELECT m.*, c.name as category_name FROM meals m JOIN categories c ON m.category_id = c.id WHERE m.id = :id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Meal not found.' });
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const { name, description, price, image, category_id, is_featured } = req.body;
    const imagePath = saveImage(image, name);
    const result = await db.execute(
      `INSERT INTO meals (name, description, price, image, category_id, is_featured) 
       VALUES (:name, :description, :price, :image, :category_id, :is_featured) 
       RETURNING id INTO :id`,
      { name, description, price, image: imagePath, category_id, is_featured: is_featured || 0, id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT } }
    );
    res.status(201).json({ success: true, data: { id: result.outBinds.id[0], name, image: imagePath } });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const { name, description, price, image, category_id, status, is_featured } = req.body;
    let imagePath = image;
    if (image && image.startsWith('data:image')) {
      imagePath = saveImage(image, name);
    }
    await db.execute(
      `UPDATE meals SET name = :name, description = :description, price = :price, image = :image, category_id = :category_id, status = :status, is_featured = :is_featured WHERE id = :id`,
      [name, description, price, imagePath, category_id, status, is_featured, req.params.id]
    );
    res.status(200).json({ success: true, message: 'Meal updated.' });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await db.execute('DELETE FROM meals WHERE id = :id', [req.params.id]);
    res.status(200).json({ success: true, message: 'Meal deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getAllAdmin, getById, create, update, remove };
