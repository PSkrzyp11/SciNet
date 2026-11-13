import type Lenis from 'lenis'

// Jedna flaga wyłącza płynny scroll: zostaje wtedy natywne przewijanie przeglądarki
const SMOOTH_SCROLL = true

let lenis: Lenis | null = null
let starting = false

export const getLenis = () => lenis

/**
 * Uruchamia płynny scroll i wspólną pętlę animacji.
 * Biblioteki ładują się osobno, po wyświetleniu strony, więc nie opóźniają startu.
 * Na ekranach dotykowych Lenis zostawia natywny scroll, a przy `prefers-reduced-motion`
 * sam wyłącza wygładzanie.
 */
export async function initMotion() {
  if (!SMOOTH_SCROLL || lenis || starting || typeof window === 'undefined') return
  starting = true

  try {
    const [{ default: LenisClass }, { gsap }, { ScrollTrigger }] = await Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('lenis/dist/lenis.css'),
    ])

    gsap.registerPlugin(ScrollTrigger)

    const instance = new LenisClass({ anchors: true })

    // Integracja z dokumentacji Lenis: ScrollTrigger i Lenis pracują w jednej pętli GSAP
    instance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => instance.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    lenis = instance
    if (locks > 0) instance.stop()
  } catch {
    // Bez bibliotek ruchu strona działa dalej z natywnym scrollem
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
