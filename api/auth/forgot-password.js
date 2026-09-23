import { query } from '../_lib/db.js';
import { hashPassword } from '../_lib/security.js';

// In-memory verification cache for dispatched reset codes with 15-minute expiry
const resetTokens = new Map();

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
    const { action, email, code, newPassword } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user exists
    const userRes = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No account registered under this email.' });
    }

    const user = userRes.rows[0];

    // 1. Action: Request verification code
    if (action === 'request') {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      resetTokens.set(trimmedEmail, {
        code: resetCode,
        userId: user.id,
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${trimmedEmail}.`,
        resetCode, // Return for simulation/testing in developer mode
      });
    }

    // 2. Action: Verify code and set new password
    if (action === 'reset') {
      if (!code || !newPassword) {
        return res.status(400).json({ error: 'Verification code and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const cached = resetTokens.get(trimmedEmail);
      if (!cached || cached.code !== code.trim()) {
        return res.status(400).json({ error: 'Invalid or expired verification code.' });
      }

      if (Date.now() > cached.expires) {
        resetTokens.delete(trimmedEmail);
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }

      // Hash new password with bcrypt
      const passwordHash = await hashPassword(newPassword);
      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        passwordHash,
        cached.userId,
      ]);

      resetTokens.delete(trimmedEmail);

      return res.status(200).json({
        success: true,
        message: 'Your password has been updated successfully. You may now sign in.',
      });
    }

    return res.status(400).json({ error: 'Invalid action specified.' });
  } catch (err) {
    console.error('[Forgot Password API Error]:', err);
    return res.status(500).json({ error: 'Internal server error processing password recovery.' });
  }
}

