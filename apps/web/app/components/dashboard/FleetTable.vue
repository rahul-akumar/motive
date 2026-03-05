<script setup lang="ts">
import type { Driver } from '@motive/shared'

const props = defineProps<{
  drivers: Driver[]
}>()

type SortKey = 'name' | 'status' | 'location' | 'milesDrivenToday' | 'hosRemaining'
type SortDir = 'asc' | 'desc'

const sortKey = ref<SortKey>('status')
const sortDir = ref<SortDir>('asc')
const currentPage = ref(1)
const pageSize = 8

function setSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const statusOrder: Record<string, number> = {
  alert: 0,
  driving: 1,
  idle: 2,
  sleeper: 3,
  offline: 4,
}

const sorted = computed(() => {
  return [...props.drivers].sort((a, b) => {
    let cmp = 0
    switch (sortKey.value) {
      case 'name':
        cmp = a.name.localeCompare(b.name)
        break
      case 'status':
        cmp = (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
        break
      case 'location':
        cmp = a.currentLocation.city.localeCompare(b.currentLocation.city)
        break
      case 'milesDrivenToday':
        cmp = a.milesDrivenToday - b.milesDrivenToday
        break
      case 'hosRemaining':
        cmp = a.hos.drivingRemaining - b.hos.drivingRemaining
        break
    }
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const totalPages = computed(() => Math.ceil(sorted.value.length / pageSize))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})

function statusLabel(status: string): string {
  return status.toUpperCase()
}

function hosColor(driver: Driver): string {
  if (driver.hos.hasViolation) return '#dc2626'
  if (driver.hos.drivingRemaining <= 1) return '#dc2626'
  if (driver.hos.drivingRemaining <= 3) return '#d97706'
  if (!import.meta.client) return '#555555'
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() ||
    '#555555'
  )
}
</script>

<template>
  <div class="fleet-table-card fleet-card">
    <div class="fleet-table-card__header">
      <div>
        <h2 class="fleet-table-card__title">Fleet Status</h2>
        <p class="fleet-table-card__subtitle font-mono-data">{{ drivers.length }} drivers</p>
      </div>
      <button class="fleet-table-card__export" type="button" aria-label="Export fleet data">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
    </div>

    <div
      class="fleet-table-card__scroll"
      role="region"
      aria-label="Fleet driver table"
      tabindex="0"
    >
      <table class="fleet-table" aria-label="Driver fleet status">
        <thead>
          <tr>
            <th
              scope="col"
              :class="{ sorted: sortKey === 'name' }"
              @click="setSort('name')"
              :aria-sort="
                sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              "
            >
              Driver
              <span v-if="sortKey === 'name'" aria-hidden="true">{{
                sortDir === 'asc' ? ' ↑' : ' ↓'
              }}</span>
            </th>
            <th
              scope="col"
              :class="{ sorted: sortKey === 'status' }"
              @click="setSort('status')"
              :aria-sort="
                sortKey === 'status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              "
            >
              Status
              <span v-if="sortKey === 'status'" aria-hidden="true">{{
                sortDir === 'asc' ? ' ↑' : ' ↓'
              }}</span>
            </th>
            <th
              scope="col"
              :class="{ sorted: sortKey === 'location' }"
              @click="setSort('location')"
              :aria-sort="
                sortKey === 'location' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              "
            >
              Location
              <span v-if="sortKey === 'location'" aria-hidden="true">{{
                sortDir === 'asc' ? ' ↑' : ' ↓'
              }}</span>
            </th>
            <th scope="col">Vehicle</th>
            <th
              scope="col"
              :class="{ sorted: sortKey === 'milesDrivenToday' }"
              @click="setSort('milesDrivenToday')"
              :aria-sort="
                sortKey === 'milesDrivenToday'
                  ? sortDir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              "
            >
              Miles Today
              <span v-if="sortKey === 'milesDrivenToday'" aria-hidden="true">{{
                sortDir === 'asc' ? ' ↑' : ' ↓'
              }}</span>
            </th>
            <th
              scope="col"
              :class="{ sorted: sortKey === 'hosRemaining' }"
              @click="setSort('hosRemaining')"
              :aria-sort="
                sortKey === 'hosRemaining'
                  ? sortDir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              "
            >
              HOS Left
              <span v-if="sortKey === 'hosRemaining'" aria-hidden="true">{{
                sortDir === 'asc' ? ' ↑' : ' ↓'
              }}</span>
            </th>
            <th scope="col">ETA</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="driver in paginated" :key="driver.id">
            <!-- Driver -->
            <td>
              <div class="fleet-table__driver-cell">
                <div class="fleet-table__avatar" aria-hidden="true">{{ driver.initials }}</div>
                <div>
                  <div class="fleet-table__driver-name">{{ driver.name }}</div>
                  <div class="fleet-table__driver-id font-mono-data">{{ driver.id }}</div>
                </div>
              </div>
            </td>
            <!-- Status -->
            <td>
              <span
                :class="`status-badge status-badge--${driver.status === 'sleeper' ? 'idle' : driver.status}`"
              >
                <span
                  :class="`status-dot status-dot--${driver.status === 'sleeper' ? 'idle' : driver.status}`"
                  aria-hidden="true"
                />
                {{ statusLabel(driver.status) }}
              </span>
            </td>
            <!-- Location -->
            <td>
              <span class="fleet-table__location"
                >{{ driver.currentLocation.city }}, {{ driver.currentLocation.state }}</span
              >
            </td>
            <!-- Vehicle -->
            <td>
              <span class="fleet-table__vehicle font-mono-data">{{ driver.vehicleId }}</span>
            </td>
            <!-- Miles Today -->
            <td>
              <span class="fleet-table__miles font-mono-data">
                {{ driver.milesDrivenToday > 0 ? driver.milesDrivenToday.toLocaleString() : '—' }}
              </span>
            </td>
            <!-- HOS Remaining -->
            <td>
              <span
                class="fleet-table__hos font-mono-data"
                :style="{ color: hosColor(driver) }"
                :aria-label="`${driver.hos.drivingRemaining.toFixed(1)} hours remaining`"
              >
                {{
                  driver.hos.hasViolation
                    ? 'VIOLATION'
                    : `${driver.hos.drivingRemaining.toFixed(1)}h`
                }}
              </span>
            </td>
            <!-- ETA -->
            <td>
              <span class="fleet-table__eta font-mono-data">{{ driver.etaNextStop || '—' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="fleet-table-card__pagination" aria-label="Table pagination">
      <span class="fleet-table-card__page-info font-mono-data">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <div class="fleet-table-card__page-btns">
        <button
          class="fleet-table-card__page-btn"
          type="button"
          :disabled="currentPage === 1"
          @click="currentPage--"
          aria-label="Previous page"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          class="fleet-table-card__page-btn"
          type="button"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          aria-label="Next page"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fleet-table-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fleet-table-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0;
}

.fleet-table-card__title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  margin: 0;
}

.fleet-table-card__subtitle {
  font-size: 0.6875rem;
  color: var(--text-muted);
  margin: 2px 0 0;
  letter-spacing: 0.04em;
}

.fleet-table-card__export {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background-color: transparent;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text-secondary);
  font-size: 0.6875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    color 100ms ease,
    border-color 100ms ease;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.06em;
}

.fleet-table-card__export:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.06);
}

.fleet-table-card__scroll {
  overflow-x: auto;
  margin-top: 1rem;
}

.fleet-table__driver-cell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.fleet-table__avatar {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fleet-table__driver-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.fleet-table__driver-id {
  font-size: 0.6875rem;
  color: var(--text-muted);
  letter-spacing: 0.03em;
}

.fleet-table__location {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.fleet-table__vehicle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}

.fleet-table__miles {
  font-size: 0.8125rem;
  color: var(--text-primary);
  letter-spacing: 0.04em;
}

.fleet-table__hos {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.fleet-table__eta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}

.fleet-table-card__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border);
}

.fleet-table-card__page-info {
  font-size: 0.6875rem;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.fleet-table-card__page-btns {
  display: flex;
  gap: 0.25rem;
}

.fleet-table-card__page-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    color 100ms ease,
    border-color 100ms ease;
}

.fleet-table-card__page-btn:hover:not(:disabled) {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.04);
}

.fleet-table-card__page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
