/**
 * authController.js - Contrôleur d'authentification.
 * Gère le login (vérification email/password + génération JWT),
 * l'inscription (client uniquement, status 'active' par défaut)
 * et la récupération du profil utilisateur.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Connexion utilisateur : vérifie les identifiants et génère un token JWT
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Récupération de l'utilisateur depuis la base de données
    const result = await db.execute(
      'SELECT id, name, email, password, role, status FROM users WHERE email = :email',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];

    console.log(`[LOGIN] User: ${user.email}, Status: "${user.status}", Role: "${user.role}"`);

    // Vérification du statut du compte
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended.'
      });
    }

    // Comparaison du mot de passe avec le hash bcrypt stocké
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Génération du token JWT avec l'ID et le rôle de l'utilisateur
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Inscription d'un nouvel utilisateur (client uniquement)
// Les comptes Livreur/Caissier/Cuisinier sont créés par l'admin via /api/users
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    // Vérification si l'email existe déjà
    const existingUser = await db.execute(
      'SELECT id FROM users WHERE email = :email',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Hash du mot de passe avec bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // L'inscription publique crée uniquement des comptes client, actifs par défaut
    const result = await db.execute(
      `INSERT INTO users (name, email, password, phone, role, status) 
       VALUES (:name, :email, :password, :phone, 'client', 'active') 
       RETURNING id INTO :id`,
      {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        id: { type: db.oracledb.NUMBER, dir: db.oracledb.BIND_OUT }
      }
    );

    const userId = result.outBinds.id[0];

    console.log(`[REGISTER] New client created: ${email}, role: client, status: active`);

    const token = jwt.sign(
      { userId, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: userId,
          name,
          email,
          role: 'client'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupération du profil de l'utilisateur connecté
const getProfile = async (req, res, next) => {
  try {
    const result = await db.execute(
      `SELECT id, name, email, phone, role, status, address, created_at 
       FROM users WHERE id = :id`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getProfile };
