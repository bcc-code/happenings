# BCC Events Registration App

A multi-tenant event registration system for churches worldwide, supporting program management, catering, resources, finance, and communication.

## Project Structure

This project consists of four main components:

- **API** - Backend API server handling all business logic, multi-tenancy, and data management
- **Admin Dashboard** - Vue/Nuxt application for church administrators to manage events and settings
- **End User App** - Vue/Nuxt application for event attendees to register and view event information
- **Shared** - Shared TypeScript types, utilities, and Vue composables used across all packages
- **Infrastructure** - Terraform configurations for deploying to Google Cloud Platform

## Key Features

- **Multi-Tenancy**: Each church operates as an independent tenant
- **Auth0 Integration**: Centralized user authentication and authorization
- **Cross-Church Events**: Users can register for events from other churches if marked as global
- **Family Registrations**: Register multiple family members together using BCC Core API SDK relationships
- **Payment Plugins**: Churches can integrate their own payment providers
- **Offline Support**: End user app works offline for viewing (critical for areas with poor connectivity)
- **Live Updates**: Both admin and app support real-time updates

## Core Modules

1. **Program** - Event scheduling, sessions, speakers, and program management
2. **Catering** - Meal planning, dietary requirements, and food service management
3. **Resources** - Volunteer shift management for event participants and non-participants
4. **Finance** - Payment processing, invoicing, and financial reporting
5. **Communication** - Notifications, announcements, and messaging

## Technology Stack

- **Package Manager**: pnpm (workspace)
- **Frontend**: Vue 3, Nuxt 3, PrimeVue
- **Design System**: @bcc-code/design-tokens
- **Shared Package**: @bcc-events/shared (types, utils, composables)
- **Backend**: Bun, TypeScript, native PostgreSQL driver
- **Database**: PostgreSQL (native `postgres` driver)
- **Authentication**: Auth0
- **Core API**: @bcc-code/bcc-core-api-node-sdk
- **Offline Support**: Service Workers, IndexedDB

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Set up database
pnpm migrate
```

See [QUICK_START.md](./QUICK_START.md) for more details.

### Testing

This project maintains a strict unit test culture with separate pipelines for components and API/business logic.

**Quick Start:**
```bash
# Run all tests
pnpm test

# Run component tests only
pnpm test:components

# Run API tests only
pnpm test:api
```

For detailed testing documentation, see:
- [TESTING.md](./TESTING.md) - Complete testing guide
- [TESTING_QUICK_START.md](./TESTING_QUICK_START.md) - Quick reference

### Infrastructure Deployment

For deploying to Google Cloud Platform, see the [infrastructure documentation](./infra/README.md) and [deployment guide](./infra/DEPLOYMENT.md).

## Development Status

This project is in the planning phase. Requirements and specifications are being documented before implementation begins.
