/**
 * server.js - Point d'entrée principal de l'application backend.
 * Initialise Express, Socket.io, les middlewares (CORS, Helmet, Morgan),
 * enregistre toutes les routes API et démarre le serveur sur le port configuré.
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const { initSocket } = require('./socket/socketHandler');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const mealRoutes = require('./routes/mealRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const server = http.createServer(app);

// Initialisation de Socket.io pour la communication temps réel
const io = initSocket(server);

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enregistrement des routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewRoutes);

// Route temporaire pour insérer les données de test
app.post('/api/seed', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, '../database/seed_data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let executed = 0;
    for (const statement of statements) {
      try {
        await db.execute(statement);
        executed++;
      } catch (err) {
        // Ignorer les erreurs de doublons
        if (!err.message.includes('unique constraint') && !err.message.includes('ORA-00001')) {
          console.error('Seed error:', err.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `${executed} requête(s) exécutée(s) avec succès.`
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'insertion.' });
  }
});

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Endpoint pour récupérer l'IP réseau du serveur
const { getLocalIP } = require('./utils/network');
app.get('/api/network', (req, res) => {
  const ip = getLocalIP();
  res.json({ ip, port: PORT });
});

// Route pour activer tous les comptes clients
app.put('/api/fix/activate-all', async (req, res) => {
  try {
    const result = await db.execute(
      `UPDATE users SET status = 'active' WHERE status != 'active'`
    );
    res.status(200).json({
      success: true,
      message: `${result.rowsAffected[0]} compte(s) activé(s).`,
    });
  } catch (error) {
    console.error('Fix error:', error);
    res.status(500).json({ success: false, message: 'Erreur.' });
  }
});

// Middleware de gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Démarrage du serveur avec test de connexion Oracle
async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log('Oracle Database connected successfully');
    connection.close();

    // Auto-fix : activer tous les comptes au démarrage
    try {
      const fixResult = await db.execute(
        `UPDATE users SET status = 'active' WHERE status != 'active'`
      );
      if (fixResult.rowsAffected[0] > 0) {
        console.log(`[FIX] ${fixResult.rowsAffected[0]} compte(s) activé(s) automatiquement.`);
      }
    } catch (fixErr) {
      console.error('[FIX] Erreur auto-fix:', fixErr.message);
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };
