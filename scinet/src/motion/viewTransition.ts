// Przejścia między stronami przez View Transitions API. Gdy przeglądarka go nie ma
// albo użytkownik ogranicza ruch, App.vue używa zwykłego <Transition>.
import { ref } from 'vue'
import type { RouteLocationNormalized, Router } from 'vue-router'

/** Czy przejścia stron idą przez View Transitions (zamiast <Transition>). */
export const viewTransitionsEnabled = ref(false)

/**
 * Artykuł, którego karta płynnie zamienia się w nagłówek strony artykułu (i z powrotem).
 * Tylko ta jedna karta dostaje `view-transition-name`, bo nazwa musi być unikalna.
 */
export const sharedArticleId = ref<number | null>(null)

// Gdyby router nie zgłosił przewinięcia, przejście i tak ruszy po tym czasie
const SCROLL_TIMEOUT = 400

let scrolled: (() => void) | null = null
let active: ViewTransition | null = null

/** Router zgłasza, że nowa strona jest już przewinięta, więc można zrobić jej zrzut. */
export function notifyScrolled() {
  scrolled?.()
  scrolled = null
}

type Transition = 'article' | 'page'

const articleId = (route: Pick<RouteLocationNormalized, 'name' | 'params'>) =>
  route.name === 'article' ? Number(route.params.id) : null

/**
 * Rodzaj przejścia: „article”, gdy karta przechodzi w artykuł albo artykuł wraca do listy
 * kart, w pozostałych przypadkach „page” (kurtyna). Zapamiętuje też wspólny artykuł.
 */
export function transitionFor(
  to: Pick<RouteLocationNormalized, 'name' | 'params'>,
  from: Pick<RouteLocationNormalized, 'name' | 'params'>,
): Transition {
  const lists = ['home', 'favorites']
  const toArticle = articleId(to)
  const fromArticle = articleId(from)

  if (toArticle !== null && lists.includes(String(from.name))) {
    sharedArticleId.value = toArticle
    return 'article'
  }
  if (fromArticle !== null && lists.includes(String(to.name))) {
    sharedArticleId.value = fromArticle
    return 'article'
  }
  sharedArticleId.value = null
  return 'page'
}

/**
 * W trakcie przejścia przeglądarka kieruje kliknięcia do <html>, więc link pod kursorem
 * by nie zareagował. Kończymy wtedy przejście od razu i przekazujemy kliknięcie elementowi,
 * który naprawdę jest w tym miejscu.
 */
function clickThrough(event: MouseEvent) {
  if (!active || event.target !== document.documentElement) return
  event.preventDefault()
  event.stopPropagation()
  const { clientX, clientY } = event
  const transition = active
  transition.skipTransition()
  void transition.finished
    .catch(() => undefined)
    .then(() => {
      const target = document.elementFromPoint(clientX, clientY)
      if (target instanceof HTMLElement && target !== document.documentElement) target.click()
    })
}

function supported() {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
}

/** Podpina przejścia pod router. Zwraca funkcję, która je odpina (przydatne w testach). */
export function installViewTransitions(router: Router) {
  if (typeof window === 'undefined') return () => {}

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const update = () => {
    viewTransitionsEnabled.value = supported() && !reduced?.matches
  }
  update()
  reduced?.addEventListener?.('change', update)
  document.addEventListener('click', clickThrough, true)

  const removeGuard = router.beforeResolve((to, from) => {
    // Pierwsze wejście na stronę i zmiana samych filtrów w adresie nie mają przejścia
    if (!viewTransitionsEnabled.value || !from.matched.length || to.path === from.path) return

    const root = document.documentElement
    root.dataset.transition = transitionFor(to, from)

    return new Promise<void>((resolveNavigation) => {
      const transition = document.startViewTransition(async () => {
        // Zrzut nowej strony powstaje dopiero po jej wyrenderowaniu i przewinięciu
        const ready = new Promise<void>((resolve) => {
          scrolled = resolve
          setTimeout(resolve, SCROLL_TIMEOUT)
        })
        resolveNavigation()
        await ready
      })
      active = transition
      void transition.finished
        .catch(() => undefined)
        .finally(() => {
          if (active === transition) {
            active = null
            delete root.dataset.transition
          }
        })
    })
  })

  return () => {
    removeGuard()
    reduced?.removeEventListener?.('change', update)
    document.removeEventListener('click', clickThrough, true)
  }
}
