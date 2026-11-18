import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const route = (name: string, id?: string) => ({
  name,
  params: (id ? { id } : {}) as Record<string, string>,
})

let uninstall: (() => void) | undefined

// Moduł trzyma stan (aktywne przejście, wspólny artykuł), więc każdy test wczytuje go od nowa
async function load() {
  vi.resetModules()
  return import('../viewTransition')
}

function stubMotion(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
}

// Udawane View Transitions: od razu wywołuje funkcję podmiany strony, jak przeglądarka
function stubViewTransitions() {
  const transitions: { skipTransition: ReturnType<typeof vi.fn>; finish: () => void }[] = []
  const start = vi.fn((update: () => Promise<void>) => {
    let finish = () => {}
    const finished = new Promise<void>((resolve) => (finish = resolve))
    const transition = { finished, ready: Promise.resolve(), skipTransition: vi.fn(() => finish()) }
    transitions.push({ skipTransition: transition.skipTransition, finish })
    void update()
    return transition
  })
  Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start })
  return { start, transitions }
}

async function makeRouter() {
  const page = { template: '<div />' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: page },
      { path: '/artykuly/:id', name: 'article', component: page },
      { path: '/kontakt', name: 'contact', component: page },
    ],
  })
  await router.push('/')
  await router.isReady()
  return router
}

describe('viewTransition', () => {
  beforeEach(() => {
    stubMotion(false)
  })

  afterEach(() => {
    uninstall?.()
    uninstall = undefined
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'startViewTransition')
    delete document.documentElement.dataset.transition
  })

  it('karta przechodzi w artykuł i z powrotem, a inne strony mają kurtynę', async () => {
    const { transitionFor, sharedArticleId } = await load()

    expect(transitionFor(route('article', '7'), route('home'))).toBe('article')
    expect(sharedArticleId.value).toBe(7)

    expect(transitionFor(route('home'), route('article', '7'))).toBe('article')
    expect(sharedArticleId.value).toBe(7)

    expect(transitionFor(route('article', '3'), route('favorites'))).toBe('article')
    expect(transitionFor(route('contact'), route('home'))).toBe('page')
    expect(sharedArticleId.value).toBeNull()
    expect(transitionFor(route('contact'), route('article', '3'))).toBe('page')
  })

  it('nawigacja idzie przez View Transitions i czeka na przewinięcie nowej strony', async () => {
    const { start } = stubViewTransitions()
    const { installViewTransitions, viewTransitionsEnabled, notifyScrolled } = await load()
    const router = await makeRouter()
    uninstall = installViewTransitions(router)
    expect(viewTransitionsEnabled.value).toBe(true)

    const navigation = router.push('/artykuly/3')
    await flushPromises()
    expect(start).toHaveBeenCalledTimes(1)
    expect(document.documentElement.dataset.transition).toBe('article')

    notifyScrolled()
    await navigation
    expect(router.currentRoute.value.path).toBe('/artykuly/3')
  })

  it('zmiana samych filtrów w adresie nie ma przejścia', async () => {
    const { start } = stubViewTransitions()
    const { installViewTransitions } = await load()
    const router = await makeRouter()
    uninstall = installViewTransitions(router)

    await router.push('/?kategoria=Fizyka')

    expect(start).not.toHaveBeenCalled()
  })

  it('przy ograniczonym ruchu strona zmienia się od razu, bez przejścia', async () => {
    stubMotion(true)
    const { start } = stubViewTransitions()
    const { installViewTransitions, viewTransitionsEnabled } = await load()
    const router = await makeRouter()
    uninstall = installViewTransitions(router)

    await router.push('/kontakt')

    expect(viewTransitionsEnabled.value).toBe(false)
    expect(start).not.toHaveBeenCalled()
  })

  it('bez View Transitions API zostaje zwykłe przejście', async () => {
    const { installViewTransitions, viewTransitionsEnabled } = await load()
    uninstall = installViewTransitions(await makeRouter())

    expect(viewTransitionsEnabled.value).toBe(false)
  })

  it('kliknięcie w trakcie przejścia kończy je i trafia w element pod kursorem', async () => {
    const { transitions } = stubViewTransitions()
    const { installViewTransitions } = await load()
    const router = await makeRouter()
    uninstall = installViewTransitions(router)
    void router.push('/kontakt')
    await flushPromises()

    const link = document.createElement('a')
    const clicked = vi.fn()
    link.addEventListener('click', clicked)
    document.elementFromPoint = vi.fn(() => link)

    document.documentElement.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }),
    )
    await flushPromises()

    expect(transitions[0]?.skipTransition).toHaveBeenCalled()
    expect(clicked).toHaveBeenCalledTimes(1)
  })
})
