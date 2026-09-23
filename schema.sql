-- ==============================================================================
-- LIKHA ATELIER — PRODUCTION POSTGRESQL DATABASE SCHEMA (VERCEL EDGE COMPLIANT)
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    tier VARCHAR(100) DEFAULT 'Kliyente de Honor • Likha Circle',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Addresses Table (Delivery Residences)
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(100) DEFAULT 'Residence',
    recipient VARCHAR(255),
    phone VARCHAR(50),
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    postal VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table (Vault Acquisitions & Cryptographic Certificates)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    serial_key VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_address TEXT NOT NULL,
    items JSONB NOT NULL,
    packaging JSONB,
    subtotal NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PHP',
    paymode VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PAID_AND_ALLOCATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table (Atelier Heritage Collection & Admin Inventory)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subtitle TEXT,
    collection VARCHAR(100) NOT NULL,
    tagline TEXT,
    price_php NUMERIC(12, 2) NOT NULL,
    edition VARCHAR(150),
    batch_remaining INTEGER DEFAULT 3,
    stock_status VARCHAR(50) DEFAULT 'available',
    lead_time VARCHAR(150),
    region VARCHAR(150),
    artisan_cooperative VARCHAR(255),
    artisan_master VARCHAR(255),
    fair_trade_percentage INTEGER DEFAULT 45,
    has_3d_model BOOLEAN DEFAULT false,
    model_type VARCHAR(100),
    model_glb_url TEXT,
    image TEXT,
    description TEXT,
    specs JSONB,
    materials JSONB,
    camera_presets JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security & Fast-Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);

