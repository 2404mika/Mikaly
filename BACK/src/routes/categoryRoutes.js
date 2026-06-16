/**
 * categoryRoutes.js - Routes des catégories.
 * GET public (actives uniquement), CRUD admin sur /api/categories.
 */
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');

// Public : liste des catégories actives
router.get('/', categoryController.getAll);

// Routes admin nécessitant authentification
router.use(authenticate);
// Admin : liste de toutes les catégories (y compris inactives)
router.get('/admin/all', authorize('admin'), categoryController.getAllAdmin);
// Récupère une catégorie par ID
router.get('/:id', categoryController.getById);
// Admin : crée une nouvelle catégorie
router.post('/', authorize('admin'), categoryController.create);
// Admin : met à jour une catégorie
router.put('/:id', authorize('admin'), categoryController.update);
// Admin : supprime une catégorie
router.delete('/:id', authorize('admin'), categoryController.remove);

module.exports = router;
