<script setup lang="ts">
import {
  Bell,
  Sliders,
  PanelLeft,
  Globe,
  Accessibility,
  Sparkles,
  Settings2,
  X,
  Check,
} from 'lucide-vue-next'
import { MModal } from '@motive/ui'
import { useTheme } from '~/composables/useTheme'

export interface AppPreferencesModalProps {
  open: boolean
  initialSection?: string
}

const props = withDefaults(defineProps<AppPreferencesModalProps>(), {
  initialSection: 'notifications',
})

const emit = defineEmits<{
  close: []
}>()

const { currentTheme, themes, applyTheme } = useTheme()

const sections = [
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Sliders },
  { key: 'sidebar', label: 'Sidebar', icon: PanelLeft },
  { key: 'language', label: 'Language & Region', icon: Globe },
  { key: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { key: 'ai', label: 'AI', icon: Sparkles },
  { key: 'advanced', label: 'Advanced', icon: Settings2 },
]

const activeSection = ref(props.initialSection)

watch(
  () => props.initialSection,
  (val) => {
    activeSection.value = val
  },
)

watch(
  () => props.open,
  (val) => {
    if (val) activeSection.value = props.initialSection
  },
)

const notificationMode = ref<'all' | 'dm' | 'none'>('all')

function selectTheme(id: string) {
  applyTheme(id as any)
}
</script>

<template>
  <MModal :open="open" max-width="760px" aria-label="Preferences" @close="emit('close')">
    <div class="pref-modal">
      <!-- Header -->
      <div class="pref-header">
        <h2 class="pref-header__title">PREFERENCES</h2>
        <button
          class="pref-header__close"
          type="button"
          aria-label="Close preferences"
          @click="emit('close')"
        >
          <X :size="14" />
        </button>
      </div>

      <div class="pref-body">
        <!-- Left Nav -->
        <nav class="pref-nav" aria-label="Preferences sections">
          <ul role="list" class="pref-nav__list">
            <li v-for="section in sections" :key="section.key">
              <button
                type="button"
                class="pref-nav__item"
                :class="{ 'pref-nav__item--active': activeSection === section.key }"
                @click="activeSection = section.key"
              >
                <component :is="section.icon" :size="14" class="pref-nav__icon" />
                <span class="pref-nav__label">{{ section.label }}</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Content -->
        <div class="pref-content">
          <!-- Notifications -->
          <div v-if="activeSection === 'notifications'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">NOTIFICATIONS</h3>
              <p class="pref-section__desc">Control when and how you receive notifications.</p>
            </div>
            <div class="pref-section__body">
              <p class="pref-group-label">NOTIFY ME ABOUT</p>
              <div class="pref-radio-group" role="radiogroup" aria-label="Notification level">
                <label class="pref-radio-row">
                  <input
                    v-model="notificationMode"
                    type="radio"
                    value="all"
                    class="pref-radio__input"
                  />
                  <div class="pref-radio__dot" aria-hidden="true" />
                  <div class="pref-radio__text">
                    <span class="pref-radio__label">All new messages</span>
                    <span class="pref-radio__hint">Every alert, update, and message</span>
                  </div>
                </label>
                <label class="pref-radio-row">
                  <input
                    v-model="notificationMode"
                    type="radio"
                    value="dm"
                    class="pref-radio__input"
                  />
                  <div class="pref-radio__dot" aria-hidden="true" />
                  <div class="pref-radio__text">
                    <span class="pref-radio__label">Direct messages, mentions &amp; keywords</span>
                    <span class="pref-radio__hint">Only messages addressed to you</span>
                  </div>
                </label>
                <label class="pref-radio-row">
                  <input
                    v-model="notificationMode"
                    type="radio"
                    value="none"
                    class="pref-radio__input"
                  />
                  <div class="pref-radio__dot" aria-hidden="true" />
                  <div class="pref-radio__text">
                    <span class="pref-radio__label">Nothing</span>
                    <span class="pref-radio__hint">Pause all notifications indefinitely</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Appearance -->
          <div v-else-if="activeSection === 'appearance'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">APPEARANCE</h3>
              <p class="pref-section__desc">Select interface theme.</p>
            </div>
            <div class="pref-section__body">
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
                  <div
                    class="theme-preview"
                    :class="{ 'theme-preview--flat': theme.layout === 'flat' }"
                    aria-hidden="true"
                  >
                    <div class="theme-preview__sidebar">
                      <div class="theme-preview__logo" />
                      <div class="theme-preview__nav-item theme-preview__nav-item--active" />
                      <div class="theme-preview__nav-item" />
                      <div class="theme-preview__nav-item" />
                      <div class="theme-preview__nav-item" />
                    </div>
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
                  <div class="theme-info">
                    <div class="theme-info__row">
                      <span class="theme-info__name">{{ theme.name }}</span>
                      <div
                        v-if="currentTheme === theme.id"
                        class="theme-info__check"
                        aria-hidden="true"
                      >
                        <Check :size="10" />
                      </div>
                    </div>
                    <p class="theme-info__desc">{{ theme.description }}</p>
                    <div class="theme-info__swatch" aria-hidden="true">
                      <div class="theme-info__swatch-dot" />
                      <span class="theme-info__swatch-label">{{ theme.accent }}</span>
                    </div>
                  </div>
                </button>
              </div>
              <p class="pref-hint">Changes apply instantly and persist across sessions.</p>
            </div>
          </div>

          <!-- Sidebar -->
          <div v-else-if="activeSection === 'sidebar'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">SIDEBAR</h3>
              <p class="pref-section__desc">Customize sidebar behavior and visible items.</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Default sidebar state</span>
                <span class="pref-row__value">Expanded</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Show WIP items</span>
                <span class="pref-row__value">On</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Pin frequently visited</span>
                <span class="pref-row__value">Off</span>
              </div>
            </div>
          </div>

          <!-- Language & Region -->
          <div v-else-if="activeSection === 'language'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">LANGUAGE &amp; REGION</h3>
              <p class="pref-section__desc">
                Set your language, timezone, and date format preferences.
              </p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Language</span>
                <span class="pref-row__value">English (US)</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Timezone</span>
                <span class="pref-row__value">America/Chicago</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Date format</span>
                <span class="pref-row__value">MM/DD/YYYY</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Distance unit</span>
                <span class="pref-row__value">Miles</span>
              </div>
            </div>
          </div>

          <!-- Accessibility -->
          <div v-else-if="activeSection === 'accessibility'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">ACCESSIBILITY</h3>
              <p class="pref-section__desc">Options to improve usability and reduce motion.</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Reduce motion</span>
                <span class="pref-row__value">Off</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">High contrast mode</span>
                <span class="pref-row__value">Off</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Font size</span>
                <span class="pref-row__value">Default</span>
              </div>
            </div>
          </div>

          <!-- AI -->
          <div v-else-if="activeSection === 'ai'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">AI</h3>
              <p class="pref-section__desc">Configure AI-assisted features and data usage.</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">AI suggestions</span>
                <span class="pref-row__value">Enabled</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Smart alerts</span>
                <span class="pref-row__value">Enabled</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Usage data sharing</span>
                <span class="pref-row__value">Off</span>
              </div>
            </div>
          </div>

          <!-- Advanced -->
          <div v-else-if="activeSection === 'advanced'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">ADVANCED</h3>
              <p class="pref-section__desc">Developer tools and experimental features.</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Developer mode</span>
                <span class="pref-row__value">Off</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Experimental features</span>
                <span class="pref-row__value">Off</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">Reset all settings</span>
                <span class="pref-row__value pref-row__value--danger">Reset…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MModal>
</template>

<style scoped>
/* ── Modal layout ── */
.pref-modal {
  display: flex;
  flex-direction: column;
  height: 560px;
}

/* ── Header ── */
.pref-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.pref-header__title {
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--text-secondary);
  margin: 0;
}

.pref-header__close {
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

.pref-header__close:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
  background-color: var(--bg-hover);
}

/* ── Body: nav + content ── */
.pref-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ── Left Nav ── */
.pref-nav {
  width: 180px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding: 0.5rem 0;
  overflow-y: auto;
}

.pref-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pref-nav__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  transition:
    color 100ms ease,
    background-color 100ms ease,
    border-color 100ms ease;
}

.pref-nav__item:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.04);
}

.pref-nav__item--active {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.06);
  border-left-color: var(--accent);
}

.pref-nav__icon {
  flex-shrink: 0;
}

.pref-nav__label {
  font-size: 0.9375rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Content Area ── */
.pref-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.pref-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pref-section__head {
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.pref-section__title {
  font-size: 0.9375rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.pref-section__desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
  margin: 0;
}

.pref-section__body {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow-y: auto;
}

/* ── Notifications ── */
.pref-group-label {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin: 0 0 0.625rem;
}

.pref-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.pref-radio-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.pref-radio-row:last-child {
  border-bottom: none;
}

.pref-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.pref-radio__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  flex-shrink: 0;
  margin-top: 1px;
  position: relative;
  transition: border-color 100ms ease;
}

.pref-radio-row:has(.pref-radio__input:checked) .pref-radio__dot {
  border-color: var(--accent);
  background-color: var(--accent);
  box-shadow: inset 0 0 0 3px var(--bg-card);
}

.pref-radio__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pref-radio__label {
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-primary);
}

.pref-radio__hint {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
}

/* ── Placeholder rows (non-notification sections) ── */
.pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--border);
}

.pref-row:last-child {
  border-bottom: none;
}

.pref-row__label {
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: var(--text-primary);
}

.pref-row__value {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
}

.pref-row__value--danger {
  color: #ef4444;
  cursor: pointer;
}

/* ── Appearance / Theme Grid ── */
.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

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
  background-color: var(--card-accent, #e2e2e2);
  margin-bottom: 3px;
  flex-shrink: 0;
}

.theme-preview__nav-item {
  height: 5px;
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

.theme-preview--flat .theme-preview__sidebar {
  border-right-color: rgba(255, 255, 255, 0.09);
}

.theme-preview__topbar {
  height: 7px;
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
  background-color: var(--card-surface, #111111);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.theme-preview__card--accent {
  border-color: var(--card-accent, #e2e2e2);
  border-left-width: 2px;
}

.theme-preview__chart {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  min-height: 10px;
}

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
  font-size: 0.9375rem;
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
  font-size: 0.8125rem;
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
  background-color: var(--card-accent, var(--accent));
  flex-shrink: 0;
}

.theme-info__swatch-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.pref-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin: 0;
}
</style>
