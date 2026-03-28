<script setup lang="ts">
const route = useRoute()
const path = route.path
</script>

<template>
  <div class="not-found">
    <div class="not-found__content">
      <p class="not-found__code font-mono-data">404</p>
      <h1 class="not-found__title">Page not found</h1>
      <p class="not-found__message">
        The path <code class="not-found__path">{{ path }}</code> doesn't exist.
      </p>
      <NuxtLink to="/" class="not-found__link">Go to Dashboard</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--bg-base);
}

.not-found__content {
  text-align: center;
  max-width: 420px;
}

.not-found__code {
  font-size: 5rem;
  font-weight: 700;
  color: var(--mtv-color-foreground-subtle);
  line-height: 1;
  margin: 0 0 0.5rem;
  letter-spacing: -0.04em;
}

.not-found__title {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  margin: 0 0 0.75rem;
}

.not-found__message {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  margin: 0 0 1.5rem;
}

.not-found__path {
  font-family: var(--font-family-mono);
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 0.25rem;
  font-size: 0.9em;
}

.not-found__link {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  background-color: var(--mtv-color-brand-primary);
  color: var(--mtv-color-foreground-on-brand);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: opacity 150ms;
}

.not-found__link:hover {
  opacity: 0.85;
}
</style>
