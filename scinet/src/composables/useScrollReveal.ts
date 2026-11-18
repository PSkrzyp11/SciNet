import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { whenMotionReady, type ScrollMotion } from '@/motion'
import { fxTier } from '@/motion/fxTier'

/**
 * Animacje sterowane scrollem (GSAP ScrollTrigger, w jednej pętli z Lenis).
 * `setup` dostaje bibliotekę, gdy ta się wczyta. Przy ograniczonym ruchu, bez bibliotek
 * i po odmontowaniu komponentu nic się nie dzieje. Wszystko, co `setup` utworzy,
 * znika przy odmontowaniu (gsap.context), a `setup` może zwrócić własne sprzątanie.
 */
export function useScrollReveal(
  scope: Ref<HTMLElement | null>,
  setup: (motion: ScrollMotion, root: HTMLElement) => void | (() => void),
) {
  let context: { revert: () => void } | null = null
  let unmounted = false
  let resizeObserver: ResizeObserver | null = null
  let refreshTimer: ReturnType<typeof setTimeout> | undefined

  // Ponowne uruchomienie, np. po zmianie listy kart na tablicy
  async function run() {
    const motion = await whenMotionReady()
    const root = scope.value
    if (!motion || !root || unmounted || fxTier.value === 'off') return

    context?.revert()
    context = motion.gsap.context(() => setup(motion, root), root)

    // Gdy sekcja zmieni wysokość (otwarty formularz, wczytany obrazek), pozycje startu
    // animacji liczą się od nowa
    if (!resizeObserver && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(refreshTimer)
        refreshTimer = setTimeout(() => motion.ScrollTrigger.refresh(), 150)
      })
      resizeObserver.observe(root)
    }
  }

  onMounted(run)

  onBeforeUnmount(() => {
    unmounted = true
    resizeObserver?.disconnect()
    clearTimeout(refreshTimer)
    context?.revert()
    context = null
  })

  return { refresh: run }
}

/** Czy element jest już (choć częściowo) widoczny w oknie. */
function inViewport(el: Element) {
  const rect = el.getBoundingClientRect()
  return rect.bottom > 0 && rect.top < window.innerHeight
}

/**
 * Elementy wchodzą grupami, gdy wjadą na ekran, z dołu albo z góry (przy przewijaniu w górę).
 * Te widoczne od razu zostają bez zmian: ukrycie ich po starcie dałoby mignięcie.
 * Zwraca sprzątanie, które `useScrollReveal` wywoła przy odmontowaniu.
 */
export function revealInBatches({ gsap, ScrollTrigger }: ScrollMotion, targets: Element[]) {
  const hidden = targets.filter((el) => !inViewport(el))
  if (!hidden.length) return undefined

  // Każdy element odsłania się tylko raz, żeby karty nie podskakiwały przy każdym przewinięciu
  const revealed = new WeakSet<Element>()
  // Na poziomie lekkim (telefon) wejścia są krótsze i z mniejszej odległości
  const lite = fxTier.value === 'lite'
  const duration = lite ? 0.5 : 0.8
  const distance = lite ? 24 : 40
  const show = (batch: Element[], fromY: number) => {
    const fresh = batch.filter((el) => !revealed.has(el))
    if (!fresh.length) return
    fresh.forEach((el) => revealed.add(el))
    gsap.fromTo(
      fresh,
      { y: fromY },
      { opacity: 1, y: 0, duration, ease: 'expo.out', stagger: 0.08, overwrite: true },
    )
  }

  // Ukrywamy samą przezroczystością, bez visibility: hidden. Niewidoczny element nadal
  // dostaje fokus z klawiatury, a przeglądarka sama przewija do niego ekran.
  gsap.set(hidden, { opacity: 0, y: distance })

  // Fokus z klawiatury pokazuje element od razu, zanim dogoni go przewijanie
  const onFocus = (event: Event) => {
    const el = hidden.find((item) => item.contains(event.target as Node))
    if (el) show([el], 0)
  }
  hidden.forEach((el) => el.addEventListener('focusin', onFocus))

  ScrollTrigger.batch(hidden, {
    start: 'top 92%',
    end: 'bottom 8%',
    onEnter: (batch) => show(batch, distance),
    // Przy przewijaniu w górę elementy, których jeszcze nie było widać, wjeżdżają z góry
    // (np. po powrocie przyciskiem „wstecz” do środka tablicy)
    onEnterBack: (batch) => show(batch, -distance),
  })

  return () => hidden.forEach((el) => el.removeEventListener('focusin', onFocus))
}
