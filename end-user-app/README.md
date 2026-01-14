# BCC Events End User App

Vue 3 + Nuxt 3 application for event attendees to register and view event information.

## Technology Stack

- Vue 3
- Nuxt 3
- PrimeVue
- @bcc-code/design-tokens
- TypeScript
- Service Workers + IndexedDB (for offline support)
- Background Sync API

## Features

- Event browsing and registration
- Profile management
- Offline viewing of event details
- Payment processing
- Communication and notifications
- Live updates via WebSocket

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

See `.env.example` for required environment variables.

## Offline Support

The app is designed to work offline, especially important for users in areas with poor connectivity. Features include:

- Cached event details
- Cached program schedules
- Offline viewing of resources
- Queued actions for sync when online

## Project Structure

```
end-user-app/
├── components/     # Vue components
├── pages/         # Nuxt pages
├── composables/   # Vue composables
├── stores/        # Pinia stores
├── utils/         # Utility functions
├── workers/       # Service workers
└── public/        # Static assets
```
