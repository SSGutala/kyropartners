import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import useScrollStore from '../store/useScrollStore'
import { holoVert, holoFrag, ptVert, ptFrag } from '../shaders/holographic'

const clamp   = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp    = (a, b, t) => a + (b - a) * t
const easeOut = t => 1 - (1 - t) ** 3
const easeIn  = t => t * t * t
const easeIO  = t => t < .5 ? 4*t*t*t : 1-((-2*t+2)**3)/2

// ── Bezier camera path (4 waypoints) ─────────────────────────
// Returns position and lookAt along a cubic bezier
const CAM_PATH = [
  { p: new THREE.Vector3(0, 0.05, 5.0),   la: new THREE.Vector3(0, 0, 0) },  // 0%  hero
  { p: new THREE.Vector3(1.4, 0.9, 7.2),  la: new THREE.Vector3(0, 0, 0) },  // 50% shard explosion
  { p: new THREE.Vector3(-1.2, 1.8, 6.5), la: new THREE.Vector3(0, 0.3, 0) },// 75% labels
  { p: new THREE.Vector3(0, -0.4, 4.8),   la: new THREE.Vector3(0, -0.2, 0) },// 100% CTA
]

function camAt(t) {
  // Piecewise linear between waypoints
  const n = CAM_PATH.length - 1
  const seg = Math.min(Math.floor(t * n), n - 1)
  const lt = (t * n) - seg
  const a = CAM_PATH[seg]
  const b = CAM_PATH[seg + 1]
  return {
    pos: new THREE.Vector3().lerpVectors(a.p, b.p, easeIO(lt)),
    la:  new THREE.Vector3().lerpVectors(a.la, b.la, easeIO(lt)),
  }
}

// ── Stable seeded RNG ─────────────────────────────────────────
function rng(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

const rand = rng(42)

const SERVICE = [
  { pos: [-3.2,  1.1, -1.4], color: new THREE.Color('#7B2FFF'), label: 'WEB DEVELOPMENT',  labelColor: '#7B2FFF' },
  { pos: [ 0.0, -2.2,  1.8], color: new THREE.Color('#2FBFFF'), label: 'SEO & GROWTH',     labelColor: '#2FBFFF' },
  { pos: [ 3.2,  0.9, -1.2], color: new THREE.Color('#FF2F7B'), label: 'APP DEVELOPMENT',  labelColor: '#FF2F7B' },
]

const SCATTER = Array.from({ length: 9 }, (_, i) => {
  const angle = (i / 9) * Math.PI * 2
  return {
    pos: [
      Math.cos(angle) * (3.5 + rand() * 1.5),
      (rand() - 0.5) * 4,
      Math.sin(angle) * (2 + rand() * 1.2),
    ],
    scale: 0.18 + rand() * 0.28,
    rx: (rand() - 0.5) * 0.04,
    ry: (rand() - 0.5) * 0.05,
    detail: rand() > 0.5 ? 1 : 0,
  }
})

// ── Particles ─────────────────────────────────────────────────
const rand2 = rng(999)
const N_PARTICLES = 2200

// Build icosahedron surface points for particle targets
const _icoGeo = new THREE.IcosahedronGeometry(1.35, 3)
const _icoPos = _icoGeo.attributes.position
const icoTargets = []
for (let i = 0; i < _icoPos.count; i++) {
  icoTargets.push(new THREE.Vector3(_icoPos.getX(i), _icoPos.getY(i), _icoPos.getZ(i)))
}

const ptPositions = new Float32Array(N_PARTICLES * 3)
const ptSizes     = new Float32Array(N_PARTICLES)
const ptPhases    = new Float32Array(N_PARTICLES)
const ptOffsets   = new Float32Array(N_PARTICLES * 3)
const ptTargets   = new Float32Array(N_PARTICLES * 3)

for (let i = 0; i < N_PARTICLES; i++) {
  const phi   = Math.acos(2 * rand2() - 1)
  const theta = rand2() * Math.PI * 2
  const r     = 1.6 + rand2() * 2.8
  ptPositions[i*3]   = r * Math.sin(phi) * Math.cos(theta)
  ptPositions[i*3+1] = r * Math.cos(phi)
  ptPositions[i*3+2] = r * Math.sin(phi) * Math.sin(theta)
  ptSizes[i]         = 0.7 + rand2() * 1.2
  ptPhases[i]        = rand2() * Math.PI * 2
  ptOffsets[i*3]     = (rand2() - 0.5) * 7
  ptOffsets[i*3+1]   = (rand2() - 0.5) * 7
  ptOffsets[i*3+2]   = (rand2() - 0.5) * 7
  // Target: random ico surface point
  const tgt = icoTargets[i % icoTargets.length]
  ptTargets[i*3]     = tgt.x
  ptTargets[i*3+1]   = tgt.y
  ptTargets[i*3+2]   = tgt.z
}

const ptGeo = new THREE.BufferGeometry()
ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPositions, 3))
ptGeo.setAttribute('aSize',    new THREE.BufferAttribute(ptSizes, 1))
ptGeo.setAttribute('aPhase',   new THREE.BufferAttribute(ptPhases, 1))
ptGeo.setAttribute('aOffset',  new THREE.BufferAttribute(ptOffsets, 3))
ptGeo.setAttribute('aTarget',  new THREE.BufferAttribute(ptTargets, 3))

// ── Shared uniforms (mutated each frame, never recreated) ─────
const coreUniforms = {
  uTime:     { value: 0 },
  uOpacity:  { value: 1 },
  uTint:     { value: new THREE.Color('#7B2FFF') },
  uAssemble: { value: 0 },
}
const serviceUniforms = SERVICE.map(s => ({
  uTime:     { value: 0 },
  uOpacity:  { value: 0 },
  uTint:     { value: s.color },
  uAssemble: { value: 1 },
}))
const scatterUniforms = SCATTER.map(() => ({
  uTime:     { value: 0 },
  uOpacity:  { value: 0 },
  uTint:     { value: new THREE.Color('#7B2FFF') },
  uAssemble: { value: 1 },
}))
const ptUniforms = {
  uTime:     { value: 0 },
  uOpacity:  { value: 0 },
  uScatter:  { value: 0 },
  uAssemble: { value: 0 },
  uColor:    { value: new THREE.Color('#8844ff') },
}

// ─────────────────────────────────────────────────────────────
export default function HeroScene() {
  const { camera } = useThree()

  const groupRef       = useRef()
  const coreMeshRef    = useRef()
  const serviceRefs    = useRef([])
  const scatterRefs    = useRef([])
  const ptRef          = useRef()
  const labelRefs      = useRef([])
  const _wp            = useMemo(() => new THREE.Vector3(), [])

  // Intro assembly state
  const introRef = useRef({ startTime: null, done: false })

  useFrame((state, delta) => {
    const scroll = useScrollStore.getState().scrollProgress
    const ph1 = clamp(scroll / 0.28,          0, 1)
    const ph2 = clamp((scroll - 0.28) / 0.42, 0, 1)
    const ph3 = clamp((scroll - 0.70) / 0.30, 0, 1)
    const t   = state.clock.elapsedTime

    // ── Intro assembly (first 2.4s) ───────────────────────
    const intro = introRef.current
    if (!intro.startTime) intro.startTime = t
    const introElapsed = t - intro.startTime
    // Particles converge 0-1.2s, crystallize 0.8-2.4s
    const ptAssemble  = clamp(introElapsed / 1.2, 0, 1)
    const coreAssemble = clamp((introElapsed - 0.6) / 1.6, 0, 1)

    coreUniforms.uAssemble.value = easeOut(coreAssemble)
    ptUniforms.uAssemble.value   = easeOut(ptAssemble)

    // Fade particles in during intro, maintain after
    const introPtOp = clamp(introElapsed / 0.8, 0, 1)

    // ── Group gentle drift ────────────────────────────────
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12 * (1 - easeIO(ph2))
    }

    // ── Core icosahedron ──────────────────────────────────
    if (coreMeshRef.current) {
      const s = lerp(1, 0.5, easeOut(ph2))
      coreMeshRef.current.scale.setScalar(s)
      coreMeshRef.current.position.y = Math.sin(t * 0.45) * 0.1 * (1 - ph2)
    }
    coreUniforms.uTime.value    = t
    // Max opacity capped at 0.82 — keeps holographic translucency
    coreUniforms.uOpacity.value = lerp(easeOut(coreAssemble) * 0.82, 0, easeOut(ph2 * 1.4))

    // ── Service shards ────────────────────────────────────
    SERVICE.forEach((sd, i) => {
      const mesh = serviceRefs.current[i]
      if (!mesh) return
      const t2 = easeOut(ph2)
      mesh.position.x = lerp(0, sd.pos[0], t2)
      mesh.position.y = lerp(0, sd.pos[1], t2) + Math.sin(t * 0.5 + i * 2.1) * 0.07
      mesh.position.z = lerp(0, sd.pos[2], t2)
      mesh.rotation.x += delta * 0.012 * ph2
      mesh.rotation.y += delta * 0.018 * ph2

      const op = lerp(0, 1, easeOut(clamp(ph2 * 1.8, 0, 1)))
      serviceUniforms[i].uTime.value    = t
      serviceUniforms[i].uOpacity.value = op

      const lbl = labelRefs.current[i]
      if (lbl && mesh) {
        if (ph3 > 0.01) {
          mesh.getWorldPosition(_wp)
          lbl.position.set(_wp.x, _wp.y - 0.55, _wp.z)
        } else {
          lbl.position.set(0, -9999, 0)
        }
        lbl.fillOpacity = easeOut(ph3)
      }
    })

    // ── Scatter shards ────────────────────────────────────
    SCATTER.forEach((sd, i) => {
      const mesh = scatterRefs.current[i]
      if (!mesh) return
      const t2 = easeOut(ph2)
      mesh.position.x = lerp(0, sd.pos[0], t2)
      mesh.position.y = lerp(0, sd.pos[1], t2) + Math.sin(t * 0.3 + i) * 0.06
      mesh.position.z = lerp(0, sd.pos[2], t2)
      mesh.rotation.x += delta * sd.rx
      mesh.rotation.y += delta * sd.ry

      const op   = lerp(0, 0.7, easeOut(clamp(ph2 * 1.8, 0, 1)))
      const fade = lerp(op, 0.12, easeOut(ph3))
      scatterUniforms[i].uTime.value    = t
      scatterUniforms[i].uOpacity.value = fade
    })

    // ── Particles ─────────────────────────────────────────
    ptUniforms.uTime.value    = t
    ptUniforms.uScatter.value = easeOut(ph2) * 2.4
    ptUniforms.uOpacity.value = introPtOp * lerp(0.45, 0.65, ph2)

    // ── Camera — authored bezier path ─────────────────────
    const { pos: tp, la: tla } = camAt(scroll)
    camera.position.x = lerp(camera.position.x, tp.x, 0.04)
    camera.position.y = lerp(camera.position.y, tp.y, 0.04)
    camera.position.z = lerp(camera.position.z, tp.z, 0.04)
    camera.lookAt(tla)
  })

  return (
    <>
      <group ref={groupRef}>

        {/* ── Core holographic icosahedron ────────────── */}
        <mesh ref={coreMeshRef}>
          <icosahedronGeometry args={[1.35, 2]} />
          <shaderMaterial
            vertexShader={holoVert}
            fragmentShader={holoFrag}
            uniforms={coreUniforms}
            transparent
            side={THREE.FrontSide}
            depthWrite={false}
          />
        </mesh>

        {/* Wireframe edge overlay */}
        <mesh>
          <icosahedronGeometry args={[1.36, 2]} />
          <meshBasicMaterial color="#7B2FFF" wireframe transparent opacity={0.22} />
        </mesh>

        {/* ── 3 Service shards ──────────────────────── */}
        {SERVICE.map((sd, i) => (
          <mesh key={`svc-${i}`} ref={el => serviceRefs.current[i] = el} scale={0.48}>
            <icosahedronGeometry args={[1, 1]} />
            <shaderMaterial
              vertexShader={holoVert}
              fragmentShader={holoFrag}
              uniforms={serviceUniforms[i]}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* ── 9 Background scatter shards ───────────── */}
        {SCATTER.map((sd, i) => (
          <mesh key={`sc-${i}`} ref={el => scatterRefs.current[i] = el} scale={sd.scale}>
            <icosahedronGeometry args={[1, sd.detail]} />
            <shaderMaterial
              vertexShader={holoVert}
              fragmentShader={holoFrag}
              uniforms={scatterUniforms[i]}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* ── Particles ─────────────────────────────── */}
        <points ref={ptRef} geometry={ptGeo}>
          <shaderMaterial
            vertexShader={ptVert}
            fragmentShader={ptFrag}
            uniforms={ptUniforms}
            transparent
            depthWrite={false}
          />
        </points>

      </group>

      {/* Labels: outside rotating group */}
      {SERVICE.map((sd, i) => (
        <Text
          key={`lbl-${i}`}
          ref={el => labelRefs.current[i] = el}
          position={[0, -999, 0]}
          fontSize={0.115}
          color={sd.labelColor}
          anchorX="center"
          anchorY="top"
          fillOpacity={0}
          letterSpacing={0.13}
          outlineWidth={0}
        >
          {sd.label}
        </Text>
      ))}
    </>
  )
}
