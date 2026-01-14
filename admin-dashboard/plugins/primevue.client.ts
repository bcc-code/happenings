import { defineNuxtPlugin } from '#app'
import BCCPreset from '@bcc-code/design-tokens/primevue'
import '@bcc-code/design-tokens/primevue/overrides'
import PrimeVue from 'primevue/config'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    // Configure PrimeVue
    theme: {
      preset: BCCPreset,
      options: {
        darkModeSelector: false,
        cssLayer: {
          name: 'primevue',
          order: 'theme, base, primevue, custom'
        }
      },
    },
    // Enable ripple effect (required for some components)
    ripple: true,
  })
})
