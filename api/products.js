import { query } from './_lib/db.js';
import { getAuthUser, setSecurityHeaders, checkRateLimit, sanitizeInput } from './_lib/security.js';

function mapProductRow(p) {
  if (!p) return null;
  const rawPrice = p.price_php ?? p.pricePHP ?? (p.price && p.price.PHP) ?? 45000;
  const pricePHP = Number(rawPrice) || 45000;

  let specs = [];
  if (Array.isArray(p.specs)) specs = p.specs;
  else if (typeof p.specs === 'string') {
    try { specs = JSON.parse(p.specs); } catch { specs = []; }
  }

  let materials = [];
  if (Array.isArray(p.materials)) materials = p.materials;
  else if (typeof p.materials === 'string') {
    try { materials = JSON.parse(p.materials); } catch { materials = []; }
  }

  let cameraPresets = [];
  const rawPresets = p.camera_presets ?? p.cameraPresets;
  if (Array.isArray(rawPresets)) cameraPresets = rawPresets;
  else if (typeof rawPresets === 'string') {
    try { cameraPresets = JSON.parse(rawPresets); } catch { cameraPresets = []; }
  }

  const batchRemaining = Number(p.batch_remaining ?? p.batchRemaining ?? 3);
  const stockStatus = p.stock_status ?? p.stockStatus ?? (batchRemaining === 0 ? 'archived' : 'available');
  const has3DModel = Boolean(p.has_3d_model ?? p.has3DModel ?? !!(p.model_type || p.modelType));
  const modelType = p.model_type ?? p.modelType ?? 'bayong';
  const modelGlbUrl = p.model_glb_url ?? p.modelGlbUrl ?? '';

  return {
    id: p.id,
    name: p.name || 'Artisanal Masterwork',
    subtitle: p.subtitle || '',
    collection: p.collection || 'Habi & Dahon',
    tagline: p.tagline || '',
    pricePHP,
    price_php: pricePHP,
    price: {
      PHP: pricePHP,
      USD: Math.round(pricePHP * 0.0177),
      EUR: Math.round(pricePHP * 0.0163),
      JPY: Math.round(pricePHP * 2.72),
      GBP: Math.round(pricePHP * 0.014),
      SGD: Math.round(pricePHP * 0.024),
      CHF: Math.round(pricePHP * 0.015),
    },
    edition: p.edition || 'Edisyon Limitado',
    batchRemaining,
    batch_remaining: batchRemaining,
    stockStatus,
    stock_status: stockStatus,
    leadTime: p.lead_time ?? p.leadTime ?? 'Handcrafted in 18 days',
    lead_time: p.lead_time ?? p.leadTime ?? 'Handcrafted in 18 days',
    region: p.region || 'Philippine Archipelago',
    artisanCooperative: p.artisan_cooperative ?? p.artisanCooperative ?? 'Master Heritage Artisans Collective',
    artisan_cooperative: p.artisan_cooperative ?? p.artisanCooperative ?? 'Master Heritage Artisans Collective',
    artisanMaster: p.artisan_master ?? p.artisanMaster ?? 'Master Artisan',
    artisan_master: p.artisan_master ?? p.artisanMaster ?? 'Master Artisan',
    fairTradePercentage: Number(p.fair_trade_percentage ?? p.fairTradePercentage ?? 45),
    fair_trade_percentage: Number(p.fair_trade_percentage ?? p.fairTradePercentage ?? 45),
    has3DModel,
    has_3d_model: has3DModel,
    modelType,
    model_type: modelType,
    modelGlbUrl,
    model_glb_url: modelGlbUrl,
    image: p.image || '',
    description: p.description || '',
    specs,
    materials,
    cameraPresets,
    camera_presets: cameraPresets,
  };
}

export default async function handler(req, res) {
  setSecurityHeaders(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limit: 120 product catalog requests per 15 minutes per IP
  if (!checkRateLimit(req, res, { maxAttempts: 120, windowMs: 15 * 60 * 1000, keyPrefix: 'products' })) {
    return;
  }

  try {
    // -------------------------------------------------------------
    // 1. GET: Fetch all products or single product by query ?id=
    // -------------------------------------------------------------
    if (req.method === 'GET') {
      const { id, collection } = req.query || {};

      if (id) {
        const result = await query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        return res.status(200).json({ success: true, product: mapProductRow(result.rows[0]) });
      }

      const result = await query('SELECT * FROM products ORDER BY created_at DESC');
      let products = result.rows.map(mapProductRow);

      if (collection && collection !== 'All') {
        products = products.filter(
          (p) => (p.collection || '').toLowerCase() === collection.toLowerCase()
        );
      }

      return res.status(200).json({
        success: true,
        count: products.length,
        products: products,
        data: products,
      });
    }

    // -------------------------------------------------------------
    // 2. POST: Create a new heritage piece (Admin CRUD)
    // -------------------------------------------------------------
    if (req.method === 'POST') {
      const payload = req.body || {};
      const {
        name,
        subtitle,
        collection,
        tagline,
        edition,
        batchRemaining,
        stockStatus,
        leadTime,
        region,
        artisanCooperative,
        artisanMaster,
        fairTradePercentage,
        has3DModel,
        modelType,
        modelGlbUrl,
        image,
        description,
        specs,
        materials,
        cameraPresets,
      } = payload;

      const rawPrice = payload.pricePHP ?? payload.price_php ?? (payload.price && payload.price.PHP) ?? 45000;
      const pricePHP = Number(rawPrice);

      if (!name || !collection) {
        return res.status(400).json({ error: 'Name and collection are required.' });
      }

      const id = payload.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const insertRes = await query(
        `INSERT INTO products (
          id, name, subtitle, collection, tagline, price_php, edition, batch_remaining,
          stock_status, lead_time, region, artisan_cooperative, artisan_master,
          fair_trade_percentage, has_3d_model, model_type, model_glb_url, image,
          description, specs, materials, camera_presets
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) 
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          subtitle = EXCLUDED.subtitle,
          collection = EXCLUDED.collection,
          tagline = EXCLUDED.tagline,
          price_php = EXCLUDED.price_php,
          edition = EXCLUDED.edition,
          batch_remaining = EXCLUDED.batch_remaining,
          stock_status = EXCLUDED.stock_status,
          lead_time = EXCLUDED.lead_time,
          region = EXCLUDED.region,
          artisan_cooperative = EXCLUDED.artisan_cooperative,
          artisan_master = EXCLUDED.artisan_master,
          fair_trade_percentage = EXCLUDED.fair_trade_percentage,
          has_3d_model = EXCLUDED.has_3d_model,
          model_type = EXCLUDED.model_type,
          model_glb_url = EXCLUDED.model_glb_url,
          image = EXCLUDED.image,
          description = EXCLUDED.description,
          specs = EXCLUDED.specs,
          materials = EXCLUDED.materials,
          camera_presets = EXCLUDED.camera_presets,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [
          id,
          name.trim(),
          subtitle?.trim() || '',
          collection.trim(),
          tagline?.trim() || '',
          pricePHP,
          edition?.trim() || 'Edisyon Limitado',
          Number(batchRemaining || 3),
          stockStatus || 'available',
          leadTime?.trim() || 'Handcrafted over 14 days',
          region?.trim() || 'Philippine Archipelago',
          artisanCooperative?.trim() || 'Master Philippine Guild',
          artisanMaster?.trim() || 'Master Artisan',
          Number(fairTradePercentage || 45),
          Boolean(has3DModel),
          modelType?.trim() || 'bayong',
          modelGlbUrl?.trim() || '',
          image || '',
          description?.trim() || '',
          JSON.stringify(specs || []),
          JSON.stringify(materials || []),
          JSON.stringify(cameraPresets || []),
        ]
      );

      const product = mapProductRow(insertRes.rows[0]);

      return res.status(201).json({
        success: true,
        message: 'Masterwork created and cataloged in PostgreSQL.',
        product,
      });
    }

    // -------------------------------------------------------------
    // 3. PUT: Update an existing piece (Admin CRUD)
    // -------------------------------------------------------------
    if (req.method === 'PUT') {
      const payload = req.body || {};
      const { id } = payload;

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for updates.' });
      }

      const updateRes = await query(
        `UPDATE products SET
          name = $1, subtitle = $2, collection = $3, tagline = $4, price_php = $5,
          edition = $6, batch_remaining = $7, stock_status = $8, lead_time = $9,
          region = $10, artisan_cooperative = $11, artisan_master = $12,
          fair_trade_percentage = $13, has_3d_model = $14, model_type = $15,
          model_glb_url = $16, image = $17, description = $18, specs = $19,
          materials = $20, updated_at = CURRENT_TIMESTAMP
        WHERE id = $21
        RETURNING *`,
        [
          payload.name,
          payload.subtitle || '',
          payload.collection,
          payload.tagline || '',
          Number(payload.pricePHP ?? payload.price_php ?? (payload.price && payload.price.PHP) ?? 45000),
          payload.edition || '',
          Number(payload.batchRemaining ?? payload.batch_remaining ?? 0),
          payload.stockStatus ?? payload.stock_status ?? 'available',
          payload.leadTime ?? payload.lead_time ?? '',
          payload.region || '',
          payload.artisanCooperative ?? payload.artisan_cooperative ?? '',
          payload.artisanMaster ?? payload.artisan_master ?? '',
          Number(payload.fairTradePercentage ?? payload.fair_trade_percentage ?? 45),
          Boolean(payload.has3DModel ?? payload.has_3d_model),
          payload.modelType ?? payload.model_type ?? 'bayong',
          payload.modelGlbUrl ?? payload.model_glb_url ?? '',
          payload.image || '',
          payload.description || '',
          JSON.stringify(payload.specs || []),
          JSON.stringify(payload.materials || []),
          id,
        ]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Masterwork updated in PostgreSQL.',
        product: mapProductRow(updateRes.rows[0]),
      });
    }

    // -------------------------------------------------------------
    // 4. DELETE: Remove a piece (Admin CRUD)
    // -------------------------------------------------------------
    if (req.method === 'DELETE') {
      const { id } = req.query || req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'Product ID is required for deletion.' });
      }

      const deleteRes = await query('DELETE FROM products WHERE id = $1', [id]);

      if (deleteRes.rowCount === 0) {
        return res.status(404).json({ error: 'Product not found or already deleted.' });
      }

      return res.status(200).json({
        success: true,
        message: `Product ${id} has been permanently removed from inventory.`,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Products API Error]:', err);
    return res.status(500).json({ error: 'Internal server error managing products.' });
  }
}
