/**
 * Composable for super admin authentication
 */

export const useSuperAdminAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('super_admin_token', {
    default: () => null,
    secure: true,
    sameSite: 'strict',
  })
  const user = useState<any | null>('super_admin_user', () => null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string) {
    try {
      const response = await $fetch<{ data: { token: string; user: any } }>(
        `${config.public.apiUrl}/api/shared/login`,
        {
          method: 'POST',
          body: {
            username,
            password,
          },
        }
      )

      if (response.data?.token) {
        token.value = response.data.token
        user.value = response.data.user
        return { success: true }
      }

      return { success: false, error: 'Invalid response' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.error || error.message || 'Login failed',
      }
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  async function verifyToken() {
    if (!token.value) {
      return false
    }

    try {
      const response = await $fetch<{ data: { valid: boolean } }>(
        `${config.public.apiUrl}/api/shared/verify`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        }
      )

      if (response.data?.valid) {
        return true
      }

      // Token invalid, clear it
      token.value = null
      user.value = null
      return false
    } catch (error) {
      // Token invalid, clear it
      token.value = null
      user.value = null
      return false
    }
  }

  function getAuthHeaders() {
    if (!token.value) {
      return {}
    }

    return {
      Authorization: `Bearer ${token.value}`,
    }
  }

  return {
    token: readonly(token),
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    verifyToken,
    getAuthHeaders,
  }
}
