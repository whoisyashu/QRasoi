-- QRasoi Database Schema Performance & Indexing Optimization Script
-- Execute this script in Supabase SQL Editor to apply database-level optimizations

-- 1. Index for Owner Orders Query: Filter by restaurant_id and sort by created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_rest_created ON orders (restaurant_id, created_at DESC);

-- 2. Index for Chef KDS Query: Filter by restaurant_id, payment verification status, and order status
CREATE INDEX IF NOT EXISTS idx_orders_kds ON orders (restaurant_id, is_payment_verified, status);

-- 3. Index for Foreign Key joins on order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- 4. Add explicit 'status' column to order_items table if it does not exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'preparing';

-- 5. Index on order_items status column for kitchen queue filtering
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items (status);

-- 6. Index for Menu Items lookup by restaurant_id
CREATE INDEX IF NOT EXISTS idx_menu_items_rest ON menu_items (restaurant_id);

-- 7. Index for Categories lookup by restaurant_id
CREATE INDEX IF NOT EXISTS idx_categories_rest ON categories (restaurant_id);

-- 8. Index for Public Menu lookup by restaurant slug
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants (slug);

-- 9. Index for User Authentication lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
