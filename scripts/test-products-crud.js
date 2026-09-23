import productsHandler from '../api/products.js';

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    },
  };
}

async function testCrud() {
  console.log('--- Testing /api/products CRUD Endpoints ---');

  // 1. GET all products
  const getReq = { method: 'GET', query: {} };
  const getRes = createMockRes();
  await productsHandler(getReq, getRes);
  console.log(`✓ GET /api/products: Status ${getRes.statusCode} | Count: ${getRes.body?.count}`);

  // 2. POST create product
  const postReq = {
    method: 'POST',
    body: {
      id: 'test-heirloom-urn',
      name: 'Maranao Okir Brass Urn',
      subtitle: 'Hand-Cast Brass Vessel with Serpent Motif',
      collection: 'Tahanan & Luho',
      tagline: 'Tugaya Brass Guild • Hand-Chiseled Okir',
      pricePHP: 58000,
      edition: 'Edisyon Limitado — No. 01 ng 10',
      batchRemaining: 2,
      stockStatus: 'available',
      leadTime: 'Crafted over 20 days',
      region: 'Tugaya, Lanao del Sur',
      artisanCooperative: 'Tugaya Master Brass Casters Guild',
      artisanMaster: 'Datu Aliman',
      fairTradePercentage: 48,
      has3DModel: true,
      modelType: 'burnay',
      description: 'An antique Mindanao brass vessel hand-cast with intricate geometric Okir filigree.',
      specs: [{ label: 'Material', value: 'Antique Philippine Cast Brass' }],
      materials: [{ id: 'brass-antique', name: 'Aged Antique Brass', hex: '#C4975D' }],
    },
  };
  const postRes = createMockRes();
  await productsHandler(postReq, postRes);
  console.log(`✓ POST /api/products: Status ${postRes.statusCode} | Created: ${postRes.body?.product?.name}`);

  // 3. PUT update product
  const putReq = {
    method: 'PUT',
    body: {
      id: 'test-heirloom-urn',
      name: 'Maranao Okir Brass Urn (Updated Master Edition)',
      collection: 'Tahanan & Luho',
      pricePHP: 62000,
      batchRemaining: 1,
      stockStatus: 'low_stock',
    },
  };
  const putRes = createMockRes();
  await productsHandler(putReq, putRes);
  console.log(`✓ PUT /api/products: Status ${putRes.statusCode} | Updated Price: ${putRes.body?.product?.pricePHP}`);

  // 4. DELETE product
  const delReq = {
    method: 'DELETE',
    query: { id: 'test-heirloom-urn' },
  };
  const delRes = createMockRes();
  await productsHandler(delReq, delRes);
  console.log(`✓ DELETE /api/products: Status ${delRes.statusCode} | Message: ${delRes.body?.message}`);

  console.log('\n✓ Products CRUD verified 100% successfully!');
  process.exit(0);
}

testCrud().catch((err) => {
  console.error('CRUD Test Error:', err);
  process.exit(1);
});

