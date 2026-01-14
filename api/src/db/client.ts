/**
 * Drizzle ORM database client
 * Supports both PostgreSQL and SQLite (for local development)
 */

import { config } from '../config';
import * as schema from './schema';

// Type imports
import type { BunSQLiteDatabase } from 'drizzle-orm/bun:sqlite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Determine database type
const dbType = config.databaseType;

// Initialize database based on type
let db: PostgresJsDatabase<typeof schema> | BunSQLiteDatabase<typeof schema>;
let sql: any;

if (dbType === 'sqlite') {
  // SQLite for local development (using Bun's native SQLite)
  const { drizzle } = await import('drizzle-orm/bun:sqlite');
  const { Database } = await import('bun:sqlite');
  
  // For SQLite, DATABASE_URL can be a file path or ':memory:' for in-memory DB
  const dbPath = config.databaseUrl || ':memory:';
  
  const sqliteDb = new Database(dbPath);
  
  // Enable foreign keys
  sqliteDb.run('PRAGMA foreign_keys = ON');
  
  // Create Drizzle instance
  db = drizzle(sqliteDb, { schema });
  sql = sqliteDb;
  
  if (config.nodeEnv === 'development') {
    console.log(`✅ Using SQLite database: ${dbPath}`);
  }
  
  // Graceful shutdown for SQLite
  if (typeof process !== 'undefined') {
    process.on('beforeExit', () => {
      sqliteDb.close();
    });
  }
} else {
  // PostgreSQL for production/staging
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const postgres = (await import('postgres')).default;
  
  // Parse DATABASE_URL
  const databaseUrl = config.databaseUrl;
  if (!databaseUrl) {
    // In development, provide a helpful error message
    if (config.nodeEnv === 'development') {
      console.warn('⚠️  DATABASE_URL not set. Database operations will fail.');
      console.warn('   Set DATABASE_URL environment variable or create a .env file');
      console.warn('   Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname');
      console.warn('   Or use SQLite: DB_TYPE=sqlite DATABASE_URL=./local.db');
    }
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Create PostgreSQL connection
  const client = postgres(databaseUrl, {
    max: 10, // Maximum number of connections
    idle_timeout: 20,
    connect_timeout: 10,
    transform: {
      undefined: null,
    },
    debug: (connection, query, parameters) => {
      if (config.nodeEnv === 'development') {
        console.log('[DB]', query, parameters);
      }
    },
  });

  // Create Drizzle instance with schema
  db = drizzle(client, { schema });
  sql = client;
  
  if (config.nodeEnv === 'development') {
    console.log('✅ Using PostgreSQL database');
  }

  // Graceful shutdown for PostgreSQL
  if (typeof process !== 'undefined') {
    process.on('beforeExit', async () => {
      await client.end();
    });
  }
}

// Export Drizzle instance and SQL client
export { db, sql };
