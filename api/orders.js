import { query } from './_lib/db.js';
import { getAuthUser } from './_lib/security.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const auth = getAuthUser(req);

  try {
    // 1. GET: Fetch authenticated patron's vault acquisitions
    if (req.method === 'GET') {
      if (!auth) {
        return res.status(401).json({ error: 'Unauthorized. Sign in to view vault acquisitions.' });
      }

      const ordersRes = await query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC',
        [auth.id]
      );

      return res.status(200).json({
        success: true,
        orders: ordersRes.rows,
      });
    }

    // 2. POST: Create and allocate new order
    if (req.method === 'POST') {
      const { items, client, packaging, paymode, total, currency, orderNumber: customOrderNumber, serialKey: customSerialKey } = req.body || {};

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one piece.' });
      }

      const orderNumber = customOrderNumber || `LKH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const serialKey = customSerialKey || `HABI-012/030-${Math.floor(100 + Math.random() * 900)}`;

      const clientName = client?.name || auth?.name || 'Valued Patron';
      const clientEmail = client?.email || auth?.email || 'collector@likha-atelier.com';
      const clientPhone = client?.phone || '';
      const clientAddress = client?.address || 'Private Atelier Residence';
      const subtotalVal = Number(total || items.reduce((acc, i) => acc + (i.price || 0), 0));
      const currencyVal = currency || 'PHP';
      const paymodeVal = paymode || 'Direct Settlement';
      const statusVal = 'PAID_AND_ALLOCATED';

      const insertRes = await query(
        `INSERT INTO orders (
          order_number, serial_key, user_id, client_name, client_email, client_phone, client_address,
          items, packaging, subtotal, currency, paymode, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          orderNumber,
          serialKey,
          auth ? auth.id : null,
          clientName,
          clientEmail,
          clientPhone,
          clientAddress,
          JSON.stringify(items),
          JSON.stringify(packaging || {}),
          subtotalVal,
          currencyVal,
          paymodeVal,
          statusVal,
        ]
      );

      const orderRecord = insertRes.rows[0];

      return res.status(201).json({
        success: true,
        message: 'Masterwork allocation secured and recorded in PostgreSQL vault.',
        order: orderRecord,
        orderNumber,
        serialKey,
        status: statusVal,
        estimatedDispatch: '7 to 14 business days (White-Glove Insured Courier)',
        certificateUrl: `/verify/${serialKey}`,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Orders API Error]:', err);
    return res.status(500).json({ error: 'Internal server error processing order.' });
  }
}
