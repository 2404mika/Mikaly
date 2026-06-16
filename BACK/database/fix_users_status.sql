-- Script pour corriger tous les comptes existants avec status != 'active'
-- Exécuter ce script sur Oracle DB pour activer tous les comptes

UPDATE users SET status = 'active' WHERE status != 'active';
COMMIT;

-- Vérification
SELECT id, name, email, role, status FROM users;
