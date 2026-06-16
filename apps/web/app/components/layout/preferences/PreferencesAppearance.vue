<script setup lang="ts">
import { MIcon } from '@motive/ui'
import { Check } from 'lucide-vue-next'
import { useTheme, type ThemeId } from '~/composables/useTheme'

const { currentTheme, themes, applyTheme, arcHue, arcTint, setHue, setNeutral, huePresets } =
  useTheme()
const { t } = useI18n()

function selectTheme(id: ThemeId) {
  applyTheme(id)
}

function onHueInput(event: Event) {
  setHue(Number((event.target as HTMLInputElement).value))
}

/** Live accent for the Arc preview/swatch (tracks the chosen hue). */
function themeAccent(theme: (typeof themes)[number]) {
  if (theme.id !== 'arc') return theme.accent
  return arcTint.value ? `oklch(0.577 0.215 ${arcHue.value})` : theme.accent
}

/** Card preview CSS vars — Arc reflects the live hue/tint, others are static. */
function cardStyle(theme: (typeof themes)[number]) {
  if (theme.id === 'arc') {
    const chroma = arcTint.value ? 0.01 : 0
    return {
      '--card-accent': themeAccent(theme),
      '--card-bg': `oklch(0.168 ${chroma} ${arcHue.value})`,
      '--card-surface': `oklch(0.191 ${chroma} ${arcHue.value})`,
      '--card-text': theme.textPrimary,
    }
  }
  return {
    '--card-accent': theme.accent,
    '--card-bg': theme.bgBase,
    '--card-surface': theme.bgCard,
    '--card-text': theme.textPrimary,
  }
}
</script>

<template>
  <div class="pref-section">
    <div class="pref-section__head">
      <h3 class="pref-section__title">{{ t('preferences.appearance.title') }}</h3>
      <p class="pref-section__desc">{{ t('preferences.appearance.desc') }}</p>
    </div>
    <div class="pref-section__body">
      <div class="theme-grid" role="radiogroup" aria-label="Available themes">
        <div
          v-for="theme in themes"
          :key="theme.id"
          class="theme-card"
          :class="{
            'theme-card--active': currentTheme === theme.id,
            'theme-card--arc': theme.id === 'arc',
          }"
          :style="cardStyle(theme)"
        >
          <button
            class="theme-card__select"
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
                <div v-if="currentTheme === theme.id" class="theme-info__check" aria-hidden="true">
                  <MIcon :icon="Check" :size="10" />
                </div>
              </div>
              <p class="theme-info__desc">{{ theme.description }}</p>
              <div class="theme-info__swatch" aria-hidden="true">
                <div class="theme-info__swatch-dot" />
                <span class="theme-info__swatch-label">
                  {{
                    theme.id === 'arc'
                      ? arcTint
                        ? `${t('preferences.appearance.hueLabel')} ${arcHue}°`
                        : t('preferences.appearance.neutral')
                      : theme.accent
                  }}
                </span>
              </div>
            </div>
          </button>

          <!-- Hue-shift control (Arc only) -->
          <div v-if="theme.id === 'arc'" class="theme-hue">
            <div class="theme-hue__presets">
              <button
                class="theme-hue__chip theme-hue__chip--neutral"
                :class="{ 'theme-hue__chip--active': !arcTint }"
                type="button"
                @click="setNeutral()"
              >
                {{ t('preferences.appearance.neutral') }}
              </button>
              <button
                v-for="preset in huePresets"
                :key="preset.id"
                class="theme-hue__chip theme-hue__chip--swatch"
                :class="{
                  'theme-hue__chip--active': arcTint && arcHue === preset.hue,
                }"
                :style="{ '--chip-hue': preset.hue }"
                type="button"
                :aria-label="t(`preferences.appearance.presets.${preset.id}`)"
                @click="setHue(preset.hue)"
              />
            </div>
            <input
              class="theme-hue__slider"
              type="range"
              min="0"
              max="360"
              :value="arcHue"
              :aria-label="t('preferences.appearance.hueLabel')"
              @input="onHueInput"
            />
            <p class="theme-hue__hint">{{ t('preferences.appearance.hueHint') }}</p>
          </div>
        </div>
      </div>
      <p class="pref-hint">{{ t('preferences.appearance.hint') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* ── Theme Grid ── */
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
  transition: border-color 100ms ease;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.theme-card--arc {
  grid-column: 1 / -1;
}

.theme-card:hover {
  border-color: var(--mtv-color-border-strong);
}

.theme-card--active {
  border-color: var(--card-accent, var(--mtv-color-brand-default)) !important;
}

.theme-card__select {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.theme-preview {
  display: flex;
  height: 72px;
  background-color: var(--card-bg, var(--mtv-color-surface-default));
  border-bottom: 1px solid var(--mtv-color-border-subtle);
  overflow: hidden;
}

.theme-preview__sidebar {
  width: 24px;
  background-color: color-mix(
    in srgb,
    var(--card-bg, var(--mtv-color-surface-default)) 85%,
    white 15%
  );
  border-right: 1px solid var(--mtv-color-border-subtle);
  padding: 5px 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}

.theme-preview__logo {
  width: 14px;
  height: 8px;
  background-color: var(--card-accent, var(--mtv-color-brand-default));
  margin-bottom: 3px;
  flex-shrink: 0;
}

.theme-preview__nav-item {
  height: 5px;
  background-color: var(--mtv-color-surface-accent);
  flex-shrink: 0;
}

.theme-preview__nav-item--active {
  background-color: var(--card-accent, var(--mtv-color-brand-default));
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
  border-right-color: var(--mtv-color-border-default);
}

.theme-preview__topbar {
  height: 7px;
  background-color: var(--mtv-color-surface-accent-subtle);
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
  background-color: var(--card-surface, var(--mtv-color-surface-raised));
  border: 1px solid var(--mtv-color-border-subtle);
}

.theme-preview__card--accent {
  border-color: var(--card-accent, var(--mtv-color-brand-default));
  border-left-width: 2px;
}

.theme-preview__chart {
  flex: 1;
  background-color: var(--mtv-color-surface-accent-subtle);
  border: 1px solid var(--mtv-color-border-subtle);
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

/* ── Arc hue-shift control ── */
.theme-hue {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.625rem;
  border-top: 1px solid var(--mtv-color-border-subtle);
}

.theme-hue__presets {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.theme-hue__chip {
  height: 20px;
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  cursor: pointer;
  background: transparent;
  transition:
    border-color 100ms ease,
    box-shadow 100ms ease;
}

.theme-hue__chip:hover {
  border-color: var(--mtv-color-border-strong);
}

.theme-hue__chip--neutral {
  padding: 0 0.5rem;
  font-size: var(--font-size-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--mtv-color-foreground-muted);
  background: var(--mtv-color-surface-default);
}

.theme-hue__chip--swatch {
  width: 24px;
  background-color: oklch(0.62 0.2 var(--chip-hue, 0));
}

.theme-hue__chip--active {
  border-color: var(--mtv-color-brand-default);
  box-shadow: 0 0 0 1px var(--mtv-color-brand-default);
}

.theme-hue__slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 2px;
  cursor: pointer;
  background: linear-gradient(
    to right,
    oklch(0.62 0.2 0),
    oklch(0.62 0.2 60),
    oklch(0.62 0.2 120),
    oklch(0.62 0.2 180),
    oklch(0.62 0.2 240),
    oklch(0.62 0.2 300),
    oklch(0.62 0.2 360)
  );
}

.theme-hue__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--mtv-color-foreground-default);
  border: 2px solid var(--mtv-color-surface-base);
  cursor: pointer;
}

.theme-hue__slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--mtv-color-foreground-default);
  border: 2px solid var(--mtv-color-surface-base);
  cursor: pointer;
}

.theme-hue__hint {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  letter-spacing: var(--tracking-normal);
  margin: 0;
}
</style>
