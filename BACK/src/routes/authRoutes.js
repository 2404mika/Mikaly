/**
 * authRoutes.js - Routes d'authentification.
 * POST /login, POST /register, GET /profile (protégé).
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Connexion : vérifie email/password et retourne un token JWT
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
], validate, authController.login);

// Inscription : crée un nouvel utilisateur avec hash du mot de passe
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
], validate, authController.register);

// Profil : récupère les infos de l'utilisateur connecté (nécessite authentification)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
