/**
 * userRoutes.js - Routes de gestion des utilisateurs (admin uniquement).
 * GET, POST, PUT, DELETE sur /api/users.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

// Protection : toutes les routes nécessitent d'être admin
router.use(authenticate);
router.use(authorize('admin'));

// Liste tous les utilisateurs
router.get('/', userController.getAll);
// Récupère un utilisateur par ID
router.get('/:id', userController.getById);
// Crée un nouvel utilisateur
router.post('/', userController.create);
// Met à jour un utilisateur
router.put('/:id', userController.update);
// Supprime un utilisateur
router.delete('/:id', userController.remove);

module.exports = router;
