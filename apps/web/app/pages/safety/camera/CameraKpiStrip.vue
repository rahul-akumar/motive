<script setup lang="ts">
import { useCameraData, getStatusGroup, type KpiFilter } from '~/composables/useCameraData'

export interface CameraKpiStripProps {
  active: KpiFilter | null
}

const props = defineProps<CameraKpiStripProps>()
const emit = defineEmits<{ select: [filter: KpiFilter | null] }>()

const { cameras } = useCameraData()

const counts = computed(() => {
  const result = { online: 0, offline: 0, pending: 0, issues: 0 }
  for (const cam of cameras) result[getStatusGroup(cam.status)]++
  return result
})

const cards = computed(() => [
  { key: 'online' as KpiFilter, label: 'Online', count: counts.value.online, color: 'success' },
  { key: 'offline' as KpiFilter, label: 'Offline', count: counts.value.offline, color: 'danger' },
  {
    key: 'pending' as KpiFilter,
    label: 'Pending Setup',
    count: counts.value.pending,
    color: 'warning',
  },
  { key: 'issues' as KpiFilter, label: 'Issues', count: counts.value.issues, color: 'issues' },
])

function handleClick(key: KpiFilter) {
  emit('select', props.active === key ? null : key)
}
</script>

<template>
  <div class="kpi-strip">
    <button
      v-for="card in cards"
      :key="card.key"
      :class="['kpi-card', `kpi-card--${card.color}`, { 'kpi-card--active': active === card.key }]"
      type="button"
      @click="handleClick(card.key)"
    >
      <span class="kpi-card__count">{{ card.count }}</span>
      <span class="kpi-card__label">{{ card.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.kpi-strip {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.kpi-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.875rem 1rem;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-left-width: 3px;
  border-radius: var(--card-radius, 6px);
  cursor: pointer;
  text-align: left;
  transition: background-color 120ms ease;
}

.kpi-card:hover {
  background-color: var(--bg-hover);
}

.kpi-card--active {
  background-color: var(--bg-hover);
}

.kpi-card__count {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--leading-none);
  transition: color 120ms ease;
}

.kpi-card__label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Color variants */
.kpi-card--success {
  border-left-color: #10b981;
}
.kpi-card--danger {
  border-left-color: #ef4444;
}
.kpi-card--warning {
  border-left-color: #f59e0b;
}
.kpi-card--issues {
  border-left-color: #f97316;
}

.kpi-card--success.kpi-card--active .kpi-card__count {
  color: #10b981;
}
.kpi-card--danger.kpi-card--active .kpi-card__count {
  color: #ef4444;
}
.kpi-card--warning.kpi-card--active .kpi-card__count {
  color: #f59e0b;
}
.kpi-card--issues.kpi-card--active .kpi-card__count {
  color: #f97316;
}
</style>
