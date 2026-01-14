import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

// Determine database type from environment
const dbType = process.env.DB_TYPE || (process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite');

const config: Config = {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  verbose: true,
  strict: true,
};

if (dbType === 'sqlite') {
  // SQLite configuration
  config.driver = 'better-sqlite';
  config.dbCredentials = {
    url: process.env.DATABASE_URL || './local.db',
  };
} else {
  // PostgreSQL configuration
  config.driver = 'pg';
  config.dbCredentials = {
    connectionString: process.env.DATABASE_URL!,
  };
}

export default config;
