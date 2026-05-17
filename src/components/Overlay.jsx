import React, { useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import useScrollStore from '../store/useScrollStore'

// ── Letter-scramble utility ───────────────────────────────────
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
function scrambleReveal(el, finalText, { duration = 900, delay = 0 } = {}) {
  if (!el) return
  const steps = Math.ceil(duration / 35)
  let frame = 0
  let raf

  const tick = () => {
    const progress = frame / steps
    el.textContent = finalText
      .split('')
      .map((ch, i) => {
        if (ch === ' ' || ch === '\n') return ch
        if (i < progress * finalText.length) return ch
        return CHARSET[Math.floor(Math.random() * CHARSET.length)]
      })
      .join('')
    frame++
    if (frame <= steps) raf = requestAnimationFrame(tick)
    else el.textContent = finalText
  }

  if (delay > 0) setTimeout(() => requestAnimationFrame(tick), delay)
  else requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

// ── Clip-path reveal word-by-word ─────────────────────────────
const wordVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i) => ({
    y: '0%',
    opacity: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 },
  }),
}

function RevealText({ text, style, delay = 0, className }) {
  const words = text.split(' ')
  return (
    <span style={{ display: 'block', ...style }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.25em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={wordVariants}
            custom={i + delay / 0.08}
            initial="hidden"
            animate="visible"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export default function Overlay() {
  const eyebrowRef  = useRef()
  const scrollRef   = useRef()
  const progressRef = useRef()
  const phaseLblRef = useRef()
  const ctaRef      = useRef()
  const ctaHeadRef  = useRef()
  const ctaRevealed = useRef(false)

  // Framer motion values driven by scroll (no React state updates)
  const heroOpacity   = useMotionValue(1)
  const heroX         = useMotionValue(0)

  // ── Intro scramble + eyebrow ──────────────────────────────
  useEffect(() => {
    scrambleReveal(eyebrowRef.current, 'KYRO 2.0  ·  NORTHERN VIRGINIA', { delay: 600 })
  }, [])

  // ── RAF scroll-driven updates ─────────────────────────────
  useEffect(() => {
    let prev = -1
    let raf

    const tick = () => {
      const p = useScrollStore.getState().scrollProgress
      if (p !== prev) {
        prev = p

        // Progress bar
        if (progressRef.current) {
          progressRef.current.style.width = `${p * 100}vw`
        }

        // Hero fades out + slides left 0-28%
        const heroOp = Math.max(0, 1 - (p / 0.28) * 1.8)
        heroOpacity.set(heroOp)
        heroX.set(-(p / 0.28) * 24 * Math.min(1, p * 5))

        // Scroll hint
        if (scrollRef.current) {
          const sh = p < 0.04 ? p / 0.04 : Math.max(0, 1 - (p / 0.28) * 4)
          scrollRef.current.style.opacity = sh
        }

        // Phase label 40-70%
        if (phaseLblRef.current) {
          const fadeIn  = clamp((p - 0.40) / 0.12, 0, 1)
          const fadeOut = clamp((p - 0.62) / 0.08, 0, 1)
          phaseLblRef.current.style.opacity = Math.max(0, fadeIn - fadeOut)
        }

        // CTA 85-100%
        if (ctaRef.current) {
          const ctaP = clamp((p - 0.85) / 0.15, 0, 1)
          ctaRef.current.style.opacity      = ctaP
          ctaRef.current.style.pointerEvents = ctaP > 0.3 ? 'auto' : 'none'
          if (ctaP > 0.1 && !ctaRevealed.current) {
            ctaRevealed.current = true
            scrambleReveal(ctaHeadRef.current, 'Ready to work\nwith us?', { duration: 1100 })
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 10,
      pointerEvents: 'none',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      userSelect: 'none',
    }}>

      {/* Scroll progress line */}
      <div ref={progressRef} style={{
        position: 'absolute', top: 0, left: 0,
        height: 1,
        background: 'linear-gradient(to right, #7B2FFF, #2FBFFF)',
        transformOrigin: 'left',
        zIndex: 20,
      }} />

      {/* ── Hero copy ──────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center',
          paddingLeft: 'clamp(24px, 6vw, 88px)',
          width: '52%',
          willChange: 'opacity, transform',
          opacity: heroOpacity,
          x: heroX,
        }}
      >
        <div>
          {/* Eyebrow — scramble reveal */}
          <motion.p
            ref={eyebrowRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.01 }}
            style={{
              fontSize: 10, letterSpacing: '0.42em',
              textTransform: 'uppercase', color: '#7B2FFF',
              marginBottom: 22,
              fontFamily: 'monospace',
            }}
          >&nbsp;</motion.p>

          {/* Tagline — clip-path word reveal */}
          <h1 style={{
            fontSize: 'clamp(36px, 4.2vw, 68px)',
            fontWeight: 700, lineHeight: 1.06,
            letterSpacing: '-0.025em', color: '#fff',
            margin: 0, marginBottom: 18,
            textShadow: '0 2px 40px rgba(0,0,0,0.8)',
          }}>
            <RevealText text="We Build" style={{ display: 'block' }} delay={80} />
            <RevealText text="Digital Worlds." style={{ display: 'block' }} delay={160} />
          </h1>

          {/* Sub — fade up */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(13px, 1.1vw, 16px)',
              fontWeight: 300, color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.82, maxWidth: 420,
              marginBottom: 44,
            }}
          >
            Custom websites, AI-powered tools, and digital experiences
            engineered to make your competitors irrelevant.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              pointerEvents: 'auto',
            }}
          >
            <button
              data-magnetic
              style={{
                padding: '13px 28px',
                background: '#7B2FFF', color: '#fff',
                border: 'none', borderRadius: 6,
                fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 0 32px rgba(123,47,255,0.45)',
                transition: 'opacity .2s, transform .15s, box-shadow .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity='.82'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity='1';   e.currentTarget.style.transform='translateY(0)' }}
              onClick={() => window.open('mailto:hello@kyro.partners', '_blank')}
            >SEE OUR WORK</button>

            <button
              data-magnetic
              style={{
                padding: '13px 28px',
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 6, fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color .2s, color .2s, transform .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.45)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.transform='translateY(0)' }}
              onClick={() => window.open('https://kyro.partners/book', '_blank')}
            >START A PROJECT</button>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll hint ────────────────────────────────────── */}
      <div ref={scrollRef} style={{
        position: 'absolute', bottom: 28,
        left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 7, opacity: 0,
      }}>
        <span style={{
          fontSize: 8, letterSpacing: '0.44em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
        }}>SCROLL</span>
        <div style={{
          width: 1, height: 32,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)',
          animation: 'kpulse 2s ease-in-out infinite',
        }} />
        <style>{`@keyframes kpulse{0%,100%{opacity:.25}50%{opacity:.9}}`}</style>
      </div>

      {/* ── Phase 2 mid-scroll label ────────────────────────── */}
      <div ref={phaseLblRef} style={{
        position: 'absolute',
        top: '50%', right: 'clamp(20px, 4vw, 60px)',
        transform: 'translateY(-50%)',
        textAlign: 'right',
        opacity: 0,
        pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: 9, letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: '#7B2FFF', marginBottom: 10,
          fontFamily: 'monospace',
        }}>SERVICES</p>
        <p style={{
          fontSize: 'clamp(15px, 1.8vw, 26px)',
          fontWeight: 600, color: '#fff',
          lineHeight: 1.25,
        }}>
          Web Dev<br />SEO &amp; Growth<br />App Dev
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div ref={ctaRef} style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 20px',
        opacity: 0, pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: 9, letterSpacing: '0.44em',
          textTransform: 'uppercase', color: '#7B2FFF',
          marginBottom: 20, fontFamily: 'monospace',
        }}>LET'S BUILD SOMETHING</p>
        <h2
          ref={ctaHeadRef}
          style={{
            fontSize: 'clamp(30px, 5vw, 72px)',
            fontWeight: 700, letterSpacing: '-0.03em',
            lineHeight: 1.05, marginBottom: 14,
            whiteSpace: 'pre-line',
          }}
        >Ready to work{'\n'}with us?</h2>
        <p style={{
          fontSize: 'clamp(13px, 1.2vw, 17px)',
          color: 'rgba(255,255,255,0.55)',
          marginBottom: 44,
        }}>Your competitors won't wait. Neither should you.</p>
        <div style={{
          display: 'flex', gap: 14,
          flexWrap: 'wrap', justifyContent: 'center',
          pointerEvents: 'auto',
        }}>
          <button
            data-magnetic
            style={{
              padding: '17px 44px',
              background: '#7B2FFF', color: '#fff',
              border: 'none', borderRadius: 7,
              fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 0 56px rgba(123,47,255,0.45)',
              transition: 'opacity .2s, transform .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity='.88'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1';   e.currentTarget.style.transform='translateY(0)' }}
            onClick={() => window.open('mailto:hello@kyro.partners', '_blank')}
          >START MY PROJECT BRIEF</button>
          <button
            data-magnetic
            style={{
              padding: '17px 44px',
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 7, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color .2s, color .2s, transform .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.45)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.transform='translateY(0)' }}
            onClick={() => window.open('https://kyro.partners/book', '_blank')}
          >BOOK AN INTRO CALL</button>
        </div>
      </div>

    </div>
  )
}
