/**
 * reviewRoutes.js - Routes des avis clients.
 * POST client (ajouter un avis), GET/PATCH/DELETE admin, GET stats admin.
 */
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middlewares/auth');

// Admin : statistiques des avis (note moyenne, répartition)
router.get('/stats', authenticate, authorize('admin'), reviewController.getStats);
// Admin : liste tous les avis
router.get('/', authenticate, authorize('admin'), reviewController.getAll);
// Authentifié : avis d'une commande spécifique
router.get('/order/:orderId', authenticate, reviewController.getByOrderId);
// Client : crée un avis (uniquement pour commandes payées)
router.post('/', authenticate, authorize('client'), reviewController.create);
// Admin : change le statut d'un avis (visible/hidden)
router.patch('/:id/status', authenticate, authorize('admin'), reviewController.updateStatus);
// Admin : supprime un avis
router.delete('/:id', authenticate, authorize('admin'), reviewController.remove);

module.exports = router;
