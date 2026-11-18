// Efekty, które zmieniają układ strony (grubość liter, liczby w tekście), czekają
// z animacją na koniec przewijania. Dzięki temu scroll nie przelicza układu.

/** Ile milisekund bez przewijania oznacza, że strona się zatrzymała */
export const SCROLL_IDLE_MS = 200

let lastScroll = 0
let listening = false

function listen() {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener('scroll', () => (lastScroll = performance.now()), { passive: true })
}

// Nasłuch rusza od razu przy wczytaniu modułu. Gdyby startował przy pierwszym użyciu
// (np. gdy stopka wjedzie na ekran w trakcie przewijania), nie znałby trwającego scrolla.
listen()

/** Czy strona przewijała się w ostatniej chwili. */
export function scrolledRecently() {
  listen()
  return performance.now() - lastScroll < SCROLL_IDLE_MS
}

/** Uruchamia `run`, gdy przewijanie ucichnie. Zwraca funkcję, która to anuluje. */
export function afterScrollIdle(run: () => void) {
  listen()
  let timer: ReturnType<typeof setTimeout> | undefined
  const check = () => {
    const wait = SCROLL_IDLE_MS - (performance.now() - lastScroll)
    if (wait > 0) timer = setTimeout(check, wait)
    else run()
  }
  check()
  return () => clearTimeout(timer)
}
