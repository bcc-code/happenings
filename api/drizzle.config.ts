import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

// Determine database type from environment
const dbType = process.env.DB_TYPE || (process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite');

const config = dbType === 'sqlite'
  ? {
      dialect: 'sqlite' as const,
      schema: './src/db/schema/index.ts',
      out: './src/db/migrations',
      dbCredentials: {
        url: process.env.DATABASE_URL || './local.db',
      },
      verbose: true,
      strict: true,
    }
  : {
      dialect: 'postgresql' as const,
      schema: './src/db/schema/index.ts',
      out: './src/db/migrations',
      dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
      },
      verbose: true,
      strict: true,
    };

export default defineConfig(config);
