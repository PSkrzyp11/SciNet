import { describe, expect, it, vi } from 'vitest'
import type { ScrollMotion } from '@/motion'
import { revealInBatches } from '../useScrollReveal'

// Udawany GSAP: zapisuje, co zostało ukryte i co pokazane, a batch oddaje wywołania testowi
function fakeMotion() {
  const set = vi.fn()
  const fromTo = vi.fn()
  let handlers: { onEnter?: (batch: Element[]) => void; onEnterBack?: (batch: Element[]) => void } =
    {}
  const batch = vi.fn((_targets: Element[], vars: typeof handlers) => {
    handlers = vars
    return []
  })
  const motion = { gsap: { set, fromTo }, ScrollTrigger: { batch } } as unknown as ScrollMotion
  return {
    motion,
    set,
    fromTo,
    batch,
    enter: (els: Element[]) => handlers.onEnter?.(els),
    enterBack: (els: Element[]) => handlers.onEnterBack?.(els),
  }
}

function element(top: number) {
  const el = document.createElement('div')
  el.getBoundingClientRect = () => ({ top, bottom: top + 200 }) as DOMRect
  return el
}

describe('revealInBatches', () => {
  it('ukrywa tylko elementy, których jeszcze nie widać', () => {
    const { motion, set } = fakeMotion()
    const visible = element(100)
    const below = element(window.innerHeight + 300)
    const above = element(-800)

    revealInBatches(motion, [visible, below, above])

    expect(set).toHaveBeenCalledWith([below, above], expect.objectContaining({ autoAlpha: 0 }))
  })

  it('gdy wszystko jest widoczne, niczego nie animuje', () => {
    const { motion, set, batch } = fakeMotion()

    revealInBatches(motion, [element(10), element(300)])

    expect(set).not.toHaveBeenCalled()
    expect(batch).not.toHaveBeenCalled()
  })

  it('każdy element odsłania się tylko raz, z dołu albo z góry', () => {
    const { motion, fromTo, enter, enterBack } = fakeMotion()
    const below = element(window.innerHeight + 300)
    const above = element(-800)
    revealInBatches(motion, [below, above])

    enter([below])
    enterBack([above])
    enter([below])
    enterBack([below, above])

    expect(fromTo).toHaveBeenCalledTimes(2)
    expect(fromTo.mock.calls[0]?.[1]).toEqual({ y: 40 })
    expect(fromTo.mock.calls[1]?.[1]).toEqual({ y: -40 })
    expect(fromTo.mock.calls[0]?.[2]).toEqual(expect.objectContaining({ autoAlpha: 1, y: 0 }))
  })
})
