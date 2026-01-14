<template>
  <div class="capacity-cell">
    <div class="capacity-cell__numbers">
      <span class="capacity-cell__current">{{ current }}</span>
      <span class="capacity-cell__total">/ {{ total }}</span>
    </div>
    <ProgressBar
      :value="percentage"
      :showValue="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProgressBar from 'primevue/progressbar'

export interface CapacityCellProps {
  current: number
  total: number
}

const props = defineProps<CapacityCellProps>()

const percentage = computed(() => {
  return Math.min(100, Math.round((props.current / props.total) * 100))
})
</script>

<style scoped lang="css">
.capacity-cell {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.35rem);
}

.capacity-cell__numbers {
  display: flex;
  gap: var(--spacing-2xs, 0.35rem);
  align-items: baseline;
}

.capacity-cell__current {
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #0f172a);
  font-size: var(--font-size-base, 1rem);
}

.capacity-cell__total {
  color: var(--text-color-secondary, #475569);
  font-size: var(--font-size-sm, 0.875rem);
}
</style>
