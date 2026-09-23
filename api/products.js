// Vercel Serverless Function: CRUD /api/products
import { query } from './_lib/db.js';
import { getAuthUser } from './_lib/security.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
        return res.status(200).json({ success: true, product: result.rows[0] });
      }

      const result = await query('SELECT * FROM products ORDER BY created_at DESC');
      let products = result.rows;

      if (collection && collection !== 'All') {
        products = products.filter(
          (p) => (p.collection || '').toLowerCase() === collection.toLowerCase()
        );
      }

      return res.status(200).json({
        success: true,
        count: products.length,
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
        pricePHP,
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

      if (!name || !pricePHP || !collection) {
        return res.status(400).json({ error: 'Name, price, and collection are required.' });
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
        ) RETURNING *`,
        [
          id,
          name.trim(),
          subtitle?.trim() || '',
          collection.trim(),
          tagline?.trim() || '',
          Number(pricePHP),
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
          image?.trim() || '',
          description?.trim() || '',
          JSON.stringify(specs || []),
          JSON.stringify(materials || []),
          JSON.stringify(cameraPresets || []),
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Masterwork created and cataloged in PostgreSQL.',
        product: insertRes.rows[0],
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
          Number(payload.pricePHP),
          payload.edition || '',
          Number(payload.batchRemaining || 0),
          payload.stockStatus || 'available',
          payload.leadTime || '',
          payload.region || '',
          payload.artisanCooperative || '',
          payload.artisanMaster || '',
          Number(payload.fairTradePercentage || 45),
          Boolean(payload.has3DModel),
          payload.modelType || 'bayong',
          payload.modelGlbUrl || '',
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
        product: updateRes.rows[0],
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
