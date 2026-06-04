<script setup lang="ts">
definePageMeta({
  layout: 'event-detail',
  title: 'Event Detail',
  moduleName: 'Fuel',
})

const route = useRoute()
const eventId = computed(() => route.params.id as string)
const { event, notFound } = useFuelEventDetail(eventId)
</script>

<template>
  <div class="fe-detail-page">
    <div v-if="notFound" class="fe-detail-page__state">
      <p class="fe-detail-page__not-found">Event "{{ eventId }}" not found.</p>
      <NuxtLinkLocale to="/fuel/events" class="fe-detail-page__back">
        ← Back to Events
      </NuxtLinkLocale>
    </div>

    <div v-else-if="event" class="fe-detail-page__content">
      <FuelDetailIdlingEventContent v-if="event.type === 'idling'" :event="event" />
      <FuelDetailFuelLossEventContent v-else :event="event" />
    </div>
  </div>
</template>

<style scoped>
.fe-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.fe-detail-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.75rem;
}

.fe-detail-page__not-found {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.fe-detail-page__back {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-brand-default);
  text-decoration: none;
}

.fe-detail-page__back:hover {
  text-decoration: underline;
}

.fe-detail-page__content {
  flex: 1;
}

.fe-detail-page__placeholder {
  padding: 2rem;
  background: var(--mtv-color-surface-raised);
  border: 1px dashed var(--mtv-color-border-default);
  border-radius: var(--radius);
  text-align: center;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
}

.fe-detail-page__placeholder-meta {
  margin-top: 0.75rem;
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
}
</style>
