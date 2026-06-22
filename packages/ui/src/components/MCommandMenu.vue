<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref, watch, nextTick } from 'vue'
import { Search } from 'lucide-vue-next'
import MIcon from './MIcon.vue'

export interface MCommandItemView {
  /** Stable unique id for the item. */
  id: string
  /** Primary label shown in the row. */
  label: string
  /** Optional secondary text shown to the right / beneath. */
  sublabel?: string
  /** Optional leading icon (a lucide-vue-next icon), rendered via MIcon. */
  icon?: Component
}

export interface MCommandGroup {
  /** Stable unique id for the group. */
  id: string
  /** Optional section heading. */
  label?: string
  items: MCommandItemView[]
}

export interface MCommandMenuProps {
  /** Current search query (v-model). @default '' */
  modelValue?: string
  /** Grouped, already-filtered/ranked items to render. */
  groups: MCommandGroup[]
  /** Placeholder for the search input. @default 'Search…' */
  placeholder?: string
  /** Message shown when there are no results. @default 'No results found.' */
  emptyText?: string
}

const props = withDefaults(defineProps<MCommandMenuProps>(), {
  modelValue: '',
  placeholder: 'Search…',
  emptyText: 'No results found.',
})

const emit = defineEmits<{
  /** Fired as the query changes. */
  'update:modelValue': [value: string]
  /** Fired when an item is chosen (Enter or click). */
  select: [item: MCommandItemView]
  /** Fired on Escape. */
  close: []
}>()

const menuId = `m-command-${Math.random().toString(36).slice(2, 9)}`
const listboxId = `${menuId}-listbox`
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

// Flattened view of every item across groups — drives active-descendant nav.
const flatItems = computed(() => props.groups.flatMap((g) => g.items))

const optionId = (index: number) => `${menuId}-opt-${index}`
const activeId = computed(() => (flatItems.value.length ? optionId(activeIndex.value) : undefined))

// Reset highlight to the top whenever the result set changes.
watch(
  () => props.groups,
  () => {
    activeIndex.value = 0
  },
  { deep: true },
)

function move(delta: number) {
  const n = flatItems.value.length
  if (n === 0) return
  activeIndex.value = (activeIndex.value + delta + n) % n
  scrollActiveIntoView()
}

function scrollActiveIntoView() {
  nextTick(() => {
    const el = listRef.value?.querySelector<HTMLElement>(`[id="${optionId(activeIndex.value)}"]`)
    el?.scrollIntoView?.({ block: 'nearest' })
  })
}

function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      move(-1)
      break
    case 'Home':
      e.preventDefault()
      activeIndex.value = 0
      scrollActiveIntoView()
      break
    case 'End':
      e.preventDefault()
      activeIndex.value = Math.max(0, flatItems.value.length - 1)
      scrollActiveIntoView()
      break
    case 'Enter': {
      e.preventDefault()
      const item = flatItems.value[activeIndex.value]
      if (item) emit('select', item)
      break
    }
    case 'Escape':
      e.preventDefault()
      emit('close')
      break
  }
}

/** Index of an item within the flattened list, for active-descendant wiring. */
function flatIndexOf(item: MCommandItemView): number {
  return flatItems.value.findIndex((i) => i.id === item.id)
}

function focus() {
  nextTick(() => inputRef.value?.focus())
}

defineExpose({ focus })
</script>

<template>
  <div class="m-command">
    <div class="m-command__search">
      <MIcon :icon="Search" class="m-command__search-icon" />
      <input
        ref="inputRef"
        :value="modelValue"
        type="text"
        role="combobox"
        aria-expanded="true"
        :aria-controls="listboxId"
        :aria-activedescendant="activeId"
        autocomplete="off"
        spellcheck="false"
        class="m-command__input"
        :placeholder="placeholder"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="onKeydown"
      />
    </div>

    <div :id="listboxId" ref="listRef" role="listbox" class="m-command__list">
      <template v-if="flatItems.length">
        <div v-for="group in groups" :key="group.id" class="m-command__group">
          <div v-if="group.label" class="m-command__group-label">{{ group.label }}</div>
          <div
            v-for="item in group.items"
            :id="optionId(flatIndexOf(item))"
            :key="item.id"
            role="option"
            :aria-selected="flatIndexOf(item) === activeIndex"
            class="m-command__option"
            :class="{ 'm-command__option--active': flatIndexOf(item) === activeIndex }"
            @click="emit('select', item)"
            @mousemove="activeIndex = flatIndexOf(item)"
          >
            <MIcon v-if="item.icon" :icon="item.icon" class="m-command__option-icon" />
            <span class="m-command__option-label">{{ item.label }}</span>
            <span v-if="item.sublabel" class="m-command__option-sublabel">{{ item.sublabel }}</span>
          </div>
        </div>
      </template>
      <div v-else class="m-command__empty">{{ emptyText }}</div>
    </div>
  </div>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.m-command {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.m-command__search {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 0.75rem;
  height: 44px;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.m-command__search-icon {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
}

.m-command__input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--font-size-base);
  font-family: var(--font-family-sans);
  color: var(--mtv-color-foreground-default);
}

.m-command__input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

.m-command__list {
  overflow-y: auto;
  padding: 0.375rem 0.25rem;
  flex: 1;
  min-height: 0;
}

.m-command__group + .m-command__group {
  margin-top: 0.25rem;
}

.m-command__group-label {
  padding: 0.375rem 0.625rem 0.25rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--mtv-color-foreground-subtle);
}

.m-command__option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  height: 36px;
  padding: 0 0.625rem;
  margin: 0 0.125rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
}

.m-command__option--active {
  background-color: var(--mtv-color-surface-hover);
  color: var(--mtv-color-foreground-default);
}

.m-command__option-icon {
  flex-shrink: 0;
  color: var(--mtv-color-foreground-subtle);
}

.m-command__option--active .m-command__option-icon {
  color: var(--mtv-color-foreground-default);
}

.m-command__option-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.m-command__option-sublabel {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  font-family: var(--font-family-mono);
}

.m-command__empty {
  padding: 1.5rem 0.625rem;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}
</style>
