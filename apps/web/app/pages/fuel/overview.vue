<script setup lang="ts">
import { MCard } from '@motive/ui'

definePageMeta({
  title: 'Overview',
  moduleName: 'Fuel',
})
</script>

<template>
  <div class="fuel-overview">
    <!-- Full-width placeholder (data coming soon) -->
    <MCard class="fuel-overview__placeholder" aria-label="Fuel overview (coming soon)" />

    <!-- Fuel overview cards -->
    <section class="fuel-overview__row" aria-label="Fuel overview cards">
      <FuelWasteCard class="fuel-overview__waste" />
    </section>
  </div>
</template>

<style scoped>
.fuel-overview {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.fuel-overview__placeholder {
  min-height: 180px;
}

.fuel-overview__row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.fuel-overview__waste {
  grid-column: span 2;
}

@media (max-width: 1280px) {
  .fuel-overview__row {
    grid-template-columns: 1fr;
  }

  .fuel-overview__waste {
    grid-column: span 1;
  }
}
</style>
