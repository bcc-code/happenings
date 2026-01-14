# Data Sync Documentation

Welcome to the `@bcc-events/data-sync` documentation. This package provides a comprehensive client-server data synchronization engine with offline support, real-time updates, and fine-grained permissions.

## Documentation Index

### Getting Started
- [Overview](./01-overview.md) - Introduction and core concepts
- [Quick Start](./02-quick-start.md) - Get up and running quickly
- [Installation](./03-installation.md) - Installation and setup guide

### Core Concepts
- [Architecture](./04-architecture.md) - System architecture and design
- [Data Model](./05-data-model.md) - Document structure and types
- [Permissions](./06-permissions.md) - Permission system explained
- [Sync Strategy](./07-sync-strategy.md) - How synchronization works

### API Reference
- [Client API](./08-client-api.md) - Client-side API reference
- [Server API](./09-server-api.md) - Server-side API reference
- [Types Reference](./10-types-reference.md) - TypeScript types and interfaces
- [Composables](./11-composables.md) - Vue composables reference

### Advanced Topics
- [Offline Support](./12-offline-support.md) - Offline mode and storage
- [Real-time Updates](./13-realtime-updates.md) - Socket.io integration
- [Retention & Expiration](./14-retention-expiration.md) - Data lifecycle management
- [Performance](./15-performance.md) - Performance optimization

### Development
- [Plugin Development](./16-plugin-development.md) - Creating custom plugins
- [Extending the System](./17-extending.md) - Extending functionality
- [Testing](./18-testing.md) - Testing strategies
- [Contributing](./19-contributing.md) - Contribution guidelines

### Examples
- [Basic Usage](./examples/01-basic-usage.md) - Simple examples
- [Advanced Patterns](./examples/02-advanced-patterns.md) - Complex scenarios
- [Integration Examples](./examples/03-integration.md) - Full integration examples

## Quick Links

- [Integration Guide](../INTEGRATION.md) - Integration with API and frontend
- [Main README](../README.md) - Package overview
- [GitHub Issues](https://github.com/your-org/happenings/issues) - Report issues

## Support

For questions, issues, or contributions:
- Check the [FAQ](./faq.md)
- Review [Common Issues](./troubleshooting.md)
- Open an issue on GitHub

## Documentation Site

The documentation is also available as a VitePress site:

```bash
# Development
pnpm docs:dev

# Build
pnpm docs:build
```

Deployed to GitHub Pages automatically on push to main branch.
