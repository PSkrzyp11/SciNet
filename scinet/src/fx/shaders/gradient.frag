// Tło hero: szum zniekształcany w czasie, trzy kolory marki i ziarno
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uBase;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uGrain;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Szum wartości z gładką interpolacją między węzłami siatki
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.02 + vec2(17.3, 9.1);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv;
  p.x *= uResolution.x / uResolution.y;

  float t = uTime * 0.06;

  // Szum podawany sam do siebie daje miękki, organiczny ruch zamiast przesuwania tekstury
  vec2 q = vec2(fbm(p * 1.2 + vec2(0.0, t)), fbm(p * 1.2 + vec2(5.2, -t)));
  vec2 r = vec2(
    fbm(p * 1.6 + 2.0 * q + vec2(1.7, 9.2) + t * 0.7),
    fbm(p * 1.6 + 2.0 * q + vec2(8.3, 2.8) - t * 0.5)
  );
  float f = fbm(p * 1.4 + 2.2 * r);

  vec3 color = uBase;
  color = mix(color, uColor1, smoothstep(0.15, 0.75, f));
  color = mix(color, uColor2, smoothstep(0.45, 0.95, length(r)) * 0.75);

  // Na wąskim hero (telefon) tekst zajmuje całą szerokość, a nie tylko lewą część
  float narrow = 1.0 - smoothstep(1.4, 2.4, uResolution.x / uResolution.y);

  // Złota poświata trzyma się prawej strony, z dala od tekstu
  float glow = smoothstep(0.55, 0.0, distance(uv, vec2(0.86, 0.7) + (q - 0.5) * 0.25));
  color = mix(color, uColor3, glow * glow * 0.55 * (0.6 + 0.4 * f) * (1.0 - 0.6 * narrow));

  // Przyciemnienie po lewej pilnuje kontrastu tytułu
  color = mix(color, uBase, smoothstep(0.75, 0.0, uv.x) * 0.6);
  // Na telefonie dochodzi przyciemnienie od dołu, bo tam stoi cały tekst
  color = mix(color, uBase, smoothstep(0.95, 0.05, uv.y) * 0.65 * narrow);

  float grain = hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5;
  color += grain * uGrain;

  gl_FragColor = vec4(color, 1.0);
}
