import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'likha-atelier-prestige-jwt-secret-key-2026-secure-archipelago';
const SALT_ROUNDS = 12;

/**
 * Hash a plain password securely using Bcrypt with 12 salt rounds
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against stored Bcrypt hash (timing-safe)
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically signed JWT token for a patron
 * @param {object} user 
 * @returns {string}
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier || 'Kliyente de Honor',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'likha-atelier-genève',
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token 
 * @returns {object|null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'likha-atelier-genève',
    });
  } catch (err) {
    return null;
  }
}

/**
 * Extract authenticated patron from request headers (Authorization: Bearer <token>)
 * @param {object} req 
 * @returns {object|null}
 */
export function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

/**
 * Sanitize user object for client response (strips sensitive hashes)
 * @param {object} user 
 * @returns {object}
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, password, ...safeUser } = user;
  return safeUser;
}

