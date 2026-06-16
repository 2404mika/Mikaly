-- Migration: Ajouter 'en_route' au statut des commandes
-- Pour le suivi de livraison: received → preparing → ready → en_route → delivered → paid

-- 1. Supprimer l'ancien CHECK constraint
DECLARE
  v_constraint_name VARCHAR2(100);
BEGIN
  SELECT constraint_name INTO v_constraint_name
  FROM user_constraints
  WHERE table_name = 'ORDERS'
    AND constraint_type = 'C'
    AND search_condition LIKE '%received%preparing%'
    AND ROWNUM = 1;
  
  EXECUTE IMMEDIATE 'ALTER TABLE orders DROP CONSTRAINT ' || v_constraint_name;
  DBMS_OUTPUT.PUT_LINE('Ancien CHECK constraint supprimé: ' || v_constraint_name);
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Erreur: ' || SQLERRM);
END;
/

-- 2. Ajouter le nouveau CHECK constraint avec 'en_route'
ALTER TABLE orders ADD CONSTRAINT chk_orders_status 
  CHECK (status IN ('received', 'preparing', 'ready', 'en_route', 'served', 'delivered', 'cancelled', 'paid'));

DBMS_OUTPUT.PUT_LINE('Nouveau CHECK constraint ajouté avec en_route');

-- Vérification
SELECT constraint_name, search_condition 
FROM user_constraints 
WHERE table_name = 'ORDERS' AND constraint_type = 'C';
