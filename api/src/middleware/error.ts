/**
 * Error handling for Bun
 */

import { ZodError } from 'zod';
import { error as errorResponse, json } from '../utils/response';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(err: Error | ApiError | ZodError): Response {
  // Log error
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return errorResponse('Validation error', 'VALIDATION_ERROR', 400, err.errors);
  }

  // Handle API errors
  if (err instanceof ApiError) {
    return errorResponse(
      err.message,
      err.code || 'API_ERROR',
      err.statusCode,
      err.details
    );
  }

  // Handle unknown errors
  return errorResponse(
    'Internal server error',
    'INTERNAL_ERROR',
    500,
    process.env.NODE_ENV === 'development' ? { message: err.message } : undefined
  );
}
