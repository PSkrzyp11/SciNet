// Efekt na obrazach: jeden canvas i jeden worker dla całej strony. Przeglądarki
// ograniczają liczbę kontekstów WebGL, więc canvas przenosi się do obrazu pod kursorem.
import type { FromDistortion, ToDistortion } from './distortion-protocol'
import { pointerIn } from './interaction'

// Ostrość ważniejsza niż przy gradiencie, ale efekt działa tylko pod kursorem
const MAX_DPR = 2

let canvas: HTMLCanvasElement | null = null
let worker: Worker | null = null
let failed = false
let active: HTMLElement | null = null
// Każde najechanie ma numer, więc spóźniony obraz z poprzedniego nic nie zepsuje
let hoverId = 0
let pointerFrame = 0
let pendingPointer: { x: number; y: number } | null = null

const send = (message: ToDistortion, transfer: Transferable[] = []) =>
  worker?.postMessage(message, transfer)

function disable() {
  failed = true
  worker?.terminate()
  worker = null
  canvas?.remove()
  canvas = null
  active?.classList.remove('fx-on')
  active = null
}

function ensureWorker() {
  if (worker || failed) return Boolean(worker)
  canvas = document.createElement('canvas')
  canvas.className = 'distortion-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const offscreen = canvas.transferControlToOffscreen()

  worker = new Worker(new URL('./distortion.worker.ts', import.meta.url), { type: 'module' })
  worker.addEventListener('message', ({ data }: MessageEvent<FromDistortion>) => {
    if (data.type === 'ready') canvas?.classList.add('visible')
    else if (data.type === 'idle') canvas?.classList.remove('visible')
    // Bez WebGL zostaje powiększenie w CSS
    else disable()
  })
  worker.addEventListener('error', disable)
  send({ type: 'init', canvas: offscreen }, [offscreen])
  return true
}

/**
 * Włącza efekt na obrazie pod kursorem. Zwraca `false`, gdy efekt jest niedostępny,
 * i wtedy obraz używa zwykłego powiększenia w CSS.
 */
export async function activate(frame: HTMLElement, image: HTMLImageElement) {
  if (failed || !image.complete || !image.naturalWidth || !ensureWorker() || !canvas) return false

  const id = ++hoverId
  active?.classList.remove('fx-on')
  active = frame
  frame.classList.add('fx-on')
  canvas.classList.remove('visible')
  frame.append(canvas)

  try {
    const bitmap = await createImageBitmap(image)
    // Kursor zdążył zjechać albo przejść na inny obraz
    if (id !== hoverId || active !== frame) {
      bitmap.close()
      return true
    }
    const rect = frame.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    send(
      {
        type: 'show',
        bitmap,
        width: Math.max(1, Math.round(rect.width * ratio)),
        height: Math.max(1, Math.round(rect.height * ratio)),
      },
      [bitmap],
    )
    return true
  } catch {
    // Obraz bez zgody CORS albo błąd dekodowania: zostaje efekt CSS
    frame.classList.remove('fx-on')
    if (active === frame) active = null
    return false
  }
}

/** Przekazuje pozycję kursora nad aktywnym obrazem, najwyżej raz na klatkę. */
export function move(frame: HTMLElement, event: PointerEvent) {
  if (frame !== active) return
  pendingPointer = pointerIn(frame.getBoundingClientRect(), event.clientX, event.clientY)
  if (pointerFrame) return
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0
    if (pendingPointer) send({ type: 'pointer', ...pendingPointer })
    pendingPointer = null
  })
}

/** Kursor zjechał z obrazu: efekt płynnie wygasa. */
export function deactivate(frame: HTMLElement) {
  if (frame !== active) return
  hoverId += 1
  frame.classList.remove('fx-on')
  active = null
  send({ type: 'hide' })
}
