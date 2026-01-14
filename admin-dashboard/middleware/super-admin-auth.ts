/**
 * Middleware to protect super admin routes
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useSuperAdminAuth()

  // Check if user is authenticated
  if (!auth.isAuthenticated.value) {
    return navigateTo('/login')
  }

  // Verify token is still valid
  const isValid = await auth.verifyToken()
  if (!isValid) {
    return navigateTo('/login')
  }
})
