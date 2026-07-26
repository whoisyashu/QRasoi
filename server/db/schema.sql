-- =======================================================
-- QRasoi Production Database Schema (Supabase / PostgreSQL)
-- WITH ROW LEVEL SECURITY (RLS) POLICIES ENABLED
-- =======================================================

-- 1. CLEAN REBUILD: DROP EXISTING TABLES
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- 2. RESTAURANTS TABLE
CREATE TABLE restaurants (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) DEFAULT 'Simple Digital Menu',
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    cuisine VARCHAR(100) DEFAULT 'Multi-Cuisine',
    opening_hours VARCHAR(100) DEFAULT '10:00 AM - 11:00 PM',
    logo_url TEXT DEFAULT '',
    cover_image_url TEXT DEFAULT '',
    order_timeout_minutes INT DEFAULT 15,
    qr_code_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- 3. USERS TABLE (Owners, Chefs, Admins)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) REFERENCES restaurants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('owner', 'chef', 'admin')),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_restaurant_role ON users(restaurant_id, role);

-- 4. CATEGORIES TABLE
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'utensils',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);

-- 5. MENU ITEMS TABLE
CREATE TABLE menu_items (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    dietary VARCHAR(20) DEFAULT 'veg' CHECK (dietary IN ('veg', 'non-veg', 'egg')),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    preparation_time_minutes INT DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);

-- 6. ORDERS TABLE
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    restaurant_id VARCHAR(64) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled', 'expired')),
    is_payment_verified BOOLEAN DEFAULT FALSE,
    estimated_time_minutes INT DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 7. ORDER ITEMS TABLE
CREATE TABLE order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(64) REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    notes TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =======================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- =======================================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon/Service Role to read & write required resources
CREATE POLICY "Allow public read access to restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Allow service role full access to restaurants" ON restaurants FOR ALL USING (true);

CREATE POLICY "Allow service role full access to users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow service role full access to categories" ON categories FOR ALL USING (true);

CREATE POLICY "Allow public read access to menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow service role full access to menu_items" ON menu_items FOR ALL USING (true);

CREATE POLICY "Allow public read & insert access to orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow public read & insert access to order_items" ON order_items FOR ALL USING (true);
