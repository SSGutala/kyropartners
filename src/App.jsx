import React, { useEffect, useRef, useState } from 'react'
import NavOverlay from './components/NavOverlay'
import MagneticCursor from './components/MagneticCursor'
import SplashScreen from './components/SplashScreen'
import AboutSection from './components/AboutSection'
import WhoWeAreSection from './components/WhoWeAreSection'
import WhatWeDoSection from './components/WhatWeDoSection'
import FeaturedProjectsSection from './components/FeaturedProjectsSection'
import CapabilitiesSection from './components/CapabilitiesSection'
import GlobeSection from './components/GlobeSection'
import FooterSection from './components/FooterSection'
import heroVid from './assets/hero.mp4'
import bgMusic from './assets/bgmusic.mov'

const TARGET_VOL = 0.22

export default function App() {
  const bgRef     = useRef(null)
  const audioRef  = useRef(null)
  const target    = useRef({ x: 0, y: 0 })
  const current   = useRef({ x: 0, y: 0 })
  const raf       = useRef(null)
  const fadeRaf   = useRef(null)   // rAF id for fade-in
  const fadeTimer = useRef(null)   // setInterval id for fade-out (works when tab hidden)
  const userOff   = useRef(false)  // true only when user clicks SOUND OFF
  const [soundOn, setSoundOn]   = useState(true)
  const [entered, setEntered]   = useState(false)
  const enteredRef = useRef(false)

  // ── parallax ─────────────────────────────────────────────────
  useEffect(() => {
    const onMove = e => {
      target.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.06
      current.current.y += (target.current.y - current.current.y) * 0.06
      if (bgRef.current) {
        bgRef.current.style.transform =
          `translate(${current.current.x * -28}px, ${current.current.y * -14}px) scale(1.12)`
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  // ── fade IN via rAF (tab visible, smooth 60fps) ──────────────
  function playFadeIn() {
    const audio = audioRef.current
    if (!audio) return
    clearInterval(fadeTimer.current)
    cancelAnimationFrame(fadeRaf.current)
    audio.volume = 0
    audio.play().catch(() => {})
    const step = () => {
      const diff = TARGET_VOL - audio.volume
      if (diff < 0.006) { audio.volume = TARGET_VOL; return }
      audio.volume = Math.min(TARGET_VOL, audio.volume + 0.006)
      fadeRaf.current = requestAnimationFrame(step)
    }
    fadeRaf.current = requestAnimationFrame(step)
  }

  // ── fade OUT via setInterval (works even when tab is hidden) ──
  function pauseFadeOut(cb) {
    const audio = audioRef.current
    if (!audio) return
    cancelAnimationFrame(fadeRaf.current)
    clearInterval(fadeTimer.current)
    fadeTimer.current = setInterval(() => {
      if (audio.volume <= 0.015) {
        audio.volume = 0
        audio.pause()
        clearInterval(fadeTimer.current)
        cb && cb()
      } else {
        audio.volume = Math.max(0, audio.volume - 0.018)
      }
    }, 16)
  }

  // ── triggered by splash click ─────────────────────────────────
  function handleEnter() {
    enteredRef.current = true
    setEntered(true)
    playFadeIn()
  }

  // ── page visibility — pause when hidden, resume when visible ──
  useEffect(() => {
    function onVisChange() {
      if (userOff.current || !enteredRef.current) return
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) {
        pauseFadeOut()
      } else {
        playFadeIn()
      }
    }
    document.addEventListener('visibilitychange', onVisChange)
    return () => document.removeEventListener('visibilitychange', onVisChange)
  }, [])

  // ── fade out near end of track, loop with fade-in ─────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    function onTime() {
      if (userOff.current || !enteredRef.current || !audio.duration) return
      const rem = audio.duration - audio.currentTime
      if (rem < 3 && rem > 0 && audio.volume > 0.01) {
        pauseFadeOut(() => {
          audio.currentTime = 0
          if (!userOff.current) playFadeIn()
        })
      }
    }
    audio.addEventListener('timeupdate', onTime)
    return () => audio.removeEventListener('timeupdate', onTime)
  }, [])

  // ── toggle ────────────────────────────────────────────────────
  function toggleSound() {
    if (soundOn) {
      userOff.current = true
      pauseFadeOut()
      setSoundOn(false)
    } else {
      userOff.current = false
      playFadeIn()
      setSoundOn(true)
    }
  }

  return (
    <>
      {!entered && <SplashScreen onEnter={handleEnter} />}
      <NavOverlay />
      <MagneticCursor />
      <audio ref={audioRef} src={bgMusic} loop preload="auto" />

      {/*
        ── HERO SECTION ──────────────────────────────────────────────
        No zIndex here — keeps this out of any stacking context so the
        navbar's transparent background composites correctly against it.
        overflow:hidden clips the video to this 100vh block; the hero
        scrolls away naturally as the page scrolls.
      */}
      <div style={{
        position  : 'sticky',
        top       : 0,
        height    : '100vh',
        overflow  : 'hidden',
        pointerEvents: 'none',
      }}>
        {/* ── background video ── */}
        <video
          ref={bgRef}
          src={heroVid}
          autoPlay muted loop playsInline preload="auto"
          className="hero-video"
          style={{
            position  : 'absolute',
            inset     : '-6%',
            width     : '112%',
            height    : '112%',
            objectFit : 'cover',
            willChange: 'transform',
          }}
        />

        {/* ── fade to black at hero bottom ── */}
        <div style={{
          position  : 'absolute',
          bottom    : 0, left: 0, right: 0,
          height    : '8%',
          background: 'linear-gradient(to bottom, transparent, #000)',
          pointerEvents: 'none',
        }} />

        {/* ── CTA buttons (bottom-left) ── */}
        {entered && (
          <div className="hero-cta-wrap" style={{
            position     : 'absolute',
            bottom       : 40,
            left         : 36,
            display      : 'flex',
            flexDirection: 'column',
            gap          : 12,
            fontFamily   : "'Space Grotesk', 'Inter', sans-serif",
            pointerEvents: 'auto',
          }}>
            <button
              onClick={() => document.getElementById('work-with-us')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background   : 'rgba(123,47,255,0.15)',
                border       : '1px solid rgba(123,47,255,0.5)',
                borderRadius : 2,
                padding      : '11px 22px',
                color        : '#fff',
                fontSize     : 11,
                fontWeight   : 400,
                letterSpacing: '0.1em',
                cursor       : 'none',
                backdropFilter: 'blur(8px)',
                transition   : 'background 0.2s, border-color 0.2s',
                userSelect   : 'none',
                whiteSpace   : 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'rgba(123,47,255,0.35)'
                e.currentTarget.style.borderColor = 'rgba(123,47,255,0.9)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(123,47,255,0.15)'
                e.currentTarget.style.borderColor = 'rgba(123,47,255,0.5)'
              }}
            >
              Start a Project
            </button>
            <button
              onClick={() => document.getElementById('featured-projects')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background   : 'none',
                border       : '1px solid rgba(255,255,255,0.18)',
                borderRadius : 2,
                padding      : '11px 22px',
                color        : 'rgba(255,255,255,0.6)',
                fontSize     : 11,
                fontWeight   : 400,
                letterSpacing: '0.1em',
                cursor       : 'none',
                backdropFilter: 'blur(8px)',
                transition   : 'color 0.2s, border-color 0.2s',
                userSelect   : 'none',
                whiteSpace   : 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color       = '#fff'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color       = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
              }}
            >
              See Our Work
            </button>
          </div>
        )}

        {/* ── Sound toggle (bottom-right) ── */}
        <button
          className="hero-sound-btn"
          onClick={toggleSound}
          style={{
            position     : 'absolute',
            bottom       : 28,
            right        : 36,
            background   : 'none',
            border       : 'none',
            padding      : 0,
            cursor       : 'none',
            display      : 'flex',
            alignItems   : 'center',
            gap          : 7,
            fontFamily   : "'Space Grotesk', 'Inter', sans-serif",
            fontSize     : 11,
            letterSpacing: '0.12em',
            color        : 'rgba(255,255,255,0.4)',
            transition   : 'color 0.2s',
            userSelect   : 'none',
            pointerEvents: 'auto',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {!soundOn ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </>
            )}
          </svg>
          {soundOn ? 'SOUND ON' : 'SOUND OFF'}
        </button>

        {/* ── Scroll hint (bottom-center) ── */}
        <div
          className="hero-scroll-hint"
          style={{
            position     : 'absolute',
            bottom       : 28,
            left         : '50%',
            transform    : 'translateX(-50%)',
            display      : 'flex',
            alignItems   : 'center',
            gap          : 10,
            fontFamily   : "'Space Grotesk', 'Inter', sans-serif",
            fontSize     : 11,
            color        : 'rgba(255,255,255,0.4)',
            letterSpacing: '0.12em',
            userSelect   : 'none',
            cursor       : 'none',
            pointerEvents: 'auto',
            animation    : 'sbounce 2.4s ease-in-out infinite',
            whiteSpace   : 'nowrap',
          }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          Scroll to explore <span style={{ fontSize: 13 }}>↓</span>
        </div>

        <style>{`
          @keyframes sbounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50%       { transform: translateX(-50%) translateY(5px); }
          }
          /* On mobile/tablet: no parallax mouse movement, so reset video to true full-bleed */
          @media (max-width: 1024px) {
            .hero-video {
              inset: 0 !important;
              width: 100% !important;
              height: 100% !important;
              transform: none !important;
              object-position: 75% 35%;
            }
          }
          @media (max-width: 767px) {
            .hero-cta-wrap {
              left: 20px !important;
              right: 20px !important;
              bottom: 52px !important;
            }
            .hero-cta-wrap button {
              width: 100%;
              justify-content: center;
            }
            .hero-sound-btn {
              bottom: 16px !important;
              right: 20px !important;
            }
            .hero-scroll-hint {
              display: none !important;
            }
          }
        `}</style>
      </div>

      {/*
        ── CONTENT SECTIONS ──────────────────────────────────────────
        No zIndex — paints over the hero in natural DOM order.
        background:#000 covers the hero video for every pixel below the fold.
      */}
      <div style={{
        position  : 'relative',
        background: '#000',
        pointerEvents: 'none',
      }}>
        <AboutSection />
        <WhoWeAreSection />
        <WhatWeDoSection />
        <FeaturedProjectsSection />
        <CapabilitiesSection />
        <GlobeSection />
        <FooterSection />
      </div>
    </>
  )
}
