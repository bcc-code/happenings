<template>
  <div class="page-container" :class="containerClass" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PageContainerProps {
  background?: 'default' | 'surface' | 'none'
  padding?: boolean
  maxWidth?: string
}

const props = withDefaults(defineProps<PageContainerProps>(), {
  background: 'default',
  padding: true,
  maxWidth: undefined,
})

const containerClass = computed(() => {
  return {
    [`page-container--bg-${props.background}`]: true,
    'page-container--no-padding': !props.padding,
  }
})

const containerStyle = computed(() => {
  const styles: Record<string, string> = {}
  if (props.maxWidth) {
    styles['max-width'] = props.maxWidth
  }
  return styles
})
</script>

<style scoped lang="css">
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.page-container--bg-default {
  background: var(--surface-50, #f8fafc);
}

.page-container--bg-surface {
  background: var(--surface-0, #ffffff);
}

.page-container--bg-none {
  background: transparent;
}

.page-container--no-padding {
  padding: 0;
}

.page-container:not(.page-container--no-padding) {
  padding: var(--spacing-xl, 2rem);
}

.page-container[style*='max-width'] {
  margin: 0 auto;
}
</style>
