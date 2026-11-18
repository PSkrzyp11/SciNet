import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, type Ref } from 'vue'
import GradientCanvas from '../GradientCanvas.vue'
import { fxTier } from '@/motion/fxTier'
import type { FromWorker, ToWorker } from '../gradient-protocol'

// Poziom efektów ustawiany w teście (w jsdom nie ma WebGL, więc prawdziwy byłby „off”)
vi.mock('@/motion/fxTier', async () => {
  const { ref } = await import('vue')
  return { fxTier: ref('full') }
})

// Udawany worker: zapisuje wiadomości i pozwala odpowiedzieć tak, jak zrobiłby prawdziwy
class FakeWorker {
  static instances: FakeWorker[] = []
  sent: ToWorker[] = []
  transfers: Transferable[][] = []
  terminated = false
  private listeners: Record<string, ((event: { data?: FromWorker }) => void)[]> = {}

  constructor() {
    FakeWorker.instances.push(this)
  }

  postMessage(message: ToWorker, transfer: Transferable[] = []) {
    this.sent.push(message)
    this.transfers.push(transfer)
  }

  addEventListener(type: string, listener: (event: { data?: FromWorker }) => void) {
    ;(this.listeners[type] ??= []).push(listener)
  }

  terminate() {
    this.terminated = true
  }

  reply(data: FromWorker) {
    this.listeners.message?.forEach((listener) => listener({ data }))
  }

  types() {
    return this.sent.map((message) => message.type)
  }
}

let viewCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null

class FakeIntersectionObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    viewCallback = callback
  }
  observe() {}
  disconnect() {}
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

function stubMotionPreference(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
}

// Przeglądarka z OffscreenCanvas: canvas da się przekazać do workera
function stubOffscreenSupport() {
  vi.stubGlobal('Worker', FakeWorker)
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  Object.defineProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen', {
    configurable: true,
    value: () => ({ offscreen: true }),
  })
}

const setTier = (tier: 'full' | 'lite' | 'off') => ((fxTier as unknown as Ref<string>).value = tier)

describe('GradientCanvas', () => {
  beforeEach(() => {
    FakeWorker.instances = []
    viewCallback = null
    setTier('full')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen')
  })

  it('jest ozdobą ukrytą przed czytnikami ekranu', () => {
    const canvas = mount(GradientCanvas).find('canvas')

    expect(canvas.attributes('aria-hidden')).toBe('true')
  })

  it('bez OffscreenCanvas nie startuje, więc widać gradient CSS pod spodem', () => {
    stubMotionPreference(false)
    vi.stubGlobal('Worker', FakeWorker)

    const wrapper = mount(GradientCanvas)

    expect(FakeWorker.instances).toHaveLength(0)
    expect(wrapper.find('canvas').classes()).not.toContain('ready')
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it('na poziomie „off” (ograniczony ruch, brak WebGL) nie uruchamia workera', () => {
    stubOffscreenSupport()
    setTier('off')

    mount(GradientCanvas)

    expect(FakeWorker.instances).toHaveLength(0)
  })

  it('przekazuje canvas do workera i pokazuje go po pierwszej klatce', async () => {
    stubOffscreenSupport()
    stubMotionPreference(false)

    const wrapper = mount(GradientCanvas)
    const [worker] = FakeWorker.instances

    expect(worker?.sent[0]).toMatchObject({ type: 'init', canvas: { offscreen: true } })
    expect(worker?.transfers[0]).toEqual([{ offscreen: true }])
    expect(wrapper.find('canvas').classes()).not.toContain('ready')

    worker?.reply({ type: 'ready' })
    await nextTick()

    expect(wrapper.find('canvas').classes()).toContain('ready')
  })

  it('rysuje tylko wtedy, gdy hero jest na ekranie', () => {
    stubOffscreenSupport()
    stubMotionPreference(false)

    mount(GradientCanvas)
    const [worker] = FakeWorker.instances

    viewCallback?.([{ isIntersecting: true }])
    viewCallback?.([{ isIntersecting: false }])

    expect(worker?.types().slice(1)).toEqual(['play', 'pause'])
  })

  it('po błędzie w workerze wraca do gradientu CSS', async () => {
    stubOffscreenSupport()
    stubMotionPreference(false)

    const wrapper = mount(GradientCanvas)
    const [worker] = FakeWorker.instances
    worker?.reply({ type: 'ready' })
    worker?.reply({ type: 'failed' })
    await nextTick()

    expect(worker?.terminated).toBe(true)
    expect(wrapper.find('canvas').classes()).not.toContain('ready')
  })

  it('zamyka workera, gdy hero znika ze strony', () => {
    stubOffscreenSupport()
    stubMotionPreference(false)

    const wrapper = mount(GradientCanvas)
    wrapper.unmount()

    expect(FakeWorker.instances[0]?.terminated).toBe(true)
  })

  it('z myszą przekazuje workerowi pozycję kursora nad hero', async () => {
    stubOffscreenSupport()
    // Mysz: precyzyjny wskaźnik, ale bez ograniczenia ruchu
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('pointer: fine'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback),
    )
    const hero = document.createElement('header')
    document.body.append(hero)

    const wrapper = mount(GradientCanvas, { attachTo: hero })
    const event = new MouseEvent('pointermove', { clientX: 0, clientY: 0 })
    Object.defineProperty(event, 'pointerType', { value: 'mouse' })
    // Canvas nie łapie zdarzeń, więc komponent słucha swojego rodzica
    wrapper.element.parentElement?.dispatchEvent(event)
    frames.forEach((callback) => callback(0))

    expect(FakeWorker.instances[0]?.types()).toContain('pointer')
    wrapper.unmount()
    hero.remove()
  })

  it('na ekranie dotykowym nie śledzi kursora', () => {
    stubOffscreenSupport()
    stubMotionPreference(false)
    const hero = document.createElement('header')
    document.body.append(hero)

    const wrapper = mount(GradientCanvas, { attachTo: hero })
    const event = new MouseEvent('pointermove')
    Object.defineProperty(event, 'pointerType', { value: 'mouse' })
    wrapper.element.parentElement?.dispatchEvent(event)

    expect(FakeWorker.instances[0]?.types()).not.toContain('pointer')
    wrapper.unmount()
    hero.remove()
  })

  it('na poziomie lekkim prosi workera o tańszy render', () => {
    stubOffscreenSupport()
    stubMotionPreference(false)
    setTier('lite')

    mount(GradientCanvas)

    expect(FakeWorker.instances[0]?.sent[0]).toMatchObject({ type: 'init', lite: true })
  })

  it('po przejściu na poziom „off” zatrzymuje gradient', async () => {
    stubOffscreenSupport()
    stubMotionPreference(false)
    mount(GradientCanvas)

    setTier('off')
    await nextTick()

    expect(FakeWorker.instances[0]?.terminated).toBe(true)
  })
})
