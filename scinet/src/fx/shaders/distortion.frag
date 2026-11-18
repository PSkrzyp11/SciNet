// Obraz pod kursorem: fala rozchodząca się od kursora i lekkie rozszczepienie kolorów
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImage;
uniform vec2 uPointer;
uniform float uTime;
uniform float uStrength;

// Ten sam kadr co `object-fit: cover`, z powiększeniem od środka
vec3 sampleCover(vec2 st, float zoom, float channelShift) {
  float canvasAspect = uResolution.x / uResolution.y;
  float imageAspect = uImage.x / uImage.y;
  vec2 scale = canvasAspect > imageAspect
    ? vec2(1.0, imageAspect / canvasAspect)
    : vec2(canvasAspect / imageAspect, 1.0);
  vec2 uv = (st - 0.5) * scale / zoom + 0.5;
  uv.x += channelShift;
  // Pierwszy wiersz tekstury to góra obrazu, a gl_FragCoord liczy od dołu
  uv.y = 1.0 - uv.y;
  return texture2D(uTexture, clamp(uv, 0.0, 1.0)).rgb;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

  vec2 fromPointer = (st - uPointer) * aspect;
  float dist = length(fromPointer);
  vec2 direction = fromPointer / max(dist, 0.0001) / aspect;

  // Fala słabnie z odległością od kursora
  float wave = sin(dist * 22.0 - uTime * 5.0) * exp(-dist * 4.0);
  vec2 offset = direction * wave * 0.012 * uStrength;

  float zoom = 1.0 + 0.04 * uStrength;
  float split = 0.004 * uStrength * (0.5 + 0.5 * exp(-dist * 3.0));

  float r = sampleCover(st + offset, zoom, split).r;
  float g = sampleCover(st + offset, zoom, 0.0).g;
  float b = sampleCover(st + offset, zoom, -split).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
