<script setup lang="ts">
import { Film, Truck, Wrench, Phone, VideoOff, X, MoreHorizontal } from 'lucide-vue-next'
import { MBadge, MDropdown, MIcon } from '@motive/ui'
import type { MDropdownItem } from '@motive/ui'
import {
  useCameraData,
  getStatusGroup,
  STATUS_SEVERITY,
  type CameraType,
  type CameraStatus,
  type KpiFilter,
} from '~/composables/useCameraData'

export interface CameraTableProps {
  typeFilter: 'all' | CameraType
  statusFilter: KpiFilter | null
  search: string
}

const props = defineProps<CameraTableProps>()

const { cameras } = useCameraData()

// ── Filtering + sorting ──────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = cameras

  if (props.typeFilter !== 'all') {
    list = list.filter((c) => c.type === props.typeFilter)
  }

  if (props.statusFilter) {
    list = list.filter((c) => getStatusGroup(c.status) === props.statusFilter)
  }

  if (props.search.trim()) {
    const q = props.search.trim().toLowerCase()
    list = list.filter(
      (c) => c.vehicle.toLowerCase().includes(q) || c.assetId.toLowerCase().includes(q),
    )
  }

  return [...list].sort((a, b) => STATUS_SEVERITY[a.status] - STATUS_SEVERITY[b.status])
})

// ── Status display helpers ───────────────────────────────────────────────────

const STATUS_LABELS: Record<CameraStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  'pending-setup': 'Pending Setup',
  'installation-issue': 'Install Issue',
  'signal-issue': 'Signal Issue',
}

type BadgeColor = 'success' | 'danger' | 'warning' | 'error' | 'default'

const STATUS_COLORS: Record<CameraStatus, BadgeColor> = {
  online: 'success',
  offline: 'danger',
  'pending-setup': 'default',
  'installation-issue': 'warning',
  'signal-issue': 'warning',
}

// ── Type display helpers ─────────────────────────────────────────────────────

const TYPE_LABELS: Record<CameraType, string> = {
  dashcam: 'Dashcam',
  'ai-omnicam': 'AI Omnicam',
  'multi-cam-dvr': 'Multi-Cam DVR',
}

// ── Preview overlay ──────────────────────────────────────────────────────────

const previewSrc = ref<string | null>(null)

function openPreview(url: string) {
  previewSrc.value = url
}

function closePreview() {
  previewSrc.value = null
}

function handleOverlayKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closePreview()
}

// ── Actions dropdown ─────────────────────────────────────────────────────────

const openMenuIndex = ref<number | null>(null)
const menuAnchor = ref<HTMLElement | null>(null)

const actionItems: MDropdownItem[] = [
  { label: 'View footage', icon: Film },
  { label: 'Reassign vehicle', icon: Truck },
  { label: 'Mark for service', icon: Wrench },
  { divider: true, label: '' },
  { label: 'Contact driver', icon: Phone },
]

function openMenu(index: number, el: HTMLElement) {
  if (openMenuIndex.value === index) {
    openMenuIndex.value = null
    menuAnchor.value = null
  } else {
    openMenuIndex.value = index
    menuAnchor.value = el
  }
}
</script>

<template>
  <div class="camera-table-wrap">
    <!-- Table -->
    <table class="camera-table" v-if="filtered.length > 0">
      <thead>
        <tr>
          <th>Vehicle / Asset</th>
          <th>Type</th>
          <th>Facing</th>
          <th>Status</th>
          <th>Last Location</th>
          <th>Preview</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cam, index) in filtered" :key="cam.id">
          <!-- Vehicle -->
          <td>
            <span class="cell-primary">{{ cam.vehicle }}</span>
            <span class="cell-sub">{{ cam.assetId }}</span>
          </td>

          <!-- Type -->
          <td class="cell-primary">{{ TYPE_LABELS[cam.type] }}</td>

          <!-- Facing -->
          <td>
            <MBadge :label="cam.facing === 'dual' ? 'Dual' : 'Road'" color="default" size="sm" />
          </td>

          <!-- Status -->
          <td>
            <MBadge
              :label="STATUS_LABELS[cam.status]"
              :color="STATUS_COLORS[cam.status]"
              size="sm"
            />
          </td>

          <!-- Last Location + Time -->
          <td>
            <span class="cell-primary">{{ cam.lastLocation }}</span>
            <span class="cell-sub">{{ cam.lastSeen }}</span>
          </td>

          <!-- Preview -->
          <td class="cell-preview">
            <button
              v-if="cam.previewUrl"
              class="thumb-btn"
              type="button"
              aria-label="Preview camera feed"
              @click="openPreview(cam.previewUrl!)"
            >
              <img :src="cam.previewUrl" class="thumb" loading="lazy" alt="" />
            </button>
            <div v-else class="thumb-offline">
              <MIcon :icon="VideoOff" :size="16" />
            </div>
          </td>

          <!-- Actions -->
          <td class="cell-actions">
            <button
              :ref="(el) => {}"
              class="action-btn"
              type="button"
              aria-label="Camera actions"
              @click="openMenu(index, $event.currentTarget as HTMLElement)"
            >
              <MIcon :icon="MoreHorizontal" :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty state -->
    <div v-else class="camera-table-empty">
      <VideoOff class="camera-table-empty__icon" :size="32" aria-hidden="true" />
      <p class="camera-table-empty__text">No cameras match your filters</p>
      <button class="camera-table-empty__clear" type="button" @click="$emit('clear')">
        Clear filters
      </button>
    </div>

    <!-- Actions dropdown (single instance, repositioned per row) -->
    <MDropdown
      :items="actionItems"
      :open="openMenuIndex !== null"
      :anchor-el="menuAnchor"
      placement="right"
      @update:open="
        (v) => {
          if (!v) openMenuIndex = null
        }
      "
    />
  </div>

  <!-- Preview overlay -->
  <Teleport to="body">
    <Transition name="preview">
      <div
        v-if="previewSrc"
        class="preview-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Camera preview"
        @click.self="closePreview"
        @keydown="handleOverlayKey"
      >
        <img :src="previewSrc" class="preview-overlay__img" alt="Camera preview" />
        <button
          class="preview-overlay__close"
          type="button"
          aria-label="Close preview"
          @click="closePreview"
        >
          <X :size="18" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Table wrapper ─────────────────────────────────────────────────────────── */
.camera-table-wrap {
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--card-radius, 6px);
  overflow: hidden;
}

/* ── Table ─────────────────────────────────────────────────────────────────── */
.camera-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-base);
}

.camera-table thead th {
  padding: 0.625rem 1rem;
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-muted);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.camera-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background-color 100ms ease;
}

.camera-table tbody tr:last-child {
  border-bottom: none;
}

.camera-table tbody tr:hover {
  background-color: var(--bg-hover);
}

.camera-table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

/* ── Cell types ────────────────────────────────────────────────────────────── */
.cell-primary {
  display: block;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.cell-sub {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-top: 0.1rem;
  font-family: var(--font-family-mono);
}

/* ── Preview cell ──────────────────────────────────────────────────────────── */
.cell-preview {
  width: 120px;
}

.thumb-btn {
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: opacity 120ms ease;
}

.thumb-btn:hover {
  opacity: 0.85;
}

.thumb {
  display: block;
  width: 112px;
  height: 63px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.thumb-offline {
  width: 112px;
  height: 63px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background-color: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

/* ── Actions cell ──────────────────────────────────────────────────────────── */
.cell-actions {
  width: 44px;
  text-align: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    background-color 100ms ease,
    color 100ms ease;
}

.action-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* ── Empty state ───────────────────────────────────────────────────────────── */
.camera-table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.camera-table-empty__icon {
  opacity: 0.4;
  margin-bottom: 0.25rem;
}

.camera-table-empty__text {
  font-size: var(--font-size-base);
  margin: 0;
}

.camera-table-empty__clear {
  margin-top: 0.25rem;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  transition: background-color 100ms ease;
}

.camera-table-empty__clear:hover {
  background-color: var(--bg-hover);
}

/* ── Preview overlay ───────────────────────────────────────────────────────── */
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-overlay__img {
  max-width: min(900px, 90vw);
  max-height: 85vh;
  border-radius: 6px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
}

.preview-overlay__close {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: background-color 120ms ease;
}

.preview-overlay__close:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* ── Transitions ───────────────────────────────────────────────────────────── */
.preview-enter-active,
.preview-leave-active {
  transition: opacity 150ms ease;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
}
</style>
