/**
 * paymentRoutes.js - Routes des paiements.
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.processPayment);
router.get('/order/:orderId', paymentController.getByOrderId);

module.exports = router;
