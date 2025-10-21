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

    // Add subjects column to mentor_profiles if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='mentor_profiles' AND column_name='subjects'
        ) THEN
          ALTER TABLE mentor_profiles ADD COLUMN subjects TEXT;
        END IF;
      END $$;
    `);

    // Add subject_name column to bookings if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='bookings' AND column_name='subject_name'
        ) THEN
          ALTER TABLE bookings ADD COLUMN subject_name TEXT;
        END IF;
      END $$;
    `);

    // Ensure mentor_subjects junction table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentor_subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(mentor_id, subject_id)
      );
    `);

    // Create index for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_mentor_subjects_mentor_id ON mentor_subjects(mentor_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_mentor_subjects_subject_id ON mentor_subjects(subject_id);
    `);
}
