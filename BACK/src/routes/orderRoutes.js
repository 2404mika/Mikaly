/**
 * orderRoutes.js - Routes des commandes.
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');

// Public
router.post('/', optionalAuth, orderController.create);
router.get('/kitchen', orderController.getKitchenOrders);
router.get('/delivery', orderController.getDeliveryOrders);
router.get('/my-deliveries', authenticate, orderController.getMyDeliveries);
router.get('/my-active-deliveries', authenticate, orderController.getMyActiveDeliveries);
router.get('/', authenticate, orderController.getAll);
router.get('/:id', orderController.getById);
router.patch('/:id/status', orderController.updateStatus);
router.patch('/:id/delivered', orderController.markDelivered);
router.post('/:id/accept-delivery', authenticate, orderController.acceptDelivery);

module.exports = router;
