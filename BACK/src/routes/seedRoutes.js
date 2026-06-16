/**
 * seedRoutes.js - Route temporaire pour insérer les données de test
 * À SUPPRIMER après utilisation
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// POST /api/seed - Insérer les données de test
router.post('/', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, '../../database/seed_data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Séparer les statements par ;
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

module.exports = router;
