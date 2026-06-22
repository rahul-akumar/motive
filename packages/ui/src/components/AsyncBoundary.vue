<script setup lang="ts">
import { TriangleAlert, Inbox } from 'lucide-vue-next'
import MSkeleton from './MSkeleton.vue'
import MEmptyState from './MEmptyState.vue'
import MButton from './MButton.vue'

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error' | 'empty'

export interface AsyncBoundaryProps {
  /** Current state of the async resource being rendered. */
  status: AsyncStatus
  /** Error-state heading. @default 'Something went wrong' */
  errorTitle?: string
  /** Error-state supporting text. */
  errorDescription?: string
  /** Empty-state heading. @default 'Nothing here yet' */
  emptyTitle?: string
  /** Empty-state supporting text. */
  emptyDescription?: string
  /** Number of skeleton lines for the default pending fallback. @default 4 */
  skeletonLines?: number
  /** Hides the retry button in the default error fallback. @default false */
  hideRetry?: boolean
}

withDefaults(defineProps<AsyncBoundaryProps>(), {
  errorTitle: 'Something went wrong',
  errorDescription: 'We couldn’t load this. Please try again.',
  emptyTitle: 'Nothing here yet',
  emptyDescription: undefined,
  skeletonLines: 4,
  hideRetry: false,
})

const emit = defineEmits<{
  /** Fired when the user requests a retry from the default error fallback. */
  retry: []
}>()
</script>

<template>
  <!-- Success: render the actual content -->
  <slot v-if="status === 'success'" />

  <!-- Pending -->
  <slot v-else-if="status === 'pending' || status === 'idle'" name="pending">
    <MSkeleton :lines="skeletonLines" />
  </slot>

  <!-- Error -->
  <slot v-else-if="status === 'error'" name="error" :retry="() => emit('retry')">
    <MEmptyState
      :icon="TriangleAlert"
      variant="error"
      :title="errorTitle"
      :description="errorDescription"
    >
      <template v-if="!hideRetry" #action>
        <MButton variant="secondary" size="sm" @click="emit('retry')">Try again</MButton>
      </template>
    </MEmptyState>
  </slot>

  <!-- Empty -->
  <slot v-else-if="status === 'empty'" name="empty">
    <MEmptyState :icon="Inbox" :title="emptyTitle" :description="emptyDescription" />
  </slot>
</template>
