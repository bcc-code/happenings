# Components Documentation

Documentation site for BCC Events reusable Vue components, built with VitePress.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm docs:dev

# Build for production
pnpm docs:build

# Preview production build
pnpm docs:preview
```

## Structure

```
components-docs/
├── .vitepress/          # VitePress configuration
├── components/          # Component documentation pages
│   ├── introduction.md
│   ├── installation.md
│   ├── data-table.md
│   ├── search-filter.md
│   └── ...
└── index.md            # Home page
```

## Adding Components

1. Create a new markdown file in `components/`
2. Add it to the sidebar in `.vitepress/config.ts`
3. Include code examples and props documentation

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to `main` branch.
