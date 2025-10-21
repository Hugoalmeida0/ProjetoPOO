import { pool } from './db';

export async function ensureSchema() {
    // Ensure users table exists (plaintext password for testing only)
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

    // Rename legacy column password_hash -> password if needed
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='password_hash'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='password'
        ) THEN
          EXECUTE 'ALTER TABLE users RENAME COLUMN password_hash TO password';
        END IF;
      END $$;
    `);
}
