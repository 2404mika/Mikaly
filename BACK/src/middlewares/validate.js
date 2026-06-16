/**
 * validate.js - Middleware de validation des données de requête.
 * Utilise express-validator pour vérifier que les champs requis sont présents et valides
 * avant d'atteindre les contrôleurs.
 */
const { validationResult } = require('express-validator');

// Vérifie les erreurs de validation et retourne une réponse 400 si nécessaire
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array()
    });
  }
  next();
};

module.exports = validate;
