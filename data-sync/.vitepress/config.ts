import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Data Sync',
  description: 'Client-server data synchronization engine with offline support',
  base: process.env.NODE_ENV === 'production' ? '/data-sync/' : '/',
  srcDir: 'docs',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/docs/01-overview' },
      { text: 'API', link: '/docs/08-client-api' },
      { text: 'Examples', link: '/docs/examples/01-basic-usage' },
    ],
    
    sidebar: {
      '/docs/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/docs/01-overview' },
            { text: 'Quick Start', link: '/docs/02-quick-start' },
            { text: 'Installation', link: '/docs/03-installation' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture', link: '/docs/04-architecture' },
            { text: 'Data Model', link: '/docs/05-data-model' },
            { text: 'Permissions', link: '/docs/06-permissions' },
            { text: 'Sync Strategy', link: '/docs/07-sync-strategy' },
          ],
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Client API', link: '/docs/08-client-api' },
            { text: 'Server API', link: '/docs/09-server-api' },
            { text: 'Types Reference', link: '/docs/10-types-reference' },
            { text: 'Composables', link: '/docs/11-composables' },
          ],
        },
        {
          text: 'Advanced Topics',
          items: [
            { text: 'Offline Support', link: '/docs/12-offline-support' },
            { text: 'Real-time Updates', link: '/docs/13-realtime-updates' },
            { text: 'Retention & Expiration', link: '/docs/14-retention-expiration' },
            { text: 'Performance', link: '/docs/15-performance' },
          ],
        },
        {
          text: 'Development',
          items: [
            { text: 'Plugin Development', link: '/docs/16-plugin-development' },
            { text: 'Extending the System', link: '/docs/17-extending' },
            { text: 'Testing', link: '/docs/18-testing' },
            { text: 'Contributing', link: '/docs/19-contributing' },
          ],
        },
        {
          text: 'Examples',
          items: [
            { text: 'Basic Usage', link: '/docs/examples/01-basic-usage' },
            { text: 'Advanced Patterns', link: '/docs/examples/02-advanced-patterns' },
            { text: 'Integration', link: '/docs/examples/03-integration' },
          ],
        },
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/happenings' },
    ],
    
    search: {
      provider: 'local',
    },
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 BCC Events',
    },
  },
  
  markdown: {
    lineNumbers: true,
  },
});
