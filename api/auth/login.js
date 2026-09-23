import { query } from '../lib/db.js';
import { comparePassword, generateToken, sanitizeUser } from '../lib/security.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Query patron record by email
    const userRes = await query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or secret credentials.' });
    }

    const user = userRes.rows[0];

    // Verify bcrypt hash
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or secret credentials.' });
    }

    // Fetch patron addresses & orders
    const addressRes = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC', [user.id]);
    const ordersRes = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC', [user.id]);

    const token = generateToken(user);
    const safeUser = sanitizeUser(user);
    safeUser.savedAddresses = addressRes.rows;
    safeUser.orders = ordersRes.rows;

    return res.status(200).json({
      success: true,
      message: 'Welcome back to Likha Atelier.',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('[Login API Error]:', err);
    return res.status(500).json({ error: 'Internal server error while authenticating patron.' });
  }
}

