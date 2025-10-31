import { pool } from './config/db';

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

  // Ensure graduations table exists (must be before subjects due to FK)
  await pool.query(`
      CREATE TABLE IF NOT EXISTS graduations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  // Ensure subjects table exists (minimal schema)
  await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        graduation_id UUID REFERENCES graduations(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  // Ensure profiles table exists
  await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        phone TEXT,
        location TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  // Add location column to profiles if it doesn't exist
  await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='profiles' AND column_name='location'
        ) THEN
          ALTER TABLE profiles ADD COLUMN location TEXT;
        END IF;
      END $$;
    `);

  // Ensure mentor_profiles table exists
  await pool.query(`
      CREATE TABLE IF NOT EXISTS mentor_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        graduation_id UUID REFERENCES graduations(id) ON DELETE SET NULL,
        experience_years INTEGER,
        subjects TEXT,
        location TEXT,
        avg_rating DECIMAL(3,2) DEFAULT 0,
        total_ratings INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  // Add location column to mentor_profiles if it doesn't exist
  await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='mentor_profiles' AND column_name='location'
        ) THEN
          ALTER TABLE mentor_profiles ADD COLUMN location TEXT;
        END IF;
      END $$;
    `);

  // Add avg_rating column to mentor_profiles if it doesn't exist
  await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='mentor_profiles' AND column_name='avg_rating'
        ) THEN
          ALTER TABLE mentor_profiles ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0;
        END IF;
      END $$;
    `);

  // Add total_ratings column to mentor_profiles if it doesn't exist
  await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='mentor_profiles' AND column_name='total_ratings'
        ) THEN
          ALTER TABLE mentor_profiles ADD COLUMN total_ratings INTEGER DEFAULT 0;
        END IF;
      END $$;
    `);

  // Ensure bookings table exists
  await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
        subject_name TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER NOT NULL DEFAULT 60,
        status TEXT NOT NULL DEFAULT 'pending',
        objective TEXT,
        student_name TEXT,
        student_email TEXT,
        student_phone TEXT,
        cancel_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
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

  // Ensure messages table exists for booking chats
  await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  // Create index for faster message lookups by booking
  await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
    `);

  // Ensure notifications table exists
  await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  // Create index for faster notification lookups by user
  await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

  // Ensure ratings table exists
  await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  // Create indexes for ratings table
  await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON ratings(booking_id);
    `);

  await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ratings_student_id ON ratings(student_id);
    `);

  await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ratings_mentor_id ON ratings(mentor_id);
    `);

  // Create admin user if it doesn't exist
  await pool.query(`
      INSERT INTO users (id, email, password, full_name)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'admin@gmail.com',
        'admin1234',
        'Administrador'
      )
      ON CONFLICT (email) DO NOTHING;
    `);
}
