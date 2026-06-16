require('dotenv').config();
const oracledb = require('oracledb');

async function test() {
  try {
    oracledb.initOracleClient();

    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    console.log('Connected to Oracle');

    // 1. Vérifier si la colonne existe déjà
    console.log('\n=== 1. Vérifier si DELIVERY_TIME existe ===');
    try {
      const result = await connection.execute(
        `SELECT column_name FROM user_tab_columns WHERE table_name = 'ORDERS' AND column_name = 'DELIVERY_TIME'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (result.rows.length > 0) {
        console.log('DELIVERY_TIME existe déjà');
      } else {
        console.log('DELIVERY_TIME n existe pas');
      }
    } catch (err) {
      console.log('Erreur:', err.message);
    }

    // 2. Ajouter la colonne
    console.log('\n=== 2. Ajouter la colonne ===');
    try {
      await connection.execute(
        `ALTER TABLE orders ADD (delivery_time VARCHAR2(10))`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true }
      );
      console.log('Colonne ajoutée avec succès');
    } catch (err) {
      console.log('Erreur:', err.message);
    }

    // 3. Vérifier que la colonne existe maintenant
    console.log('\n=== 3. Vérifier que la colonne existe ===');
    try {
      const result = await connection.execute(
        `SELECT column_name FROM user_tab_columns WHERE table_name = 'ORDERS' AND column_name = 'DELIVERY_TIME'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (result.rows.length > 0) {
        console.log('DELIVERY_TIME existe maintenant');
      } else {
        console.log('DELIVERY_TIME nexiste toujours pas');
      }
    } catch (err) {
      console.log('Erreur:', err.message);
    }

    // 4. Tester l'INSERT avec delivery_time
    console.log('\n=== 4. Tester INSERT avec delivery_time ===');
    try {
      const result = await connection.execute(
        `INSERT INTO orders (order_type, client_name, client_phone, delivery_time)
         VALUES (:order_type, :client_name, :client_phone, :delTime)
         RETURNING id INTO :id`,
        {
          order_type: 'online',
          client_name: 'Test Delivery',
          client_phone: '0340000000',
          delTime: '15:30',
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true }
      );
      console.log('INSERT SUCCESS! ID:', result.outBinds.id[0]);
    } catch (err) {
      console.log('INSERT FAILED:', err.message);
    }

    // 5. Vérifier que l'insert a fonctionné
    console.log('\n=== 5. Vérifier les données ===');
    try {
      const result = await connection.execute(
        `SELECT id, order_type, client_name, delivery_time FROM orders WHERE delivery_time = '15:30'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (result.rows.length > 0) {
        console.log('Données trouvées:', result.rows);
      } else {
        console.log('Aucune donnée trouvée');
      }
    } catch (err) {
      console.log('Erreur:', err.message);
    }

    await connection.close();
    console.log('\n=== Terminé ===');
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
