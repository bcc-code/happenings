/**
 * @swagger
 * /shared/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Shared]
 *     description: Returns API health status
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

export async function healthHandler() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
