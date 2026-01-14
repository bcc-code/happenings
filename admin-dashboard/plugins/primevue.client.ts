import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue)

  // Apply design tokens as CSS variables
  // This will be customized based on actual @bcc-code/design-tokens package structure
  if (process.client) {
    try {
      // Try to import design tokens - adjust import based on actual package structure
      // @ts-expect-error - design tokens may not have types or may have different structure
      const designTokens = require('@bcc-code/design-tokens')
      
      if (designTokens) {
        const root = document.documentElement
        
        // Apply design tokens as CSS variables
        // Adjust this based on actual design token structure
        const applyTokens = (obj: any, prefix = '') => {
          Object.entries(obj).forEach(([key, value]) => {
            const cssVarName = prefix ? `${prefix}-${key}` : key
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              applyTokens(value, cssVarName)
            } else {
              root.style.setProperty(`--${cssVarName}`, String(value))
            }
          })
        }
        
        applyTokens(designTokens)
      }
    } catch (error) {
      // Design tokens package may not be available or have different structure
      // This is expected during initial setup - adjust import/usage based on actual package
      console.warn('Could not load design tokens:', error)
    }
  }
})
