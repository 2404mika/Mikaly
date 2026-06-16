-- Script pour ajouter la colonne delivery_time à la table orders
-- Exécuter ce script dans SQL*Plus connecté avec le même utilisateur que .env

-- 1. Vérifier si la colonne existe déjà
SELECT column_name, data_type
FROM user_tab_columns
WHERE table_name = 'ORDERS' AND column_name = 'DELIVERY_TIME';

-- 2. Si elle n'existe pas, l'ajouter
ALTER TABLE orders ADD (delivery_time VARCHAR2(10));

-- 3. Valider
COMMIT;

-- 4. Vérifier que la colonne existe maintenant
SELECT column_name, data_type
FROM user_tab_columns
WHERE table_name = 'ORDERS' AND column_name = 'DELIVERY_TIME';

-- 5. Tester l'insertion
INSERT INTO orders (order_type, client_name, client_phone, delivery_time)
VALUES ('online', 'Test', '0340000000', '12:30');

COMMIT;

-- 6. Vérifier que l'insertion a fonctionné
SELECT id, order_type, client_name, delivery_time
FROM orders
WHERE delivery_time = '12:30';
