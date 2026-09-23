import { query } from '../lib/db.js';
import { getAuthUser, hashPassword, sanitizeUser } from '../lib/security.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    }

    const { name, phone, password } = req.body || {};

    // 1. If password change requested
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'New password must contain at least 6 characters.' });
      }

      const passwordHash = await hashPassword(password);
      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        passwordHash,
        auth.id,
      ]);
    }

    // 2. If name or phone update requested
    if (name) {
      await query(
        'UPDATE users SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [name.trim(), phone?.trim() || '', auth.id]
      );
    }

    // Fetch updated user
    const updated = await query('SELECT * FROM users WHERE id = $1', [auth.id]);
    const safeUser = sanitizeUser(updated.rows[0]);

    return res.status(200).json({
      success: true,
      message: 'Patron profile updated successfully.',
      user: safeUser,
    });
  } catch (err) {
    console.error('[Update Profile API Error]:', err);
    return res.status(500).json({ error: 'Internal server error updating profile.' });
  }
}

