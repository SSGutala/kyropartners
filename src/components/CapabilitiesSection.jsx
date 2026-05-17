import React, { useEffect, useRef, useState } from 'react'

const HND  = "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif"
const SYNE = "'Syne',sans-serif"

const words = [
  {
    text    : 'unforgettable',
    gradient: 'linear-gradient(135deg, #7B2FFF 0%, #3B0DB0 45%, #1E90FF 100%)',
    glow    : 'rgba(123,47,255,0.35)',
  },
  {
    text    : 'iconic',
    gradient: 'linear-gradient(135deg, #DC143C 0%, #FF1493 55%, #FF00FF 100%)',
    glow    : 'rgba(220,20,60,0.35)',
  },
  {
    text    : 'extraordinary',
    gradient: 'linear-gradient(135deg, #00E5FF 0%, #00897B 50%, #00C853 100%)',
    glow    : 'rgba(0,229,255,0.30)',
  },
  {
    text    : 'cinematic',
    gradient: 'linear-gradient(135deg, #FFB300 0%, #FF6F00 55%, #F9A825 100%)',
    glow    : 'rgba(255,179,0,0.30)',
  },
  {
    text    : 'immersive',
    gradient: 'linear-gradient(135deg, #AA00FF 0%, #1565C0 50%, #00BCD4 100%)',
    glow    : 'rgba(170,0,255,0.30)',
  },
]

const caps = [
  {
    title: 'Custom Digital Experiences',
    body : 'Every project is built from the ground up around your goals. Whether you want a refined minimalist presence, cinematic motion, immersive 3D environments, or advanced interactive storytelling, we build experiences tailored entirely to your vision.',
    tags : ['Custom Dev', '3D & Motion', 'Interactive Design', 'Performance Engineering'],
  },
  {
    title: 'Brand Evolution',
    body : 'A strong digital experience starts with a strong identity. From modern refreshes to complete visual transformations, we help brands evolve into something sharper, more cohesive, and impossible to overlook.',
    tags : ['Brand Refresh', 'Visual Identity', 'Creative Direction', 'Digital Presence'],
  },
  {
    title: 'Precision Interaction Design',
    body : 'The smallest interactions shape the entire experience. We craft motion, transitions, hover states, and interface behavior with intention so every interaction feels fluid, elevated, and memorable.',
    tags : ['Motion Systems', 'UI/UX Design', 'Interaction Design', 'Conversion Focused'],
  },
  {
    title: 'End-to-End Execution',
    body : 'From concept to launch, every layer is handled in-house. Strategy, design, development, animation, optimization, and deployment all engineered into one seamless digital experience.',
    tags : ['Full Site Builds', 'Strategy & Direction', 'Deployment', 'Optimization'],
  },
]

/* ── Animated word cycling ──────────────────────────────────── */
function AnimatedWord() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState(null)
  const [key, setKey]         = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(c => {
        setPrev(c)
        setKey(k => k + 1)
        return (c + 1) % words.length
      })
    }, 2400)
    return () => clearInterval(id)
  }, [])

  const fs = 'clamp(32px, 5vw, 80px)'

  const gradientStyle = (idx) => ({
    background            : words[idx].gradient,
    WebkitBackgroundClip  : 'text',
    WebkitTextFillColor   : 'transparent',
    backgroundClip        : 'text',
    fontFamily            : HND,
    fontSize              : fs,
    fontWeight            : 700,
    letterSpacing         : '-0.03em',
    lineHeight            : 1.4,
    display               : 'block',
    whiteSpace            : 'nowrap',
    willChange            : 'transform, opacity',
    filter                : `drop-shadow(0 0 20px ${words[idx].glow})`,
  })

  return (
    <>
      <style>{`
        @keyframes capWordExit {
          0%   { transform: translateY(0%);    opacity: 1; }
          100% { transform: translateY(-115%); opacity: 0; }
        }
        @keyframes capWordEnter {
          0%   { transform: translateY(115%);  opacity: 0; }
          100% { transform: translateY(0%);    opacity: 1; }
        }
      `}</style>

      {/*
        Container sized by the longest word (invisible sizer in normal flow).
        Overflow hidden masks slide-in / slide-out.
        Absolutely positioned words animate vertically inside it.
      */}
      <span style={{
        display       : 'inline-block',
        position      : 'relative',
        overflow      : 'hidden',
        verticalAlign : 'middle',
        /* height is set by the sizer below */
      }}>
        {/* Invisible sizer — keeps container wide enough for any word */}
        <span style={{
          visibility  : 'hidden',
          display     : 'block',
          fontFamily  : HND,
          fontSize    : fs,
          fontWeight  : 700,
          letterSpacing: '-0.03em',
          lineHeight  : 1.4,
          whiteSpace  : 'nowrap',
          paddingRight: '0.06em', /* room for glow filter overflow */
        }}>
          extraordinary
        </span>

        {/* Exiting word */}
        {prev !== null && (
          <span
            key={`exit-${key}`}
            style={{
              ...gradientStyle(prev),
              position : 'absolute',
              top      : 0,
              left     : 0,
              animation: 'capWordExit 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          />
        )}

        {/* Entering word */}
        <span
          key={`enter-${key}`}
          style={{
            ...gradientStyle(current),
            position : 'absolute',
            top      : 0,
            left     : 0,
            animation: prev === null
              ? 'none'
              : 'capWordEnter 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            /* On first render (no prev) sit statically at position */
            transform: prev === null ? 'translateY(0%)' : undefined,
            opacity  : prev === null ? 1 : undefined,
          }}
        >
          {words[current].text}
        </span>
      </span>
    </>
  )
}

/* ── Section ────────────────────────────────────────────────── */
export default function CapabilitiesSection() {
  const colsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('cap-visible')
      }),
      { threshold: 0.08 }
    )
    colsRef.current.filter(Boolean).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="cap-section" style={{
      position  : 'relative',
      background: '#000',
      minHeight : '100vh',
      pointerEvents: 'auto',
      overflow  : 'hidden',
    }}>

      {/* subtle ambient orb */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position  : 'absolute', top: '15%', right: '-8%',
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(123,47,255,0.07) 0%, transparent 70%)',
          filter    : 'blur(80px)',
        }}/>
      </div>

      {/* ── Animated heading ── */}
      <div className="cap-head" style={{
        position       : 'relative',
        zIndex         : 1,
        minHeight      : '40vh',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
        padding        : '80px 48px 48px',
        textAlign      : 'center',
      }}>
        <div style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            fontFamily   : HND,
            fontSize     : 'clamp(32px, 5vw, 80px)',
            fontWeight   : 700,
            color        : '#fff',
            letterSpacing: '-0.03em',
            lineHeight   : 1.4,
            display      : 'inline-block',
          }}>
            We are here to build the&nbsp;
          </span>
          <AnimatedWord />
        </div>
      </div>

      {/* ── Capabilities grid ── */}
      <div className="cap-body" style={{
        position : 'relative',
        zIndex   : 1,
        padding  : '0 64px 100px',
        maxWidth : 1200,
        margin   : '0 auto',
      }}>
        <div className="cap-grid" style={{
          display            : 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap                : 48,
          borderTop          : '1px solid rgba(255,255,255,0.1)',
          paddingTop         : 40,
        }}>
          {caps.map((c, i) => (
            <div
              key={i}
              ref={el => colsRef.current[i] = el}
              className="cap-up"
              style={{
                animationDelay : `${0.10 + i * 0.08}s`,
                display        : 'flex',
                flexDirection  : 'column',
              }}
            >
              {/* Fixed-height title area — 2 lines tall so all cards align */}
              <h4 style={{
                fontFamily  : SYNE,
                fontSize    : 16,
                fontWeight  : 700,
                lineHeight  : 1.4,
                color       : '#fff',
                margin      : 0,
                marginBottom: 16,
                letterSpacing: '-0.01em',
                minHeight   : 'calc(16px * 1.4 * 2)', /* 2-line reserve */
              }}>{c.title}</h4>

              {/* flex:1 pushes tags to the bottom regardless of body length */}
              <p style={{
                fontFamily : SYNE,
                fontSize   : 14,
                fontWeight : 400,
                lineHeight : 1.85,
                color      : 'rgba(255,255,255,0.75)',
                margin     : 0,
                marginBottom: 20,
                flex       : 1,
              }}>{c.body}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.tags.map((tag, ti) => (
                  <span key={ti} style={{
                    fontFamily   : SYNE,
                    fontSize     : 10,
                    fontWeight   : 600,
                    letterSpacing: '0.1em',
                    color        : 'rgba(255,255,255,0.70)',
                    border       : '1px solid rgba(255,255,255,0.22)',
                    borderRadius : 4,
                    padding      : '4px 10px',
                    background   : 'rgba(255,255,255,0.05)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cap-up {
          opacity  : 0;
          transform: translateY(28px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1),
                      transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .cap-up.cap-visible { opacity:1; transform:translateY(0); }
        @media (max-width: 767px) {
          .cap-section { overflow-x: hidden; }
          .cap-head { padding: 60px 24px 32px !important; min-height: auto !important; }
          .cap-head > div { white-space: normal !important; flex-wrap: wrap; justify-content: center; }
          .cap-body { padding: 0 24px 60px !important; }
          .cap-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .cap-head { padding: 60px 32px 32px !important; }
          .cap-body { padding: 0 32px 80px !important; }
          .cap-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
