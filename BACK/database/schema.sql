-- =============================================
-- SmartRestaurant - Oracle Database Schema
-- Schéma complet de la base de données : 9 tables (users, categories, meals, tables,
-- orders, order_items, payments, reservations, reviews), séquences, triggers,
-- index, vues et données de test (catégories, tables, admin).
-- =============================================

-- Suppression des tables si elles existent
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE reviews CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE order_items CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE orders CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE payments CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE reservations CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE meals CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE categories CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE tables CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE user_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE category_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE meal_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE table_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE order_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE order_item_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE payment_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE reservation_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE review_seq';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- =============================================
-- TABLE: users
-- =============================================
CREATE TABLE users (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  email VARCHAR2(150) UNIQUE NOT NULL,
  password VARCHAR2(255) NOT NULL,
  phone VARCHAR2(20),
  role VARCHAR2(20) NOT NULL CHECK (role IN ('client', 'admin', 'cook', 'delivery', 'cashier')),
  status VARCHAR2(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  address VARCHAR2(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT user_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER users_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLE: categories
-- =============================================
CREATE TABLE categories (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  description VARCHAR2(500),
  image VARCHAR2(255),
  status VARCHAR2(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  display_order NUMBER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE category_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER categories_before_insert
BEFORE INSERT ON categories
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT category_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER categories_before_update
BEFORE UPDATE ON categories
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLE: meals
-- =============================================
CREATE TABLE meals (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(150) NOT NULL,
  description VARCHAR2(1000),
  price NUMBER(10, 2) NOT NULL CHECK (price >= 0),
  image VARCHAR2(255),
  category_id NUMBER NOT NULL,
  status VARCHAR2(20) DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
  is_featured NUMBER(1) DEFAULT 0 CHECK (is_featured IN (0, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_meals_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE SEQUENCE meal_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER meals_before_insert
BEFORE INSERT ON meals
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT meal_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER meals_before_update
BEFORE UPDATE ON meals
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLE: tables
-- =============================================
CREATE TABLE tables (
  id NUMBER PRIMARY KEY,
  table_number VARCHAR2(20) UNIQUE NOT NULL,
  capacity NUMBER NOT NULL CHECK (capacity > 0),
  status VARCHAR2(20) DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved')),
  qr_code VARCHAR2(255),
  location VARCHAR2(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE table_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER tables_before_insert
BEFORE INSERT ON tables
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT table_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER tables_before_update
BEFORE UPDATE ON tables
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLE: orders
-- =============================================
CREATE TABLE orders (
  id NUMBER PRIMARY KEY,
  order_type VARCHAR2(20) NOT NULL CHECK (order_type IN ('dine_in', 'online', 'takeaway')),
  status VARCHAR2(30) DEFAULT 'received' CHECK (status IN (
    'received',
    'preparing',
    'ready',
    'served',
    'delivered',
    'cancelled',
    'paid'
  )),
  user_id NUMBER,
  table_id NUMBER,
  client_name VARCHAR2(100),
  client_phone VARCHAR2(20),
  delivery_address VARCHAR2(500),
  delivery_time VARCHAR2(10),
  delivery_fee NUMBER(10, 2) DEFAULT 0,
  subtotal NUMBER(10, 2) DEFAULT 0,
  total NUMBER(10, 2) DEFAULT 0,
  notes VARCHAR2(500),
  session_id VARCHAR2(100),
  cook_id NUMBER,
  delivery_id NUMBER,
  cashier_id NUMBER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ready_at TIMESTAMP,
  delivered_at TIMESTAMP,
  paid_at TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_cook FOREIGN KEY (cook_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_delivery FOREIGN KEY (delivery_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_cashier FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE SEQUENCE order_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER orders_before_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT order_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER orders_before_update
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLE: order_items
-- =============================================
CREATE TABLE order_items (
  id NUMBER PRIMARY KEY,
  order_id NUMBER NOT NULL,
  meal_id NUMBER NOT NULL,
  quantity NUMBER NOT NULL CHECK (quantity > 0),
  unit_price NUMBER(10, 2) NOT NULL,
  total_price NUMBER(10, 2) NOT NULL,
  notes VARCHAR2(255),
  status VARCHAR2(30) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'preparing',
    'ready',
    'served',
    'cancelled'
  )),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_meal FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

CREATE SEQUENCE order_item_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER order_items_before_insert
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT order_item_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER order_items_before_update
BEFORE UPDATE ON order_items
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLE: payments
-- =============================================
CREATE TABLE payments (
  id NUMBER PRIMARY KEY,
  order_id NUMBER NOT NULL,
  amount NUMBER(10, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR2(30) NOT NULL CHECK (payment_method IN ('cash', 'mobile_money', 'card')),
  amount_received NUMBER(10, 2) NOT NULL,
  change_amount NUMBER(10, 2) DEFAULT 0,
  status VARCHAR2(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  transaction_ref VARCHAR2(100),
  cashier_id NUMBER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_cashier FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE SEQUENCE payment_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER payments_before_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT payment_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

-- =============================================
-- TABLE: reservations
-- =============================================
CREATE TABLE reservations (
  id NUMBER PRIMARY KEY,
  client_name VARCHAR2(100) NOT NULL,
  client_phone VARCHAR2(20) NOT NULL,
  client_email VARCHAR2(150),
  reservation_date DATE NOT NULL,
  reservation_time VARCHAR2(10) NOT NULL,
  number_of_guests NUMBER NOT NULL CHECK (number_of_guests > 0),
  table_id NUMBER,
  status VARCHAR2(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes VARCHAR2(500),
  user_id NUMBER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservations_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE SEQUENCE reservation_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER reservations_before_insert
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT reservation_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER reservations_before_update
BEFORE UPDATE ON reservations
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- =============================================
-- TABLE: reviews
-- =============================================
CREATE TABLE reviews (
  id NUMBER PRIMARY KEY,
  order_id NUMBER NOT NULL,
  user_id NUMBER,
  rating NUMBER(1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment_text VARCHAR2(1000),
  status VARCHAR2(20) DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE SEQUENCE review_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER reviews_before_insert
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT review_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_meals_category ON meals(category_id);
CREATE INDEX idx_meals_status ON meals(status);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_reviews_order ON reviews(order_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue pour les commandes avec détails
CREATE OR REPLACE VIEW v_orders_details AS
SELECT 
  o.*,
  u.name AS client_name_user,
  t.table_number,
  c.name AS cook_name,
  d.name AS delivery_name,
  ca.name AS cashier_name
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN users c ON o.cook_id = c.id
LEFT JOIN users d ON o.delivery_id = d.id
LEFT JOIN users ca ON o.cashier_id = ca.id;

-- Vue pour les statistiques
CREATE OR REPLACE VIEW v_daily_stats AS
SELECT 
  TRUNC(created_at) AS order_date,
  COUNT(*) AS total_orders,
  SUM(CASE WHEN order_type = 'dine_in' THEN 1 ELSE 0 END) AS dine_in_orders,
  SUM(CASE WHEN order_type = 'online' THEN 1 ELSE 0 END) AS online_orders,
  SUM(CASE WHEN order_type = 'takeaway' THEN 1 ELSE 0 END) AS takeaway_orders,
  SUM(total) AS total_revenue,
  AVG(total) AS avg_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY TRUNC(created_at);

-- =============================================
-- DONNEES DE TEST
-- =============================================

-- Categories
INSERT INTO categories (name, description, display_order) VALUES ('Entrées', 'Légères et savoureuses pour débuter', 1);
INSERT INTO categories (name, description, display_order) VALUES ('Plats principaux', 'Le cœur de notre menu culinaire', 2);
INSERT INTO categories (name, description, display_order) VALUES ('Desserts', 'Une note sucrée pour conclure', 3);
INSERT INTO categories (name, description, display_order) VALUES ('Boissons', 'Vins, cocktails et rafraîchissements', 4);

-- Admin par défaut (mot de passe: admin123 - à hasher avec bcrypt)
INSERT INTO users (name, email, password, phone, role, status) 
VALUES ('Admin', 'admin@smartrestaurant.com', '$2a$10$YourHashedPasswordHere', '+261340000000', 'admin', 'active');

-- Tables
INSERT INTO tables (table_number, capacity, location) VALUES ('T1', 2, 'Salle principale');
INSERT INTO tables (table_number, capacity, location) VALUES ('T2', 4, 'Salle principale');
INSERT INTO tables (table_number, capacity, location) VALUES ('T3', 6, 'Terrasse');
INSERT INTO tables (table_number, capacity, location) VALUES ('T4', 2, 'Terrasse');
INSERT INTO tables (table_number, capacity, location) VALUES ('T5', 8, 'Salle VIP');

COMMIT;
