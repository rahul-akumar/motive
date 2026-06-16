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
} from 'lucide-vue-next'
import { MIcon, MModal } from '@motive/ui'
import PreferencesNotifications from '~/components/layout/preferences/PreferencesNotifications.vue'
import PreferencesAppearance from '~/components/layout/preferences/PreferencesAppearance.vue'
import PreferencesLanguageRegion from '~/components/layout/preferences/PreferencesLanguageRegion.vue'
import PreferencesPlaceholderSection from '~/components/layout/preferences/PreferencesPlaceholderSection.vue'

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
          <MIcon :icon="X" :size="14" />
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
          <PreferencesNotifications v-if="activeSection === 'notifications'" />
          <PreferencesAppearance v-else-if="activeSection === 'appearance'" />
          <PreferencesPlaceholderSection
            v-else-if="activeSection === 'sidebar'"
            section="sidebar"
          />
          <PreferencesLanguageRegion v-else-if="activeSection === 'language'" />
          <PreferencesPlaceholderSection
            v-else-if="activeSection === 'accessibility'"
            section="accessibility"
          />
          <PreferencesPlaceholderSection v-else-if="activeSection === 'ai'" section="ai" />
          <PreferencesPlaceholderSection
            v-else-if="activeSection === 'advanced'"
            section="advanced"
          />
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
  background-color: var(--mtv-color-surface-accent-subtle);
}

.pref-nav__item--active {
  color: var(--mtv-color-foreground-default);
  background-color: var(--mtv-color-surface-accent);
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
</style>

<!-- Section-body styles shared across the extracted preference section SFCs. -->
<style src="./preferences/preferences.css"></style>
