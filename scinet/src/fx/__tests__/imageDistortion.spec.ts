import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FromDistortion, ToDistortion } from '../distortion-protocol'

class FakeWorker {
  static instances: FakeWorker[] = []
  sent: ToDistortion[] = []
  transfers: Transferable[][] = []
  terminated = false
  private listeners: Record<string, ((event: { data?: FromDistortion }) => void)[]> = {}

  constructor() {
    FakeWorker.instances.push(this)
  }
  postMessage(message: ToDistortion, transfer: Transferable[] = []) {
    this.sent.push(message)
    this.transfers.push(transfer)
  }
  addEventListener(type: string, listener: (event: { data?: FromDistortion }) => void) {
    ;(this.listeners[type] ??= []).push(listener)
  }
  terminate() {
    this.terminated = true
  }
  reply(data: FromDistortion) {
    this.listeners.message?.forEach((listener) => listener({ data }))
  }
}

const bitmap = { width: 960, height: 540, close: vi.fn() }

// Moduł trzyma stan (jeden canvas i worker na stronę), więc każdy test wczytuje go od nowa
async function load() {
  vi.resetModules()
  return import('../imageDistortion')
}

function loadedImage() {
  const image = document.createElement('img')
  Object.defineProperty(image, 'complete', { value: true })
  Object.defineProperty(image, 'naturalWidth', { value: 960 })
  return image
}

function frameWithImage() {
  const frame = document.createElement('div')
  frame.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 225 }) as DOMRect
  const image = loadedImage()
  frame.append(image)
  return { frame, image }
}

describe('imageDistortion', () => {
  beforeEach(() => {
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => bitmap),
    )
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    Object.defineProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen', {
      configurable: true,
      value: () => ({ offscreen: true }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(HTMLCanvasElement.prototype, 'transferControlToOffscreen')
  })

  it('przenosi wspólny canvas na obraz pod kursorem i wysyła mu obraz', async () => {
    const { activate } = await load()
    const { frame, image } = frameWithImage()

    expect(await activate(frame, image)).toBe(true)

    const [worker] = FakeWorker.instances
    expect(FakeWorker.instances).toHaveLength(1)
    expect(frame.classList.contains('fx-on')).toBe(true)
    expect(frame.querySelector('canvas.distortion-canvas')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    expect(worker?.sent.map((m) => m.type)).toEqual(['init', 'show'])
    expect(worker?.transfers[1]).toEqual([bitmap])
  })

  it('jeden worker obsługuje kolejne obrazy', async () => {
    const { activate, deactivate } = await load()
    const first = frameWithImage()
    const second = frameWithImage()

    await activate(first.frame, first.image)
    deactivate(first.frame)
    await activate(second.frame, second.image)

    expect(FakeWorker.instances).toHaveLength(1)
    expect(second.frame.querySelector('canvas')).not.toBeNull()
    expect(first.frame.querySelector('canvas')).toBeNull()
    expect(FakeWorker.instances[0]?.sent.map((m) => m.type)).toEqual([
      'init',
      'show',
      'hide',
      'show',
    ])
  })

  it('pokazuje canvas po pierwszej klatce i chowa go, gdy efekt wygaśnie', async () => {
    const { activate, deactivate } = await load()
    const { frame, image } = frameWithImage()
    await activate(frame, image)
    const [worker] = FakeWorker.instances
    const canvas = () => frame.querySelector('canvas')!

    worker?.reply({ type: 'ready' })
    expect(canvas().classList.contains('visible')).toBe(true)

    deactivate(frame)
    expect(frame.classList.contains('fx-on')).toBe(false)
    worker?.reply({ type: 'idle' })
    expect(canvas().classList.contains('visible')).toBe(false)
  })

  it('przekazuje pozycję kursora tylko dla aktywnego obrazu', async () => {
    const { activate, move } = await load()
    const { frame, image } = frameWithImage()
    const other = frameWithImage()
    await activate(frame, image)

    move(other.frame, new MouseEvent('pointermove', { clientX: 10, clientY: 10 }) as PointerEvent)
    move(frame, new MouseEvent('pointermove', { clientX: 100, clientY: 225 }) as PointerEvent)

    const pointers = FakeWorker.instances[0]?.sent.filter((m) => m.type === 'pointer')
    expect(pointers).toEqual([{ type: 'pointer', x: 0.25, y: 0 }])
  })

  it('po błędzie WebGL wyłącza się na stałe i zostawia efekt CSS', async () => {
    const { activate } = await load()
    const { frame, image } = frameWithImage()
    await activate(frame, image)
    const [worker] = FakeWorker.instances

    worker?.reply({ type: 'failed' })

    expect(worker?.terminated).toBe(true)
    expect(frame.querySelector('canvas')).toBeNull()
    expect(frame.classList.contains('fx-on')).toBe(false)
    expect(await activate(frame, image)).toBe(false)
  })

  it('nie startuje na niewczytanym obrazie', async () => {
    const { activate } = await load()
    const frame = document.createElement('div')

    expect(await activate(frame, document.createElement('img'))).toBe(false)
    expect(FakeWorker.instances).toHaveLength(0)
  })
})
