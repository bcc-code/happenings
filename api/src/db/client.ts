/**
 * Drizzle ORM database client
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';
import * as schema from './schema';

// Parse DATABASE_URL
const databaseUrl = config.databaseUrl;
if (!databaseUrl) {
  // In development, provide a helpful error message
  if (config.nodeEnv === 'development') {
    console.warn('⚠️  DATABASE_URL not set. Database operations will fail.');
    console.warn('   Set DATABASE_URL environment variable or create a .env file');
    console.warn('   Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname');
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
export const db = drizzle(client, { schema });

// Export client for raw SQL if needed
export { client as sql };

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await client.end();
  });
}
