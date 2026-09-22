// Vercel Serverless Function: GET /api/products
import { PRODUCTS } from '../src/data/products.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { collection, region } = req.query;
  let results = [...PRODUCTS];

  if (collection && collection !== 'All') {
    results = results.filter(p => p.collection.toLowerCase() === collection.toLowerCase());
  }

  if (region) {
    results = results.filter(p => p.region.toLowerCase().includes(region.toLowerCase()));
  }

  return res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  });
}

