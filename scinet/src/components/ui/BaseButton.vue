<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    to?: RouteLocationRaw
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    to: undefined,
    disabled: false,
    loading: false,
    block: false,
  },
)
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="base-btn"
    :class="[`variant-${variant}`, `size-${size}`, { block }]"
  >
    <slot />
  </RouterLink>
  <button
    v-else
    :type="type"
    class="base-btn"
    :class="[`variant-${variant}`, `size-${size}`, { block, loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <span class="content"><slot /></span>
  </button>
</template>

<style scoped>
.base-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.base-btn.block {
  display: flex;
  width: 100%;
}

/* Rozmiary */
.size-sm {
  padding: var(--space-2) var(--space-35);
  font-size: var(--text-sm);
  border-radius: var(--radius-xs);
}

.size-md {
  padding: var(--space-3) 22px;
  font-size: var(--text-base);
}

.size-lg {
  padding: var(--space-35) 28px;
  font-size: var(--text-base);
  border-radius: var(--radius-md);
}

@media (pointer: coarse) {
  .base-btn {
    min-height: 44px;
  }
}

/* Fizyczny feedback przy kliknięciu */
.base-btn:not(:disabled):active {
  transform: scale(0.975);
}

/* Wariant: Primary (Królewski Ametyst) */
.variant-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-xs);
}

.variant-primary:not(:disabled):hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.variant-primary:not(:disabled):active {
  background: var(--color-primary-active);
  transform: translateY(0) scale(0.98);
}

/* Wariant: Accent (Szlachetny Bursztyn) */
.variant-accent {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
  box-shadow: var(--shadow-xs);
}

.variant-accent:not(:disabled):hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

/* Wariant: Secondary (Obramowany) */
.variant-secondary {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.variant-secondary:not(:disabled):hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

/* Wariant: Ghost (Bez tła) */
.variant-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-text-muted);
}

.variant-ghost:not(:disabled):hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

/* Wariant: Danger */
.variant-danger {
  background: var(--color-error-bg);
  border-color: var(--color-error-border);
  color: var(--color-error);
}

.variant-danger:not(:disabled):hover {
  background: var(--color-error);
  border-color: var(--color-error);
  color: #fff;
}

/* Focus i Disabled */
.base-btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.base-btn:disabled {
  opacity: 0.52;
  cursor: not-allowed;
  box-shadow: none;
}

.content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin var(--duration-spin) linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
