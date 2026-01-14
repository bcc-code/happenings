/**
 * Response helpers for Bao.js
 * Note: Bao.js provides ctx.json(), but these helpers are for error responses
 */

export function error(message: string, code: string, status: number = 400, details?: any): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code,
      ...(details && { details }),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

export function unauthorized(message: string = 'Authentication required'): Response {
  return error(message, 'UNAUTHORIZED', 401);
}

export function forbidden(message: string = 'Access denied'): Response {
  return error(message, 'FORBIDDEN', 403);
}
