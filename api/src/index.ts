/**
 * BCC Events API Server - Bun Edition with Elysia
 */

import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { config } from './config';
import { handleError } from './middleware/error';
import { swaggerSpec } from './openapi/config';
import adminRouter from './routes/admin';
import appRouter from './routes/app';
import sharedRouter from './routes/shared';

const app = new Elysia();

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
app.group(config.api.adminPath, adminRouter);
app.group(config.api.appPath, appRouter);
app.group(config.api.sharedPath, sharedRouter);

// Error handling
app.onError(({ error }: { error: Error }) => {
  return handleError(error);
});

// 404 handler
app.onAfterHandle(({ response, set }: { response: any; set: { status?: number } }) => {
  if (set.status === 404) {
    return {
      error: 'Not found',
      code: 'NOT_FOUND',
    };
  }
  return response;
});

// Start server
app.listen(config.port);

console.log(`🚀 Server running on port ${config.port}`);
console.log(`📚 API Documentation: http://localhost:${config.port}${config.openapi.path}`);
console.log(`📄 OpenAPI Spec: http://localhost:${config.port}${config.openapi.specPath}`);

export default app;
