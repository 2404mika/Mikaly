/**
 * mealRoutes.js - Routes des repas.
 * GET public (disponibles uniquement), CRUD admin avec filtres sur /api/meals.
 */
const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { authenticate, authorize } = require('../middlewares/auth');

// Public : liste des repas disponibles (avec filtre par catégorie)
router.get('/', mealController.getAll);

// Routes admin nécessitant authentification
router.use(authenticate);
// Admin : liste de tous les repas (avec filtres catégorie/statut)
router.get('/admin/all', authorize('admin'), mealController.getAllAdmin);
// Récupère un repas par ID
router.get('/:id', mealController.getById);
// Admin : crée un nouveau repas
router.post('/', authorize('admin'), mealController.create);
// Admin : met à jour un repas
router.put('/:id', authorize('admin'), mealController.update);
// Admin : supprime un repas
router.delete('/:id', authorize('admin'), mealController.remove);

module.exports = router;
