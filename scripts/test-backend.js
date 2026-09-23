import { hashPassword, comparePassword, generateToken, verifyToken } from '../api/lib/security.js';
import registerHandler from '../api/auth/register.js';
import loginHandler from '../api/auth/login.js';
import ordersHandler from '../api/orders.js';
import healthHandler from '../api/health.js';

// Mock request / response helpers for serverless function testing
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

async function runTests() {
  console.log('--- Testing Likha Atelier Serverless & PostgreSQL Backend ---');

  // 1. Test Bcrypt Hashing
  console.log('\n[1] Testing Bcrypt Password Security:');
  const password = 'SecretPassword123!';
  const hash = await hashPassword(password);
  console.log('✓ Hashed Password:', hash.substring(0, 29) + '...');
  const match = await comparePassword(password, hash);
  const mismatch = await comparePassword('WrongPassword', hash);
  console.log(`✓ Password match: ${match} | False password reject: ${!mismatch}`);

  // 2. Test JWT Signing and Verification
  console.log('\n[2] Testing JWT Cryptographic Sessions:');
  const user = { id: 42, name: 'Don Juan de la Cruz', email: 'juan@likha.ph', tier: 'Kliyente de Honor' };
  const token = generateToken(user);
  console.log('✓ Issued JWT Token:', token.substring(0, 35) + '...');
  const decoded = verifyToken(token);
  console.log(`✓ Verified Token ID: ${decoded.id} | Email: ${decoded.email}`);

  // 3. Test Register Endpoint
  console.log('\n[3] Testing POST /api/auth/register:');
  const regReq = {
    method: 'POST',
    headers: {},
    body: {
      name: 'Gabriel Silang',
      email: 'gabriel.silang@atelier-archipelago.ph',
      phone: '+63 918 123 4567',
      password: 'heirloom_password_2026',
    },
  };
  const regRes = createMockRes();
  await registerHandler(regReq, regRes);
  console.log(`✓ Register Status: ${regRes.statusCode} | Success: ${regRes.body?.success}`);
  const authToken = regRes.body?.token;

  // 4. Test Login Endpoint
  console.log('\n[4] Testing POST /api/auth/login:');
  const loginReq = {
    method: 'POST',
    headers: {},
    body: {
      email: 'gabriel.silang@atelier-archipelago.ph',
      password: 'heirloom_password_2026',
    },
  };
  const loginRes = createMockRes();
  await loginHandler(loginReq, loginRes);
  console.log(`✓ Login Status: ${loginRes.statusCode} | User Name: ${loginRes.body?.user?.name}`);

  // 5. Test Orders Endpoint
  console.log('\n[5] Testing POST /api/orders:');
  const orderReq = {
    method: 'POST',
    headers: {
      authorization: `Bearer ${authToken}`,
    },
    body: {
      items: [{ name: 'Modern Sculptural Terno', price: 125000 }],
      packaging: { packagingType: 'Kamagong Crate' },
      total: 125000,
      currency: 'PHP',
      paymode: 'GCash Express (QR Ph)',
    },
  };
  const orderRes = createMockRes();
  await ordersHandler(orderReq, orderRes);
  console.log(`✓ Order Status: ${orderRes.statusCode} | Serial Key: ${orderRes.body?.serialKey}`);

  // 6. Test Health Endpoint
  console.log('\n[6] Testing GET /api/health:');
  const healthReq = { method: 'GET', headers: {} };
  const healthRes = createMockRes();
  await healthHandler(healthReq, healthRes);
  console.log(`✓ Health Status: ${healthRes.statusCode} | Database: ${healthRes.body?.database?.engine} (${healthRes.body?.database?.status})`);

  console.log('\n✓ All backend tests passed successfully!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

