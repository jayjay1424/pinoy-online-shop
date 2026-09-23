/**
 * Likha Atelier — Product Data Normalizer
 * Ensures product objects from Postgres (snake_case), API, local cache, or hardcoded products (camelCase)
 * always possess consistent, complete, and safe properties for both customer UI and admin.
 */

export function normalizeProduct(p) {
  if (!p) return null;

  const rawPrice = p.pricePHP ?? p.price_php ?? (p.price && p.price.PHP) ?? 45000;
  const pricePHP = Number(rawPrice) || 45000;

  // Safe parsing of specs JSON if coming from PostgreSQL text/jsonb
  let specs = [];
  if (Array.isArray(p.specs)) {
    specs = p.specs;
  } else if (typeof p.specs === 'string') {
    try {
      specs = JSON.parse(p.specs);
    } catch {
      specs = [];
    }
  }

  // Safe parsing of materials JSON
  let materials = [];
  if (Array.isArray(p.materials)) {
    materials = p.materials;
  } else if (typeof p.materials === 'string') {
    try {
      materials = JSON.parse(p.materials);
    } catch {
      materials = [];
    }
  }

  // Safe parsing of camera presets
  let cameraPresets = [];
  const rawPresets = p.cameraPresets ?? p.camera_presets;
  if (Array.isArray(rawPresets)) {
    cameraPresets = rawPresets;
  } else if (typeof rawPresets === 'string') {
    try {
      cameraPresets = JSON.parse(rawPresets);
    } catch {
      cameraPresets = [];
    }
  }

  const batchRemaining = Number(p.batchRemaining ?? p.batch_remaining ?? 3);
  const stockStatus = p.stockStatus ?? p.stock_status ?? (batchRemaining === 0 ? 'archived' : 'available');
  const has3DModel = Boolean(p.has3DModel ?? p.has_3d_model ?? !!(p.modelType || p.model_type));
  const modelType = p.modelType ?? p.model_type ?? 'bayong';
  const modelGlbUrl = p.modelGlbUrl ?? p.model_glb_url ?? '';

  return {
    id: p.id || `prod-${Date.now()}`,
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
    leadTime: p.leadTime ?? p.lead_time ?? 'Handcrafted in 18 days',
    lead_time: p.leadTime ?? p.lead_time ?? 'Handcrafted in 18 days',
    region: p.region || 'Philippine Archipelago',
    artisanCooperative: p.artisanCooperative ?? p.artisan_cooperative ?? 'Master Heritage Artisans Collective',
    artisan_cooperative: p.artisanCooperative ?? p.artisan_cooperative ?? 'Master Heritage Artisans Collective',
    artisanMaster: p.artisanMaster ?? p.artisan_master ?? 'Master Artisan',
    artisan_master: p.artisanMaster ?? p.artisan_master ?? 'Master Artisan',
    fairTradePercentage: Number(p.fairTradePercentage ?? p.fair_trade_percentage ?? 45),
    fair_trade_percentage: Number(p.fairTradePercentage ?? p.fair_trade_percentage ?? 45),
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

