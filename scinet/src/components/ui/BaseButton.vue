<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { hasFinePointer } from '@/fx/interaction'

// Najdalej o tyle pikseli przycisk podąża za kursorem
const MAGNET_X = 6
const MAGNET_Y = 4

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

const motionAllowed = (event: PointerEvent) =>
  event.pointerType === 'mouse' &&
  hasFinePointer() &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Wypełnienie zaczyna się w miejscu, w którym kursor wjechał na przycisk
function setFillOrigin(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--fill-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
  el.style.setProperty('--fill-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
}

function onEnter(event: PointerEvent) {
  if (motionAllowed(event)) setFillOrigin(event)
}

// Efekt magnetyczny: przycisk przesuwa się lekko w stronę kursora
function onMove(event: PointerEvent) {
  if (!motionAllowed(event)) return
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const dx = (event.clientX - rect.left) / rect.width - 0.5
  const dy = (event.clientY - rect.top) / rect.height - 0.5
  el.style.setProperty('--magnet-x', `${(dx * 2 * MAGNET_X).toFixed(1)}px`)
  el.style.setProperty('--magnet-y', `${(dy * 2 * MAGNET_Y).toFixed(1)}px`)
}

// Wypełnienie cofa się w stronę miejsca wyjścia, a przycisk wraca na swoje miejsce
function onLeave(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  if (motionAllowed(event)) setFillOrigin(event)
  el.style.removeProperty('--magnet-x')
  el.style.removeProperty('--magnet-y')
}
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="base-btn"
    :class="[`variant-${variant}`, `size-${size}`, { block }]"
    @pointerenter="onEnter"
    @pointermove="onMove"
    @pointerleave="onLeave"
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
    @pointerenter="onEnter"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <span class="content"><slot /></span>
  </button>
</template>

<style scoped>
.base-btn {
  /* Kolor wypełnienia po najechaniu ustawia wariant */
  --btn-fill: transparent;
  --press: 1;
  position: relative;
  isolation: isolate;
  overflow: hidden;
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
    transform var(--duration-normal) var(--ease-spring);
  transform: translate(var(--magnet-x, 0), var(--magnet-y, 0)) scale(var(--press));
}

/* Wypełnienie rozlewa się koliście od miejsca wejścia kursora (bez myszy: od środka) */
.base-btn::before {
  content: '';
  position: absolute;
  top: var(--fill-y, 50%);
  left: var(--fill-x, 50%);
  z-index: -1;
  width: 250%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--btn-fill);
  transform: translate(-50%, -50%) scale(0);
  transition: transform var(--duration-slow) var(--ease-out);
  pointer-events: none;
}

.base-btn:not(:disabled):hover::before {
  transform: translate(-50%, -50%) scale(1);
}

.base-btn.block {
  display: flex;
  width: 100%;
}

/* Rozmiary */
/* Mały przycisk ma kształt pigułki, jak przełączniki „Lubię to” i „Zapisz”, obok których stoi */
.size-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  border-radius: var(--radius-pill);
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
  --press: 0.975;
}

/* Wariant: Primary (Królewski Ametyst) */
.variant-primary {
  --btn-fill: var(--color-primary-hover);
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-xs);
}

.variant-primary:not(:disabled):hover {
  border-color: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
}

.variant-primary:not(:disabled):active {
  --btn-fill: var(--color-primary-active);
}

/* Wariant: Accent (Szlachetny Bursztyn) */
.variant-accent {
  --btn-fill: var(--color-accent-hover);
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
  box-shadow: var(--shadow-xs);
}

.variant-accent:not(:disabled):hover {
  border-color: var(--color-accent-hover);
  box-shadow: var(--shadow-sm);
}

/* Wariant: Secondary (Obramowany) */
.variant-secondary {
  --btn-fill: var(--color-primary-light);
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.variant-secondary:not(:disabled):hover {
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

/* Wariant: Ghost (Bez tła) */
.variant-ghost {
  --btn-fill: var(--color-primary-light);
  background: transparent;
  border-color: transparent;
  color: var(--color-text-muted);
}

.variant-ghost:not(:disabled):hover {
  color: var(--color-primary);
}

/* Wariant: Danger */
.variant-danger {
  --btn-fill: var(--color-error);
  background: var(--color-error-bg);
  border-color: var(--color-error-border);
  color: var(--color-error);
}

.variant-danger:not(:disabled):hover {
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
