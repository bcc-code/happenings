# BCC Events Registration App

A multi-tenant event registration system for churches worldwide, supporting program management, catering, resources, finance, and communication.

## Project Overview

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

## Documentation

### Getting Started
- [Quick Start Guide](getting-started/quick-start.md) - Get up and running quickly
- [Installation](getting-started/installation.md) - Detailed installation instructions

### Architecture
- [System Architecture](architecture/overview.md) - High-level system design

### Development
- [Development Guide](development/development.md) - Development workflow and practices
- [Contributing](development/contributing.md) - Contribution guidelines

### API Documentation
- [API Structure](api/api-structure.md) - API organization and patterns
- [Audit Logging](api/audit-logging.md) - Audit logging system
- [Event System](api/event-system.md) - Event-driven architecture
- [Database Migrations](api/migrations.md) - Migration guides and notes

### Requirements
- [Program Module](requirements/program.md) - Event scheduling and program management
- [Catering Module](requirements/catering.md) - Meal planning and dietary requirements
- [Resources Module](requirements/resources.md) - Volunteer shift management
- [Finance Module](requirements/finance.md) - Payment processing and invoicing
- [Communication Module](requirements/communication.md) - Notifications and messaging
- [Family Registrations](requirements/family-registrations.md) - Family registration support
- [Payment Plugins](requirements/payment-plugins.md) - Payment provider plugin system
- [Multi-Tenancy](requirements/multi-tenancy.md) - Multi-tenant architecture
- [Offline Support](requirements/offline-support.md) - Offline functionality strategy
- [Auth0 Integration](requirements/auth0-integration.md) - Authentication setup

### Components
- [Component Documentation](components/index.md) - UI component library
- [Form Builder](components/form-builder.md) - Form builder component
- [Data Table](components/data-table.md) - Data table component
- [Search Filter](components/search-filter.md) - Search and filter components

### Data Sync
- [Data Sync Overview](data-sync/index.md) - Data synchronization system
- [Quick Start](data-sync/quick-start.md) - Getting started with data sync
- [Client API](data-sync/client-api.md) - Client-side API
- [Server API](data-sync/server-api.md) - Server-side API
- [Offline Support](data-sync/offline-support.md) - Offline capabilities

### Infrastructure
- [Infrastructure Overview](infrastructure/overview.md) - Infrastructure documentation
- [Deployment Guide](infrastructure/deployment.md) - Deployment instructions

### Testing
- [Testing Guide](testing/testing.md) - Complete testing documentation
- [Testing Quick Start](testing/quick-start.md) - Quick reference for testing
- [Migration Notes](testing/migration-notes.md) - Testing migration notes

## Quick Links

- [Project Status](../../PROJECT_STATUS.md) - Current project status
- [Package Updates](../../PACKAGE_UPDATES.md) - Package update history

## Getting Started

See the [Quick Start Guide](getting-started/quick-start.md) to begin developing with this project.

## Contributing

Please read our [Contributing Guide](development/contributing.md) before submitting pull requests.
