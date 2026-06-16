/**
 * reservationRoutes.js - Routes des réservations.
 * POST public (créer), GET/PATCH admin (liste et validation) sur /api/reservations.
 */
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticate, authorize } = require('../middlewares/auth');

// Admin : liste toutes les réservations
router.get('/', authenticate, authorize('admin'), reservationController.getAll);
// Client : mes réservations
router.get('/my-reservations', authenticate, reservationController.getMyReservations);
// Public : crée une nouvelle réservation
router.post('/', reservationController.create);
// Admin : change le statut d'une réservation (pending/confirmed/cancelled/completed)
router.patch('/:id/status', authenticate, authorize('admin'), reservationController.updateStatus);

module.exports = router;
