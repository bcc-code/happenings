<template>
  <div class="display-json" :class="jsonClass">
    <pre v-if="!collapsed || !collapsible"><code>{{ formattedJson }}</code></pre>
    <Button
      v-if="collapsible"
      :label="collapsed ? 'Show JSON' : 'Hide JSON'"
      text
      size="small"
      icon="pi pi-code"
      @click="toggleCollapse"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'

export interface JsonProps {
  value: any
  collapsible?: boolean
  collapsed?: boolean
  indent?: number
  highlight?: boolean
}

const props = withDefaults(defineProps<JsonProps>(), {
  value: undefined,
  collapsible: true,
  collapsed: false,
  indent: 2,
  highlight: false,
})

const isCollapsed = ref(props.collapsed)

const jsonClass = computed(() => {
  return {
    'display-json--collapsible': props.collapsible,
    'display-json--highlight': props.highlight,
  }
})

const formattedJson = computed(() => {
  if (!props.value) return 'null'
  
  try {
    return JSON.stringify(props.value, null, props.indent)
  } catch (error) {
    return String(props.value)
  }
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped lang="css">
.display-json {
  background: var(--surface-50, #fafafa);
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: var(--border-radius-md, 6px);
  padding: var(--spacing-md, 1rem);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: var(--line-height-relaxed, 1.6);
  overflow-x: auto;
}

.display-json pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.display-json code {
  color: var(--text-color, #212529);
}

.display-json--highlight code {
  color: var(--blue-700, #1d4ed8);
}

.display-json--collapsible {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
}
</style>