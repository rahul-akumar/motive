<script setup lang="ts">
import { MSelect } from '@motive/ui'
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
  options: { value: string; label: string }[]
}

// Map the locale/region domain objects to MSelect's { value, label } shape.
const regionOptions = computed(() =>
  availableRegions.map((r) => ({ value: r.code, label: `${r.flag} ${r.name}` })),
)
const localeOptions = computed(() =>
  availableLocales.map((l) => ({ value: l.code, label: l.name })),
)

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

function onFormatSelect(key: keyof FormatPreferences, value: string | number | null) {
  if (value == null) return
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
        <span class="pref-row__label">{{ t('preferences.language.region') }}</span>
        <MSelect
          :model-value="currentRegion"
          :options="regionOptions"
          :aria-label="t('preferences.language.region')"
          @update:model-value="(v) => v != null && applyRegion(v as any)"
        />
      </div>
      <div class="pref-row">
        <span class="pref-row__label">{{ t('preferences.language.language') }}</span>
        <MSelect
          :model-value="currentLocale"
          :options="localeOptions"
          :aria-label="t('preferences.language.language')"
          @update:model-value="(v) => v != null && applyLocale(v as any)"
        />
      </div>

      <!-- ── Date & Time ── -->
      <p class="pref-group-label">{{ t('preferences.language.groupDateTime') }}</p>
      <div v-for="row in dateTimeRows" :key="row.id" class="pref-row">
        <span class="pref-row__label">{{ row.label }}</span>
        <MSelect
          :model-value="formatPreferences[row.key]"
          :options="row.options"
          :searchable="row.options.length > 10"
          :aria-label="row.label"
          @update:model-value="(v) => onFormatSelect(row.key, v)"
        />
      </div>

      <!-- ── Units ── -->
      <p class="pref-group-label">{{ t('preferences.language.groupUnits') }}</p>
      <div v-for="row in unitRows" :key="row.id" class="pref-row">
        <span class="pref-row__label">{{ row.label }}</span>
        <MSelect
          :model-value="formatPreferences[row.key]"
          :options="row.options"
          :searchable="row.options.length > 10"
          :aria-label="row.label"
          @update:model-value="(v) => onFormatSelect(row.key, v)"
        />
      </div>
    </div>
  </div>
</template>
