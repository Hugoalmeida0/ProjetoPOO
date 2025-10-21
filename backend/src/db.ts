import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment');
}

export const pool = new Pool({ connectionString });
