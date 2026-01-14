# Documentation Setup Guide

This guide explains how the documentation sites are set up and deployed.

## Overview

We use **VitePress** for documentation because:
- ✅ Vue-based (matches our project stack)
- ✅ Supports Vue components in markdown (perfect for component demos)
- ✅ Fast and modern (Vite-powered)
- ✅ Great developer experience
- ✅ Built-in search and navigation

## Documentation Sites

### 1. Data Sync Documentation

**Location**: `data-sync/`  
**URL**: `https://your-org.github.io/happenings/data-sync/`  
**Source**: `data-sync/docs/` and `data-sync/.vitepress/`

### 2. Components Documentation

**Location**: `components-docs/`  
**URL**: `https://your-org.github.io/happenings/components/`  
**Source**: `components-docs/components/` and `components-docs/.vitepress/`

## Local Development

### Data Sync Docs

```bash
cd data-sync
pnpm install
pnpm docs:dev
# Opens at http://localhost:5173
```

### Components Docs

```bash
cd components-docs
pnpm install
pnpm docs:dev
# Opens at http://localhost:5173
```

## GitHub Pages Setup

### Initial Configuration

1. Go to repository **Settings** → **Pages**
2. Configure:
   - **Source**: GitHub Actions
   - This allows the workflows to deploy automatically

### GitHub Actions

Two workflows are set up:

1. **`.github/workflows/docs-data-sync.yml`**
   - Deploys data-sync documentation
   - Triggers on changes to `data-sync/docs/**` or `data-sync/.vitepress/**`
   - Deploys to `github-pages` environment

2. **`.github/workflows/docs-components.yml`**
   - Deploys components documentation
   - Triggers on changes to `components-docs/**` or `admin-dashboard/components/**`
   - Deploys to `github-pages-components` environment

### Environment Configuration

The workflows use separate GitHub Pages environments:
- `github-pages` - For data-sync docs
- `github-pages-components` - For components docs

These need to be created in:
**Settings** → **Environments** → **New environment**

### Base Path Configuration

The base paths are configured in `.vitepress/config.ts`:

```typescript
base: process.env.NODE_ENV === 'production' ? '/data-sync/' : '/',
```

This ensures:
- Production builds use the correct base path for GitHub Pages
- Local development works without base path

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add `CNAME` file to each `.vitepress/public/` directory
2. Update DNS settings
3. Update base path in config if needed

## Adding New Documentation

### Data Sync Docs

1. Add markdown files to `data-sync/docs/`
2. Update sidebar in `data-sync/.vitepress/config.ts`
3. Push to main branch (auto-deploys)

### Components Docs

1. Add markdown files to `components-docs/components/`
2. Update sidebar in `components-docs/.vitepress/config.ts`
3. Push to main branch (auto-deploys)

## Component Demos

VitePress supports Vue components in markdown. To add interactive demos:

1. Create component demo files in `.vitepress/components/`
2. Import and use in markdown:

```markdown
<script setup>
import Demo from './components/Demo.vue'
</script>

<Demo />
```

## Troubleshooting

### Docs Not Deploying

1. Check GitHub Actions workflow runs
2. Verify GitHub Pages is enabled
3. Check environment permissions
4. Review workflow logs

### Wrong Base Path

1. Verify `base` in `.vitepress/config.ts`
2. Check repository name matches base path
3. Rebuild and redeploy

### Components Not Rendering

1. Ensure components are imported correctly
2. Check Vue version compatibility
3. Verify component paths

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
