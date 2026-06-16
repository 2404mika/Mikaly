-- Migration: Ajouter la colonne delivery_time à la table orders
-- Date: 2024

ALTER TABLE orders ADD (
  delivery_time VARCHAR2(10)
);
