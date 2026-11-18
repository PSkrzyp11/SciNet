import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GradientCanvas from '../GradientCanvas.vue'
import type { FromWorker, ToWorker } from '../gradient-protocol'

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

describe('GradientCanvas', () => {
  beforeEach(() => {
    FakeWorker.instances = []
    viewCallback = null
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

  it('przy ograniczonym ruchu nie uruchamia workera', () => {
    stubOffscreenSupport()
    stubMotionPreference(true)

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
})
