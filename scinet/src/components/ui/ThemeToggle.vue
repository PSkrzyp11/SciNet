<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'"
    :title="theme === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'"
    @click="toggleTheme"
  >
    <span class="icon-wrap" aria-hidden="true">
      <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" class="sun">
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="18" height="18" class="moon">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </span>
    <span class="theme-label">{{ theme === 'dark' ? 'Jasny' : 'Nocny' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 13px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-soft);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out);
}

.theme-toggle:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  box-shadow: var(--shadow-xs);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.icon-wrap {
  display: inline-grid;
  place-items: center;
}

svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.theme-toggle:hover svg {
  transform: rotate(18deg) scale(1.08);
}

@media (pointer: coarse) {
  .theme-toggle {
    min-height: 40px;
  }
}
</style>
