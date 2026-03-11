<script setup lang="ts">
import { Search, Bell, Menu } from 'lucide-vue-next'

const props = defineProps<{
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
    <!-- Left: Logo + hamburger on mobile -->
    <div class="topbar__left">
      <button
        type="button"
        class="topbar__hamburger"
        aria-label="Open navigation menu"
        @click="emit('toggleSidebar')"
      >
        <Menu :size="18" :stroke-width="1.5" aria-hidden="true" />
      </button>
      <svg
        class="topbar__logo"
        aria-label="Motive"
        fill="none"
        viewBox="0 0 86 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.6003 4.89116H10.0753L3.31154 16.3393H0V19.7259H5.28792L10.8221 10.3504V19.7192H15.2862L20.7945 10.3233V19.7192H24.5823V4.89116H20.037L14.6003 14.0866V4.89116Z"
          fill="currentColor"
        />
        <path
          d="M33.4728 4.71886H33.4444C29.3713 4.71886 26.1003 8.10547 26.1003 12.3049C26.1003 16.5043 29.3713 19.8909 33.4444 19.8909H33.4728C37.5473 19.8909 40.7885 16.4718 40.7885 12.3049C40.7885 8.13797 37.5473 4.71886 33.4728 4.71886ZM33.4728 16.0979H33.4444C31.4369 16.0979 29.888 14.4033 29.888 12.3049C29.888 10.2066 31.4369 8.51191 33.4444 8.51191H33.4728C35.4235 8.51191 37.0049 10.235 37.0049 12.3049C37.0022 14.4005 35.4533 16.0952 33.4728 16.0952V16.0979Z"
          fill="currentColor"
        />
        <path
          d="M47.0964 16.3398V8.19564H50.4242V4.89571H47.0964V0H43.3087V4.89299H41.1578V8.19293H43.3101V19.7197H50.4242V16.333L47.0964 16.3398Z"
          fill="currentColor"
        />
        <path d="M55.8138 4.89116H52.0261V19.7192H55.8138V4.89251V4.89116Z" fill="currentColor" />
        <path d="M55.8099 0H52.0317V3.3785H55.8099V0Z" fill="currentColor" />
        <path
          d="M68.4504 4.89543L64.8412 14.5947L61.2321 4.89543H57.1819L62.9109 19.7208H66.7229L72.4856 4.90356H68.4504C68.4504 4.90356 68.4504 4.89407 68.4504 4.89543Z"
          fill="currentColor"
        />
        <path
          d="M79.2198 16.5222C80.7422 16.5222 81.6902 15.6323 81.9482 14.8547H85.7364C85.5928 16.0915 83.9561 19.8885 79.217 19.8885C74.9385 19.8885 71.7773 16.6672 71.7773 12.2944C71.7773 8.00958 75.0238 4.70155 79.1012 4.70155C82.9782 4.70155 86 8.09492 86 12.2375C86 12.6682 85.9715 13.072 85.9431 13.3591H75.6619C75.9178 15.1717 77.0095 16.5222 79.2198 16.5222ZM75.7784 10.6552H82.2721C81.8657 9.16515 80.8649 8.06652 79.113 8.06652C77.2772 8.06652 76.2084 9.13126 75.7826 10.6552H75.7784Z"
          fill="currentColor"
        />
      </svg>
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

    <!-- Right: Live indicator + Time + Alerts -->
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
        <Bell :size="20" :stroke-width="1.75" aria-hidden="true" />
        <span v-if="alertCount && alertCount > 0" class="topbar__notif-badge" aria-hidden="true">
          {{ alertCount > 9 ? '9+' : alertCount }}
        </span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 1.25rem;
  height: 52px;
  width: 100%;
  background-color: var(--bg-base);
  position: sticky;
  top: 0;
  z-index: 30;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topbar__logo {
  height: 16px;
  width: auto;
  color: var(--text-primary);
  flex-shrink: 0;
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

.topbar__search-wrap {
  width: 380px;
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
  justify-self: end;
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
  .topbar {
    grid-template-columns: auto 1fr auto;
  }

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
  }

  /* Hide date/time on very small screens */
  .topbar__time {
    display: none;
  }

  /* Hide live label text, keep dot */
  .topbar__live-label {
    display: none;
  }
}
</style>
