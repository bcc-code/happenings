// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-12',
  devtools: { enabled: true },
  telemetry: false, // Disable telemetry to avoid EIO errors
  
  modules: [
    '@nuxtjs/pwa', // For offline support
    // '@nuxtjs/auth0' // Will be configured when Auth0 integration is implemented
  ],

  css: [
    'primevue/resources/themes/lara-light-blue/theme.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
  ],

  devServer: {
    port: 9001,
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:9000',
      auth0Domain: process.env.AUTH0_DOMAIN || '',
      auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
      auth0Audience: process.env.AUTH0_AUDIENCE || '',
    },
  },

  // PWA configuration for offline support
  pwa: {
    // Will be configured when offline support is implemented
    // manifest: {
    //   name: 'BCC Events',
    //   short_name: 'BCC Events',
    //   theme_color: '#ffffff',
    // },
    // workbox: {
    //   // Service worker configuration
    // },
  },
})
