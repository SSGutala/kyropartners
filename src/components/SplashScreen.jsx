import React, { useRef, useEffect, useState } from 'react'

const BASE_RADIUS = 200
const N_PARTICLES = 500

export default function SplashScreen({ onEnter }) {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({
    t         : 0,
    mouse     : { x: -9999, y: -9999 },
    hovered   : false,
    hoverAmt  : 0,      // 0–1 lerped
    dispersing: false,
    dispParticles: [],
    dispStart : 0,
  })
  const wrapRef    = useRef(null)
  const [opacity, setOpacity] = useState(1)
  const [fading,  setFading]  = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let   rafId

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── grain canvas (offscreen) ──────────────────────────────
    const grainCanvas  = document.createElement('canvas')
    const grainCtx     = grainCanvas.getContext('2d')
    let   grainFrame   = 0
    const rebuildGrain = () => {
      grainCanvas.width  = canvas.width
      grainCanvas.height = canvas.height
      const id = grainCtx.createImageData(canvas.width, canvas.height)
      const d  = id.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 22 | 0
        d[i] = d[i+1] = d[i+2] = v; d[i+3] = v
      }
      grainCtx.putImageData(id, 0, 0)
    }
    rebuildGrain()

    // ── particle color by angle ───────────────────────────────
    function particleColor(angle, alpha = 1) {
      const t = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const p = t / (Math.PI * 2)
      let r, g, b
      if (p < 0.33) {
        const f = p / 0.33
        r = Math.round(51  + f * (170 - 51))
        g = Math.round(68  + f * (34  - 68))
        b = Math.round(255 + f * (255 - 255))
      } else if (p < 0.66) {
        const f = (p - 0.33) / 0.33
        r = Math.round(170 + f * (255 - 170))
        g = Math.round(34  + f * (34  - 34))
        b = Math.round(255 + f * (204 - 255))
      } else {
        const f = (p - 0.66) / 0.34
        r = Math.round(255 + f * (51  - 255))
        g = Math.round(34  + f * (68  - 34))
        b = Math.round(204 + f * (255 - 204))
      }
      return `rgba(${r},${g},${b},${alpha})`
    }

    // ── draw frame ────────────────────────────────────────────
    function draw() {
      const s  = stateRef.current
      const W  = canvas.width
      const H  = canvas.height
      const cx = W / 2
      const cy = H / 2

      // black bg
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      // ── hover lerp ────────────────────────────────────────
      const dx   = s.mouse.x - cx
      const dy   = s.mouse.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const hoverTarget = dist < BASE_RADIUS + 80 ? 1 : 0
      s.hoverAmt += (hoverTarget - s.hoverAmt) * 0.06
      const amp = 1 + s.hoverAmt * 0.35

      if (!s.dispersing) {
        // ── waveform ring (two passes for mesh depth) ─────────
        for (let pass = 0; pass < 2; pass++) {
          const phaseShift = pass * 0.9
          const alphaBase  = pass === 0 ? 0.88 : 0.32
          const sizeBase   = pass === 0 ? 1.2  : 0.75

          for (let i = 0; i < N_PARTICLES; i++) {
            const angle = (i / N_PARTICLES) * Math.PI * 2

            const displacement =
              Math.sin(angle * 3 + s.t * 0.8  + phaseShift) * 22 * amp +
              Math.sin(angle * 5 - s.t * 1.1  + phaseShift) * 14 * amp +
              Math.sin(angle * 7 + s.t * 0.5  + phaseShift) * 8  * amp +
              Math.sin(angle * 2 + s.t * 1.4  + phaseShift) * 18 * amp

            const r  = BASE_RADIUS + displacement
            const px = cx + Math.cos(angle) * r
            const py = cy + Math.sin(angle) * r

            const dispMag  = Math.abs(displacement) / (22 + 14 + 8 + 18)
            const alpha    = (alphaBase * 0.5 + dispMag * alphaBase) * (1 + s.hoverAmt * 0.3)
            const pSize    = sizeBase + dispMag * 1.0 + s.hoverAmt * 0.3

            ctx.beginPath()
            ctx.arc(px, py, pSize, 0, Math.PI * 2)
            ctx.fillStyle = particleColor(angle, Math.min(1, alpha))
            ctx.shadowBlur  = pass === 0 ? 6 + s.hoverAmt * 8 : 0
            ctx.shadowColor = particleColor(angle, 0.5)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }

        // ── outer glow ring ───────────────────────────────────
        const ringGrad = ctx.createConicGradient
          ? (() => {
              const g = ctx.createConicGradient(-Math.PI / 2, cx, cy)
              g.addColorStop(0,    'rgba(51,68,255,0.85)')
              g.addColorStop(0.25, 'rgba(120,30,255,0.85)')
              g.addColorStop(0.5,  'rgba(200,30,220,0.85)')
              g.addColorStop(0.75, 'rgba(160,40,255,0.85)')
              g.addColorStop(1,    'rgba(51,68,255,0.85)')
              return g
            })()
          : 'rgba(140,60,255,0.8)'

        ctx.beginPath()
        ctx.arc(cx, cy, BASE_RADIUS, 0, Math.PI * 2)
        ctx.strokeStyle = ringGrad
        ctx.lineWidth   = 1
        ctx.shadowBlur  = 30 + s.hoverAmt * 20
        ctx.shadowColor = 'rgba(140,60,255,0.9)'
        ctx.stroke()
        ctx.shadowBlur  = 0

      } else {
        // ── dispersion particles ──────────────────────────────
        const elapsed = (performance.now() - s.dispStart) / 1000
        let   alive   = false

        s.dispParticles.forEach(p => {
          if (p.life <= 0) return
          p.life -= 1
          p.x    += p.vx
          p.y    += p.vy
          p.vx   *= 0.97
          p.vy   *= 0.97
          alive   = true

          const a = (p.life / p.maxLife) * p.alpha
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2)
          ctx.fillStyle   = particleColor(p.angle, a)
          ctx.shadowBlur  = 8
          ctx.shadowColor = particleColor(p.angle, a * 0.5)
          ctx.fill()
          ctx.shadowBlur  = 0
        })
      }

      // ── grain overlay ─────────────────────────────────────
      grainFrame++
      if (grainFrame % 3 === 0) rebuildGrain()
      ctx.drawImage(grainCanvas, 0, 0)

      s.t += 0.016
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    const onMove = (e) => {
      stateRef.current.mouse = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const handleClick = (e) => {
    const canvas = canvasRef.current
    const cx = canvas.width  / 2
    const cy = canvas.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    if (Math.sqrt(dx * dx + dy * dy) > BASE_RADIUS + 20) return

    const s = stateRef.current
    if (s.dispersing) return

    // seed dispersion from current ring particles
    const particles = []
    for (let i = 0; i < 600; i++) {
      const angle = (i / 600) * Math.PI * 2
      const displacement =
        Math.sin(angle * 3 + s.t * 0.8)  * 22 +
        Math.sin(angle * 5 - s.t * 1.1)  * 14 +
        Math.sin(angle * 7 + s.t * 0.5)  * 8  +
        Math.sin(angle * 2 + s.t * 1.4)  * 18

      const r     = BASE_RADIUS + displacement
      const px    = cx + Math.cos(angle) * r
      const py    = cy + Math.sin(angle) * r
      const speed = 1.5 + Math.random() * 4.5
      const spread = (Math.random() - 0.5) * 0.6
      const outAngle = angle + spread

      particles.push({
        x: px, y: py,
        vx: Math.cos(outAngle) * speed,
        vy: Math.sin(outAngle) * speed,
        life   : 55 + Math.random() * 55 | 0,
        maxLife: 80 + Math.random() * 40 | 0,
        size   : 1 + Math.random() * 1.5,
        alpha  : 0.6 + Math.random() * 0.4,
        angle,
      })
    }
    s.dispParticles = particles
    s.dispersing    = true
    s.dispStart     = performance.now()

    // fade wrapper out
    setFading(true)
    const start = performance.now()
    const dur   = 1200
    const fade  = (now) => {
      const p  = Math.min(1, (now - start) / dur)
      setOpacity(1 - p)
      if (p < 1) requestAnimationFrame(fade)
      else onEnter()
    }
    requestAnimationFrame(fade)
  }

  return (
    <div
      ref={wrapRef}
      onClick={handleClick}
      style={{
        position     : 'fixed',
        inset        : 0,
        zIndex       : 9999,
        background   : '#000',
        cursor       : 'none',
        opacity,
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, willChange: 'contents' }}
      />

      {/* KYRO. logo top left */}
      <div style={{
        position     : 'fixed',
        top          : 0,
        left         : 0,
        right        : 0,
        height       : 56,
        display      : 'flex',
        alignItems   : 'center',
        padding      : '0 36px',
        zIndex       : 2,
        pointerEvents: 'none',
        userSelect   : 'none',
        fontFamily   : "'Space Grotesk', 'Inter', sans-serif",
        fontSize     : 17,
        fontWeight   : 300,
        letterSpacing: '0.18em',
        color        : '#fff',
      }}>
        KYRO.
      </div>

      {/* center text */}
      {!fading && (
        <div style={{
          position      : 'fixed',
          inset         : 0,
          display       : 'flex',
          flexDirection : 'column',
          alignItems    : 'center',
          justifyContent: 'center',
          pointerEvents : 'none',
          userSelect    : 'none',
          zIndex        : 1,
        }}>
          <div style={{
            fontFamily   : "'Space Grotesk', 'Inter', sans-serif",
            fontSize     : 13,
            fontWeight   : 400,
            letterSpacing: '0.38em',
            color        : '#fff',
            textShadow   : '0 0 24px rgba(160,80,255,0.9), 0 0 48px rgba(100,40,255,0.4)',
            animation    : 'ctlPulse 2.6s ease-in-out infinite',
          }}>
            CLICK HERE TO LOAD
          </div>
          <div style={{
            marginTop : 12,
            width     : 32,
            height    : 1,
            background: 'linear-gradient(to right, transparent, rgba(160,80,255,0.7), transparent)',
          }} />
        </div>
      )}

      <style>{`
        @keyframes ctlPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
