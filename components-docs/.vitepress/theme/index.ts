import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register global components if needed
    // You can import and register your actual components here for demos
  },
};
