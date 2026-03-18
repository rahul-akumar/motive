<script setup lang="ts">
defineProps<{
  dot: 'alert' | 'driving' | 'idle' | 'offline' | 'active' | 'sleeper'
  text: string
  sub: string
  time: string
}>()
</script>

<template>
  <div class="panel-feed-row">
    <span :class="['status-dot', `status-dot--${dot}`]" />
    <div class="panel-feed-row__body">
      <span class="panel-feed-row__text">{{ text }}</span>
      <span class="panel-feed-row__sub">{{ sub }}</span>
    </div>
    <span class="panel-feed-row__time">{{ time }}</span>
  </div>
</template>

<style scoped>
.panel-feed-row {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.4375rem 1.25rem;
}

.panel-feed-row .status-dot {
  margin-top: 0.375rem;
  flex-shrink: 0;
}

.panel-feed-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.panel-feed-row__text {
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-tight);
}

.panel-feed-row__sub {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}

.panel-feed-row__time {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
  padding-top: 0.1rem;
}
</style>
