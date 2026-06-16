/**
 * fixRoutes.js - Route temporaire pour corriger les comptes utilisateurs
 * À SUPPRIMER après utilisation
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// PUT /api/fix/activate-all - Active tous les comptes
router.put('/activate-all', async (req, res) => {
  try {
    const result = await db.execute(
      `UPDATE users SET status = 'active' WHERE status != 'active'`
    );
    
    res.status(200).json({
      success: true,
      message: `${result.rowsAffected[0]} compte(s) activé(s) avec succès.`,
    });
  } catch (error) {
    console.error('Fix users error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la correction.' });
  }
});

module.exports = router;
