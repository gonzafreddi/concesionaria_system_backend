import 'dotenv/config';
import { Client } from 'pg';
import { encryptPassword } from '../src/utils/encrypt';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@auto3.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';
const RESET_PASSWORD = process.env.ADMIN_RESET_PASSWORD === 'true';

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'concesionaria',
  });

  await client.connect();

  try {
    const existing = await client.query<{ id: number; role: string }>(
      'SELECT id, role FROM users WHERE email = $1',
      [ADMIN_EMAIL],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const user = existing.rows[0];

      if (RESET_PASSWORD) {
        await client.query(
          'UPDATE users SET name = $1, role = $2, password = $3 WHERE email = $4',
          [ADMIN_NAME, 'ADMIN', encryptPassword(ADMIN_PASSWORD), ADMIN_EMAIL],
        );
        console.log(`Admin user updated and password reset: ${ADMIN_EMAIL}`);
        return;
      }

      if (user.role !== 'ADMIN') {
        await client.query('UPDATE users SET role = $1 WHERE email = $2', [
          'ADMIN',
          ADMIN_EMAIL,
        ]);
        console.log(`Existing user promoted to ADMIN: ${ADMIN_EMAIL}`);
        return;
      }

      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      return;
    }

    await client.query(
      'INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4)',
      [ADMIN_NAME, ADMIN_EMAIL, 'ADMIN', encryptPassword(ADMIN_PASSWORD)],
    );

    console.log(`Admin user created: ${ADMIN_EMAIL}`);
    console.log(`Initial password: ${ADMIN_PASSWORD}`);
    console.log('Change this password after the first login.');
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('Admin seed failed.');
  console.error(error);
  process.exit(1);
});
