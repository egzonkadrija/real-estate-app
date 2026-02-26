import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

declare global {
  // Reuse a single postgres client in dev to avoid exhausting connections during HMR.
  var __sqlClient__: ReturnType<typeof postgres> | undefined;
}

const sqlClient =
  globalThis.__sqlClient__ ??
  postgres(process.env.DATABASE_URL, {
    max: isLocal ? 1 : 1,
    ssl: isLocal ? false : 'require',
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__sqlClient__ = sqlClient;
}

// Create the postgres.js SQL client
export const sql = sqlClient;

// Create the Drizzle ORM instance with schema for relational queries
export const db = drizzle(sql, { schema });
