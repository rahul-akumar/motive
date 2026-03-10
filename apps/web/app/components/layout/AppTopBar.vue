<script setup lang="ts">
import { Search, Bell, ChevronRight, Menu } from 'lucide-vue-next'

const props = defineProps<{
  title?: string
  moduleName?: string
  alertCount?: number
}>()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const currentTime = ref('')
const currentDate = ref('')

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  updateTime()
  const interval = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <header class="topbar">
    <!-- Mobile hamburger -->
    <button
      type="button"
      class="topbar__hamburger"
      aria-label="Open navigation menu"
      @click="emit('toggleSidebar')"
    >
      <Menu :size="18" :stroke-width="1.5" aria-hidden="true" />
    </button>

    <!-- Left: Title + Breadcrumb -->
    <div class="topbar__left">
      <div class="topbar__breadcrumb">
        <span class="topbar__breadcrumb-root">{{ moduleName || 'App' }}</span>
        <ChevronRight :size="12" aria-hidden="true" class="topbar__breadcrumb-sep" />
        <span class="topbar__breadcrumb-current">{{ title || 'Overview' }}</span>
      </div>
      <h1 class="topbar__title font-condensed">{{ title || moduleName || 'Overview' }}</h1>
    </div>

    <!-- Center: Search -->
    <div class="topbar__search-wrap">
      <label for="topbar-search" class="sr-only">Search drivers, vehicles, loads</label>
      <div class="topbar__search">
        <Search :size="14" aria-hidden="true" class="topbar__search-icon" />
        <input
          id="topbar-search"
          type="search"
          placeholder="Search drivers, vehicles, loads..."
          class="topbar__search-input"
          aria-label="Search drivers, vehicles, loads"
        />
        <kbd class="topbar__search-kbd" aria-label="Keyboard shortcut: Command K">⌘K</kbd>
      </div>
    </div>

    <!-- Right: Live indicator + Time + Alerts + Avatar -->
    <div class="topbar__right">
      <!-- Live indicator -->
      <div class="topbar__live" aria-label="Live data feed active">
        <span class="status-dot status-dot--driving" aria-hidden="true" />
        <span class="topbar__live-label font-mono-data">LIVE</span>
      </div>

      <!-- Date/Time -->
      <div class="topbar__time font-mono-data" aria-label="Current time">
        <span class="topbar__date">{{ currentDate }}</span>
        <span class="topbar__clock">{{ currentTime }}</span>
      </div>

      <!-- Notifications -->
      <button
        class="topbar__notif-btn"
        type="button"
        aria-label="`${alertCount || 0} active alerts`"
      >
        <Bell :size="16" :stroke-width="1.5" aria-hidden="true" />
        <span v-if="alertCount && alertCount > 0" class="topbar__notif-badge" aria-hidden="true">
          {{ alertCount > 9 ? '9+' : alertCount }}
        </span>
      </button>

      <!-- Avatar -->
      <button class="topbar__avatar" type="button" aria-label="User menu — John Dispatch">
        <span aria-hidden="true">JD</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.25rem;
  height: 52px;
  background-color: var(--bg-base);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

/* Hamburger: hidden on desktop, shown on mobile */
.topbar__hamburger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    color 100ms ease,
    background-color 100ms ease,
    border-color 100ms ease;
}

.topbar__hamburger:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.03);
  border-color: var(--border-strong);
}

.topbar__left {
  flex-shrink: 0;
  min-width: 160px;
}

.topbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1px;
}

.topbar__breadcrumb-root {
  font-size: 0.6875rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.05em;
  font-family: 'IBM Plex Mono', monospace;
  text-transform: uppercase;
}

.topbar__breadcrumb-sep {
  color: var(--text-dim);
}

.topbar__breadcrumb-current {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.05em;
  font-family: 'IBM Plex Mono', monospace;
  text-transform: uppercase;
}

.topbar__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  line-height: 1;
  margin: 0;
}

.topbar__search-wrap {
  flex: 1;
  max-width: 380px;
  margin: 0 auto;
}

.topbar__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 0 0.75rem;
  height: 32px;
  transition: border-color 100ms ease;
}

.topbar__search:focus-within {
  border-color: var(--search-focus-border);
  box-shadow: var(--search-focus-shadow);
}

.topbar__search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.topbar__search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-family: 'Barlow', sans-serif;
}

.topbar__search-input::placeholder {
  color: var(--text-muted);
}

.topbar__search-kbd {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6875rem;
  color: var(--text-muted);
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 1px 4px;
  flex-shrink: 0;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  margin-left: auto;
}

.topbar__live {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.topbar__live-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}

.topbar__time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.topbar__date {
  font-size: 0.6875rem;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.topbar__clock {
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.06em;
}

.topbar__notif-btn {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    color 100ms ease,
    background-color 100ms ease,
    border-color 100ms ease;
}

.topbar__notif-btn:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.03);
  border-color: var(--border-strong);
}

.topbar__notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 15px;
  height: 15px;
  background-color: #dc2626;
  color: white;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  border: 1px solid var(--bg-base);
}

.topbar__avatar {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background: var(--avatar-bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--avatar-text);
  cursor: pointer;
  transition: border-color 100ms ease;
  letter-spacing: 0.04em;
}

.topbar__avatar:hover {
  border-color: var(--border-strong);
}

/* Screen reader only */
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

/* ── Responsive ── */
@media (max-width: 768px) {
  .topbar__hamburger {
    display: flex;
  }

  /* Hide search bar on mobile — too cramped */
  .topbar__search-wrap {
    display: none;
  }

  .topbar__right {
    gap: 0.625rem;
  }
}

@media (max-width: 480px) {
  .topbar {
    padding: 0 0.75rem;
    gap: 0.625rem;
  }

  /* Hide date/time on very small screens */
  .topbar__time {
    display: none;
  }

  /* Hide live label text, keep dot */
  .topbar__live-label {
    display: none;
  }

  .topbar__left {
    min-width: unset;
  }

  /* Shrink title slightly */
  .topbar__title {
    font-size: 0.875rem;
  }

  .topbar__breadcrumb {
    display: none;
  }
}
</style>
