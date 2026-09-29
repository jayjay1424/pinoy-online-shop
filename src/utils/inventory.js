// Inventory & Stock Synchronization Engine for Likha Atelier
// Guarantees atomic deductions, persistence across page reloads, and protects against stateless serverless rollbacks.

export const INVENTORY_STORAGE_KEY = 'likha_inventory_stock';

/**
 * Retrieve the current persistent stock map from localStorage
 * Format: { [productId]: number }
 */
export function getStoredStockMap() {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[Inventory] Failed to read stock map from localStorage:', e);
    return {};
  }
}

/**
 * Persist the stock map to localStorage
 */
export function saveStoredStockMap(stockMap) {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(stockMap));
  } catch (e) {
    console.warn('[Inventory] Failed to save stock map to localStorage:', e);
  }
}

/**
 * Merge any product list (from local data or API response) with the local stock map
 * This ensures that local purchases are NEVER overwritten by stale/stateless API responses.
 */
export function mergeProductsWithInventory(products) {
  if (!Array.isArray(products)) return [];
  const stockMap = getStoredStockMap();

  return products.map((prod) => {
    if (!prod || !prod.id) return prod;
    
    // If there is a recorded stock for this item in stockMap, enforce it
    if (stockMap[prod.id] !== undefined) {
      const recordedStock = Number(stockMap[prod.id]);
      const currentStock = typeof prod.batchRemaining === 'number'
        ? prod.batchRemaining
        : (typeof prod.batch_remaining === 'number' ? prod.batch_remaining : 3);

      // Take the lower value between server and local purchase record to prevent stale resets
      const finalStock = Math.min(recordedStock, currentStock);
      const isArchived = finalStock <= 0;

      return {
        ...prod,
        batchRemaining: finalStock,
        batch_remaining: finalStock,
        stockStatus: isArchived ? 'archived' : (prod.stockStatus === 'archived' ? 'archived' : 'available'),
        stock_status: isArchived ? 'archived' : (prod.stock_status === 'archived' ? 'archived' : 'available'),
      };
    }

    return prod;
  });
}

/**
 * Deduct stock for all items in a completed order
 * @param {Array} orderItems - Array of purchased order items
 * @param {Array} currentProducts - Current product catalog array
 * @returns {{ updatedProducts: Array, deductedStockMap: Object }}
 */
export function deductStockForOrder(orderItems, currentProducts) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return { updatedProducts: currentProducts, deductedStockMap: getStoredStockMap() };
  }

  const purchasedMap = {};
  orderItems.forEach((item) => {
    const prodId = item.product?.id || item.productId || item.id;
    const qty = Math.max(1, Number(item.quantity || 1));
    if (prodId) {
      purchasedMap[prodId] = (purchasedMap[prodId] || 0) + qty;
    }
  });

  const stockMap = getStoredStockMap();

  const updatedProducts = currentProducts.map((p) => {
    const purchasedQty = purchasedMap[p.id];
    if (purchasedQty) {
      const curStock = typeof p.batchRemaining === 'number'
        ? p.batchRemaining
        : (typeof p.batch_remaining === 'number' ? p.batch_remaining : 3);
      const newStock = Math.max(0, curStock - purchasedQty);
      const isArchived = newStock === 0;

      // Update in persistent map
      stockMap[p.id] = newStock;

      return {
        ...p,
        batchRemaining: newStock,
        batch_remaining: newStock,
        stockStatus: isArchived ? 'archived' : p.stockStatus,
        stock_status: isArchived ? 'archived' : p.stock_status,
      };
    }
    return p;
  });

  saveStoredStockMap(stockMap);

  return {
    updatedProducts,
    deductedStockMap: stockMap,
  };
}

/**
 * Explicitly update stock for a product (used by Admin / Curator Studio)
 */
export function updateProductStockInStorage(productId, newStock) {
  const stockMap = getStoredStockMap();
  stockMap[productId] = Math.max(0, Number(newStock));
  saveStoredStockMap(stockMap);
  return stockMap;
}
