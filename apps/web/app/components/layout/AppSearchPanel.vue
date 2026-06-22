<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { MIcon, MTooltip, MCommandMenu, type MCommandItemView } from '@motive/ui'

export interface AppSearchPanelProps {
  collapsed?: boolean
}

const props = withDefaults(defineProps<AppSearchPanelProps>(), {
  collapsed: false,
})

const { t } = useI18n()
const { query, groups, runById, recordSearch, loadRecentSearches } = useCommandPalette()
const { isOpen, open, close } = useCommandPaletteState()

onMounted(loadRecentSearches)

const buttonRef = ref<HTMLElement | null>(null) // collapsed icon button
const triggerRef = ref<HTMLElement | null>(null) // expanded bar wrapper
const overlayRef = ref<HTMLElement | null>(null)
const menuRef = ref<InstanceType<typeof MCommandMenu> | null>(null)

// Position only — width/height driven by transition hooks
const overlayStyle = ref<Record<string, string>>({})

// Morphing open/close transition — hooks for the <Transition :css="false"> below
const { captureTriggerRect, onBeforeEnter, onEnter, onLeave } = useSearchPanelTransition(triggerRef)

// The overlay is bound directly to the shared `isOpen` (single source of truth),
// so the trigger, ⌘K, and "/" can't desync. The watcher runs pre-flush, so we
// position the morph origin before the element renders (no flash), then focus.
watch(isOpen, (val) => {
  if (val) {
    const anchor = props.collapsed ? buttonRef.value : triggerRef.value
    if (anchor) {
      const rect = captureTriggerRect(anchor)
      overlayStyle.value = { left: `${rect.left}px`, top: `${rect.top}px` }
    }
    nextTick(() => menuRef.value?.focus())
  } else {
    query.value = ''
  }
})

function handleFocusOut(e: FocusEvent) {
  const el = overlayRef.value
  if (!el) return
  if (!el.contains(e.relatedTarget as Node | null)) close()
}

function handleSelect(item: MCommandItemView) {
  recordSearch()
  runById(item.id)
  close()
}
</script>

<template>
  <!-- Collapsed: icon-only button — opens overlay without expanding sidebar -->
  <MTooltip v-if="collapsed" :content="t('search.label')" placement="right">
    <button
      ref="buttonRef"
      type="button"
      class="sidebar-nav-item sidebar-nav-item--btn"
      :aria-label="t('search.label')"
      @click="open"
    >
      <MIcon :icon="Search" class="sidebar__icon" />
      <span class="sidebar__label">{{ t('search.label') }}</span>
    </button>
  </MTooltip>

  <!-- Expanded: in-flow trigger bar (keeps sidebar layout space) -->
  <div v-else ref="triggerRef" class="search-trigger" @click="open">
    <div :class="['search-trigger__bar', { 'search-trigger__bar--hidden': isOpen }]">
      <MIcon :icon="Search" class="search-trigger__icon" />
      <span class="search-trigger__placeholder">{{ t('search.placeholder') }}</span>
      <kbd class="search-trigger__kbd" aria-label="Keyboard shortcut: Command K">⌘K</kbd>
    </div>
  </div>

  <!-- Morphing overlay — lives on body so it escapes sidebar's transform context,
       and is available in both collapsed and expanded sidebar states -->
  <Teleport to="body">
    <Transition :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
      <div
        v-if="isOpen"
        ref="overlayRef"
        class="search-overlay"
        :style="overlayStyle"
        @focusout="handleFocusOut"
      >
        <!-- Command palette (results animated separately inside onEnter/onLeave) -->
        <div class="search-overlay__body">
          <MCommandMenu
            ref="menuRef"
            v-model="query"
            :groups="groups"
            :placeholder="t('search.inputPlaceholder')"
            :empty-text="t('search.noResults')"
            class="search-overlay__menu"
            @select="handleSelect"
            @close="close"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── In-flow trigger bar ── */
.search-trigger {
  flex-shrink: 0;
  cursor: pointer;
}

.search-trigger__bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background-color: var(--mtv-color-surface-default);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--card-radius);
  padding: 0 0.5rem;
  height: 36px;
  transition:
    border-color var(--mtv-duration-fast) var(--mtv-ease-standard),
    opacity var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.search-trigger__bar:hover {
  border-color: color-mix(
    in srgb,
    var(--mtv-color-border-default) 50%,
    var(--mtv-color-foreground-subtle)
  );
}

/* Fade out in-flow bar when overlay is visible — keeps layout space */
.search-trigger__bar--hidden {
  opacity: 0;
  pointer-events: none;
}

.search-trigger__icon {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
}

.search-trigger__placeholder {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  font-family: var(--font-family-sans);
  user-select: none;
}

.search-trigger__kbd {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  background-color: var(--mtv-color-surface-accent-subtle);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--radius-sm);
  padding: 1px 4px;
  flex-shrink: 0;
}

/* ── Morphing overlay (teleported to body) ── */
.search-overlay {
  position: fixed;
  z-index: var(--mtv-z-modal);
  display: flex;
  flex-direction: column;
  max-height: min(60vh, 460px);
  background-color: var(--mtv-color-surface-default);
  border: 1px solid var(--search-focus-border);
  border-radius: var(--card-radius);
  box-shadow:
    0 0 0 1px var(--mtv-color-border-subtle) inset,
    var(--mtv-shadow-lg),
    var(--search-focus-shadow);
  /* width/height/opacity animated by JS hooks — no CSS transition here */
}

.search-overlay__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  /* opacity/transform driven by JS hooks */
}

.search-overlay__menu {
  flex: 1;
  min-height: 0;
}

/* ── Collapsed button (replicates sidebar nav-item styles) ── */
.sidebar-nav-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  transition:
    color var(--mtv-duration-fast) var(--mtv-ease-standard),
    background-color var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.sidebar-nav-item:hover {
  color: var(--mtv-color-foreground-default);
  background-color: var(--mtv-color-surface-hover);
}

.sidebar-nav-item--btn {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
}

.sidebar__icon {
  justify-self: center;
}

.sidebar__label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transform: translateX(0);
  transition:
    opacity var(--mtv-duration-base) var(--mtv-ease-standard) 60ms,
    transform var(--mtv-duration-base) var(--mtv-ease-standard) 60ms;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .search-overlay {
    transition: none !important;
  }
}
</style>
