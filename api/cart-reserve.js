// Vercel Serverless Function: POST /api/cart-reserve
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, finishId } = req.body || {};
  const lockToken = `LOCK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes TTL

  return res.status(200).json({
    success: true,
    lockToken,
    expiresAt,
    message: 'Vault allocation locked for 15 minutes',
  });
}

