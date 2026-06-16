-- =============================================
-- DONNÉES DE TEST - Mik'Aly Restaurant
-- Exécuter ce script sur Oracle DB
-- =============================================

-- Vérifier les catégories existantes
-- Catégorie 1: Entrées
-- Catégorie 2: Plats principaux
-- Catégorie 3: Desserts
-- Catégorie 4: Boissons

-- =============================================
-- REPAS - ENTRÉES
-- =============================================
INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Coquilles St-Jacques', 'Noix de Saint-Jacques poêlées, purée de petits pois à la menthe, éclats de noisettes torréfiées et émulsion au citron yuzu.', 25000, 1, 'available', 1);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Burrata Crémeuse', 'Burrata fraîche des Pouilles, tomates d''antan rôties, pesto de basilic maison, pignons de pin et focaccia toastée.', 22000, 1, 'available', 1);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Tartare de Saumon', 'Saumon frais de qualité sashimi, avocat crémeux, mangue exotique, huile de sésame noir et micro-pousses.', 28000, 1, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Velouté de Potimarron', 'Velouté onctueux au potimarron rôti, crème de noisettes, croûtons dorés à l''huile d''olive et herbes fraîches.', 15000, 1, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Carpaccio de Bœuf', 'Tranches fines de bœuf Wagyu, roquette fraîche, copeaux de parmesan, huile de truffe noire et jus de citron vert.', 32000, 1, 'available', 0);

-- =============================================
-- REPAS - PLATS PRINCIPAUX
-- =============================================
INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Burger Signature', 'Bœuf Angus haché minute, cheddar affiné, bacon croustillant, oignons caramélisés, sauce secrète, frites maison au sel de truffe.', 35000, 2, 'available', 1);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Pizza Tartufo', 'Pâte à fermentation lente, crème de truffe noire, fior di latte, champignons sauvages rôtis, roquette fraîche et copeaux de parmesan.', 42000, 2, 'available', 1);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Risotto aux Champignons', 'Risotto carnaroli crémeux, mélange de champignons sauvages, parmesan affiné 24 mois, truffe d''été et beurre noisette.', 38000, 2, 'available', 1);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Filet de Boeuf Rossini', 'Filet de bœuf poêlé, escalope de foie gras pochée, sauce Périgord au truffe, pommes dauphine et haricots verts.', 55000, 2, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Poisson du Jour', 'Poisson frais du marché, cuisson en croûte de sel aux herbes de Provence, légumes de saison et beurre blanc.', 45000, 2, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Canard Confit', 'Cuisse de canard confit 8 heures, pommes sarladaises, salade verte et sauce cerise noire.', 40000, 2, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Couscous Royal', 'Semoule dorée, agneau mijoté, merguez, poulet tandoori, légumes confits et brochettes de veau au four.', 38000, 2, 'available', 0);

-- =============================================
-- REPAS - DESSERTS
-- =============================================
INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Tarte Chocolat Valrhona', 'Pâte sablée croustillante, ganache chocolat noir Valrhona, caramel au beurre salé, feuille d''or et framboise fraîche.', 16000, 3, 'available', 1);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Crème Brûlée Vanille', 'Crème brûlée à la vanille de Madagascar, caramel croustillant et sablés aux amandes.', 12000, 3, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Tiramisu Maison', 'Biscuits imbibés au café espresso, crème mascarpone légère, cacao amer et éclats de chocolat noir.', 14000, 3, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Fondant au Chocolat', 'Chocolat noir 70% cacao, cœur coulant, glace vanille artisanale et sauce framboise maison.', 15000, 3, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Salade de Fruits Exotiques', 'Mangue, litchi, passion, ananas et noix de coco, sirop de menthe fraîche et granité de citron vert.', 10000, 3, 'available', 0);

-- =============================================
-- REPAS - BOISSONS
-- =============================================
INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Cocktail Signature Mik''Aly', 'Rhum blanc, mangue fraîche, jus de passion, lime pressée et grenadine maison, servi avec glaçons artisanaux.', 18000, 4, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Vin Rouge Château Margaux', 'Grand cru classé Bordeaux, notes de cassis, vanille et bois précieux, tanins soyeux et finale persistante.', 85000, 4, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Jus de Fruits Pressé', 'Orange, pomme, ananas ou fruit de la passion, pressé fresh daily, sans sucre ajouté.', 8000, 4, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Eau Minérale Evian', 'Bouteille 50cl, eau de source des Alpes françaises, plate ou pétillante.', 5000, 4, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Café Espresso', 'Café d''exception torréfaction artisanale, aromes intenses et corsés, servi avec un petit four.', 4000, 4, 'available', 0);

INSERT INTO meals (name, description, price, category_id, status, is_featured) 
VALUES ('Smoothie Tropical', 'Mangue, banane, fruits de la passion, lait de coco et miel d''eucalyptus, mixé velouté.', 12000, 4, 'available', 0);

COMMIT;

-- =============================================
-- TABLES DU RESTAURANT
-- =============================================
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T1', 2, 'Salle principale', 'free');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T2', 4, 'Salle principale', 'free');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T3', 6, 'Terrasse', 'free');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T4', 2, 'Terrasse', 'occupied');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T5', 8, 'Salle VIP', 'free');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T6', 4, 'Salle principale', 'free');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T7', 4, 'Terrasse', 'reserved');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T8', 2, 'Bar', 'free');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T9', 6, 'Salle principale', 'free');
INSERT INTO tables (table_number, capacity, location, status) VALUES ('T10', 10, 'Salle VIP', 'free');

COMMIT;

-- Vérification
SELECT COUNT(*) AS total_meals FROM meals WHERE status = 'available';
SELECT COUNT(*) AS total_tables FROM tables;
SELECT m.name, m.price, c.name AS category FROM meals m JOIN categories c ON m.category_id = c.id ORDER BY c.display_order, m.name;
