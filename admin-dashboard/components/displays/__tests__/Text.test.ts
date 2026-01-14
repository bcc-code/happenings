/**
 * Example test for Text display component
 * Demonstrates best practices for component testing
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Text from '../Text.vue';

describe('Text Display Component', () => {
  it('renders text value correctly', () => {
    const wrapper = mount(Text, {
      props: {
        value: 'Hello World',
      },
    });

    expect(wrapper.text()).toBe('Hello World');
    expect(wrapper.find('.display-text').exists()).toBe(true);
  });

  it('displays fallback when value is null', () => {
    const wrapper = mount(Text, {
      props: {
        value: null,
      },
    });

    expect(wrapper.text()).toBe('—');
  });

  it('displays fallback when value is undefined', () => {
    const wrapper = mount(Text, {
      props: {
        value: undefined,
      },
    });

    expect(wrapper.text()).toBe('—');
  });

  it('truncates text when truncate is enabled and text exceeds maxLength', () => {
    const longText = 'A'.repeat(150);
    const wrapper = mount(Text, {
      props: {
        value: longText,
        truncate: true,
        maxLength: 100,
      },
    });

    const displayedText = wrapper.text();
    expect(displayedText.length).toBe(103); // 100 + '...'
    expect(displayedText).toContain('...');
  });

  it('does not truncate when truncate is disabled', () => {
    const longText = 'A'.repeat(150);
    const wrapper = mount(Text, {
      props: {
        value: longText,
        truncate: false,
        maxLength: 100,
      },
    });

    expect(wrapper.text()).toBe(longText);
  });

  it('applies correct variant classes', () => {
    const variants = ['default', 'muted', 'bold', 'italic'] as const;

    variants.forEach((variant) => {
      const wrapper = mount(Text, {
        props: {
          value: 'Test',
          variant,
        },
      });

      expect(wrapper.find(`.display-text--${variant}`).exists()).toBe(true);
    });
  });

  it('applies truncate class when truncate is enabled', () => {
    const wrapper = mount(Text, {
      props: {
        value: 'A'.repeat(150),
        truncate: true,
      },
    });

    expect(wrapper.find('.display-text--truncate').exists()).toBe(true);
  });

  it('uses custom ellipsis string', () => {
    const longText = 'A'.repeat(150);
    const wrapper = mount(Text, {
      props: {
        value: longText,
        truncate: true,
        maxLength: 100,
        ellipsis: '…',
      },
    });

    expect(wrapper.text()).toContain('…');
    expect(wrapper.text()).not.toContain('...');
  });

  it('sets title attribute when text is truncated', async () => {
    const longText = 'A'.repeat(150);
    const wrapper = mount(Text, {
      props: {
        value: longText,
        truncate: true,
        maxLength: 100,
      },
    });

    await wrapper.vm.$nextTick();
    const element = wrapper.find('.display-text').element;
    expect(element.getAttribute('title')).toBe(longText);
  });

  it('does not set title attribute when text is not truncated', () => {
    const wrapper = mount(Text, {
      props: {
        value: 'Short text',
        truncate: true,
        maxLength: 100,
      },
    });

    const element = wrapper.find('.display-text').element;
    expect(element.getAttribute('title')).toBeNull();
  });
});
