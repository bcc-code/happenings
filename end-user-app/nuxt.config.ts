import BCCPreset from '@bcc-code/design-tokens/primevue'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  telemetry: false, // Disable telemetry to avoid EIO errors
  
  modules: [
    '@vite-pwa/nuxt', // For offline support (Nuxt 4 compatible)
    // '@nuxtjs/auth0' // Will be configured when Auth0 integration is implemented
    '@primevue/nuxt-module'
  ],

  plugins: [
    '~/plugins/globals.ts',
  ],

  css: [
    'primeicons/primeicons.css',
    '@bcc-code/design-tokens/primevue/overrides'
  ],

  primevue: {
    options: {
      theme: {
        preset: BCCPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primevue',
            order: 'theme, base, primevue, custom'
          }
        }
      },
    },
  },

  devServer: {
    port: 9001,
  },

  vite: {
    server: {
      hmr: {
        port: 24680, // Explicit HMR port to avoid conflicts (different from admin-dashboard)
      },
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:9009',
      auth0Domain: process.env.AUTH0_DOMAIN || '',
      auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
      auth0Audience: process.env.AUTH0_AUDIENCE || '',
    },
  },

  // PWA configuration for offline support
  // Minimal configuration to avoid initialization errors
  // Will be fully configured when offline support is implemented
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'BCC Events',
      short_name: 'BCC Events',
      theme_color: '#ffffff',
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['**/index.ts', '**/types.ts'],
    },
  ],

  imports: {
    // Exclude PrimeVue's useToast and useConfirm from auto-imports
    // so our custom composables in composables/ directory are used instead
    exclude: [
      'primevue/usetoast',
      'primevue/useconfirm',
    ],
  },
})
