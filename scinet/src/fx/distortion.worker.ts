// Worker efektu na obrazach. Rysuje tylko wtedy, gdy kursor jest nad obrazem
// albo efekt jeszcze wygasa. Jeden kontekst WebGL obsługuje wszystkie obrazy.
import type { FromDistortion, ToDistortion } from './distortion-protocol'
import fragment from './shaders/distortion.frag?raw'
import { createFullscreenProgram, type FullscreenProgram } from './webgl'

// Wygładzanie siły efektu i ruchu kursora w każdej klatce (0–1)
const STRENGTH_EASE = 0.08
const POINTER_EASE = 0.15
// Poniżej tej siły efekt jest niewidoczny i render się zatrzymuje
const IDLE_STRENGTH = 0.002

let canvas: OffscreenCanvas | null = null
let gl: WebGLRenderingContext | null = null
let program: FullscreenProgram | null = null
let texture: WebGLTexture | null = null
const uniforms: Record<string, WebGLUniformLocation | null> = {}

let failed = false
let hovering = false
let strength = 0
let time = 0
let last = 0
let frame = 0
let firstFrame = false
const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 }

const post = (message: FromDistortion) => self.postMessage(message)

const nextFrame = (callback: (now: number) => void) =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(callback)
    : setTimeout(() => callback(performance.now()), 16)

function fail() {
  failed = true
  frame = 0
  post({ type: 'failed' })
}

function render(now: number) {
  frame = 0
  if (!gl || !program || failed) return
  const delta = last ? Math.min(now - last, 100) : 16
  last = now
  time += delta / 1000

  strength += ((hovering ? 1 : 0) - strength) * STRENGTH_EASE
  pointer.x += (pointer.targetX - pointer.x) * POINTER_EASE
  pointer.y += (pointer.targetY - pointer.y) * POINTER_EASE

  gl.uniform1f(uniforms.time ?? null, time)
  gl.uniform1f(uniforms.strength ?? null, strength)
  gl.uniform2f(uniforms.pointer ?? null, pointer.x, pointer.y)
  program.draw()

  if (firstFrame) {
    firstFrame = false
    post({ type: 'ready' })
  }

  if (!hovering && strength < IDLE_STRENGTH) {
    strength = 0
    last = 0
    post({ type: 'idle' })
    return
  }
  frame = nextFrame(render)
}

function schedule() {
  if (!frame && !failed && program) frame = nextFrame(render)
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
  if (!gl || !program) return fail()

  for (const [key, name] of Object.entries({
    resolution: 'uResolution',
    image: 'uImage',
    pointer: 'uPointer',
    time: 'uTime',
    strength: 'uStrength',
    texture: 'uTexture',
  })) {
    uniforms[key] = program.uniform(name)
  }

  // Tekstura o dowolnych wymiarach: WebGL 1 wymaga wtedy przycinania krawędzi i braku mipmap
  texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.uniform1i(uniforms.texture ?? null, 0)
}

let ready: Promise<void> | null = null

async function show(message: Extract<ToDistortion, { type: 'show' }>) {
  await ready
  const { bitmap } = message
  if (!gl || !program || !canvas || failed) return bitmap.close()

  canvas.width = message.width
  canvas.height = message.height
  gl.viewport(0, 0, message.width, message.height)
  gl.uniform2f(uniforms.resolution ?? null, message.width, message.height)
  gl.uniform2f(uniforms.image ?? null, bitmap.width, bitmap.height)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bitmap)
  bitmap.close()

  // Nowy obraz startuje bez efektu i płynnie go nabiera
  strength = 0
  firstFrame = true
  schedule()
}

self.addEventListener('message', (event: MessageEvent<ToDistortion>) => {
  const message = event.data
  switch (message.type) {
    case 'init':
      ready = init(message.canvas)
      break
    case 'show':
      // Stan najechania zmienia się od razu, bo „hide” może przyjść przed wgraniem tekstury
      hovering = true
      void show(message)
      break
    case 'pointer':
      pointer.targetX = message.x
      pointer.targetY = message.y
      // Pierwsza pozycja nad nowym obrazem ustawia się od razu
      if (strength < 0.01) {
        pointer.x = message.x
        pointer.y = message.y
      }
      break
    case 'hide':
      hovering = false
      schedule()
      break
  }
})
