import { initDatabase, query } from '../api/_lib/db.js';

async function main() {
  console.log('--- Likha Atelier Database Initializer ---');
  console.log('Connecting to PostgreSQL database...');

  try {
    await initDatabase();
    console.log('✓ Tables (users, addresses, orders) and indexes verified successfully.');

    const userCount = await query('SELECT count(*) as count FROM users');
    console.log(`✓ Active patron records: ${userCount.rows[0]?.count || 0}`);

    const orderCount = await query('SELECT count(*) as count FROM orders');
    console.log(`✓ Recorded vault acquisitions: ${orderCount.rows[0]?.count || 0}`);

    console.log('\nPostgreSQL Database is 100% ready for Vercel deployment!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

main();

