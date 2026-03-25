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
import { useLocalePreferences } from '~/composables/useLocalePreferences'

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
const { currentLocale, availableLocales, applyLocale } = useLocalePreferences()
const { currentRegion, availableRegions, applyRegion } = useRegion()
const { t } = useI18n()

const sections = computed(() => [
  { key: 'notifications', label: t('preferences.sections.notifications'), icon: Bell },
  { key: 'appearance', label: t('preferences.sections.appearance'), icon: Sliders },
  { key: 'sidebar', label: t('preferences.sections.sidebar'), icon: PanelLeft },
  { key: 'language', label: t('preferences.sections.language'), icon: Globe },
  { key: 'accessibility', label: t('preferences.sections.accessibility'), icon: Accessibility },
  { key: 'ai', label: t('preferences.sections.ai'), icon: Sparkles },
  { key: 'advanced', label: t('preferences.sections.advanced'), icon: Settings2 },
])

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
        <h2 class="pref-header__title">{{ t('preferences.title') }}</h2>
        <button
          class="pref-header__close"
          type="button"
          :aria-label="t('preferences.close')"
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
              <h3 class="pref-section__title">{{ t('preferences.notifications.title') }}</h3>
              <p class="pref-section__desc">{{ t('preferences.notifications.desc') }}</p>
            </div>
            <div class="pref-section__body">
              <p class="pref-group-label">{{ t('preferences.notifications.notifyAbout') }}</p>
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
                    <span class="pref-radio__label">{{
                      t('preferences.notifications.allMessages')
                    }}</span>
                    <span class="pref-radio__hint">{{
                      t('preferences.notifications.allMessagesHint')
                    }}</span>
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
                    <span class="pref-radio__label">{{
                      t('preferences.notifications.dmMentions')
                    }}</span>
                    <span class="pref-radio__hint">{{
                      t('preferences.notifications.dmMentionsHint')
                    }}</span>
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
                    <span class="pref-radio__label">{{
                      t('preferences.notifications.nothing')
                    }}</span>
                    <span class="pref-radio__hint">{{
                      t('preferences.notifications.nothingHint')
                    }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Appearance -->
          <div v-else-if="activeSection === 'appearance'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">{{ t('preferences.appearance.title') }}</h3>
              <p class="pref-section__desc">{{ t('preferences.appearance.desc') }}</p>
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
              <p class="pref-hint">{{ t('preferences.appearance.hint') }}</p>
            </div>
          </div>

          <!-- Sidebar -->
          <div v-else-if="activeSection === 'sidebar'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">{{ t('preferences.sidebarSection.title') }}</h3>
              <p class="pref-section__desc">{{ t('preferences.sidebarSection.desc') }}</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{
                  t('preferences.sidebarSection.defaultState')
                }}</span>
                <span class="pref-row__value">{{ t('preferences.sidebarSection.expanded') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.sidebarSection.showWip') }}</span>
                <span class="pref-row__value">{{ t('preferences.sidebarSection.on') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{
                  t('preferences.sidebarSection.pinFrequent')
                }}</span>
                <span class="pref-row__value">{{ t('preferences.sidebarSection.off') }}</span>
              </div>
            </div>
          </div>

          <!-- Language & Region -->
          <div v-else-if="activeSection === 'language'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">{{ t('preferences.language.title') }}</h3>
              <p class="pref-section__desc">{{ t('preferences.language.desc') }}</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row">
                <label class="pref-row__label" for="pref-region-select">{{
                  t('preferences.language.region')
                }}</label>
                <select
                  id="pref-region-select"
                  class="pref-select"
                  :value="currentRegion"
                  @change="applyRegion(($event.target as HTMLSelectElement).value as any)"
                >
                  <option
                    v-for="region in availableRegions"
                    :key="region.code"
                    :value="region.code"
                  >
                    {{ region.flag }} {{ region.name }}
                  </option>
                </select>
              </div>
              <div class="pref-row">
                <label class="pref-row__label" for="pref-language-select">{{
                  t('preferences.language.language')
                }}</label>
                <select
                  id="pref-language-select"
                  class="pref-select"
                  :value="currentLocale"
                  @change="applyLocale(($event.target as HTMLSelectElement).value as any)"
                >
                  <option
                    v-for="locale in availableLocales"
                    :key="locale.code"
                    :value="locale.code"
                  >
                    {{ locale.name }}
                  </option>
                </select>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.language.timezone') }}</span>
                <span class="pref-row__value">America/Chicago</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.language.dateFormat') }}</span>
                <span class="pref-row__value">MM/DD/YYYY</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.language.distanceUnit') }}</span>
                <span class="pref-row__value">{{ t('preferences.language.miles') }}</span>
              </div>
            </div>
          </div>

          <!-- Accessibility -->
          <div v-else-if="activeSection === 'accessibility'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">{{ t('preferences.accessibility.title') }}</h3>
              <p class="pref-section__desc">{{ t('preferences.accessibility.desc') }}</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{
                  t('preferences.accessibility.reduceMotion')
                }}</span>
                <span class="pref-row__value">{{ t('preferences.accessibility.off') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{
                  t('preferences.accessibility.highContrast')
                }}</span>
                <span class="pref-row__value">{{ t('preferences.accessibility.off') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.accessibility.fontSize') }}</span>
                <span class="pref-row__value">{{ t('preferences.accessibility.default') }}</span>
              </div>
            </div>
          </div>

          <!-- AI -->
          <div v-else-if="activeSection === 'ai'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">{{ t('preferences.ai.title') }}</h3>
              <p class="pref-section__desc">{{ t('preferences.ai.desc') }}</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.ai.suggestions') }}</span>
                <span class="pref-row__value">{{ t('preferences.ai.enabled') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.ai.smartAlerts') }}</span>
                <span class="pref-row__value">{{ t('preferences.ai.enabled') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.ai.usageSharing') }}</span>
                <span class="pref-row__value">{{ t('preferences.ai.off') }}</span>
              </div>
            </div>
          </div>

          <!-- Advanced -->
          <div v-else-if="activeSection === 'advanced'" class="pref-section">
            <div class="pref-section__head">
              <h3 class="pref-section__title">{{ t('preferences.advanced.title') }}</h3>
              <p class="pref-section__desc">{{ t('preferences.advanced.desc') }}</p>
            </div>
            <div class="pref-section__body">
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.advanced.devMode') }}</span>
                <span class="pref-row__value">{{ t('preferences.advanced.off') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.advanced.experimental') }}</span>
                <span class="pref-row__value">{{ t('preferences.advanced.off') }}</span>
              </div>
              <div class="pref-row pref-row--placeholder">
                <span class="pref-row__label">{{ t('preferences.advanced.reset') }}</span>
                <span class="pref-row__value pref-row__value--danger">{{
                  t('preferences.advanced.resetAction')
                }}</span>
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
  height: 800px;
}

/* ── Header ── */
.pref-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.pref-header__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-loosest);
  color: var(--mtv-color-foreground-muted);
  margin: 0;
  text-transform: uppercase;
}

.pref-header__close {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background: transparent;
  color: var(--mtv-color-foreground-muted);
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
  color: var(--mtv-color-foreground-default);
  border-color: var(--mtv-color-border-strong);
  background-color: var(--mtv-color-surface-hover);
}

/* ── Body: nav + content ── */
.pref-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ── Left Nav ── */
.pref-nav {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid var(--mtv-color-border-default);
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
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  text-align: left;
  transition:
    color 100ms ease,
    background-color 100ms ease,
    border-color 100ms ease;
}

.pref-nav__item:hover {
  color: var(--mtv-color-foreground-default);
  background-color: oklch(1 0 0 / 0.04);
}

.pref-nav__item--active {
  color: var(--mtv-color-foreground-default);
  background-color: oklch(1 0 0 / 0.06);
  border-left-color: var(--mtv-color-brand-default);
}

.pref-nav__icon {
  flex-shrink: 0;
}

.pref-nav__label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--tracking-wide);
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
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.pref-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--tracking-looser);
  color: var(--mtv-color-foreground-default);
  margin: 0 0 4px;
  text-transform: uppercase;
}

.pref-section__desc {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
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
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-loose);
  color: var(--mtv-color-foreground-subtle);
  margin: 0 0 0.625rem;
  text-transform: uppercase;
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
  border-bottom: 1px solid var(--mtv-color-border-default);
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
  border: 1px solid var(--mtv-color-border-strong);
  flex-shrink: 0;
  margin-top: 1px;
  position: relative;
  transition: border-color 100ms ease;
}

.pref-radio-row:has(.pref-radio__input:checked) .pref-radio__dot {
  border-color: var(--mtv-color-brand-default);
  background-color: var(--mtv-color-brand-default);
  box-shadow: inset 0 0 0 3px var(--mtv-color-surface-default);
}

.pref-radio__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pref-radio__label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  color: var(--mtv-color-foreground-default);
}

.pref-radio__hint {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
}

/* ── Placeholder rows (non-notification sections) ── */
.pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--mtv-color-border-default);
}

.pref-row:last-child {
  border-bottom: none;
}

.pref-row__label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-normal);
  color: var(--mtv-color-foreground-default);
}

.pref-row__value {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
}

.pref-row__value--danger {
  color: oklch(0.637 0.208 25.3);
  cursor: pointer;
}

/* ── Language select ── */
.pref-select {
  appearance: none;
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  color: var(--mtv-color-foreground-default);
  font-family: inherit;
  font-size: var(--font-size-sm);
  letter-spacing: var(--tracking-normal);
  padding: 0.25rem 1.75rem 0.25rem 0.5rem;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  transition: border-color 100ms ease;
}

.pref-select:hover {
  border-color: var(--mtv-color-border-strong);
}

.pref-select:focus {
  outline: none;
  border-color: var(--mtv-color-brand-default);
}

.pref-select option {
  background-color: var(--mtv-color-surface-raised);
  color: var(--mtv-color-foreground-default);
}

/* ── Appearance / Theme Grid ── */
.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.theme-card {
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  padding: 0;
  cursor: pointer;
  text-align: left;
  transition: border-color 100ms ease;
  overflow: hidden;
  position: relative;
}

.theme-card:hover {
  border-color: var(--mtv-color-border-strong);
}

.theme-card--active {
  border-color: var(--card-accent, var(--mtv-color-brand-default)) !important;
}

.theme-preview {
  display: flex;
  height: 72px;
  background-color: var(--card-bg, oklch(0.159 0 0));
  border-bottom: 1px solid oklch(1 0 0 / 0.06);
  overflow: hidden;
}

.theme-preview__sidebar {
  width: 24px;
  background-color: color-mix(in srgb, var(--card-bg, oklch(0.159 0 0)) 85%, white 15%);
  border-right: 1px solid oklch(1 0 0 / 0.06);
  padding: 5px 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}

.theme-preview__logo {
  width: 14px;
  height: 8px;
  background-color: var(--card-accent, oklch(0.913 0 0));
  margin-bottom: 3px;
  flex-shrink: 0;
}

.theme-preview__nav-item {
  height: 5px;
  background-color: oklch(1 0 0 / 0.08);
  flex-shrink: 0;
}

.theme-preview__nav-item--active {
  background-color: var(--card-accent, oklch(0.913 0 0));
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
  border-right-color: oklch(1 0 0 / 0.09);
}

.theme-preview__topbar {
  height: 7px;
  background-color: oklch(1 0 0 / 0.04);
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
  background-color: var(--card-surface, oklch(0.178 0 0));
  border: 1px solid oklch(1 0 0 / 0.06);
}

.theme-preview__card--accent {
  border-color: var(--card-accent, oklch(0.913 0 0));
  border-left-width: 2px;
}

.theme-preview__chart {
  flex: 1;
  background-color: oklch(1 0 0 / 0.02);
  border: 1px solid oklch(1 0 0 / 0.04);
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
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  color: var(--mtv-color-foreground-default);
  text-transform: uppercase;
}

.theme-info__check {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background-color: var(--mtv-color-brand-default);
  color: var(--mtv-color-surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.theme-info__desc {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-snug);
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
  background-color: var(--card-accent, var(--mtv-color-brand-default));
  flex-shrink: 0;
}

.theme-info__swatch-label {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

.pref-hint {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  letter-spacing: var(--tracking-wider);
  margin: 0;
}
</style>
