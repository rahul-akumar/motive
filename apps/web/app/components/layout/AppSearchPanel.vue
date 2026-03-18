<script setup lang="ts">
import { Search, Clock, X, Truck, Bell, Users, Fuel, Globe } from 'lucide-vue-next'
import { MIcon, MTooltip } from '@motive/ui'

export interface AppSearchPanelProps {
  collapsed?: boolean
}

const props = withDefaults(defineProps<AppSearchPanelProps>(), {
  collapsed: false,
})

const emit = defineEmits<{
  search: [query: string]
}>()

const { t } = useI18n()
const router = useRouter()
const { recentSearches, loadRecentSearches, addRecentSearch, removeRecentSearch } = useSearch()

onMounted(loadRecentSearches)

const query = ref('')
const isOpen = ref(false)
const buttonRef = ref<HTMLElement | null>(null) // collapsed icon button
const triggerRef = ref<HTMLElement | null>(null) // expanded bar wrapper
const overlayRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const OVERLAY_WIDTH = 380

// Position only — width/height driven by transition hooks
const overlayStyle = ref<Record<string, string>>({})

// Captured at open time, reused by enter/leave hooks
let triggerRect: DOMRect | null = null
let measuredHeight = 0

async function openPanel() {
  // Use whichever element is visible as the morph origin
  const anchor = props.collapsed ? buttonRef.value : triggerRef.value
  if (!anchor) return
  triggerRect = anchor.getBoundingClientRect()
  overlayStyle.value = {
    left: `${triggerRect.left}px`,
    top: `${triggerRect.top}px`,
  }
  isOpen.value = true
  await nextTick()
  inputRef.value?.focus()
}

function closePanel() {
  isOpen.value = false
  query.value = ''
}

function focus() {
  nextTick(() => openPanel())
}

defineExpose({ focus })

function handleFocusOut(e: FocusEvent) {
  const el = overlayRef.value
  if (!el) return
  if (!el.contains(e.relatedTarget as Node | null)) {
    closePanel()
  }
}

function handleEnter() {
  const q = query.value.trim()
  if (!q) return
  addRecentSearch(q)
  emit('search', q)
  closePanel()
}

function handleEscape() {
  closePanel()
}

function handleInputArrowDown() {
  const items = overlayRef.value?.querySelectorAll<HTMLElement>('[data-panel-item]')
  items?.item(0)?.focus()
}

function handleItemKeydown(e: KeyboardEvent, index: number) {
  const items = overlayRef.value?.querySelectorAll<HTMLElement>('[data-panel-item]')
  if (!items) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    items.item(index + 1)?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (index === 0) inputRef.value?.focus()
    else items.item(index - 1)?.focus()
  } else if (e.key === 'Escape') {
    handleEscape()
  }
}

function handleRecentClick(q: string) {
  addRecentSearch(q)
  emit('search', q)
  closePanel()
}

async function handleQuickAction(href: string) {
  closePanel()
  await router.push(href)
}

const quickActions = computed(() => [
  { label: t('nav.fleet'), href: '/fleet', icon: Truck },
  { label: t('nav.alerts'), href: '/alerts', icon: Bell },
  { label: t('nav.workforce'), href: '/workforce', icon: Users },
  { label: t('nav.fuel'), href: '/fuel', icon: Fuel },
  { label: t('pages.titles.fleet3d'), href: '/fleet-3d', icon: Globe },
])

// ── JS Transition Hooks ─────────────────────────────────────────────────────
// Morph: overlay starts at trigger-bar rect, expands to natural full size.
//
// onBeforeEnter  – hide element; set full width so onEnter can measure it
// onEnter        – measure height, snap to trigger size, then spring to full
// onLeave        – snap back to trigger size, fade out
//
// transitionend bubbles from children, so we filter: target === el && property === 'width'

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)' // spring overshoot
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)' // smooth open for height
const EASE_IN = 'cubic-bezier(0.55, 0, 1, 0.45)' // snappy collapse

function addTransitionEnd(el: HTMLElement, property: string, done: () => void, timeout: number) {
  let called = false
  const finish = () => {
    if (called) return
    called = true
    done()
  }
  const handler = (e: Event) => {
    const te = e as TransitionEvent
    if (te.target !== el || te.propertyName !== property) return
    el.removeEventListener('transitionend', handler)
    finish()
  }
  el.addEventListener('transitionend', handler)
  setTimeout(() => {
    el.removeEventListener('transitionend', handler)
    finish()
  }, timeout)
}

function onBeforeEnter(el: Element) {
  const htmlEl = el as HTMLElement
  // Keep invisible while we set up for measurement in onEnter
  htmlEl.style.opacity = '0'
  htmlEl.style.width = `${OVERLAY_WIDTH}px`
  htmlEl.style.height = 'auto'
}

function onEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement

  // 1. Measure natural height at full width (element is auto-height here)
  void htmlEl.offsetHeight
  const naturalH = htmlEl.offsetHeight

  // 2. Snap to trigger-bar start state
  const r = triggerRect
  const startW = r ? r.width : OVERLAY_WIDTH
  const startH = r ? r.height : 40
  htmlEl.style.width = `${startW}px`
  htmlEl.style.height = `${startH}px`
  htmlEl.style.overflow = 'hidden'
  htmlEl.style.opacity = '0.5'

  // Pre-hide body so it can animate in separately
  const body = htmlEl.querySelector<HTMLElement>('.search-overlay__body')
  if (body) {
    body.style.opacity = '0'
    body.style.transform = 'translateY(-10px)'
  }

  // 3. Commit start state with a reflow, then begin transition
  void htmlEl.offsetHeight

  htmlEl.style.transition = [
    `width 320ms ${SPRING}`,
    `height 290ms ${EASE_OUT}`,
    `opacity 100ms ease`,
  ].join(', ')
  htmlEl.style.width = `${OVERLAY_WIDTH}px`
  htmlEl.style.height = `${naturalH}px`
  htmlEl.style.opacity = '1'

  // Body slides in once the container is mostly open
  setTimeout(() => {
    if (!body) return
    body.style.transition = 'opacity 180ms ease, transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
    body.style.opacity = '1'
    body.style.transform = 'translateY(0)'
  }, 110)

  addTransitionEnd(
    htmlEl,
    'width',
    () => {
      htmlEl.style.overflow = ''
      htmlEl.style.height = 'auto'
      done()
    },
    600,
  )
}

function onLeave(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement

  // Lock height to current pixel value so CSS can animate from it
  htmlEl.style.height = `${htmlEl.getBoundingClientRect().height}px`
  htmlEl.style.overflow = 'hidden'

  // Body vanishes first (brief, so the collapse feels clean)
  const body = htmlEl.querySelector<HTMLElement>('.search-overlay__body')
  if (body) {
    body.style.transition = 'opacity 60ms ease'
    body.style.opacity = '0'
  }

  // Force reflow to commit locked height, then start the collapse
  void htmlEl.offsetHeight

  const target = triggerRef.value?.getBoundingClientRect() ?? triggerRect
  htmlEl.style.transition = [
    `width 220ms ${EASE_IN}`,
    `height 200ms ${EASE_IN}`,
    `opacity 150ms ease-in`,
  ].join(', ')
  if (target) {
    htmlEl.style.width = `${target.width}px`
    htmlEl.style.height = `${target.height}px`
  }
  htmlEl.style.opacity = '0'

  addTransitionEnd(htmlEl, 'width', done, 400)
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
      @click="openPanel"
    >
      <MIcon :icon="Search" class="sidebar__icon" />
      <span class="sidebar__label">{{ t('search.label') }}</span>
    </button>
  </MTooltip>

  <!-- Expanded: in-flow trigger bar (keeps sidebar layout space) -->
  <div v-else ref="triggerRef" class="search-trigger" @click="openPanel">
    <div :class="['search-trigger__bar', { 'search-trigger__bar--hidden': isOpen }]">
      <MIcon :icon="Search" class="search-trigger__icon" />
      <span class="search-trigger__placeholder">{{ t('search.placeholder') }}</span>
      <kbd class="search-trigger__kbd" aria-label="Keyboard shortcut: Command F">F</kbd>
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
        <!-- Input row -->
        <div class="search-overlay__bar">
          <MIcon :icon="Search" class="search-overlay__icon" />
          <label for="app-search" class="sr-only">{{ t('search.inputLabel') }}</label>
          <input
            id="app-search"
            ref="inputRef"
            v-model="query"
            type="search"
            :placeholder="t('search.inputPlaceholder')"
            class="search-overlay__input"
            autocomplete="off"
            @keydown.enter.prevent="handleEnter"
            @keydown.escape.prevent="handleEscape"
            @keydown.arrow-down.prevent="handleInputArrowDown"
          />
          <kbd class="search-overlay__esc">Esc</kbd>
        </div>

        <!-- Results (animated separately inside onEnter/onLeave) -->
        <div class="search-overlay__body">
          <div class="search-overlay__section-label">{{ t('search.recent') }}</div>
          <template v-if="recentSearches.length > 0">
            <div
              v-for="(item, i) in recentSearches"
              :key="item"
              class="search-overlay__row"
              tabindex="0"
              data-panel-item
              @click="handleRecentClick(item)"
              @keydown.enter.prevent="handleRecentClick(item)"
              @keydown="handleItemKeydown($event, i)"
            >
              <MIcon :icon="Clock" class="search-overlay__row-icon" />
              <span class="search-overlay__row-label">{{ item }}</span>
              <button
                type="button"
                class="search-overlay__row-remove"
                :aria-label="t('search.removeRecent', { query: item })"
                @click.stop="removeRecentSearch(item)"
              >
                <MIcon :icon="X" :size="12" />
              </button>
            </div>
          </template>
          <div v-else class="search-overlay__empty">{{ t('search.noRecentSearches') }}</div>

          <div class="search-overlay__divider" />

          <div class="search-overlay__section-label">{{ t('search.quickActions') }}</div>
          <div
            v-for="(action, i) in quickActions"
            :key="action.href"
            class="search-overlay__row"
            tabindex="0"
            data-panel-item
            @click="handleQuickAction(action.href)"
            @keydown.enter.prevent="handleQuickAction(action.href)"
            @keydown="handleItemKeydown($event, recentSearches.length + i)"
          >
            <MIcon :icon="action.icon" class="search-overlay__row-icon" />
            <span class="search-overlay__row-label">{{ action.label }}</span>
          </div>
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
    border-color 100ms ease,
    opacity 80ms ease;
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
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  padding: 1px 4px;
  flex-shrink: 0;
}

/* ── Morphing overlay (teleported to body) ── */
.search-overlay {
  position: fixed;
  z-index: 200;
  background-color: var(--mtv-color-surface-default);
  border: 1px solid var(--search-focus-border);
  border-radius: var(--card-radius);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 8px 40px rgba(0, 0, 0, 0.55),
    var(--search-focus-shadow);
  /* width/height/opacity animated by JS hooks — no CSS transition here */
}

.search-overlay__bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0 0.75rem;
  height: 40px;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.search-overlay__icon {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
}

.search-overlay__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-default);
  font-family: var(--font-family-sans);
  min-width: 0;
}

.search-overlay__input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

.search-overlay__input::-webkit-search-cancel-button {
  display: none;
}

.search-overlay__esc {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 3px;
  padding: 2px 6px;
  flex-shrink: 0;
  letter-spacing: var(--tracking-tight);
  white-space: nowrap;
}

.search-overlay__body {
  padding: 4px 0 6px;
  /* opacity/transform driven by JS hooks */
}

.search-overlay__section-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--mtv-color-foreground-subtle);
  padding: 6px 12px 3px;
}

.search-overlay__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  height: 34px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
  outline: none;
  transition:
    color 80ms ease,
    background-color 80ms ease;
}

.search-overlay__row:hover,
.search-overlay__row:focus {
  background-color: hsla(0, 0%, 100%, 0.07);
  color: var(--mtv-color-foreground-default);
}

.search-overlay__row-icon {
  flex-shrink: 0;
  color: var(--mtv-color-foreground-subtle);
  width: 15px;
  height: 15px;
}

.search-overlay__row-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-overlay__row-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background: transparent;
  border: none;
  color: var(--mtv-color-foreground-subtle);
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition:
    opacity 80ms ease,
    color 80ms ease,
    background-color 80ms ease;
}

.search-overlay__row:hover .search-overlay__row-remove,
.search-overlay__row:focus .search-overlay__row-remove {
  opacity: 1;
}

.search-overlay__row-remove:hover {
  color: var(--mtv-color-foreground-default);
  background-color: hsla(0, 0%, 100%, 0.1);
}

.search-overlay__empty {
  padding: 4px 12px 2px;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  font-style: italic;
}

.search-overlay__divider {
  height: 1px;
  background-color: var(--mtv-color-border-default);
  margin: 5px 8px;
}

/* ── Collapsed button (replicates sidebar nav-item styles) ── */
.sidebar-nav-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  height: 36px;
  border-radius: 4px;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  transition:
    color 100ms ease,
    background-color 100ms ease;
}

.sidebar-nav-item:hover {
  color: var(--mtv-color-foreground-default);
  background-color: hsla(0, 0%, 100%, 0.09);
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
    opacity 160ms ease-out 60ms,
    transform 180ms ease-out 60ms;
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
