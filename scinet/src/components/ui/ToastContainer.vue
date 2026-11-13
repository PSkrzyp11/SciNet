<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast" tag="ul" class="toast-list">
      <li
        v-for="item in toasts"
        :key="item.id"
        class="toast-item"
        :class="`variant-${item.variant}`"
        role="status"
      >
        <span class="toast-icon" aria-hidden="true">
          <svg v-if="item.variant === 'error'" viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.5l2.5 2.5 4.5-5" />
          </svg>
        </span>

        <div class="toast-body">
          <strong class="toast-title">{{ item.title }}</strong>
          <p v-if="item.description" class="toast-desc">{{ item.description }}</p>
        </div>

        <button
          type="button"
          class="toast-close"
          aria-label="Zamknij powiadomienie"
          @click="dismiss(item.id)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region {
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: var(--z-toast);
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  min-width: 280px;
  max-width: 380px;
  padding: var(--space-35) var(--space-4);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-strong);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
}

.toast-item.variant-success {
  border-left-color: var(--color-accent);
}

.toast-item.variant-error {
  border-left-color: var(--color-error);
}

.toast-icon {
  display: inline-flex;
  flex-shrink: 0;
  margin-top: var(--space-05);
  color: var(--color-primary);
}

.variant-error .toast-icon {
  color: var(--color-error);
}

.toast-icon svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  display: block;
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.35;
}

.toast-desc {
  margin: var(--space-05) 0 0;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  line-height: 1.4;
}

.toast-close {
  display: inline-flex;
  padding: var(--space-1);
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.toast-close:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.toast-close svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-spring);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.96);
}
</style>
