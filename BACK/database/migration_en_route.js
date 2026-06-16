/**
 * migration_en_route.js - Script pour ajouter 'en_route' au statut des commandes
 * Usage: node database/migration_en_route.js
 */
require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    // 1. Trouver et supprimer l'ancien CHECK constraint
    const constraints = await db.execute(
      `SELECT constraint_name FROM user_constraints 
       WHERE table_name = 'ORDERS' AND constraint_type = 'C'`
    );
    
    for (const row of constraints.rows) {
      const name = row.constraint_name;
      // Vérifier si c'est le CHECK constraint sur le statut
      const check = await db.execute(
        `SELECT search_condition FROM user_constraints 
         WHERE constraint_name = :name AND table_name = 'ORDERS'`,
        [name]
      );
      
      if (check.rows.length > 0 && check.rows[0].search_condition && 
          check.rows[0].search_condition.includes('received')) {
        console.log(`Suppression du CHECK constraint: ${name}`);
        await db.execute(`ALTER TABLE orders DROP CONSTRAINT ${name}`);
      }
    }

    // 2. Ajouter le nouveau CHECK constraint avec 'en_route'
    console.log('Ajout du nouveau CHECK constraint avec en_route...');
    await db.execute(
      `ALTER TABLE orders ADD CONSTRAINT chk_orders_status 
       CHECK (status IN ('received', 'preparing', 'ready', 'en_route', 'served', 'delivered', 'cancelled', 'paid'))`
    );
    
    console.log('Migration terminée avec succès !');
    console.log('Le statut "en_route" est maintenant disponible.');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

migrate();
