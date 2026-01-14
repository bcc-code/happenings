import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'BCC Events Components',
  description: 'Reusable Vue components for BCC Events applications',
  base: process.env.NODE_ENV === 'production' ? '/components/' : '/',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Components', link: '/components/data-table' },
      { text: 'GitHub', link: 'https://github.com/your-org/happenings' },
    ],
    
    sidebar: {
      '/components/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/components/introduction' },
            { text: 'Installation', link: '/components/installation' },
          ],
        },
        {
          text: 'Data Components',
          items: [
            { text: 'DataTable', link: '/components/data-table' },
            { text: 'SearchFilter', link: '/components/search-filter' },
          ],
        },
        {
          text: 'Form Components',
          items: [
            { text: 'FormBuilder', link: '/components/form-builder' },
            { text: 'FormField', link: '/components/form-field' },
            { text: 'FormFieldGroup', link: '/components/form-field-group' },
          ],
        },
        {
          text: 'Other Components',
          items: [
            { text: 'RelationshipSelect', link: '/components/relationship-select' },
            { text: 'RelationshipTable', link: '/components/relationship-table' },
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
