/**
 * db.js - Configuration de la connexion à la base de données Oracle.
 * Gère le pool de connexions (min/max), fournit les méthodes execute() et getConnection()
 * pour exécuter les requêtes SQL depuis les contrôleurs.
 */
const oracledb = require('oracledb');
require('dotenv').config();

oracledb.initOracleClient();

// Configuration du pool de connexions Oracle
const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60
};

let pool;

// Création du pool de connexions
async function initPool() {
  try {
    pool = await oracledb.createPool(poolConfig);
    console.log('Oracle connection pool created');
  } catch (error) {
    console.error('Error creating connection pool:', error);
    throw error;
  }
}

// Obtention d'une connexion depuis le pool
async function getConnection() {
  if (!pool) {
    await initPool();
  }
  return await pool.getConnection();
}

// Exécution d'une requête SQL avec gestion automatique de la connexion
async function execute(sql, binds = [], options = {}) {
  const connection = await getConnection();
  try {
    options.outFormat = oracledb.OUT_FORMAT_OBJECT;
    options.autoCommit = true;
    const result = await connection.execute(sql, binds, options);
    
    // Transformer les clés en minuscules pour compatibilité
    if (result.rows) {
      result.rows = result.rows.map(row => {
        const lowerRow = {};
        Object.keys(row).forEach(key => {
          lowerRow[key.toLowerCase()] = row[key];
        });
        return lowerRow;
      });
    }

    // Transformer outBinds en minuscules aussi
    if (result.outBinds) {
      const lowerBinds = {};
      for (const key in result.outBinds) {
        lowerBinds[key.toLowerCase()] = result.outBinds[key];
      }
      result.outBinds = lowerBinds;
    }
    
    return result;
  } finally {
    await connection.close();
  }
}

// Fermeture du pool de connexions
async function closePool() {
  if (pool) {
    await pool.close();
    console.log('Connection pool closed');
  }
}

module.exports = {
  execute,
  getConnection,
  closePool,
  oracledb
};
