import { query } from '../lib/db.js';
import { getAuthUser, sanitizeUser } from '../lib/security.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    }

    const userRes = await query('SELECT * FROM users WHERE id = $1', [auth.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patron account not found.' });
    }

    const user = userRes.rows[0];
    const addressRes = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC', [user.id]);
    const ordersRes = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC', [user.id]);

    const safeUser = sanitizeUser(user);
    safeUser.savedAddresses = addressRes.rows;
    safeUser.orders = ordersRes.rows;

    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (err) {
    console.error('[Me API Error]:', err);
    return res.status(500).json({ error: 'Internal server error while fetching session profile.' });
  }
}

