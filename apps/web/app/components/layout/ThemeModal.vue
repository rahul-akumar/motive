<script setup lang="ts">
import { X, Check, Sliders } from 'lucide-vue-next'
import { MModal } from '@motive/ui'
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { currentTheme, themes, applyTheme } = useTheme()

function selectTheme(id: string) {
  applyTheme(id as any)
}
</script>

<template>
  <MModal :open="open" max-width="520px" @close="emit('close')">
    <!-- Header -->
    <div class="modal-header">
      <div class="modal-header__left">
        <div class="modal-header__icon" aria-hidden="true">
          <Sliders :size="14" />
        </div>
        <div>
          <h2 class="modal-title font-mono-data">APPEARANCE</h2>
          <p class="modal-subtitle font-mono-data">Select interface theme</p>
        </div>
      </div>
      <button
        class="modal-close"
        type="button"
        aria-label="Close theme settings"
        @click="emit('close')"
      >
        <X :size="14" />
      </button>
    </div>

    <!-- Theme Grid -->
    <div class="theme-grid" role="radiogroup" aria-label="Available themes">
      <button
        v-for="theme in themes"
        :key="theme.id"
        class="theme-card"
        :class="{ 'theme-card--active': currentTheme === theme.id }"
        :style="{
          '--card-accent': theme.accent,
          '--card-bg': theme.bgBase,
          '--card-surface': theme.bgCard,
          '--card-text': theme.textPrimary,
        }"
        type="button"
        role="radio"
        :aria-checked="currentTheme === theme.id"
        :aria-label="`${theme.name}: ${theme.description}`"
        @click="selectTheme(theme.id)"
      >
        <!-- Mini preview -->
        <div
          class="theme-preview"
          :class="{ 'theme-preview--flat': theme.layout === 'flat' }"
          aria-hidden="true"
        >
          <!-- Preview sidebar strip -->
          <div class="theme-preview__sidebar">
            <div class="theme-preview__logo" />
            <div class="theme-preview__nav-item theme-preview__nav-item--active" />
            <div class="theme-preview__nav-item" />
            <div class="theme-preview__nav-item" />
            <div class="theme-preview__nav-item" />
          </div>
          <!-- Preview content area -->
          <div class="theme-preview__content">
            <div class="theme-preview__topbar" />
            <div class="theme-preview__cards">
              <div class="theme-preview__card" />
              <div class="theme-preview__card" />
              <div class="theme-preview__card theme-preview__card--accent" />
              <div class="theme-preview__card" />
            </div>
            <div class="theme-preview__chart" />
          </div>
        </div>

        <!-- Theme info -->
        <div class="theme-info">
          <div class="theme-info__row">
            <span class="theme-info__name font-mono-data">{{ theme.name }}</span>
            <div v-if="currentTheme === theme.id" class="theme-info__check" aria-hidden="true">
              <Check :size="10" />
            </div>
          </div>
          <p class="theme-info__desc font-mono-data">{{ theme.description }}</p>
          <!-- Accent swatch -->
          <div class="theme-info__swatch" aria-hidden="true">
            <div class="theme-info__swatch-dot" />
            <span class="theme-info__swatch-label font-mono-data">{{ theme.accent }}</span>
          </div>
        </div>
      </button>
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <span class="modal-footer__hint font-mono-data"
        >Changes apply instantly and persist across sessions</span
      >
    </div>
  </MModal>
</template>

<style scoped>
/* ── Header ── */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.modal-header__left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.modal-header__icon {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.modal-subtitle {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  margin: 3px 0 0;
}

.modal-close {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 100ms ease,
    border-color 100ms ease,
    background-color 100ms ease;
}

.modal-close:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
  background-color: var(--bg-hover);
}

/* ── Theme Grid ── */
.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  padding: 1rem 1.25rem;
}

/* ── Theme Card ── */
.theme-card {
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 0;
  cursor: pointer;
  text-align: left;
  transition: border-color 100ms ease;
  overflow: hidden;
  position: relative;
}

.theme-card:hover {
  border-color: var(--border-strong);
}

.theme-card--active {
  border-color: var(--card-accent, var(--accent)) !important;
}

/* ── Mini Preview ── */
.theme-preview {
  display: flex;
  height: 72px;
  background-color: var(--card-bg, #0d0d0d);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.theme-preview__sidebar {
  width: 24px;
  background-color: color-mix(in srgb, var(--card-bg, #0d0d0d) 85%, white 15%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 5px 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}

.theme-preview__logo {
  width: 14px;
  height: 8px;
  border-radius: 0;
  background-color: var(--card-accent, #e2e2e2);
  margin-bottom: 3px;
  flex-shrink: 0;
}

.theme-preview__nav-item {
  height: 5px;
  border-radius: 0;
  background-color: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.theme-preview__nav-item--active {
  background-color: var(--card-accent, #e2e2e2);
  opacity: 0.6;
}

.theme-preview__content {
  flex: 1;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}

/* Flat layout: no gap between sidebar and content */
.theme-preview--flat .theme-preview__sidebar {
  border-right-color: rgba(255, 255, 255, 0.09);
}

.theme-preview--flat .theme-preview__content {
  padding: 4px 4px 4px 4px;
}

.theme-preview__topbar {
  height: 7px;
  border-radius: 0;
  background-color: rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

.theme-preview__cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  flex-shrink: 0;
}

.theme-preview__card {
  height: 16px;
  border-radius: 0;
  background-color: var(--card-surface, #111111);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.theme-preview__card--accent {
  border-color: var(--card-accent, #e2e2e2);
  border-left-width: 2px;
}

.theme-preview__chart {
  flex: 1;
  border-radius: 0;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  min-height: 10px;
}

/* ── Theme Info ── */
.theme-info {
  padding: 0.5rem 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.theme-info__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.theme-info__name {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-primary);
  text-transform: uppercase;
}

.theme-info__check {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background-color: var(--accent);
  color: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.theme-info__desc {
  font-size: 0.5rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
  line-height: 1.4;
  margin: 0;
}

.theme-info__swatch {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 2px;
}

.theme-info__swatch-dot {
  width: 6px;
  height: 6px;
  border-radius: 0;
  background-color: var(--card-accent, var(--accent));
  flex-shrink: 0;
}

.theme-info__swatch-label {
  font-size: 0.5rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Footer ── */
.modal-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border);
}

.modal-footer__hint {
  font-size: 0.5rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}
</style>
