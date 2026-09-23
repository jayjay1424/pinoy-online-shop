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

/**
 * Apply mandatory enterprise security headers
 * @param {object} res 
 */
export function setSecurityHeaders(res) {
  if (!res || !res.setHeader) return;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

// In-memory sliding rate limit store (keyed by prefix:ip)
const ipRateLimitStore = new Map();

/**
 * Differentiated sliding-window rate limiter for serverless endpoints
 * @param {object} req 
 * @param {object} res 
 * @param {object} options 
 * @returns {boolean} true if allowed, false if rate limited (429 response automatically sent)
 */
export function checkRateLimit(req, res, { maxAttempts = 15, windowMs = 15 * 60 * 1000, keyPrefix = 'api' } = {}) {
  const headers = req?.headers || {};
  const forwarded = headers['x-forwarded-for'];
  const ip = (forwarded ? forwarded.split(',')[0].trim() : req?.socket?.remoteAddress) || '127.0.0.1';
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const record = ipRateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  ipRateLimitStore.set(key, record);

  // Periodic pruning of stale records
  if (ipRateLimitStore.size > 2000) {
    for (const [k, v] of ipRateLimitStore.entries()) {
      if (now > v.resetTime) ipRateLimitStore.delete(k);
    }
  }

  if (res && res.setHeader) {
    res.setHeader('X-RateLimit-Limit', maxAttempts.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAttempts - record.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());
  }

  if (record.count > maxAttempts) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    if (res && res.setHeader) {
      res.setHeader('Retry-After', retryAfterSec.toString());
    }
    if (res && res.status) {
      res.status(429).json({
        error: `Security Protocol: Too many requests. Please wait ${retryAfterSec} seconds before retrying.`,
        retryAfter: retryAfterSec,
      });
    }
    return false;
  }

  return true;
}

/**
 * Sanitize text inputs against XSS and control characters
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // strip raw script tags / angle brackets
    .trim();
}


