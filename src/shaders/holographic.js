// ── Holographic iridescent object ────────────────────────────
export const holoVert = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vFresnel;
  uniform float uTime;
  uniform float uAssemble; // 0=scattered 1=formed

  // Simple hash
  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);

    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
    vFresnel = 1.0 - clamp(dot(viewDir, vNormal), 0.0, 1.0);

    // Self-assemble: vertices drift from random positions toward final position
    float vid = float(gl_VertexID);
    vec3 scattered = vec3(
      sin(vid * 1.3 + uTime * 0.2) * 4.0,
      cos(vid * 0.9 + uTime * 0.15) * 4.0,
      sin(vid * 2.1 + uTime * 0.25) * 3.0
    );
    vec3 pos = mix(scattered, position, uAssemble);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
  }
`

export const holoFrag = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vFresnel;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3  uTint;

  vec3 hueShift(float h) {
    h = fract(h);
    float r = abs(h * 6.0 - 3.0) - 1.0;
    float g = 2.0 - abs(h * 6.0 - 2.0);
    float b = 2.0 - abs(h * 6.0 - 4.0);
    return clamp(vec3(r, g, b), 0.0, 1.0);
  }

  void main() {
    float fr = pow(vFresnel, 1.6);

    float hue = 0.72
              + vWorldPos.y * 0.06
              + vWorldPos.x * 0.04
              + uTime * 0.035;
    vec3 irid = hueShift(hue);

    vec3 col = mix(uTint, irid, fr * 0.65);
    col += fr * 0.4;

    float alpha = uOpacity * (0.02 + fr * 0.55);
    gl_FragColor = vec4(col, alpha);
  }
`

// ── Particle points ───────────────────────────────────────────
export const ptVert = /* glsl */`
  attribute float aSize;
  attribute float aPhase;
  attribute vec3  aOffset;
  attribute vec3  aTarget;   // final icosahedron surface point

  uniform float uTime;
  uniform float uScatter;
  uniform float uAssemble;   // 0=gathered on ico surface 1=scattered

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Gentle breathe
    pos += normalize(pos + 0.001) * sin(uTime * 0.45 + aPhase) * 0.12;

    // Scatter outward on scroll (phase 2)
    pos += aOffset * uScatter;

    // Intro assemble: lerp from offset cloud → ico surface
    // uAssemble goes 0→1 as object forms
    vec3 cloud = aTarget + aOffset * 1.6;
    pos = mix(cloud, pos, uAssemble);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (80.0 / -mv.z);

    vAlpha = smoothstep(12.0, 3.0, -mv.z);
  }
`

export const ptFrag = /* glsl */`
  uniform float uOpacity;
  uniform vec3  uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.08, d) * uOpacity * vAlpha;
    gl_FragColor = vec4(uColor, a);
  }
`
