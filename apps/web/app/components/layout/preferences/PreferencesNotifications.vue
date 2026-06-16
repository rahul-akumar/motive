<script setup lang="ts">
const { t } = useI18n()

const notificationMode = ref<'all' | 'dm' | 'none'>('all')

const options = computed(() => [
  {
    value: 'all' as const,
    label: t('preferences.notifications.allMessages'),
    hint: t('preferences.notifications.allMessagesHint'),
  },
  {
    value: 'dm' as const,
    label: t('preferences.notifications.dmMentions'),
    hint: t('preferences.notifications.dmMentionsHint'),
  },
  {
    value: 'none' as const,
    label: t('preferences.notifications.nothing'),
    hint: t('preferences.notifications.nothingHint'),
  },
])
</script>

<template>
  <div class="pref-section">
    <div class="pref-section__head">
      <h3 class="pref-section__title">{{ t('preferences.notifications.title') }}</h3>
      <p class="pref-section__desc">{{ t('preferences.notifications.desc') }}</p>
    </div>
    <div class="pref-section__body">
      <p class="pref-group-label">{{ t('preferences.notifications.notifyAbout') }}</p>
      <div class="pref-radio-group" role="radiogroup" aria-label="Notification level">
        <label v-for="opt in options" :key="opt.value" class="pref-radio-row">
          <input
            v-model="notificationMode"
            type="radio"
            :value="opt.value"
            class="pref-radio__input"
          />
          <div class="pref-radio__dot" aria-hidden="true" />
          <div class="pref-radio__text">
            <span class="pref-radio__label">{{ opt.label }}</span>
            <span class="pref-radio__hint">{{ opt.hint }}</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
