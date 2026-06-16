/**
 * auth.js - Middleware d'authentification et d'autorisation.
 * authenticate : vérifie le token JWT et charge l'utilisateur depuis la DB.
 * authorize : restreint l'accès aux routes selon les rôles (admin, cook, delivery, cashier, client).
 */
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Vérifie le token JWT et charge l'utilisateur
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupération de l'utilisateur depuis la base de données
    const result = await db.execute(
      'SELECT id, name, email, phone, role, status FROM users WHERE id = :id',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended.'
      });
    }

    // Attachement de l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    next(error);
  }
};

// Vérifie que l'utilisateur a le rôle requis pour accéder à la route
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Auth optionnelle : charge l'utilisateur si un token est présent, sinon continue
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.execute(
      'SELECT id, name, email, phone, role, status FROM users WHERE id = :id',
      [decoded.userId]
    );
    if (result.rows.length > 0 && result.rows[0].status === 'active') {
      req.user = result.rows[0];
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
