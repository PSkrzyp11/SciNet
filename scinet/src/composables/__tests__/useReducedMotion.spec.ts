import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useReducedMotion } from '../useReducedMotion'

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const query = {
    matches,
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    ),
    removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
    ),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => query),
  )
  const change = (value: boolean) =>
    listeners.forEach((listener) => listener({ matches: value } as MediaQueryListEvent))
  return { change, listeners }
}

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('odczytuje ustawienie systemu', () => {
    stubMatchMedia(true)
    const scope = effectScope()

    expect(scope.run(() => useReducedMotion())?.value).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    scope.stop()
  })

  it('reaguje na zmianę ustawienia przy otwartej stronie', () => {
    const { change } = stubMatchMedia(false)
    const scope = effectScope()
    const reduced = scope.run(() => useReducedMotion())!

    expect(reduced.value).toBe(false)
    change(true)
    expect(reduced.value).toBe(true)
    scope.stop()
  })

  it('przestaje nasłuchiwać, gdy komponent znika', () => {
    const { listeners } = stubMatchMedia(false)
    const scope = effectScope()
    scope.run(() => useReducedMotion())

    expect(listeners.size).toBe(1)
    scope.stop()
    expect(listeners.size).toBe(0)
  })

  it('bez matchMedia przyjmuje, że ruch jest dozwolony', () => {
    vi.stubGlobal('matchMedia', undefined)
    const scope = effectScope()

    expect(scope.run(() => useReducedMotion())?.value).toBe(false)
    scope.stop()
  })
})
