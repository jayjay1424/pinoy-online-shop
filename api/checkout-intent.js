// Vercel Serverless Function: POST /api/checkout-intent
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, paymode } = req.body || {};

  const intentId = `PI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return res.status(200).json({
    success: true,
    intentId,
    amount: amount || 0,
    currency: currency || 'PHP',
    paymode: paymode || 'gcash',
    clientSecret: `sec_${intentId}`,
    status: 'requires_action',
  });
}

