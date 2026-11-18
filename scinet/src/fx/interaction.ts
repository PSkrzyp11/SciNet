import { fxTier } from '@/motion/fxTier'

// Kursor i prędkość przewijania dla efektów WebGL. Zdarzenia są zbierane i wysyłane
// najwyżej raz na klatkę, żeby nie zasypywać workera wiadomościami.

/** Prędkość scrolla w px/ms, przy której efekt jest najsilniejszy (4000 px/s) */
const MAX_SPEED = 4

/** Efekty kursora działają tylko z myszą lub gładzikiem, nie na ekranach dotykowych. */
export function hasFinePointer() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
}

export interface PointerState {
  /** 0–1 od lewej krawędzi */
  x: number
  /** 0–1 od dolnej krawędzi, jak w shaderze */
  y: number
  active: boolean
}

/** Pozycja kursora względem prostokąta, w układzie shadera (y rośnie w górę). */
export function pointerIn(rect: DOMRect, clientX: number, clientY: number) {
  return {
    x: (clientX - rect.left) / (rect.width || 1),
    y: 1 - (clientY - rect.top) / (rect.height || 1),
  }
}

/** Siła efektu 0–1 z przesunięcia strony w pikselach i czasu w ms. */
export function scrollStrength(distance: number, elapsed: number) {
  return Math.min(Math.abs(distance) / Math.max(elapsed, 1) / MAX_SPEED, 1)
}

function perFrame<T>(send: (value: T) => void) {
  let frame = 0
  let pending: T | null = null
  return {
    queue(value: T) {
      pending = value
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (pending !== null) send(pending)
        pending = null
      })
    },
    cancel() {
      cancelAnimationFrame(frame)
      frame = 0
    },
  }
}

/** Śledzi mysz nad elementem. Zwraca funkcję, która kończy śledzenie. */
export function trackPointer(target: HTMLElement, send: (state: PointerState) => void) {
  const batch = perFrame(send)
  let last = { x: 0.5, y: 0.5 }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    last = pointerIn(target.getBoundingClientRect(), event.clientX, event.clientY)
    batch.queue({ ...last, active: true })
  }
  const onLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    batch.queue({ ...last, active: false })
  }

  target.addEventListener('pointermove', onMove, { passive: true })
  target.addEventListener('pointerleave', onLeave)
  return () => {
    batch.cancel()
    target.removeEventListener('pointermove', onMove)
    target.removeEventListener('pointerleave', onLeave)
  }
}

/** Śledzi prędkość przewijania strony (działa z Lenis i bez niego). */
export function trackScrollVelocity(send: (strength: number) => void) {
  let lastY = window.scrollY
  let lastTime = performance.now()
  let frame = 0

  const measure = (now: number) => {
    frame = 0
    const strength = scrollStrength(window.scrollY - lastY, now - lastTime)
    lastY = window.scrollY
    lastTime = now
    if (strength > 0) send(strength)
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(measure)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
  }
}

// Hosty, które wysyłają nagłówek CORS, więc obraz da się użyć jako tekstury.
// Innych adresów nie sprawdzamy na ślepo, bo nieudana próba zostawia błąd w konsoli.
const CORS_HOSTS = /(^|\.)wikimedia\.org$/

/** Czy obraz z tego adresu może trafić do WebGL (ten sam serwis albo host z CORS). */
export function isCorsFriendly(src: string) {
  if (typeof window === 'undefined') return false
  try {
    const url = new URL(src, window.location.href)
    return url.origin === window.location.origin || CORS_HOSTS.test(url.hostname)
  } catch {
    return false
  }
}

/** Efekt wymaga pełnego poziomu efektów, myszy, zgody na ruch i WebGL w workerze. */
export function canDistort() {
  return (
    fxTier.value === 'full' &&
    hasFinePointer() &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    typeof Worker !== 'undefined' &&
    typeof createImageBitmap === 'function' &&
    'transferControlToOffscreen' in HTMLCanvasElement.prototype
  )
}
