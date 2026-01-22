/**
 * Dev-only auth helper for the end-user app.
 *
 * Until Auth0 is wired up in the Nuxt app, you can paste a Bearer token + tenant ID
 * and we’ll attach the headers for API calls.
 */

export function useDevAuth() {
  const token = useCookie<string | null>('app_bearer_token', {
    default: () => null,
    // Allow localhost dev over http
    secure: false,
    sameSite: 'lax',
  })

  const tenantId = useCookie<string | null>('app_tenant_id', {
    default: () => null,
    secure: false,
    sameSite: 'lax',
  })

  const isConfigured = computed(() => !!token.value && !!tenantId.value)

  function setToken(next: string | null) {
    token.value = next && next.trim() ? next.trim() : null
  }

  function setTenantId(next: string | null) {
    tenantId.value = next && next.trim() ? next.trim() : null
  }

  function clear() {
    token.value = null
    tenantId.value = null
  }

  function getHeaders() {
    const headers: Record<string, string> = {}
    if (token.value) headers.Authorization = `Bearer ${token.value}`
    if (tenantId.value) headers['X-Tenant-ID'] = tenantId.value
    return headers
  }

  return {
    token: readonly(token),
    tenantId: readonly(tenantId),
    isConfigured,
    setToken,
    setTenantId,
    clear,
    getHeaders,
  }
}

