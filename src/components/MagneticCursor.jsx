import React, { useEffect, useRef } from 'react'

export default function MagneticCursor() {
  const dotRef  = useRef()
  const ringRef = useRef()
  const pos     = useRef({ x: -100, y: -100 })
  const ring    = useRef({ x: -100, y: -100 })
  const hovered = useRef(false)
  const raf     = useRef()

  useEffect(() => {
    const onMove = e => { pos.current = { x: e.clientX, y: e.clientY } }

    const onEnter = e => {
      if (e.target.closest('button, a, [data-magnetic]')) {
        hovered.current = true
      }
    }
    const onLeave = e => {
      if (e.target.closest('button, a, [data-magnetic]')) {
        hovered.current = false
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onEnter)
    window.addEventListener('mouseout',  onLeave)

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12)
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12)

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`
      }
      if (ringRef.current) {
        const scale = hovered.current ? 2.2 : 1
        ringRef.current.style.transform =
          `translate(${ring.current.x - 18}px, ${ring.current.y - 18}px) scale(${scale})`
        ringRef.current.style.borderColor = hovered.current
          ? 'rgba(123,47,255,0.9)'
          : 'rgba(255,255,255,0.35)'
        ringRef.current.style.background = hovered.current
          ? 'rgba(123,47,255,0.08)'
          : 'transparent'
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onEnter)
      window.removeEventListener('mouseout',  onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      {/* Dot — snaps instantly to cursor */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 8, height: 8,
        borderRadius: '50%',
        background: '#7B2FFF',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
        mixBlendMode: 'screen',
      }} />
      {/* Ring — lags behind with lerp */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 36, height: 36,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.35)',
        pointerEvents: 'none',
        zIndex: 9998,
        willChange: 'transform',
        transition: 'border-color 0.3s, background 0.3s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </>
  )
}
