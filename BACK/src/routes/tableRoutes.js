/**
 * tableRoutes.js - Routes des tables.
 * GET public, création admin, changement de statut (admin/caissier) sur /api/tables.
 */
const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticate, authorize } = require('../middlewares/auth');

// Public : liste de toutes les tables
router.get('/', tableController.getAll);
// Public : tables disponibles pour une date/heure
router.get('/available', tableController.getAvailable);
// Public : récupère une table par ID
router.get('/:id', tableController.getById);
// Public : mettre à jour le statut d'une table (QR Code - occupation/libération)
router.patch('/:id/status', tableController.updateStatus);

// Routes nécessitant authentification
router.use(authenticate);
// Admin : crée une nouvelle table avec QR code
router.post('/', authorize('admin'), tableController.create);
// Admin : supprime une table
router.delete('/:id', authorize('admin'), tableController.remove);

module.exports = router;
