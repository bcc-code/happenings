<template>
  <Card class="stat-card">
    <template #content>
      <div class="stat-card__top">
        <span class="stat-card__icon">
          <i :class="icon"></i>
        </span>
        <div class="stat-card__meta">
          <p class="stat-card__label">{{ label }}</p>
          <p class="stat-card__value">{{ value }}</p>
        </div>
      </div>
      <div class="stat-card__footer">
        <span class="stat-card__trend" :class="trendClass">
          <i :class="trendIcon"></i>
          {{ delta }}
        </span>
        <span class="stat-card__caption">{{ caption }}</span>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'

export interface StatCardProps {
  label: string
  value: string
  delta: string
  caption: string
  icon: string
  trend: 'up' | 'down'
}

const props = defineProps<StatCardProps>()

const trendClass = computed(() => {
  return {
    'stat-card__trend--up': props.trend === 'up',
    'stat-card__trend--down': props.trend === 'down',
  }
})

const trendIcon = computed(() => {
  return props.trend === 'up' ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-left'
})
</script>

<style scoped lang="css">
.stat-card {
  border: 1px solid var(--surface-border, #e5e7eb);
  background: var(--surface-0, #ffffff);
}

.stat-card__top {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 1rem);
}

.stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius-full, 999px);
  background: var(--surface-100, #eef2ff);
  color: var(--primary-500, #4338ca);
  font-size: 1.1rem;
}

.stat-card__label {
  margin: 0;
  color: var(--text-color-secondary, #475569);
  font-size: var(--font-size-sm, 0.875rem);
}

.stat-card__value {
  margin: 0;
  font-size: var(--font-size-2xl, 2rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #0f172a);
  line-height: var(--line-height-tight, 1.2);
}

.stat-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-sm, 0.75rem);
}

.stat-card__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 0.35rem);
  font-weight: var(--font-weight-medium, 500);
  font-size: var(--font-size-sm, 0.875rem);
}

.stat-card__trend--up {
  color: var(--green-600, #16a34a);
}

.stat-card__trend--down {
  color: var(--orange-600, #ea580c);
}

.stat-card__caption {
  color: var(--text-color-secondary, #475569);
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
}
</style>
