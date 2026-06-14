<script setup lang="ts">
export interface Breadcrumb {
  label: string
  to?: string
}

export interface AppMainDetailProps {
  breadcrumb: Breadcrumb[]
  /** When true, content area takes full space with overflow hidden (for map layouts) */
  fullBleed?: boolean
}

withDefaults(defineProps<AppMainDetailProps>(), {
  fullBleed: false,
})
</script>

<template>
  <div class="detail-main">
    <!-- Header: breadcrumb + actions -->
    <div class="detail-main__header">
      <nav class="detail-main__breadcrumb" aria-label="Breadcrumb">
        <template v-for="(crumb, i) in breadcrumb" :key="i">
          <span v-if="i > 0" class="detail-main__breadcrumb-sep">/</span>
          <NuxtLinkLocale v-if="crumb.to" :to="crumb.to" class="detail-main__breadcrumb-link">
            {{ crumb.label }}
          </NuxtLinkLocale>
          <span v-else class="detail-main__breadcrumb-current">{{ crumb.label }}</span>
        </template>
      </nav>

      <div class="detail-main__actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Optional sub-nav tabs -->
    <slot name="tabs" />

    <!-- Content -->
    <main
      id="main-content"
      :class="['detail-main__content', { 'detail-main__content--full-bleed': fullBleed }]"
    >
      <div
        v-if="!fullBleed"
        v-motion
        class="detail-main__content-inner"
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 300, ease: 'easeOut' } }"
      >
        <slot />
      </div>
      <slot v-else />
    </main>
  </div>
</template>

<style scoped>
.detail-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  margin: var(--main-margin, 0.5rem 0.5rem 0.5rem 0);
  border-radius: var(--main-radius, var(--card-radius));
  background-color: var(--mtv-color-surface-base);
  border: 1px solid var(--mtv-color-border-default);
}

.detail-main__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem var(--page-gutter);
  flex-shrink: 0;
  gap: 0.75rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
}

.detail-main__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-tighter);
}

.detail-main__breadcrumb-link {
  color: var(--mtv-color-foreground-muted);
  text-decoration: none;
  transition: color 150ms ease;
}

.detail-main__breadcrumb-link:hover {
  color: var(--mtv-color-brand-default);
}

.detail-main__breadcrumb-sep {
  color: var(--mtv-color-foreground-subtle);
  font-weight: var(--font-weight-normal);
}

.detail-main__breadcrumb-current {
  color: var(--mtv-color-foreground-default);
}

.detail-main__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.detail-main__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.detail-main__content--full-bleed {
  position: relative;
}

.detail-main__content-inner {
  flex: 1;
  padding: 1rem var(--page-gutter);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
