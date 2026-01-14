/**
 * Application configuration
 */

export const config = {
  port: parseInt(process.env.PORT || '9009', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  // Database type: 'postgres' or 'sqlite' (defaults to 'postgres' if DATABASE_URL starts with postgres://, otherwise 'sqlite')
  databaseType: process.env.DB_TYPE || (process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite'),
  
  // Auth0
  auth0: {
    domain: process.env.AUTH0_DOMAIN || '',
    audience: process.env.AUTH0_AUDIENCE || '',
    issuer: process.env.AUTH0_ISSUER || `https://${process.env.AUTH0_DOMAIN}/`,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:9001', 'http://localhost:9002'],
    credentials: true,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // API
  api: {
    version: 'v1',
    basePath: '/api',
    adminPath: '/api/admin',
    appPath: '/api/app',
    sharedPath: '/api/shared',
  },
  
  // OpenAPI
  openapi: {
    enabled: process.env.NODE_ENV !== 'production' || process.env.ENABLE_OPENAPI === 'true',
    path: '/api/docs',
    specPath: '/api/openapi.json',
  },
} as const;
