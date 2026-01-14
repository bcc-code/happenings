/**
 * OpenAPI/Swagger configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BCC Events Registration API',
      version: '1.0.0',
      description: 'Multi-tenant event registration system API',
      contact: {
        name: 'BCC Events',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.bccevents.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Auth0 JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
          required: ['error'],
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {},
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Admin',
        description: 'Admin-only endpoints (requires admin role)',
      },
      {
        name: 'App',
        description: 'End user endpoints (limited to user and their relatives)',
      },
      {
        name: 'Shared',
        description: 'Shared endpoints (available to both admin and app)',
      },
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
    ],
  },
  apis: [
    './src/routes/admin/**/*.ts',
    './src/routes/app/**/*.ts',
    './src/routes/shared/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
