import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'concesionaria',
  });

  const migrationsDir = join(process.cwd(), 'migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('No SQL migrations found.');
    return;
  }

  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    const result = await client.query<{
      filename: string;
    }>('SELECT filename FROM schema_migrations');

    const executed = new Set(result.rows.map((row) => row.filename));

    for (const file of migrationFiles) {
      if (executed.has(file)) {
        console.log(`Skipping ${file}`);
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), 'utf8');

      console.log(`Applying ${file}`);
      await client.query('BEGIN');

      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('SQL migrations completed.');
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('SQL migrations failed.');
  console.error(error);
  process.exit(1);
});
