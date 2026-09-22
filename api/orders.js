// Vercel Serverless Function: POST /api/orders
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, client, paymode, total, currency } = req.body || {};

  const orderNumber = `LKH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const serialKey = `HABI-012/030-${Math.floor(100 + Math.random() * 900)}`;

  return res.status(200).json({
    success: true,
    orderNumber,
    serialKey,
    status: 'PAID_AND_ALLOCATED',
    estimatedDispatch: '7 to 14 business days (White-Glove Insured)',
    certificateUrl: `/verify/${serialKey}`,
  });
}

