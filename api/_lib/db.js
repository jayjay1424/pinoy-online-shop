import pg from 'pg';
import { hashPassword } from './security.js';
import { PRODUCTS } from '../../src/data/products.js';

const { Pool } = pg;

// Read PostgreSQL connection string from standard Vercel / Neon / Supabase environment variables
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;
let isInitialized = false;

// Fallback in-memory store for local development or previews without configured database
const inMemoryStore = {
  users: [],
  addresses: [],
  orders: [],
  products: [...PRODUCTS],
  password_resets: [],
};

// Seed demo account into fallback store
async function seedDefaultDemo() {
  if (inMemoryStore.users.length === 0) {
    const demoHash = await hashPassword('password123');
    const demoUser = {
      id: 1,
      name: 'Doña Maria Clara de los Santos',
      email: 'maria.clara@likha-atelier.com',
      phone: '+63 917 555 1887',
      password_hash: demoHash,
      tier: 'Kliyente de Honor • Likha Circle',
      created_at: new Date('2026-01-15T00:00:00Z'),
      updated_at: new Date(),
    };
    inMemoryStore.users.push(demoUser);

    inMemoryStore.addresses.push({
      id: 1,
      user_id: 1,
      label: 'Forbes Park Villa',
      recipient: 'Doña Maria Clara',
      phone: '+63 917 555 1887',
      street: 'Cambridge Circle, Forbes Park',
      city: 'Makati City',
      province: 'Metro Manila',
      postal: '1219',
      is_default: true,
      created_at: new Date(),
    });

    inMemoryStore.orders.push({
      id: 1,
      order_number: 'LKH-2026-8812',
      serial_key: 'BAYONG-012/030-8812',
      user_id: 1,
      client_name: 'Doña Maria Clara de los Santos',
      client_email: 'maria.clara@likha-atelier.com',
      client_phone: '+63 917 555 1887',
      client_address: 'Cambridge Circle, Forbes Park, Makati City',
      items: [
        {
          name: 'Bayong Royale (Sun-Dried Pandan)',
          price: 48500,
          currency: 'PHP',
          monogram: 'MC',
        },
      ],
      packaging: { packagingType: 'Kamagong Crate', giftNote: 'Heirloom Reserve' },
      subtotal: 48500,
      currency: 'PHP',
      paymode: 'GCash Express (QR Ph)',
      status: 'PAID_AND_ALLOCATED',
      created_at: new Date('2026-02-14T00:00:00Z'),
    });
  }
}

/**
 * Initialize connection pool to PostgreSQL
 */
export function getPool() {
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }

  return pool;
}

/**
 * Ensure database schema (tables, foreign keys, and indexes) exists in PostgreSQL
 */
export async function initDatabase() {
  if (isInitialized) return;

  const db = getPool();
  if (!db) {
    await seedDefaultDemo();
    isInitialized = true;
    return;
  }

  const client = await db.connect();
  try {
    await client.query(`
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

      -- 2. Addresses Table
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

      -- 3. Orders Table
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

      -- 4. Products Table
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

      -- 5. Password Resets Table
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Performance & Security Indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
      CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
      CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
    `);

    // Seed default VIP demo account if not exists
    const existing = await client.query('SELECT id FROM users WHERE email = $1', ['maria.clara@likha-atelier.com']);
    if (existing.rows.length === 0) {
      const demoHash = await hashPassword('password123');
      const userRes = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, tier)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          'Doña Maria Clara de los Santos',
          'maria.clara@likha-atelier.com',
          '+63 917 555 1887',
          demoHash,
          'Kliyente de Honor • Likha Circle',
        ]
      );

      const userId = userRes.rows[0].id;

      await client.query(
        `INSERT INTO addresses (user_id, label, recipient, phone, street, city, province, postal, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          'Forbes Park Villa',
          'Doña Maria Clara',
          '+63 917 555 1887',
          'Cambridge Circle, Forbes Park',
          'Makati City',
          'Metro Manila',
          '1219',
          true,
        ]
      );

      await client.query(
        `INSERT INTO orders (order_number, serial_key, user_id, client_name, client_email, client_phone, client_address, items, packaging, subtotal, currency, paymode, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          'LKH-2026-8812',
          'BAYONG-012/030-8812',
          userId,
          'Doña Maria Clara de los Santos',
          'maria.clara@likha-atelier.com',
          '+63 917 555 1887',
          'Cambridge Circle, Forbes Park, Makati City',
          JSON.stringify([
            {
              name: 'Bayong Royale (Sun-Dried Pandan)',
              price: 48500,
              currency: 'PHP',
              monogram: 'MC',
            },
          ]),
          JSON.stringify({ packagingType: 'Kamagong Crate', giftNote: 'Heirloom Reserve' }),
          48500,
          'PHP',
          'GCash Express (QR Ph)',
          'PAID_AND_ALLOCATED',
        ]
      );
    }

    // Seed default heritage products if table is empty or missing any default masterworks
    const prodCountRes = await client.query('SELECT count(*) as count FROM products');
    const existingCount = Number(prodCountRes.rows[0]?.count || 0);
    if (existingCount === 0) {
      for (const p of PRODUCTS) {
        await client.query(
          `INSERT INTO products (
            id, name, subtitle, collection, tagline, price_php, edition, batch_remaining,
            stock_status, lead_time, region, artisan_cooperative, artisan_master,
            fair_trade_percentage, has_3d_model, model_type, model_glb_url, image,
            description, specs, materials, camera_presets
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
          ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.name,
            p.subtitle || '',
            p.collection || 'Kasuotan & Sutla',
            p.tagline || '',
            p.pricePHP || 45000,
            p.edition || 'Edisyon Limitado',
            p.batchRemaining ?? 3,
            p.stockStatus || 'available',
            p.leadTime || 'Handcrafted',
            p.region || 'Philippines',
            p.artisanCooperative || 'Artisan Cooperative',
            p.artisanMaster || 'Master Artisan',
            p.fairTradePercentage ?? 45,
            p.has3DModel ?? false,
            p.modelType || 'bayong',
            p.modelGlbUrl || '',
            p.image || '',
            p.description || '',
            JSON.stringify(p.specs || []),
            JSON.stringify(p.materials || []),
            JSON.stringify(p.cameraPresets || []),
          ]
        );
      }
    } else {
      // Clean up any test barong products if present
      await client.query("DELETE FROM products WHERE id IN ('barong-ilustrado', 'barong-dalisay')");
    }

    isInitialized = true;
  } catch (err) {
    console.error('[PostgreSQL Init Schema Error]:', err.message);
  } finally {
    client.release();
  }
}

/**
 * Execute a secure parameterized SQL query with automatic schema initialization
 * @param {string} text SQL statement with $1, $2 placeholders
 * @param {Array} params Parameter values
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
export async function query(text, params = []) {
  await initDatabase();
  const db = getPool();

  if (db) {
    return db.query(text, params);
  }

  // Fallback in-memory handler for offline / pre-configured environments
  return handleInMemoryQuery(text, params);
}

/**
 * In-memory SQL emulator for seamless local dev when DATABASE_URL is not set
 */
function handleInMemoryQuery(text, params) {
  const normalized = text.trim().toLowerCase();

  // 1. SELECT user by email
  if (normalized.startsWith('select') && normalized.includes('from users where email =')) {
    const email = params[0]?.toLowerCase();
    const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === email);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  // 2. SELECT user by id
  if (normalized.startsWith('select') && normalized.includes('from users where id =')) {
    const id = Number(params[0]);
    const user = inMemoryStore.users.find((u) => u.id === id);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  // 3. INSERT into users
  if (normalized.startsWith('insert into users')) {
    const newUser = {
      id: inMemoryStore.users.length + 1,
      name: params[0],
      email: params[1],
      phone: params[2],
      password_hash: params[3],
      tier: params[4] || 'Kliyente de Honor • Likha Circle',
      created_at: new Date(),
      updated_at: new Date(),
    };
    inMemoryStore.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // 4. UPDATE users (password or profile)
  if (normalized.startsWith('update users')) {
    const id = Number(params[params.length - 1]);
    const user = inMemoryStore.users.find((u) => u.id === id);
    if (user) {
      if (normalized.includes('password_hash =')) {
        user.password_hash = params[0];
      }
      if (normalized.includes('name =')) {
        user.name = params[0];
        user.phone = params[1];
      }
      user.updated_at = new Date();
      return { rows: [user], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. SELECT addresses by user_id
  if (normalized.startsWith('select') && normalized.includes('from addresses where user_id =')) {
    const userId = Number(params[0]);
    const list = inMemoryStore.addresses.filter((a) => a.user_id === userId);
    return { rows: list, rowCount: list.length };
  }

  // 6. INSERT into addresses
  if (normalized.startsWith('insert into addresses')) {
    const newAddress = {
      id: inMemoryStore.addresses.length + 1,
      user_id: Number(params[0]),
      label: params[1],
      recipient: params[2],
      phone: params[3],
      street: params[4],
      city: params[5],
      province: params[6],
      postal: params[7],
      is_default: Boolean(params[8]),
      created_at: new Date(),
    };
    inMemoryStore.addresses.push(newAddress);
    return { rows: [newAddress], rowCount: 1 };
  }

  // 7. SELECT orders by user_id
  if (normalized.startsWith('select') && normalized.includes('from orders where user_id =')) {
    const userId = Number(params[0]);
    const list = inMemoryStore.orders.filter((o) => o.user_id === userId);
    return { rows: list, rowCount: list.length };
  }

  // 8. INSERT into orders
  if (normalized.startsWith('insert into orders')) {
    const newOrder = {
      id: inMemoryStore.orders.length + 1,
      order_number: params[0],
      serial_key: params[1],
      user_id: params[2] ? Number(params[2]) : null,
      client_name: params[3],
      client_email: params[4],
      client_phone: params[5],
      client_address: params[6],
      items: typeof params[7] === 'string' ? JSON.parse(params[7]) : params[7],
      packaging: typeof params[8] === 'string' ? JSON.parse(params[8]) : params[8],
      subtotal: Number(params[9]),
      currency: params[10],
      paymode: params[11],
      status: params[12] || 'PAID_AND_ALLOCATED',
      created_at: new Date(),
    };
    inMemoryStore.orders.push(newOrder);
    return { rows: [newOrder], rowCount: 1 };
  }

  // 9. SELECT products
  if (normalized.startsWith('select') && normalized.includes('from products')) {
    if (normalized.includes('where id =')) {
      const id = params[0];
      const prod = inMemoryStore.products.find((p) => p.id === id);
      return { rows: prod ? [{ ...prod }] : [], rowCount: prod ? 1 : 0 };
    }
    return { rows: [...inMemoryStore.products], rowCount: inMemoryStore.products.length };
  }

  // 10. INSERT into products (upsert)
  if (normalized.startsWith('insert into products')) {
    const newProduct = {
      id: params[0],
      name: params[1],
      subtitle: params[2],
      collection: params[3],
      tagline: params[4],
      pricePHP: Number(params[5]),
      edition: params[6],
      batchRemaining: Number(params[7]),
      stockStatus: params[8] || 'available',
      leadTime: params[9],
      region: params[10],
      artisanCooperative: params[11],
      artisanMaster: params[12],
      fairTradePercentage: Number(params[13]),
      has3DModel: Boolean(params[14]),
      modelType: params[15],
      modelGlbUrl: params[16],
      image: params[17],
      description: params[18],
      specs: typeof params[19] === 'string' ? JSON.parse(params[19] || '[]') : params[19],
      materials: typeof params[20] === 'string' ? JSON.parse(params[20] || '[]') : params[20],
      cameraPresets: typeof params[21] === 'string' ? JSON.parse(params[21] || '[]') : params[21],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const existingIdx = inMemoryStore.products.findIndex((p) => p.id === newProduct.id);
    if (existingIdx >= 0) {
      inMemoryStore.products[existingIdx] = newProduct;
    } else {
      inMemoryStore.products.push(newProduct);
    }

    return { rows: [newProduct], rowCount: 1 };
  }

  // 11. UPDATE products
  if (normalized.startsWith('update products')) {
    const id = params[params.length - 1];
    const existingIdx = inMemoryStore.products.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      const updated = {
        ...inMemoryStore.products[existingIdx],
        name: params[0],
        subtitle: params[1],
        collection: params[2],
        tagline: params[3],
        pricePHP: Number(params[4]),
        edition: params[5],
        batchRemaining: Number(params[6]),
        stockStatus: params[7],
        leadTime: params[8],
        region: params[9],
        artisanCooperative: params[10],
        artisanMaster: params[11],
        fairTradePercentage: Number(params[12]),
        has3DModel: Boolean(params[13]),
        modelType: params[14],
        modelGlbUrl: params[15],
        image: params[16],
        description: params[17],
        specs: typeof params[18] === 'string' ? JSON.parse(params[18] || '[]') : params[18],
        materials: typeof params[19] === 'string' ? JSON.parse(params[19] || '[]') : params[19],
        updated_at: new Date(),
      };
      inMemoryStore.products[existingIdx] = updated;
      return { rows: [updated], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 12. DELETE from products
  if (normalized.startsWith('delete from products where id =')) {
    const id = params[0];
    const initialLen = inMemoryStore.products.length;
    inMemoryStore.products = inMemoryStore.products.filter((p) => p.id !== id);
    return { rows: [], rowCount: initialLen - inMemoryStore.products.length };
  }

  // 13. INSERT into password_resets
  if (normalized.startsWith('insert into password_resets')) {
    const newReset = {
      id: inMemoryStore.password_resets.length + 1,
      email: (params[0] || '').toLowerCase(),
      code: (params[1] || '').trim(),
      user_id: params[2],
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
      created_at: new Date(),
    };
    inMemoryStore.password_resets.push(newReset);
    return { rows: [newReset], rowCount: 1 };
  }

  // 14. SELECT from password_resets
  if (normalized.startsWith('select') && normalized.includes('from password_resets')) {
    const email = (params[0] || '').toLowerCase();
    const code = (params[1] || '').trim();
    const now = Date.now();
    const matches = inMemoryStore.password_resets.filter(
      (r) => r.email === email && (!code || r.code === code) && new Date(r.expires_at).getTime() > now
    );
    const sorted = matches.sort((a, b) => b.id - a.id);
    return { rows: sorted.slice(0, 1), rowCount: sorted.length > 0 ? 1 : 0 };
  }

  // 15. DELETE from password_resets
  if (normalized.startsWith('delete from password_resets')) {
    const email = (params[0] || '').toLowerCase();
    const initialLen = inMemoryStore.password_resets.length;
    inMemoryStore.password_resets = inMemoryStore.password_resets.filter((r) => r.email !== email);
    return { rows: [], rowCount: initialLen - inMemoryStore.password_resets.length };
  }

  // Default fallback
  return { rows: [], rowCount: 0 };
}

