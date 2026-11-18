import type Lenis from 'lenis'
import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerClass } from 'gsap/ScrollTrigger'
import { fxTier } from './fxTier'

// Jedna flaga wyłącza płynny scroll: zostaje wtedy natywne przewijanie przeglądarki
const SMOOTH_SCROLL = true

let lenis: Lenis | null = null
let starting = false

export const getLenis = () => lenis

export interface ScrollMotion {
  gsap: typeof Gsap
  ScrollTrigger: typeof ScrollTriggerClass
}

let resolveReady: (motion: ScrollMotion | null) => void = () => {}
const ready = new Promise<ScrollMotion | null>((resolve) => (resolveReady = resolve))

/**
 * GSAP i ScrollTrigger, gdy już się wczytają (po wyświetleniu strony).
 * `null` oznacza, że biblioteki się nie wczytały i animacje scrolla zostają wyłączone.
 */
export const whenMotionReady = () => ready

/**
 * Uruchamia płynny scroll i wspólną pętlę animacji.
 * Biblioteki ładują się osobno, po wyświetleniu strony, więc nie opóźniają startu.
 * Na ekranach dotykowych Lenis zostawia natywny scroll, a przy `prefers-reduced-motion`
 * sam wyłącza wygładzanie.
 */
export async function initMotion() {
  if (lenis || starting || typeof window === 'undefined') return
  // Poziom „off” (ograniczony ruch, brak WebGL): bez bibliotek ruchu, zmiany są natychmiastowe
  if (fxTier.value === 'off') return resolveReady(null)
  starting = true

  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])
    gsap.registerPlugin(ScrollTrigger)

    // Poziom lekki (telefon, słabszy sprzęt): natywny scroll, a ScrollTrigger sam słucha
    // przewijania. Lenis wczytuje się tylko na pełnym poziomie.
    if (!SMOOTH_SCROLL || fxTier.value !== 'full') {
      resolveReady({ gsap, ScrollTrigger })
      return
    }

    const [{ default: LenisClass }] = await Promise.all([
      import('lenis'),
      import('lenis/dist/lenis.css'),
    ])

    const instance = new LenisClass({ anchors: true })

    // Integracja z dokumentacji Lenis: ScrollTrigger i Lenis pracują w jednej pętli GSAP
    instance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => instance.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    lenis = instance
    if (locks > 0) instance.stop()
    resolveReady({ gsap, ScrollTrigger })
  } catch {
    // Bez bibliotek ruchu strona działa dalej z natywnym scrollem
    resolveReady(null)
  } finally {
    starting = false
  }
}

/** Przewija stronę od razu, bez animacji (zmiana strony, przycisk „wstecz”). */
export function jumpTo(top: number) {
  if (lenis) {
    // Wysokość nowej strony mogła się zmienić, a Lenis przycina cel do znanej wysokości
    lenis.resize()
    lenis.scrollTo(top, { immediate: true, force: true })
  } else {
    window.scrollTo(0, top)
  }
}

let locks = 0

/** Blokuje przewijanie strony pod otwartym oknem modalnym. */
export function lockScroll() {
  locks += 1
  if (locks > 1) return
  if (lenis) lenis.stop()
  else document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  if (locks === 0) return
  locks -= 1
  if (locks > 0) return
  lenis?.start()
  document.documentElement.style.overflow = ''
}
