// Worker rysujący gradient hero. Kontekst WebGL, kompilacja shadera i każda klatka
// działają tutaj, więc wątek główny strony zostaje wolny dla przewijania i kliknięć.
import type { FromWorker, GradientColors, GradientSize, ToWorker } from './gradient-protocol'
import fragment from './shaders/gradient.frag?raw'
import { createFullscreenProgram, type FullscreenProgram } from './webgl'

const SCALE = 0.6
const LOW_SCALE = 0.35
// Po tylu klatkach sprawdzamy, czy urządzenie nadąża
const SAMPLE_FRAMES = 90
const SLOW_FRAME_MS = 24
// Co ile klatek wysyłamy licznik do strony
const REPORT_EVERY = 30
// Wygładzanie ruchu kursora i prędkości scrolla w każdej klatce (0–1)
const POINTER_EASE = 0.08
const STRENGTH_EASE = 0.05
const VELOCITY_EASE = 0.12
// Bez nowych zdarzeń scrolla prędkość wygasa
const VELOCITY_DECAY = 0.92
// Tyle razy szybciej płynie czas gradientu przy najszybszym scrollu
const VELOCITY_TIME_BOOST = 3

let canvas: OffscreenCanvas | null = null
let gl: WebGLRenderingContext | null = null
let program: FullscreenProgram | null = null
const uniforms: Record<string, WebGLUniformLocation | null> = {}

let size: GradientSize = { width: 1, height: 1 }
let colors: GradientColors | null = null
let scale = SCALE
let playing = false
let failed = false
// Poziom lekki rysuje co drugą klatkę (30 kl./s), co wystarcza dla wolnego gradientu
let lite = false
let skipFrame = false

let frame = 0
let last = 0
let elapsed = 0
let frames = 0
let sampleFrames = 0
let sampleTime = 0

// Stan interakcji: wartości docelowe z wiadomości i wartości wygładzone
const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 }
let strength = 0
let pointerActive = false
let velocity = 0
let velocityTarget = 0

const post = (message: FromWorker) => self.postMessage(message)

// requestAnimationFrame w workerze mają Chrome, Firefox i Safari 16.4+
const nextFrame = (callback: (now: number) => void) =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(callback)
    : setTimeout(() => callback(performance.now()), 16)
const cancelFrame = (id: number) =>
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id)

function applyColors() {
  if (!gl || !program || !colors) return
  for (const name of ['base', 'color1', 'color2', 'color3'] as const) {
    const rgb = colors[name]
    if (rgb) gl.uniform3f(uniforms[name] ?? null, ...rgb)
  }
  gl.uniform1f(uniforms.grain ?? null, colors.grain)
}

function applySize() {
  if (!gl || !program || !canvas) return
  const width = Math.max(1, Math.round(size.width * scale))
  const height = Math.max(1, Math.round(size.height * scale))
  if (canvas.width === width && canvas.height === height) return
  canvas.width = width
  canvas.height = height
  gl.viewport(0, 0, width, height)
  gl.uniform2f(uniforms.resolution ?? null, width, height)
}

function fail() {
  failed = true
  pause()
  post({ type: 'failed' })
}

function render(now: number) {
  frame = 0
  if (!gl || !program) return
  if (lite) {
    skipFrame = !skipFrame
    if (skipFrame) return schedule()
  }
  const delta = last ? Math.min(now - last, 100) : 16
  last = now
  frames += 1

  // Wygładzanie: gradient dąży do kursora zamiast skakać za nim
  pointer.x += (pointer.targetX - pointer.x) * POINTER_EASE
  pointer.y += (pointer.targetY - pointer.y) * POINTER_EASE
  strength += ((pointerActive ? 1 : 0) - strength) * STRENGTH_EASE
  velocity += (velocityTarget - velocity) * VELOCITY_EASE
  velocityTarget *= VELOCITY_DECAY

  // Przy szybkim scrollu czas płynie szybciej, ale bez skoku
  elapsed += delta * (1 + velocity * VELOCITY_TIME_BOOST)

  gl.uniform1f(uniforms.time ?? null, elapsed / 1000)
  gl.uniform2f(uniforms.pointer ?? null, pointer.x, pointer.y)
  gl.uniform1f(uniforms.pointerStrength ?? null, strength)
  gl.uniform1f(uniforms.velocity ?? null, velocity)
  program.draw()
  if (frames === 1) post({ type: 'ready' })
  if (frames % REPORT_EVERY === 0) post({ type: 'frames', frames })

  // Plan B dla słabych urządzeń: najpierw niższa rozdzielczość, potem sam gradient CSS
  if (sampleFrames < SAMPLE_FRAMES) {
    sampleFrames += 1
    sampleTime += delta
    if (sampleFrames === SAMPLE_FRAMES && sampleTime / SAMPLE_FRAMES > SLOW_FRAME_MS) {
      if (scale > LOW_SCALE) {
        scale = LOW_SCALE
        sampleFrames = 0
        sampleTime = 0
        applySize()
      } else {
        fail()
        return
      }
    }
  }
  schedule()
}

function schedule() {
  if (frame || !playing || failed || !program) return
  frame = nextFrame(render)
}

function pause() {
  if (frame) cancelFrame(frame)
  frame = 0
  // Po przerwie czas rusza od nowa, żeby gradient nie przeskoczył
  last = 0
  // Strona dostaje dokładny stan licznika w chwili zatrzymania
  if (frames) post({ type: 'frames', frames })
}

async function init(target: OffscreenCanvas) {
  canvas = target
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    fail()
  })

  gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    powerPreference: 'low-power',
  }) as WebGLRenderingContext | null
  program = gl && (await createFullscreenProgram(gl, fragment))
  if (!program) return fail()

  for (const [key, name] of Object.entries({
    resolution: 'uResolution',
    time: 'uTime',
    grain: 'uGrain',
    base: 'uBase',
    color1: 'uColor1',
    color2: 'uColor2',
    color3: 'uColor3',
    pointer: 'uPointer',
    pointerStrength: 'uPointerStrength',
    velocity: 'uVelocity',
  })) {
    uniforms[key] = program.uniform(name)
  }
  applyColors()
  applySize()
  schedule()
}

self.addEventListener('message', (event: MessageEvent<ToWorker>) => {
  const message = event.data
  switch (message.type) {
    case 'init':
      size = { width: message.width, height: message.height }
      colors = message.colors
      lite = message.lite
      if (lite) scale = LOW_SCALE
      void init(message.canvas)
      break
    case 'resize':
      size = { width: message.width, height: message.height }
      applySize()
      break
    case 'colors':
      colors = message.colors
      applyColors()
      break
    case 'play':
      playing = true
      schedule()
      break
    case 'pause':
      playing = false
      pause()
      break
    case 'pointer':
      // Pierwsze wejście kursora ustawia pozycję od razu, żeby plama nie płynęła przez cały ekran
      if (!pointerActive && strength < 0.01) {
        pointer.x = message.x
        pointer.y = message.y
      }
      pointer.targetX = message.x
      pointer.targetY = message.y
      pointerActive = message.active
      break
    case 'velocity':
      velocityTarget = Math.max(velocityTarget, message.value)
      break
  }
})
