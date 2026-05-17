import React, { useRef, useEffect } from 'react'

export default function FireplaceFlame() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const particles = []

    function spawnParticle() {
      const x = Math.random() * W
      particles.push({
        x,
        y: H * 0.85,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(1.2 + Math.random() * 2.2),
        life: 0,
        maxLife: 38 + Math.random() * 28,
        size: 3 + Math.random() * 5,
      })
    }

    let frame = 0
    let raf

    function tick() {
      ctx.clearRect(0, 0, W, H)

      // spawn several particles per frame
      for (let i = 0; i < 4; i++) spawnParticle()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x  += p.vx + Math.sin(frame * 0.06 + p.x * 0.08) * 0.35
        p.y  += p.vy
        p.life++

        if (p.life > p.maxLife) { particles.splice(i, 1); continue }

        const t = p.life / p.maxLife  // 0 → 1
        const alpha = Math.sin(t * Math.PI) * 0.85

        // colour: white core → orange → red → transparent
        let r, g, b
        if (t < 0.25) {
          // white-yellow core
          r = 255; g = 230; b = 160
        } else if (t < 0.55) {
          // orange
          r = 255; g = 120 - t * 80; b = 20
        } else {
          // deep red fading out
          r = 200 - t * 120; g = 30; b = 10
        }

        const size = p.size * (1 - t * 0.5)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size)
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)

        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // subtle glow base along the bottom
      const glow = ctx.createLinearGradient(0, H * 0.75, 0, H)
      glow.addColorStop(0, 'rgba(255,90,10,0.18)')
      glow.addColorStop(1, 'rgba(255,40,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, H * 0.75, W, H * 0.25)

      frame++
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={90}
      style={{
        position: 'absolute',
        // tuned to the fireplace position in the image
        left: '28.5%',
        top: '53.5%',
        width: '14%',
        height: 'auto',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  )
}
