import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const lerp = (a, b, t) => a + (b - a) * t
function rng(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

// ── Marble tile floor texture ─────────────────────────────────
function makeMarbleTex() {
  const W = 1024, H = 1024
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0a090a'; ctx.fillRect(0, 0, W, H)
  const TILES = 8, ts = W / TILES
  ctx.strokeStyle = 'rgba(30,20,35,0.9)'; ctx.lineWidth = 2
  for (let i = 0; i <= TILES; i++) {
    ctx.beginPath(); ctx.moveTo(i * ts, 0); ctx.lineTo(i * ts, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * ts); ctx.lineTo(W, i * ts); ctx.stroke()
  }
  const r = rng(77)
  for (let i = 0; i < 80; i++) {
    ctx.strokeStyle = `rgba(40,30,50,${0.05 + r() * 0.08})`; ctx.lineWidth = r() * 1.2
    ctx.beginPath(); ctx.moveTo(r()*W, r()*H); ctx.lineTo(r()*W, r()*H); ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3)
  return t
}

// ── Building window texture ───────────────────────────────────
function makeBuildingTex(cols, rows, seed) {
  const W = 128, H = 256; const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'); ctx.fillStyle = '#03040c'; ctx.fillRect(0, 0, W, H)
  const r = rng(seed); const cw = W/cols, ch = H/rows
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    if (r() > 0.42) {
      const warm = r() > 0.3
      ctx.fillStyle = warm ? `rgba(255,210,130,${0.5+r()*0.5})` : `rgba(150,190,255,${0.4+r()*0.45})`
      ctx.fillRect(col*cw+1.5, row*ch+1.5, cw-2.5, ch-2.5)
    }
  }
  return new THREE.CanvasTexture(c)
}

// ── KYRO TV screen texture ────────────────────────────────────
function makeKyroScreenTex() {
  const W = 960, H = 540; const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#04060e'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(123,47,255,0.06)'; ctx.fillRect(0, 0, W, H)
  ctx.font = 'bold 120px "Arial Black", sans-serif'; ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0.12em'
  ctx.fillText('KYRO', W/2, H/2 - 30)
  ctx.font = '22px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.letterSpacing = '0.3em'; ctx.fillText('ENGINEERED TO PRECISION', W/2, H/2 + 55)
  ctx.strokeStyle = 'rgba(123,47,255,0.35)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(W*0.2, H/2+85); ctx.lineTo(W*0.8, H/2+85); ctx.stroke()
  return new THREE.CanvasTexture(c)
}

// ── Art piece texture (purple character) ─────────────────────
function makeArtTex() {
  const W = 512, H = 700; const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'); ctx.fillStyle = '#050308'; ctx.fillRect(0, 0, W, H)
  const radGrad = ctx.createRadialGradient(W/2, H*0.45, 0, W/2, H*0.45, W*0.6)
  radGrad.addColorStop(0, 'rgba(123,47,255,0.55)'); radGrad.addColorStop(0.5, 'rgba(80,20,180,0.2)')
  radGrad.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = radGrad; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(160,80,255,0.9)'; ctx.lineWidth = 2
  const bolts = [[W*0.35,H*0.2,W*0.45,H*0.5],[W*0.55,H*0.15,W*0.5,H*0.48],[W*0.28,H*0.35,W*0.42,H*0.6]]
  bolts.forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+(x2-x1)*0.5+20,y1+(y2-y1)*0.5-10); ctx.lineTo(x2,y2); ctx.stroke()
  })
  ctx.fillStyle = 'rgba(90,20,180,0.7)'
  ctx.beginPath(); ctx.ellipse(W/2, H*0.42, 60, 80, 0, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(W/2, H*0.55, 45, 65, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(180,100,255,0.95)'
  ctx.beginPath(); ctx.arc(W/2, H*0.3, 32, 0, Math.PI*2); ctx.fill()
  return new THREE.CanvasTexture(c)
}

// ── Code screen texture ───────────────────────────────────────
function makeCodeTex() {
  const W = 512, H = 288; const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'); ctx.fillStyle = '#060e1c'; ctx.fillRect(0, 0, W, H)
  const r = rng(888); const cols = ['#4af','#8f8','#fa8','#f88','#aaf','#fff','#a8f']
  for (let line = 0; line < 18; line++) {
    const y = 14 + line * 15; let x = 12 + Math.floor(r()*3)*12
    for (let s = 0; s < 5+Math.floor(r()*4); s++) {
      ctx.fillStyle = cols[Math.floor(r()*cols.length)]; const sw = 18+r()*60
      ctx.fillRect(x, y, sw, 5); x += sw + 6 + r()*10; if (x>W-10) break
    }
  }
  return new THREE.CanvasTexture(c)
}

// ── NYC Skyline with Empire State Building ────────────────────
function NYCSkyline() {
  const bldgs = useMemo(() => {
    const r = rng(314); const result = []
    for (let i = 0; i < 65; i++) {
      const x = (r()-0.5)*100; const z = -22 - r()*45
      const w = 1.2 + r()*4.5; const h = 3 + r()*18; const d = 1.5+r()*3
      result.push({ x, z, w, h, d, cols: Math.max(2,Math.floor(w*2)), rows: Math.max(3,Math.floor(h*2.2)), seed: i*41+7 })
    }
    return result
  }, [])
  const textures = useMemo(() => bldgs.map(b => makeBuildingTex(b.cols, b.rows, b.seed)), [bldgs])
  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry(); const pos = new Float32Array(350*3); const r = rng(777)
    for (let i = 0; i < 350; i++) { pos[i*3]=(r()-0.5)*180; pos[i*3+1]=10+r()*35; pos[i*3+2]=-28-r()*70 }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3)); return geo
  }, [])

  return (
    <group>
      {/* Night sky gradient */}
      <mesh position={[0, 18, -75]}>
        <planeGeometry args={[400, 120]} />
        <meshStandardMaterial color="#010308" roughness={1} />
      </mesh>
      <points geometry={starGeo}>
        <pointsMaterial color="#ffffff" size={0.1} sizeAttenuation transparent opacity={0.75} />
      </points>
      {/* City ground glow (horizon warmth) */}
      <mesh position={[0, -9, -40]} rotation={[0.08,0,0]}>
        <planeGeometry args={[260, 14]} />
        <meshStandardMaterial color="#000" emissive="#ff4400" emissiveIntensity={0.12} transparent opacity={0.4} />
      </mesh>
      {/* Regular buildings */}
      {bldgs.map((b, i) => (
        <group key={i} position={[b.x, b.h/2 - 15, b.z]}>
          <mesh><boxGeometry args={[b.w,b.h,b.d]} /><meshStandardMaterial color="#020408" roughness={0.95} /></mesh>
          <mesh position={[0,0,b.d/2+0.01]}>
            <planeGeometry args={[b.w-0.08,b.h-0.08]} />
            <meshStandardMaterial map={textures[i]} emissiveMap={textures[i]} emissive="#fff" emissiveIntensity={0.5} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* ── Empire State Building ── */}
      <group position={[0, -15, -26]}>
        {/* Base */}
        <mesh position={[0, 6.5, 0]}><boxGeometry args={[3.2,13,2.5]} /><meshStandardMaterial color="#020408" roughness={0.95} /></mesh>
        <mesh position={[0, 6.5, 1.26]}>
          <planeGeometry args={[3.0,12.8]} />
          <meshStandardMaterial map={useMemo(()=>makeBuildingTex(6,18,99),[]) } emissiveMap={useMemo(()=>makeBuildingTex(6,18,99),[])} emissive="#fff" emissiveIntensity={0.55} roughness={0.9} />
        </mesh>
        {/* Setback 1 */}
        <mesh position={[0, 14, 0]}><boxGeometry args={[2.4,2.2,1.9]} /><meshStandardMaterial color="#03050a" roughness={0.95} /></mesh>
        {/* Setback 2 */}
        <mesh position={[0, 16, 0]}><boxGeometry args={[1.8,1.8,1.4]} /><meshStandardMaterial color="#030509" roughness={0.95} /></mesh>
        {/* Setback 3 */}
        <mesh position={[0, 17.6, 0]}><boxGeometry args={[1.2,1.4,1.0]} /><meshStandardMaterial color="#040609" roughness={0.95} /></mesh>
        {/* Crown */}
        <mesh position={[0, 19.2, 0]}><boxGeometry args={[0.7,2.8,0.65]} /><meshStandardMaterial color="#050809" roughness={0.9} /></mesh>
        {/* Spire */}
        <mesh position={[0, 22.5, 0]}><cylinderGeometry args={[0.03,0.07,6.5,6]} /><meshStandardMaterial color="#c8d8ff" emissive="#9ab0ff" emissiveIntensity={1.0} /></mesh>
        {/* Crown lights */}
        <pointLight position={[0, 20, 0]} intensity={5} color="#8899ff" distance={6} decay={2} />
        <pointLight position={[0, 22, 0]} intensity={3} color="#aabbff" distance={4} decay={2} />
      </group>
      {/* Other tall landmark buildings flanking ESB */}
      {[[-18,-24],[-9,-22],[10,-23],[20,-25]].map(([x,z],i) => (
        <group key={i} position={[x,-15,z]}>
          <mesh position={[0,10,0]}><boxGeometry args={[2.2,20,1.8]} /><meshStandardMaterial color="#020407" roughness={0.95} /></mesh>
          <mesh position={[0,10,0.91]}>
            <planeGeometry args={[2.0,19.8]} />
            <meshStandardMaterial map={useMemo(()=>makeBuildingTex(4,14,i*7+3),[])} emissiveMap={useMemo(()=>makeBuildingTex(4,14,i*7+3),[])} emissive="#fff" emissiveIntensity={0.5} roughness={0.9} />
          </mesh>
          <mesh position={[0,21,0]}><cylinderGeometry args={[0.04,0.08,3.5,6]} /><meshStandardMaterial color="#c8d8ff" emissive="#9ab0ff" emissiveIntensity={0.8} /></mesh>
        </group>
      ))}
    </group>
  )
}

// ── Floor-to-ceiling windows ──────────────────────────────────
function Windows() {
  const PANELS = 10; const PW = 2.8; const PH = 10.5
  return (
    <group position={[0, 0, -18]}>
      {Array.from({length:PANELS+1},(_,i) => (
        <mesh key={i} position={[i*PW-(PANELS*PW)/2, PH/2, 0]}>
          <boxGeometry args={[0.055,PH+0.1,0.08]} /><meshStandardMaterial color="#080808" roughness={0.3} metalness={0.95} />
        </mesh>
      ))}
      <mesh position={[0,PH+0.03,0]}><boxGeometry args={[PANELS*PW+0.1,0.06,0.08]} /><meshStandardMaterial color="#080808" roughness={0.3} metalness={0.95} /></mesh>
      {Array.from({length:PANELS},(_,i) => (
        <mesh key={i} position={[i*PW-(PANELS*PW)/2+PW/2, PH/2, 0.02]}>
          <planeGeometry args={[PW-0.06,PH]} />
          <meshStandardMaterial color="#0c1828" transparent opacity={0.18} roughness={0.04} metalness={0.12} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

// ── Purple cove ceiling lighting ──────────────────────────────
function PurpleCoveLighting() {
  const y = 9.0; const rW = 28; const rD = 30
  const strip = { color:'#7B2FFF', emissive:'#7B2FFF', emissiveIntensity:2.2 }
  return (
    <group>
      {/* Front strip */}
      <mesh position={[0,y,8.2]}><boxGeometry args={[rW,0.035,0.4]} /><meshStandardMaterial {...strip} /></mesh>
      {/* Back strip */}
      <mesh position={[0,y,-17.2]}><boxGeometry args={[rW,0.035,0.4]} /><meshStandardMaterial {...strip} /></mesh>
      {/* Left strip */}
      <mesh position={[-rW/2+0.3,y,-4.5]}><boxGeometry args={[0.4,0.035,rD]} /><meshStandardMaterial {...strip} /></mesh>
      {/* Right strip */}
      <mesh position={[rW/2-0.3,y,-4.5]}><boxGeometry args={[0.4,0.035,rD]} /><meshStandardMaterial {...strip} /></mesh>
      {/* Cove recess boxes (ceiling trim) */}
      <mesh position={[0,9.1,-4.5]}><boxGeometry args={[rW,0.15,rD]} /><meshStandardMaterial color="#040404" roughness={0.95} /></mesh>
      {/* Purple glow lights */}
      {[-10,-3,5].map((x,i)=> <pointLight key={i} position={[x,8.9,-4.5]} intensity={4} color="#7B2FFF" distance={10} decay={1.5} /> )}
      {[-10,-3,5].map((x,i)=> <pointLight key={`b${i}`} position={[x,8.9,-12]} intensity={3.5} color="#6622ee" distance={10} decay={1.5} /> )}
    </group>
  )
}

// ── Glass staircase (left side) ───────────────────────────────
function GlassStaircase() {
  return (
    <group position={[-10.5, 0, -5]}>
      {Array.from({length:14},(_,i) => (
        <group key={i}>
          <mesh position={[0, i*0.44+0.22, -(i*0.72)]}>
            <boxGeometry args={[2.8, 0.055, 0.75]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.15} metalness={0.85} />
          </mesh>
          <mesh position={[0,i*0.44+0.23,-(i*0.72)]} rotation={[-Math.PI/2,0,0]}>
            <planeGeometry args={[2.78,0.73]} />
            <meshStandardMaterial color="#3344aa" transparent opacity={0.05} roughness={0.05} />
          </mesh>
        </group>
      ))}
      {/* Glass side panel */}
      <mesh position={[1.35, 3.0, -5]} rotation={[0,0,-0.12]}>
        <boxGeometry args={[0.015, 7, 11]} />
        <meshStandardMaterial color="#1a3055" transparent opacity={0.22} roughness={0.04} metalness={0.1} />
      </mesh>
      {/* Handrail */}
      <mesh position={[1.35, 6.4, -5]} rotation={[0,0,-0.12]}>
        <boxGeometry args={[0.04, 0.04, 11.2]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.15} metalness={0.95} />
      </mesh>
      {/* Vertical posts */}
      {Array.from({length:6},(_,i) => (
        <mesh key={i} position={[1.35, 3.2+i*0.35, -i*1.8]} >
          <boxGeometry args={[0.025,6.5-i*0.35,0.025]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.15} metalness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ── Mezzanine with bar/bottle shelf ───────────────────────────
function Mezzanine() {
  const bottleTex = useMemo(() => {
    const W=256,H=256; const c=document.createElement('canvas'); c.width=W; c.height=H
    const ctx=c.getContext('2d')
    const g=ctx.createLinearGradient(0,0,W,0)
    g.addColorStop(0,'#1a0a00'); g.addColorStop(0.5,'#3a1800'); g.addColorStop(1,'#1a0a00')
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
    ctx.fillStyle='rgba(200,120,30,0.7)'
    for(let i=0;i<18;i++) { const x=14+i*13; ctx.fillRect(x,20,8,H-40) }
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group position={[-12.5, 5.2, -8]}>
      {/* Platform floor */}
      <mesh position={[1.5, 0, 4]}>
        <boxGeometry args={[4, 0.2, 10.5]} />
        <meshStandardMaterial color="#080808" roughness={0.25} metalness={0.15} />
      </mesh>
      {/* Bar back wall */}
      <mesh position={[3.0, 1.8, 4]}>
        <boxGeometry args={[0.12, 4, 10.5]} />
        <meshStandardMaterial color="#080808" roughness={0.8} />
      </mesh>
      {/* Bottle display shelves */}
      {[0.3, 1.4, 2.5].map((y, row) => (
        <group key={row} position={[2.9, y, 4]}>
          <mesh position={[0, 0, 0]}><boxGeometry args={[0.14, 0.04, 10.2]} /><meshStandardMaterial color="#0a0808" roughness={0.4} metalness={0.8} /></mesh>
          {/* Backlit panel */}
          <mesh position={[0.07, 0.22, 0]}>
            <planeGeometry args={[0.06, 0.8]} />
            <meshStandardMaterial color="#c07820" emissive="#aa5808" emissiveIntensity={1.2} />
          </mesh>
          {Array.from({length:14},(_,i) => (
            <mesh key={i} position={[0, 0.22, i*0.7-4.55]}>
              <cylinderGeometry args={[0.07,0.09,0.42,6]} />
              <meshStandardMaterial color="#080c0a" roughness={0.2} metalness={0.05} transparent opacity={0.75} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Bar warm light */}
      <pointLight position={[2.5, 2.0, 4]} intensity={5} color="#cc7010" distance={6} decay={1.5} />
      {/* Railing */}
      <mesh position={[1.5, 1.0, -0.6]}>
        <boxGeometry args={[4, 0.04, 0.04]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.15} metalness={0.95} />
      </mesh>
      {[0.3, 1.5, 2.7].map((x, i) => (
        <mesh key={i} position={[x-0.3, 0.5, -0.6]}>
          <boxGeometry args={[0.025, 1.0, 0.025]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.15} metalness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// ── TV wall (left wall, below mezzanine) ─────────────────────
function TVWall() {
  const kyroTex = useMemo(() => makeKyroScreenTex(), [])
  const artTex  = useMemo(() => makeArtTex(), [])

  return (
    <group>
      {/* TV frame */}
      <mesh position={[-12.4, 3.2, -3.5]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[4.2, 2.4, 0.06]} />
        <meshStandardMaterial color="#060606" roughness={0.25} metalness={0.8} />
      </mesh>
      {/* TV screen */}
      <mesh position={[-12.3, 3.2, -3.5]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[4.1, 2.32]} />
        <meshStandardMaterial map={kyroTex} emissiveMap={kyroTex} emissive="#ffffff" emissiveIntensity={0.65} roughness={0.1} />
      </mesh>
      {/* TV glow */}
      <pointLight position={[-11, 3.2, -3.5]} intensity={5} color="#7B2FFF" distance={6} decay={2} />

      {/* Art piece above/beside staircase */}
      <mesh position={[-12.4, 6.2, -1.5]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[3.2, 4.0]} />
        <meshStandardMaterial map={artTex} emissiveMap={artTex} emissive="#ffffff" emissiveIntensity={0.7} roughness={0.1} />
      </mesh>
      <pointLight position={[-11.5, 6.2, -1.5]} intensity={4} color="#7B2FFF" distance={5} decay={2} />
    </group>
  )
}

// ── Linear gas fireplace ──────────────────────────────────────
function Fireplace() {
  return (
    <group position={[-2.5, 0, -10.5]}>
      {/* Housing */}
      <mesh position={[0, 0.22, 0]}><boxGeometry args={[8, 0.42, 0.38]} /><meshStandardMaterial color="#080808" roughness={0.35} metalness={0.7} /></mesh>
      {/* Glass front */}
      <mesh position={[0, 0.22, 0.2]}><planeGeometry args={[7.8, 0.4]} /><meshStandardMaterial color="#0f1a2a" transparent opacity={0.35} roughness={0.03} metalness={0.1} /></mesh>
      {/* Flame line */}
      <mesh position={[0, 0.19, 0.15]}><planeGeometry args={[7.4, 0.1]} /><meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.2} transparent opacity={0.92} /></mesh>
      <mesh position={[0, 0.16, 0.14]}><planeGeometry args={[7.0, 0.06]} /><meshStandardMaterial color="#2244ff" emissive="#1133ff" emissiveIntensity={1.6} transparent opacity={0.8} /></mesh>
      {/* Rocks/base inside */}
      <mesh position={[0, 0.12, 0.12]}><boxGeometry args={[7.2, 0.05, 0.12]} /><meshStandardMaterial color="#0d0d0d" roughness={0.95} /></mesh>
      {/* Warm glow */}
      <pointLight position={[-2, 0.5, 0.8]} intensity={4} color="#ff5500" distance={6} decay={2} />
      <pointLight position={[ 2, 0.5, 0.8]} intensity={4} color="#ff5500" distance={6} decay={2} />
      <pointLight position={[ 0, 0.5, 0.8]} intensity={3} color="#ff7700" distance={5} decay={2} />
    </group>
  )
}

// ── Large sectional sofa (foreground right) ───────────────────
function SectionalSofa() {
  const mat = { color:'#0e0c0c', roughness:0.88 }
  return (
    <group position={[5.5, 0, 1]}>
      {/* Main long section */}
      <mesh position={[0, 0.46, 0]}><boxGeometry args={[6.5, 0.3, 1.35]} /><meshStandardMaterial {...mat} /></mesh>
      <mesh position={[0, 0.82, -0.58]} rotation={[-0.05,0,0]}><boxGeometry args={[6.5, 0.78, 0.22]} /><meshStandardMaterial {...mat} /></mesh>
      {/* Left arm */}
      <mesh position={[-3.35, 0.65, 0]}><boxGeometry args={[0.22, 0.66, 1.35]} /><meshStandardMaterial {...mat} /></mesh>
      {/* Right arm */}
      <mesh position={[3.35, 0.65, 0]}><boxGeometry args={[0.22, 0.66, 1.35]} /><meshStandardMaterial {...mat} /></mesh>
      {/* L-section chaise (right side, extends forward) */}
      <mesh position={[2.8, 0.46, 1.5]}><boxGeometry args={[1.9, 0.3, 1.55]} /><meshStandardMaterial {...mat} /></mesh>
      <mesh position={[2.8, 0.82, 2.25]} rotation={[-0.05,0,0]}><boxGeometry args={[1.9, 0.78, 0.22]} /><meshStandardMaterial {...mat} /></mesh>
      {/* Cushions */}
      {[-2.6,-0.8,1.0].map((x,i) => (
        <mesh key={i} position={[x, 0.66, -0.15]}><boxGeometry args={[1.6, 0.22, 1.1]} /><meshStandardMaterial color="#100d0d" roughness={0.9} /></mesh>
      ))}
      {/* Back cushions */}
      {[-2.4,-0.7,1.1].map((x,i) => (
        <mesh key={i} position={[x, 0.94, -0.5]}><boxGeometry args={[1.5, 0.48, 0.18]} /><meshStandardMaterial color="#0f0c0c" roughness={0.9} /></mesh>
      ))}
      {/* Legs */}
      {[[-3.1,-0.56],[3.1,-0.56],[-3.1,0.56],[3.1,0.56]].map(([x,z],i) => (
        <mesh key={i} position={[x, 0.1, z]}><boxGeometry args={[0.07,0.22,0.07]} /><meshStandardMaterial color="#060606" roughness={0.2} metalness={0.95} /></mesh>
      ))}
      {/* Area rug under sofa */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0, 0.005, 0.5]}>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial color="#0c0b0b" roughness={0.98} />
      </mesh>
      {/* Dog sleeping on right end of chaise */}
      <Dog position={[3.4, 0.62, 1.5]} />
    </group>
  )
}

// ── Dog (sleeping) ────────────────────────────────────────────
function Dog({ position }) {
  const [x, y, z] = position
  return (
    <group position={[x, y, z]}>
      {/* Body */}
      <mesh rotation={[0, 0.2, 0]}><boxGeometry args={[0.65, 0.22, 0.36]} /><meshStandardMaterial color="#c8a06a" roughness={0.9} /></mesh>
      {/* Head */}
      <mesh position={[0.3, 0.02, 0]}><sphereGeometry args={[0.16, 8, 8]} /><meshStandardMaterial color="#c8a06a" roughness={0.9} /></mesh>
      {/* Muzzle */}
      <mesh position={[0.44, -0.03, 0]}><sphereGeometry args={[0.09, 6, 6]} /><meshStandardMaterial color="#b89060" roughness={0.9} /></mesh>
      {/* Ear */}
      <mesh position={[0.28, 0.12, -0.12]} rotation={[0,0,0.3]}><boxGeometry args={[0.1, 0.12, 0.08]} /><meshStandardMaterial color="#b88850" roughness={0.9} /></mesh>
      {/* Tail */}
      <mesh position={[-0.35, 0.08, 0.06]} rotation={[0,0,0.4]}><cylinderGeometry args={[0.03,0.05,0.25,6]} /><meshStandardMaterial color="#c8a06a" roughness={0.9} /></mesh>
    </group>
  )
}

// ── Coffee table with candles ─────────────────────────────────
function CoffeeTable() {
  return (
    <group position={[1.5, 0, -1.5]}>
      {/* Tabletop — dark glass */}
      <mesh position={[0, 0.38, 0]}><boxGeometry args={[2.2, 0.04, 1.0]} /><meshStandardMaterial color="#0a0a0a" roughness={0.08} metalness={0.2} /></mesh>
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[2.18, 0.015, 0.98]} /><meshStandardMaterial color="#1a2030" transparent opacity={0.5} roughness={0.04} metalness={0.3} /></mesh>
      {/* Legs */}
      {[[-0.9,-0.38],[0.9,-0.38],[-0.9,0.38],[0.9,0.38]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.19,z]}><boxGeometry args={[0.04,0.38,0.04]} /><meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.95} /></mesh>
      ))}
      {/* Candles */}
      {[[-0.5,0.05],[0,0.07],[0.5,0.04]].map(([cx,ch],i) => (
        <group key={i} position={[cx, 0.41, 0]}>
          <mesh position={[0,ch/2,0]}><cylinderGeometry args={[0.04,0.04,ch+0.14,8]} /><meshStandardMaterial color="#1a1515" roughness={0.8} /></mesh>
          {/* Flame */}
          <mesh position={[0,ch+0.15,0]}><sphereGeometry args={[0.03,6,6]} /><meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={2.0} /></mesh>
          <pointLight position={[0,ch+0.2,0]} intensity={0.8} color="#ff8800" distance={1.8} decay={2} />
        </group>
      ))}
      {/* Book on table */}
      <mesh position={[0.6, 0.42, 0.15]} rotation={[0,0.15,0]}><boxGeometry args={[0.35,0.025,0.26]} /><meshStandardMaterial color="#0a0808" roughness={0.85} /></mesh>
    </group>
  )
}

// ── Indoor plants ─────────────────────────────────────────────
function Plants() {
  return (
    <>
      {/* Large plant near fireplace — slimmer, taller, not blocking windows */}
      <group position={[-5.5, 0, -8.5]}>
        <mesh position={[0,0.28,0]}><cylinderGeometry args={[0.18,0.22,0.52,7]} /><meshStandardMaterial color="#0f0d0a" roughness={0.9} /></mesh>
        {[0,0.55,1.1,1.65,2.2,2.75].map((y,i) => (
          <mesh key={i} position={[(i%2===0?0.12:-0.12),0.85+y*0.28,0]} rotation={[0.25*(i%2===0?1:-1),i*0.55,0.08]}>
            <boxGeometry args={[0.04,0.52+i*0.04,0.03]} />
            <meshStandardMaterial color="#0b1608" roughness={0.95} />
          </mesh>
        ))}
        {/* Smaller crown — doesn't block skyline */}
        <mesh position={[0,2.6,0]}><sphereGeometry args={[0.32,7,7]} /><meshStandardMaterial color="#0a1607" roughness={0.95} /></mesh>
      </group>
      {/* Plant near TV (left) */}
      <group position={[-9, 0, -6]}>
        <mesh position={[0,0.2,0]}><cylinderGeometry args={[0.14,0.18,0.38,7]} /><meshStandardMaterial color="#0d0b09" roughness={0.9} /></mesh>
        <mesh position={[0,1.1,0]}><sphereGeometry args={[0.32,7,7]} /><meshStandardMaterial color="#0a1507" roughness={0.95} /></mesh>
      </group>
    </>
  )
}

// ── Workstation (right of center, near windows) ───────────────
function Workstation() {
  const codeTex = useMemo(() => makeCodeTex(), [])
  return (
    <group position={[6.5, 0, -11]}>
      {/* Desk */}
      <mesh position={[0, 0.82, 0]}><boxGeometry args={[3.2, 0.055, 1.1]} /><meshStandardMaterial color="#0c0a08" roughness={0.55} /></mesh>
      {[[-1.4,-0.42],[1.4,-0.42],[-1.4,0.42],[1.4,0.42]].map(([x,z],i)=>(
        <mesh key={i} position={[x,0.4,z]}><boxGeometry args={[0.055,0.82,0.055]} /><meshStandardMaterial color="#070707" roughness={0.3} metalness={0.9} /></mesh>
      ))}
      {/* Under-desk LED */}
      <mesh position={[0, 0.65, -0.44]}><boxGeometry args={[3.0, 0.012, 0.015]} /><meshStandardMaterial color="#4466ff" emissive="#2244ee" emissiveIntensity={1.4} /></mesh>
      {/* Main monitor */}
      <group position={[0, 1.4, -0.28]}>
        <mesh><boxGeometry args={[2.0, 1.15, 0.05]} /><meshStandardMaterial color="#070707" roughness={0.25} metalness={0.8} /></mesh>
        <mesh position={[0,0,0.027]}><planeGeometry args={[1.93,1.1]} /><meshStandardMaterial map={codeTex} emissiveMap={codeTex} emissive="#fff" emissiveIntensity={0.75} roughness={0.1} /></mesh>
        <mesh position={[0,-0.7,0.3]}><boxGeometry args={[0.1,0.32,0.1]} /><meshStandardMaterial color="#060606" roughness={0.3} metalness={0.9} /></mesh>
        <mesh position={[0,-0.86,0.35]}><boxGeometry args={[0.48,0.03,0.3]} /><meshStandardMaterial color="#060606" roughness={0.3} metalness={0.9} /></mesh>
      </group>
      {/* Side monitor */}
      <group position={[-1.25, 1.3, -0.2]} rotation={[0, 0.4, 0]}>
        <mesh><boxGeometry args={[1.05, 0.65, 0.04]} /><meshStandardMaterial color="#060606" roughness={0.25} metalness={0.8} /></mesh>
        <mesh position={[0,0,0.022]}><planeGeometry args={[1.01,0.62]} /><meshStandardMaterial color="#070e1c" emissive="#0d2244" emissiveIntensity={0.55} roughness={0.1} /></mesh>
      </group>
      {/* Keyboard */}
      <mesh position={[0.1, 0.862, 0.18]}><boxGeometry args={[0.95, 0.022, 0.33]} /><meshStandardMaterial color="#0c0c0c" roughness={0.5} /></mesh>
      {/* Desk lamp */}
      <group position={[1.35, 0.86, -0.12]}>
        <mesh position={[0,0.28,0]}><cylinderGeometry args={[0.018,0.018,0.55,5]} /><meshStandardMaterial color="#0d0d0d" roughness={0.2} metalness={0.95} /></mesh>
        <mesh position={[0,0.58,0.14]} rotation={[-0.5,0,0]}><cylinderGeometry args={[0.07,0.055,0.18,7,1,true]} /><meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.95} /></mesh>
        <pointLight position={[0,0.62,0.22]} intensity={3} color="#ddaa44" distance={3} decay={2} />
      </group>
      {/* Monitor glow */}
      <pointLight position={[0, 1.4, -0.1]} intensity={6} color="#2244aa" distance={4} decay={2} />
      {/* Person silhouette */}
      <PersonAtDesk />
    </group>
  )
}

function PersonAtDesk() {
  return (
    <group position={[0.1, 0, 0.5]}>
      <mesh position={[0,1.08,0]} rotation={[-0.12,0,0]}><boxGeometry args={[0.48,0.58,0.28]} /><meshStandardMaterial color="#09080a" roughness={0.95} /></mesh>
      <mesh position={[0,1.58,-0.05]} rotation={[-0.06,0,0]}><sphereGeometry args={[0.15,10,10]} /><meshStandardMaterial color="#0d0b0e" roughness={0.95} /></mesh>
      <mesh position={[-0.26,0.9,0.22]} rotation={[0.5,0,-0.15]}><boxGeometry args={[0.1,0.44,0.09]} /><meshStandardMaterial color="#090808" roughness={0.95} /></mesh>
      <mesh position={[0.26,0.9,0.24]} rotation={[0.48,0,0.15]}><boxGeometry args={[0.1,0.44,0.09]} /><meshStandardMaterial color="#090808" roughness={0.95} /></mesh>
      {/* Chair */}
      <mesh position={[0,0.6,0.32]}><boxGeometry args={[0.52,0.055,0.52]} /><meshStandardMaterial color="#0a0808" roughness={0.9} /></mesh>
      <mesh position={[0,0.96,0.56]} rotation={[0.08,0,0]}><boxGeometry args={[0.5,0.7,0.05]} /><meshStandardMaterial color="#090707" roughness={0.9} /></mesh>
      <mesh position={[0,0.32,0.32]}><cylinderGeometry args={[0.05,0.05,0.52,5]} /><meshStandardMaterial color="#070707" roughness={0.3} metalness={0.85} /></mesh>
      <mesh position={[0,0.06,0.32]}><cylinderGeometry args={[0.3,0.3,0.035,5]} /><meshStandardMaterial color="#070707" roughness={0.25} metalness={0.85} /></mesh>
    </group>
  )
}

// ── Floor lamp (right side) ───────────────────────────────────
function FloorLamp() {
  return (
    <group position={[11.5, 0, -4.5]}>
      <mesh position={[0,0.03,0]}><cylinderGeometry args={[0.18,0.18,0.04,8]} /><meshStandardMaterial color="#080808" roughness={0.3} metalness={0.9} /></mesh>
      <mesh position={[0,1.5,0]}><cylinderGeometry args={[0.02,0.02,3.0,6]} /><meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.95} /></mesh>
      <mesh position={[0,3.1,0]}><cylinderGeometry args={[0.25,0.2,0.45,8,1,true]} /><meshStandardMaterial color="#0d0d0d" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0,3.0,0]}><planeGeometry args={[0.3,0.3]} /><meshStandardMaterial color="#ffffee" emissive="#ffffcc" emissiveIntensity={1.2} /></mesh>
      <pointLight position={[0,3.0,0]} intensity={5} color="#ddcc88" distance={7} decay={2} />
    </group>
  )
}

// ── Room shell ────────────────────────────────────────────────
function PenthouseRoom() {
  const marbleTex = useMemo(() => makeMarbleTex(), [])
  return (
    <>
      {/* Reflective marble floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,-5]} receiveShadow>
        <planeGeometry args={[30,32]} />
        <meshStandardMaterial map={marbleTex} color="#0c0b0c" roughness={0.12} metalness={0.06} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI/2,0,0]} position={[0,9.2,-5]}>
        <planeGeometry args={[30,32]} />
        <meshStandardMaterial color="#040404" roughness={0.95} />
      </mesh>
      {/* Left wall (partial — staircase/mezzanine cuts in) */}
      <mesh rotation={[0,Math.PI/2,0]} position={[-13.5,4.5,-5]}>
        <planeGeometry args={[32,9]} />
        <meshStandardMaterial color="#060606" roughness={0.88} />
      </mesh>
      {/* Right wall */}
      <mesh rotation={[0,-Math.PI/2,0]} position={[13.5,4.5,-5]}>
        <planeGeometry args={[32,9]} />
        <meshStandardMaterial color="#060606" roughness={0.88} />
      </mesh>
      {/* Entrance wall */}
      <mesh position={[0,4.5,9.5]}>
        <planeGeometry args={[30,9]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      {/* Solid wall sections beside windows */}
      <mesh position={[-12.8,4.5,-18]}><boxGeometry args={[1.6,9,0.18]} /><meshStandardMaterial color="#040404" roughness={0.9} /></mesh>
      <mesh position={[ 12.8,4.5,-18]}><boxGeometry args={[1.6,9,0.18]} /><meshStandardMaterial color="#040404" roughness={0.9} /></mesh>
      {/* Ceiling recessed section (for cove) */}
      <mesh position={[0,9.25,-5]}>
        <boxGeometry args={[29,0.2,31]} />
        <meshStandardMaterial color="#030303" roughness={0.95} />
      </mesh>
      {/* Baseboard */}
      <mesh position={[0,0.07,-5]}><boxGeometry args={[30,0.14,32]} /><meshStandardMaterial color="#050505" roughness={0.7} /></mesh>
    </>
  )
}

// ── Camera controls ───────────────────────────────────────────
export default function RoomScene() {
  const { camera } = useThree()
  const mouse  = useRef({ x: 0, y: 0 })
  const camRot = useRef({ x: 0, y: 0 })
  const camZ   = useRef(8.5)

  useEffect(() => {
    camera.position.set(-1, 1.6, 8.5)
    camera.rotation.order = 'YXZ'
    camera.rotation.x = -0.08
    camera.fov = 75
    camera.updateProjectionMatrix()
  }, [camera])

  useEffect(() => {
    const onMove = e => {
      mouse.current.x = (e.clientX / window.innerWidth)  * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const onWheel = e => { camZ.current = Math.max(-5, Math.min(9, camZ.current - e.deltaY * 0.006)) }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  useFrame(() => {
    camRot.current.x = lerp(camRot.current.x, mouse.current.x * -0.26, 0.05)
    camRot.current.y = lerp(camRot.current.y, mouse.current.y * 0.10 - 0.08, 0.05)
    camera.rotation.y = camRot.current.x
    camera.rotation.x = camRot.current.y
    camera.position.z = lerp(camera.position.z, camZ.current, 0.06)
    camera.position.x = -1
    camera.position.y = 1.6
  })

  return (
    <>
      <fog attach="fog" args={['#020202', 0.022]} />

      {/* ── Lighting ─────────────────────────────────────── */}
      <ambientLight intensity={0.06} color="#060410" />
      <hemisphereLight skyColor="#0a0818" groundColor="#050305" intensity={0.5} />

      {/* Purple cove ceiling wash */}
      <pointLight position={[-4, 7, -4]}  intensity={6} color="#6622dd" distance={14} decay={1} />
      <pointLight position={[ 6, 7, -8]}  intensity={5} color="#5511cc" distance={14} decay={1} />
      <pointLight position={[-4, 7, -12]} intensity={5} color="#6622dd" distance={12} decay={1} />
      <pointLight position={[ 4, 7,  2]}  intensity={4} color="#7733ee" distance={12} decay={1} />

      {/* City glow through windows (cool blue) */}
      <pointLight position={[0,  4, -20]} intensity={16} color="#1a3a88" distance={22} decay={1} />
      <pointLight position={[-8, 3, -19]} intensity={8}  color="#1530aa" distance={16} decay={1} />
      <pointLight position={[8,  3, -19]} intensity={8}  color="#1530aa" distance={16} decay={1} />

      {/* Workstation monitor fill */}
      <pointLight position={[6.5, 1.5, -10.8]} intensity={7} color="#2244aa" distance={5} decay={2} />

      {/* Mezzanine bar warm spill */}
      <pointLight position={[-10, 6, -7]} intensity={4} color="#cc7010" distance={8} decay={1.5} />

      {/* Sofa + foreground floor — purple ceiling spill */}
      <pointLight position={[5,  4.0, 4]}  intensity={18} color="#5500aa" distance={18} decay={1.0} />
      <pointLight position={[-2, 4.0, 4]}  intensity={14} color="#4400aa" distance={18} decay={1.0} />
      <pointLight position={[2,  6.0, 1]}  intensity={12} color="#6622cc" distance={20} decay={1.0} />
      <pointLight position={[8,  4.0, 2]}  intensity={10} color="#4400bb" distance={14} decay={1.0} />
      {/* Marble floor purple reflection */}
      <pointLight position={[0,  0.3, 3]}  intensity={8}  color="#440088" distance={14} decay={1.2} />
      <pointLight position={[5,  0.3, 2]}  intensity={6}  color="#330077" distance={10} decay={1.2} />
      {/* Dedicated sofa fill */}
      <pointLight position={[5.5, 2.5, 1.5]}  intensity={12} color="#7733cc" distance={8}  decay={1.5} />
      <pointLight position={[3.5, 2.5, 1.5]}  intensity={10} color="#6622bb" distance={8}  decay={1.5} />
      {/* Candle warm fill on coffee table */}
      <pointLight position={[1.5, 0.8, -1.5]} intensity={4}  color="#ff8800" distance={8}  decay={1.8} />

      {/* Fireplace warm fill on floor */}
      <pointLight position={[-2.5, 1.2, -9.5]} intensity={5} color="#ff5500" distance={8} decay={2} />

      {/* ── Scene ──────────────────────────────────────────── */}
      <PenthouseRoom />
      <NYCSkyline />
      <Windows />
      <PurpleCoveLighting />
      <GlassStaircase />
      <Mezzanine />
      <TVWall />
      <Fireplace />
      <SectionalSofa />
      <CoffeeTable />
      <Plants />
      <Workstation />
      <FloorLamp />
    </>
  )
}
