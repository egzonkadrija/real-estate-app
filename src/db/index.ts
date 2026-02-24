import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

// Create the postgres.js SQL client
export const sql = postgres(process.env.DATABASE_URL, {
  max: isLocal ? 10 : 1,
  ssl: isLocal ? false : 'require',
});

// Create the Drizzle ORM instance with schema for relational queries
export const db = drizzle(sql, { schema });
