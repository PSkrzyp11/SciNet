// Minimalna warstwa WebGL dla efektów na cały prostokąt. Wystarcza zamiast biblioteki 3D.

const VERTEX = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

// Co ile sprawdzamy, czy karta graficzna skończyła kompilować shader
const POLL_MS = 16

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const result = gl.createShader(type)
  if (!result) return null
  gl.shaderSource(result, source)
  gl.compileShader(result)
  return result
}

/**
 * Czeka na wynik linkowania bez blokowania strony. Pytanie o LINK_STATUS zatrzymuje
 * wątek główny do końca kompilacji (na słabym telefonie nawet kilkaset ms), więc
 * z rozszerzeniem KHR_parallel_shader_compile najpierw tylko sprawdzamy, czy już gotowe.
 */
function linked(gl: WebGLRenderingContext, program: WebGLProgram) {
  const parallel = gl.getExtension('KHR_parallel_shader_compile')
  return new Promise<boolean>((resolve) => {
    const check = () => {
      if (gl.isContextLost()) return resolve(false)
      if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
        setTimeout(check, POLL_MS)
        return
      }
      resolve(Boolean(gl.getProgramParameter(program, gl.LINK_STATUS)))
    }
    check()
  })
}

export interface FullscreenProgram {
  uniform: (name: string) => WebGLUniformLocation | null
  draw: () => void
}

/**
 * Buduje program z podanym fragment shaderem i rysuje go jednym trójkątem,
 * który zakrywa cały canvas. Zwraca `null`, gdy karta graficzna odrzuci shader.
 */
export async function createFullscreenProgram(
  gl: WebGLRenderingContext,
  fragment: string,
): Promise<FullscreenProgram | null> {
  const vertexShader = shader(gl, gl.VERTEX_SHADER, VERTEX)
  const fragmentShader = shader(gl, gl.FRAGMENT_SHADER, fragment)
  const program = gl.createProgram()
  if (!vertexShader || !fragmentShader || !program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  // Błąd kompilacji któregoś shadera też kończy się nieudanym linkowaniem
  if (!(await linked(gl, program))) return null

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const position = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  gl.useProgram(program)

  return {
    uniform: (name: string) => gl.getUniformLocation(program, name),
    draw: () => gl.drawArrays(gl.TRIANGLES, 0, 3),
  }
}

/** Zamienia kolor CSS w zapisie #rrggbb na trzy liczby 0–1 dla shadera. */
export function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match?.[1]) return null
  const value = parseInt(match[1], 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}
