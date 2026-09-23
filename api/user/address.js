import { query } from '../lib/db.js';
import { getAuthUser } from '../lib/security.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const auth = getAuthUser(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }

  try {
    // 1. GET addresses
    if (req.method === 'GET') {
      const result = await query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC',
        [auth.id]
      );
      return res.status(200).json({ success: true, addresses: result.rows });
    }

    // 2. POST create address
    if (req.method === 'POST') {
      const { label, recipient, phone, street, city, province, postal, isDefault } = req.body || {};

      if (!street || !city) {
        return res.status(400).json({ error: 'Street address and city are required.' });
      }

      // If set as default, reset other addresses
      if (isDefault) {
        await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [auth.id]);
      }

      const insertRes = await query(
        `INSERT INTO addresses (user_id, label, recipient, phone, street, city, province, postal, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          auth.id,
          label || 'Residence',
          recipient || auth.name,
          phone || '',
          street.trim(),
          city.trim(),
          province?.trim() || '',
          postal?.trim() || '',
          Boolean(isDefault),
        ]
      );

      const allAddresses = await query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC',
        [auth.id]
      );

      return res.status(201).json({
        success: true,
        message: 'Delivery residence added successfully.',
        address: insertRes.rows[0],
        addresses: allAddresses.rows,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Address API Error]:', err);
    return res.status(500).json({ error: 'Internal server error managing address.' });
  }
}

