<template>
  <span class="timeline-marker" :class="markerClass">
    <i :class="icon"></i>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TimelineMarkerProps {
  icon: string
  severity: 'info' | 'success' | 'warning'
}

const props = defineProps<TimelineMarkerProps>()

const markerClass = computed(() => {
  return {
    [`timeline-marker--${props.severity}`]: true,
  }
})
</script>

<style scoped lang="css">
.timeline-marker {
  width: 38px;
  height: 38px;
  border-radius: var(--border-radius-full, 999px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--surface-0, #ffffff);
  font-size: var(--font-size-base, 1rem);
}

.timeline-marker--info {
  background: var(--blue-500, #2563eb);
}

.timeline-marker--success {
  background: var(--green-500, #22c55e);
}

.timeline-marker--warning {
  background: var(--orange-500, #f97316);
}
</style>
