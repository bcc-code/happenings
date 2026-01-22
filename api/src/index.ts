/**
 * BCC Events API Server - Bun Edition with Elysia
 */

import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { config } from './config';
import { ensureAllTables } from './db/ensure-tables';
import { registerAuditLogHandler } from './events/handlers/audit';
import { handleError } from './middleware/error';
import { swaggerSpec } from './openapi/config';
import adminRouter from './routes/admin';
import superAdminRouter from './routes/admin/super-admin';
import appRouter from './routes/app';
import sharedRouter from './routes/shared';

// Ensure all SQLite tables exist at startup
ensureAllTables();

const app = new Elysia();

// Register audit logging handler
registerAuditLogHandler();

// CORS middleware
app.use(
  cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
  })
);

// Health check (before auth)
app.get('/health', () => {
  return { status: 'ok' };
});

// OpenAPI documentation
if (config.openapi.enabled) {
  app.get(config.openapi.specPath, () => {
    return swaggerSpec;
  });

  // Swagger UI
  app.get(config.openapi.path, () => {
    const swaggerHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>BCC Events API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '${config.openapi.specPath}',
      dom_id: '#swagger-ui',
    });
  </script>
</body>
</html>
    `;
    return new Response(swaggerHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  });
}

// API routes
app.group(config.api.adminPath, (app) => app.use(adminRouter));
app.group(config.api.adminPath, (app) => app.use(superAdminRouter)); // Super admin routes (no tenant required)
app.group(config.api.appPath, (app) => app.use(appRouter));
app.group(config.api.sharedPath, (app) => app.use(sharedRouter));

// Error handling
app.onError((context) => {
  const error = context.error as Error;
  return handleError(error);
});

// 404 handler
app.onAfterHandle((context) => {
  if (context.set.status === 404) {
    return {
      error: 'Not found',
      code: 'NOT_FOUND',
    };
  }
  return context.response;
});

// Start server
app.listen({
  port: config.port,
  hostname: '0.0.0.0',
});

console.log(`🚀 Server running on port ${config.port}`);
console.log(`📚 API Documentation: http://localhost:${config.port}${config.openapi.path}`);
console.log(`📄 OpenAPI Spec: http://localhost:${config.port}${config.openapi.specPath}`);

export default app;
