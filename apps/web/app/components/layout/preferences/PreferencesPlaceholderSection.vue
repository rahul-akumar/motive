<script setup lang="ts">
type PlaceholderSection = 'sidebar' | 'accessibility' | 'ai' | 'advanced'

const props = defineProps<{
  section: PlaceholderSection
}>()

const { t } = useI18n()

interface PlaceholderRow {
  label: string
  value: string
  danger?: boolean
}

interface PlaceholderConfig {
  title: string
  desc: string
  rows: PlaceholderRow[]
}

// All non-interactive preview sections share the same label/value row shape;
// they differ only in their copy, so they're data-driven rather than four SFCs.
const configs = computed<Record<PlaceholderSection, PlaceholderConfig>>(() => ({
  sidebar: {
    title: t('preferences.sidebarSection.title'),
    desc: t('preferences.sidebarSection.desc'),
    rows: [
      {
        label: t('preferences.sidebarSection.defaultState'),
        value: t('preferences.sidebarSection.expanded'),
      },
      { label: t('preferences.sidebarSection.showWip'), value: t('preferences.sidebarSection.on') },
      {
        label: t('preferences.sidebarSection.pinFrequent'),
        value: t('preferences.sidebarSection.off'),
      },
    ],
  },
  accessibility: {
    title: t('preferences.accessibility.title'),
    desc: t('preferences.accessibility.desc'),
    rows: [
      {
        label: t('preferences.accessibility.reduceMotion'),
        value: t('preferences.accessibility.off'),
      },
      {
        label: t('preferences.accessibility.highContrast'),
        value: t('preferences.accessibility.off'),
      },
      {
        label: t('preferences.accessibility.fontSize'),
        value: t('preferences.accessibility.default'),
      },
    ],
  },
  ai: {
    title: t('preferences.ai.title'),
    desc: t('preferences.ai.desc'),
    rows: [
      { label: t('preferences.ai.suggestions'), value: t('preferences.ai.enabled') },
      { label: t('preferences.ai.smartAlerts'), value: t('preferences.ai.enabled') },
      { label: t('preferences.ai.usageSharing'), value: t('preferences.ai.off') },
    ],
  },
  advanced: {
    title: t('preferences.advanced.title'),
    desc: t('preferences.advanced.desc'),
    rows: [
      { label: t('preferences.advanced.devMode'), value: t('preferences.advanced.off') },
      { label: t('preferences.advanced.experimental'), value: t('preferences.advanced.off') },
      {
        label: t('preferences.advanced.reset'),
        value: t('preferences.advanced.resetAction'),
        danger: true,
      },
    ],
  },
}))

const config = computed(() => configs.value[props.section])
</script>

<template>
  <div class="pref-section">
    <div class="pref-section__head">
      <h3 class="pref-section__title">{{ config.title }}</h3>
      <p class="pref-section__desc">{{ config.desc }}</p>
    </div>
    <div class="pref-section__body">
      <div v-for="row in config.rows" :key="row.label" class="pref-row pref-row--placeholder">
        <span class="pref-row__label">{{ row.label }}</span>
        <span class="pref-row__value" :class="{ 'pref-row__value--danger': row.danger }">{{
          row.value
        }}</span>
      </div>
    </div>
  </div>
</template>
