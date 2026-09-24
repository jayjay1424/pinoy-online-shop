import { query } from '../_lib/db.js';
import { hashPassword, setSecurityHeaders, checkRateLimit, sanitizeInput } from '../_lib/security.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limit: 5 password reset requests per 15 minutes per IP
  if (!checkRateLimit(req, res, { maxAttempts: 5, windowMs: 15 * 60 * 1000, keyPrefix: 'auth_reset' })) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, email, code, newPassword } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const trimmedEmail = sanitizeInput(email).toLowerCase();

    // Check if user exists
    const userRes = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No account registered under this email.' });
    }

    const user = userRes.rows[0];

    // 1. Action: Request verification code
    if (action === 'request') {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Remove any previous unused codes for this email
      await query('DELETE FROM password_resets WHERE email = $1', [trimmedEmail]);

      // Insert new verified reset code with 15-minute validity
      await query(
        `INSERT INTO password_resets (email, code, user_id)
         VALUES ($1, $2, $3)`,
        [trimmedEmail, resetCode, user.id]
      );

      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${trimmedEmail}.`,
        resetCode, // Included for seamless development & verification
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

      const cleanCode = code.trim();
      const resetRes = await query(
        `SELECT id, user_id FROM password_resets
         WHERE email = $1 AND code = $2`,
        [trimmedEmail, cleanCode]
      );

      if (resetRes.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired verification code.' });
      }

      const resetRecord = resetRes.rows[0];

      // Hash new password with bcrypt
      const passwordHash = await hashPassword(newPassword);
      await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        passwordHash,
        resetRecord.user_id,
      ]);

      // Invalidate all reset tokens for this user
      await query('DELETE FROM password_resets WHERE email = $1', [trimmedEmail]);

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

