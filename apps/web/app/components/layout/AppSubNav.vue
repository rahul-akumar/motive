<script setup lang="ts">
export type SubNavTab = { label: string; href: string }

export interface AppSubNavProps {
  /** Pass a flat array for ungrouped tabs, or an array of arrays to get dividers between groups. */
  tabs: SubNavTab[] | SubNavTab[][]
}

const props = defineProps<AppSubNavProps>()
const route = useRoute()

const groups = computed<SubNavTab[][]>(() => {
  if (props.tabs.length === 0) return []
  return Array.isArray(props.tabs[0]) ? (props.tabs as SubNavTab[][]) : [props.tabs as SubNavTab[]]
})

const navRef = ref<HTMLElement | null>(null)
const tabEls = ref<Record<string, HTMLElement>>({})
const ready = ref(false)

const indicatorStyle = ref({
  transform: 'translateX(0px)',
  width: '0px',
  opacity: '0',
})

function updateIndicator() {
  if (!navRef.value) return
  const el = tabEls.value[route.path]
  if (!el) return

  const navLeft = navRef.value.getBoundingClientRect().left
  const { left, width } = el.getBoundingClientRect()
  const x = left - navLeft + navRef.value.scrollLeft

  indicatorStyle.value = {
    transform: `translateX(${x}px)`,
    width: `${width}px`,
    opacity: '1',
  }

  if (!ready.value)
    nextTick(() => {
      ready.value = true
    })
}

watch(
  () => route.path,
  () => nextTick(updateIndicator),
)
onMounted(() => nextTick(updateIndicator))
</script>

<template>
  <nav ref="navRef" class="app-sub-nav" aria-label="Sub-navigation">
    <!-- Shared bottom bar indicator — slides between tabs via JS-driven translateX -->
    <span
      class="app-sub-nav__indicator"
      :class="{ 'app-sub-nav__indicator--ready': ready }"
      :style="indicatorStyle"
      aria-hidden="true"
    />

    <template v-for="(group, gi) in groups" :key="gi">
      <span v-if="gi > 0" class="app-sub-nav__divider" aria-hidden="true" />
      <NuxtLink
        v-for="tab in group"
        :key="tab.href"
        :ref="
          (el) => {
            if (el) tabEls[tab.href] = ((el as any).$el ?? el) as HTMLElement
          }
        "
        :to="tab.href"
        :class="['app-sub-nav__tab', { 'app-sub-nav__tab--active': route.path === tab.href }]"
        :aria-current="route.path === tab.href ? 'page' : undefined"
      >
        {{ tab.label }}
      </NuxtLink>
    </template>
  </nav>
</template>

<style scoped>
.app-sub-nav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 1.25rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}

.app-sub-nav::-webkit-scrollbar {
  display: none;
}

/* Sliding bottom bar — no transition on mount (avoids sliding in from 0,0) */
.app-sub-nav__indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background-color: var(--text-primary);
  pointer-events: none;
  z-index: 1;
}

/* Transitions enabled only after first position is set */
.app-sub-nav__indicator--ready {
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.15s ease;
}

.app-sub-nav__divider {
  display: block;
  width: 1px;
  height: 1rem;
  background-color: var(--border);
  margin: 0 0.5rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.app-sub-nav__tab {
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition: color 150ms ease;
}

.app-sub-nav__tab:hover {
  color: var(--text-primary);
}

.app-sub-nav__tab--active {
  color: var(--text-primary);
}
</style>
