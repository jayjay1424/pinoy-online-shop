import { query } from '../_lib/db.js';
import { hashPassword, generateToken, sanitizeUser } from '../_lib/security.js';

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
    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with 12 salt rounds
    const passwordHash = await hashPassword(password);
    const tier = 'Kliyente de Honor • Likha Circle';

    const result = await query(
      `INSERT INTO users (name, email, phone, password_hash, tier)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, tier, created_at`,
      [name.trim(), trimmedEmail, phone?.trim() || '', passwordHash, tier]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Patron account created successfully. Welcome to Likha Circle.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('[Register API Error]:', err);
    return res.status(500).json({ error: 'Internal server error while creating patron account.' });
  }
}

