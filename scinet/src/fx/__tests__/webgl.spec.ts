import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFullscreenProgram, hexToRgb } from '../webgl'

const COMPLETION_STATUS_KHR = 0x91b1
const LINK_STATUS = 0x8b82

// Udawany kontekst WebGL: tyle, ile potrzeba do zbudowania programu
function fakeGl({ parallel = true, linkOk = true, readyAfter = 0 } = {}) {
  let polls = 0
  const gl = {
    LINK_STATUS,
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    ARRAY_BUFFER: 3,
    STATIC_DRAW: 4,
    TRIANGLES: 5,
    FLOAT: 6,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    isContextLost: vi.fn(() => false),
    getExtension: vi.fn(() => (parallel ? { COMPLETION_STATUS_KHR } : null)),
    getProgramParameter: vi.fn((_program: unknown, name: number) => {
      if (name === COMPLETION_STATUS_KHR) return polls++ >= readyAfter
      return linkOk
    }),
    createBuffer: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    useProgram: vi.fn(),
    getUniformLocation: vi.fn(),
    drawArrays: vi.fn(),
  }
  return gl
}

const asGl = (gl: ReturnType<typeof fakeGl>) => gl as unknown as WebGLRenderingContext

describe('createFullscreenProgram', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('nie pyta o wynik linkowania, dopóki kompilacja w tle trwa', async () => {
    vi.useFakeTimers()
    const gl = fakeGl({ readyAfter: 3 })
    const linkChecks = () =>
      gl.getProgramParameter.mock.calls.filter(([, name]) => name === LINK_STATUS).length

    const pending = createFullscreenProgram(asGl(gl), 'void main() {}')
    await vi.advanceTimersByTimeAsync(16 * 2)
    expect(linkChecks()).toBe(0)

    await vi.advanceTimersByTimeAsync(16 * 2)
    const program = await pending

    expect(linkChecks()).toBe(1)
    expect(program).not.toBeNull()
    program?.draw()
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3)
  })

  it('bez rozszerzenia sprawdza linkowanie od razu', async () => {
    const gl = fakeGl({ parallel: false })

    expect(await createFullscreenProgram(asGl(gl), 'void main() {}')).not.toBeNull()
    expect(gl.getProgramParameter).toHaveBeenCalledTimes(1)
  })

  it('zwraca null, gdy shader się nie skompiluje', async () => {
    const gl = fakeGl({ linkOk: false })

    expect(await createFullscreenProgram(asGl(gl), 'zły kod')).toBeNull()
    expect(gl.useProgram).not.toHaveBeenCalled()
  })

  it('zwraca null, gdy kontekst zginie w trakcie kompilacji', async () => {
    const gl = fakeGl()
    gl.isContextLost.mockReturnValue(true)

    expect(await createFullscreenProgram(asGl(gl), 'void main() {}')).toBeNull()
  })
})

describe('hexToRgb', () => {
  it('zamienia kolor #rrggbb na liczby od 0 do 1', () => {
    expect(hexToRgb('#ffffff')).toEqual([1, 1, 1])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
    expect(hexToRgb('#ff0080')).toEqual([1, 0, 128 / 255])
  })

  it('przyjmuje wartość prosto z getComputedStyle, ze spacjami i wielkimi literami', () => {
    expect(hexToRgb('  #7C4DDB ')).toEqual([124 / 255, 77 / 255, 219 / 255])
  })

  it('zwraca null dla zapisu, którego shader nie dostanie', () => {
    expect(hexToRgb('')).toBeNull()
    expect(hexToRgb('#fff')).toBeNull()
    expect(hexToRgb('rgb(255, 0, 0)')).toBeNull()
    expect(hexToRgb('#gggggg')).toBeNull()
  })
})
