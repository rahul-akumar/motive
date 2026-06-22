<script setup lang="ts">
import { MTextarea, MCheckbox } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'
import { saveNote } from '~/services/notesRepository'

const props = defineProps<{
  event: FuelEventRow
}>()

interface Note {
  id: string
  author: string
  text: string
  date: string
}

// Module-level notes store (persists across navigation, resets on refresh)
const notesByEvent = reactive<Map<string, Note[]>>(new Map())

const newNoteText = ref('')
const visibleToDriver = ref(false)

const { run, isPending } = useOptimisticAction()

const notes = computed(() => {
  return notesByEvent.get(props.event.id) ?? []
})

async function addNote() {
  const text = newNoteText.value.trim()
  if (!text || isPending.value) return

  const note: Note = {
    id: `note-${Date.now()}`,
    author: 'You',
    text,
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
  }
  // Snapshot for rollback if the save fails.
  const previousText = newNoteText.value
  const previousVisible = visibleToDriver.value

  await run({
    apply: () => {
      const existing = notesByEvent.get(props.event.id) ?? []
      existing.push(note)
      notesByEvent.set(props.event.id, existing)
      newNoteText.value = ''
      visibleToDriver.value = false
    },
    rollback: () => {
      const existing = notesByEvent.get(props.event.id) ?? []
      notesByEvent.set(
        props.event.id,
        existing.filter((n) => n.id !== note.id),
      )
      newNoteText.value = previousText
      visibleToDriver.value = previousVisible
    },
    action: () => saveNote({ eventId: props.event.id, text, visibleToDriver: previousVisible }),
    successMessage: 'Note added',
    errorMessage: 'Could not save note. Please try again.',
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    addNote()
  }
}
</script>

<template>
  <div class="drawer-notes">
    <!-- Input -->
    <div class="drawer-notes__input-wrap">
      <MTextarea
        :model-value="newNoteText"
        placeholder="Add a note..."
        :rows="2"
        @update:model-value="newNoteText = $event"
        @keydown="handleKeydown"
      />
      <span class="drawer-notes__hint">{{ isPending ? 'Saving…' : 'Enter ↵ to Save' }}</span>
    </div>
    <MCheckbox
      :model-value="visibleToDriver"
      label="Make visible to driver"
      @update:model-value="visibleToDriver = $event"
    />

    <!-- Existing notes -->
    <div v-if="notes.length" class="drawer-notes__list">
      <div v-for="note in notes" :key="note.id" class="drawer-notes__note">
        <span class="drawer-notes__note-author">{{ note.author }}</span>
        <span class="drawer-notes__note-text">{{ note.text }}</span>
        <span class="drawer-notes__note-date">{{ note.date }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-notes__input-wrap {
  display: flex;
  flex-direction: column;
}

.drawer-notes__hint {
  display: block;
  text-align: right;
  padding: 0.25rem 0.625rem 0.375rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}

.drawer-notes__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.drawer-notes__note {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.drawer-notes__note-author {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.drawer-notes__note-text {
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-default);
}

.drawer-notes__note-date {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}
</style>
