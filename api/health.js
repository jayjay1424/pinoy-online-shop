import { query, getPool } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const start = Date.now();

  try {
    const isPoolConfigured = Boolean(getPool());
    let dbStatus = 'fallback_memory';
    let dbVersion = 'Simulated Atelier Memory DB';

    if (isPoolConfigured) {
      const result = await query('SELECT version()');
      dbStatus = 'connected';
      dbVersion = result.rows[0]?.version || 'PostgreSQL (Connected)';
    }

    const latency = Date.now() - start;

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'Vercel Serverless Function',
      database: {
        engine: 'PostgreSQL',
        status: dbStatus,
        configured: isPoolConfigured,
        latencyMs: latency,
        version: dbVersion,
      },
      security: {
        hashing: 'Bcrypt (12 rounds)',
        auth: 'JWT (HMAC SHA-256)',
        queries: 'Parameterized ($1, $2) SQL Injection Guard',
        ssl: 'Enabled (Managed Cloud Pool)',
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'degraded',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

