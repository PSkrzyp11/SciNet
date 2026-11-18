import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  hasFinePointer,
  isCorsFriendly,
  pointerIn,
  scrollStrength,
  trackPointer,
  trackScrollVelocity,
} from '../interaction'

function stubPointer(fine: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: query.includes('pointer: fine') ? fine : false })),
  )
}

// Klatki animacji czekają w kolejce, a test sam decyduje, kiedy je wykonać
let frames: FrameRequestCallback[] = []
let clock = 0

function runFramesNow() {
  frames = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
}

function flushFrames() {
  clock += 16
  const pending = frames
  frames = []
  pending.forEach((callback) => callback(clock))
}

function pointerEvent(
  type: string,
  init: { clientX?: number; clientY?: number; pointerType: string },
) {
  const event = new MouseEvent(type, { clientX: init.clientX, clientY: init.clientY })
  Object.defineProperty(event, 'pointerType', { value: init.pointerType })
  return event
}

describe('interaction', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('liczy pozycję kursora w układzie shadera, z osią y w górę', () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 } as DOMRect

    expect(pointerIn(rect, 100, 150)).toEqual({ x: 0, y: 0 })
    expect(pointerIn(rect, 300, 50)).toEqual({ x: 1, y: 1 })
    expect(pointerIn(rect, 200, 100)).toEqual({ x: 0.5, y: 0.5 })
  })

  it('siła efektu rośnie z prędkością scrolla i nie przekracza 1', () => {
    expect(scrollStrength(0, 16)).toBe(0)
    expect(scrollStrength(32, 16)).toBe(0.5)
    expect(scrollStrength(-32, 16)).toBe(0.5)
    expect(scrollStrength(5000, 16)).toBe(1)
    // Zerowy czas nie dzieli przez zero
    expect(scrollStrength(2, 0)).toBe(0.5)
  })

  it('efekty kursora działają tylko z myszą lub gładzikiem', () => {
    stubPointer(true)
    expect(hasFinePointer()).toBe(true)

    stubPointer(false)
    expect(hasFinePointer()).toBe(false)
  })

  it('do WebGL trafiają tylko obrazy z tego serwisu i z Wikimedia', () => {
    expect(isCorsFriendly('https://thumb.wikimedia.org/obraz.jpg')).toBe(true)
    expect(isCorsFriendly('https://upload.wikimedia.org/obraz.jpg')).toBe(true)
    expect(isCorsFriendly('/obraz.jpg')).toBe(true)
    expect(isCorsFriendly('https://example.com/obraz.jpg')).toBe(false)
    expect(isCorsFriendly('https://wikimedia.org.example.com/obraz.jpg')).toBe(false)
    expect(isCorsFriendly('http://[zły adres')).toBe(false)
  })

  it('śledzi tylko mysz i zgłasza wyjście kursora', () => {
    runFramesNow()
    const target = document.createElement('div')
    target.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect
    const send = vi.fn()

    const stop = trackPointer(target, send)
    target.dispatchEvent(
      pointerEvent('pointermove', { clientX: 25, clientY: 25, pointerType: 'touch' }),
    )
    expect(send).not.toHaveBeenCalled()

    target.dispatchEvent(
      pointerEvent('pointermove', { clientX: 25, clientY: 25, pointerType: 'mouse' }),
    )
    flushFrames()
    expect(send).toHaveBeenLastCalledWith({ x: 0.25, y: 0.75, active: true })

    // Kilka ruchów w jednej klatce daje jedną wiadomość z ostatnią pozycją
    target.dispatchEvent(
      pointerEvent('pointermove', { clientX: 10, clientY: 10, pointerType: 'mouse' }),
    )
    target.dispatchEvent(
      pointerEvent('pointermove', { clientX: 50, clientY: 50, pointerType: 'mouse' }),
    )
    flushFrames()
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenLastCalledWith({ x: 0.5, y: 0.5, active: true })

    target.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'mouse' }))
    flushFrames()
    expect(send).toHaveBeenLastCalledWith({ x: 0.5, y: 0.5, active: false })

    stop()
    target.dispatchEvent(
      pointerEvent('pointermove', { clientX: 50, clientY: 50, pointerType: 'mouse' }),
    )
    flushFrames()
    expect(send).toHaveBeenCalledTimes(3)
  })

  it('zgłasza prędkość tylko wtedy, gdy strona się przesunęła', () => {
    runFramesNow()
    const send = vi.fn()
    const stop = trackScrollVelocity(send)

    window.dispatchEvent(new Event('scroll'))
    flushFrames()
    expect(send).not.toHaveBeenCalled()

    window.scrollY = 400
    window.dispatchEvent(new Event('scroll'))
    flushFrames()
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0]?.[0]).toBeGreaterThan(0)

    stop()
    window.scrollY = 0
  })
})
