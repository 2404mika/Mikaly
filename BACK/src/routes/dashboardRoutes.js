/**
 * dashboardRoutes.js - Routes du tableau de bord admin.
 * GET /api/dashboard/stats : statistiques globales (CA, commandes, plats, catégories, avis).
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

// Protection : toutes les routes nécessitent d'être admin
router.use(authenticate);
router.use(authorize('admin'));

// Récupère toutes les statistiques pour le dashboard
router.get('/stats', dashboardController.getStats);

module.exports = router;
