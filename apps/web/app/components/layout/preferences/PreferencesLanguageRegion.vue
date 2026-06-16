<script setup lang="ts">
import { useLocalePreferences } from '~/composables/useLocalePreferences'
import { useFormatPreferences, type FormatPreferences } from '~/composables/useFormatPreferences'

const { currentLocale, availableLocales, applyLocale } = useLocalePreferences()
const { currentRegion, availableRegions, applyRegion } = useRegion()
const {
  formatPreferences,
  applyFormatPreferences,
  TIMEZONE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  DISTANCE_UNIT_OPTIONS,
  SPEED_UNIT_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  TEMPERATURE_UNIT_OPTIONS,
  VOLUME_UNIT_OPTIONS,
  FUEL_EFFICIENCY_UNIT_OPTIONS,
  PRESSURE_UNIT_OPTIONS,
  FIRST_DAY_OF_WEEK_OPTIONS,
} = useFormatPreferences()
const { t } = useI18n()

interface SelectRow {
  id: string
  label: string
  key: keyof FormatPreferences
  options: ReadonlyArray<{ value: string; label: string }>
}

// Date & time formatting selects — all driven by applyFormatPreferences.
const dateTimeRows = computed<SelectRow[]>(() => [
  {
    id: 'pref-timezone-select',
    label: t('preferences.language.timezone'),
    key: 'timezone',
    options: TIMEZONE_OPTIONS,
  },
  {
    id: 'pref-date-format-select',
    label: t('preferences.language.dateFormat'),
    key: 'dateFormat',
    options: DATE_FORMAT_OPTIONS,
  },
  {
    id: 'pref-time-format-select',
    label: t('preferences.language.timeFormat'),
    key: 'timeFormat',
    options: TIME_FORMAT_OPTIONS,
  },
  {
    id: 'pref-first-day-select',
    label: t('preferences.language.firstDayOfWeek'),
    key: 'firstDayOfWeek',
    options: FIRST_DAY_OF_WEEK_OPTIONS,
  },
])

// Measurement unit selects — same applyFormatPreferences pattern.
const unitRows = computed<SelectRow[]>(() => [
  {
    id: 'pref-distance-select',
    label: t('preferences.language.distanceUnit'),
    key: 'distanceUnit',
    options: DISTANCE_UNIT_OPTIONS,
  },
  {
    id: 'pref-speed-select',
    label: t('preferences.language.speedUnit'),
    key: 'speedUnit',
    options: SPEED_UNIT_OPTIONS,
  },
  {
    id: 'pref-weight-select',
    label: t('preferences.language.weightUnit'),
    key: 'weightUnit',
    options: WEIGHT_UNIT_OPTIONS,
  },
  {
    id: 'pref-temperature-select',
    label: t('preferences.language.temperatureUnit'),
    key: 'temperatureUnit',
    options: TEMPERATURE_UNIT_OPTIONS,
  },
  {
    id: 'pref-volume-select',
    label: t('preferences.language.volumeUnit'),
    key: 'volumeUnit',
    options: VOLUME_UNIT_OPTIONS,
  },
  {
    id: 'pref-fuel-efficiency-select',
    label: t('preferences.language.fuelEfficiencyUnit'),
    key: 'fuelEfficiencyUnit',
    options: FUEL_EFFICIENCY_UNIT_OPTIONS,
  },
  {
    id: 'pref-pressure-select',
    label: t('preferences.language.pressureUnit'),
    key: 'pressureUnit',
    options: PRESSURE_UNIT_OPTIONS,
  },
])

function onFormatChange(key: keyof FormatPreferences, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  applyFormatPreferences({ [key]: value } as Partial<FormatPreferences>)
}
</script>

<template>
  <div class="pref-section">
    <div class="pref-section__head">
      <h3 class="pref-section__title">{{ t('preferences.language.title') }}</h3>
      <p class="pref-section__desc">{{ t('preferences.language.desc') }}</p>
    </div>
    <div class="pref-section__body">
      <!-- ── Locale ── -->
      <p class="pref-group-label">{{ t('preferences.language.groupLocale') }}</p>
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
          <option v-for="region in availableRegions" :key="region.code" :value="region.code">
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
          <option v-for="locale in availableLocales" :key="locale.code" :value="locale.code">
            {{ locale.name }}
          </option>
        </select>
      </div>

      <!-- ── Date & Time ── -->
      <p class="pref-group-label">{{ t('preferences.language.groupDateTime') }}</p>
      <div v-for="row in dateTimeRows" :key="row.id" class="pref-row">
        <label class="pref-row__label" :for="row.id">{{ row.label }}</label>
        <select
          :id="row.id"
          class="pref-select"
          :value="formatPreferences[row.key]"
          @change="onFormatChange(row.key, $event)"
        >
          <option v-for="opt in row.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- ── Units ── -->
      <p class="pref-group-label">{{ t('preferences.language.groupUnits') }}</p>
      <div v-for="row in unitRows" :key="row.id" class="pref-row">
        <label class="pref-row__label" :for="row.id">{{ row.label }}</label>
        <select
          :id="row.id"
          class="pref-select"
          :value="formatPreferences[row.key]"
          @change="onFormatChange(row.key, $event)"
        >
          <option v-for="opt in row.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
