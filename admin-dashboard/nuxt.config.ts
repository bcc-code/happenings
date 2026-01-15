import BCCPreset from '@bcc-code/design-tokens/primevue'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  telemetry: false, // Disable telemetry to avoid EIO errors
  ssr: false, // Disable SSR - run as SPA only
  
  modules: [
    // PrimeVue is configured via plugin instead of module
    // '@nuxtjs/auth0' // Will be configured when Auth0 integration is implemented
    '@primevue/nuxt-module'
  ],

  css: [
    'primeicons/primeicons.css',
    'https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=IBM+Plex+Serif:wght@400;600&display=swap',
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
    port: 9002,
  },

  plugins: [
    '~/plugins/globals.ts',
  ],

  vite: {
    server: {
      hmr: {
        port: 24679, // Explicit HMR port to avoid conflicts
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

  // Service Worker for offline support
  // Will be configured when offline support is implemented
  // pwa: {
  //   // PWA configuration
  // },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['**/index.ts'],
    },
  ],
})
