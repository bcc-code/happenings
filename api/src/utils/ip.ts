/**
 * IP Address Utilities
 * 
 * Extracts client IP address from Elysia request, handling proxies
 */

import type { Context } from 'elysia';

/**
 * Get client IP address from request
 * Handles X-Forwarded-For header for proxied requests
 */
export function getClientIp({ request }: Context): string | undefined {
  // Check X-Forwarded-For header (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    return ips[0] || undefined;
  }

  // Check X-Real-IP header (alternative proxy header)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback: try to get from request (if available in Elysia)
  // Note: Elysia's request is a standard Request object
  // The actual IP might not be directly accessible without server info
  // This is a fallback that may not work in all cases
  return undefined;
}
