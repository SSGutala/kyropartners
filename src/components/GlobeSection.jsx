import React, { useEffect, useRef } from 'react'

const HND  = "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif"
const SYNE = "'Syne',sans-serif"

export default function GlobeSection() {
  const sectionRef = useRef(null)
  const labelRef   = useRef(null)
  const headRef    = useRef(null)
  const subRef     = useRef(null)
  const btnRef     = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('cta-visible')
      }),
      { threshold: 0.1 }
    )
    ;[labelRef.current, headRef.current, subRef.current, btnRef.current]
      .filter(Boolean)
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="work-with-us"
      className="globe-section"
      style={{
        position    : 'relative',
        background  : '#000',
        minHeight   : '100vh',
        display     : 'flex',
        flexDirection: 'column',
        alignItems  : 'center',
        justifyContent: 'center',
        padding     : '120px 64px',
        overflow    : 'hidden',
        pointerEvents: 'auto',
        textAlign   : 'center',
      }}
    >
      {/* ambient orb */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{
          position : 'absolute', top:'20%', left:'50%', transform:'translateX(-50%)',
          width    : '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(0,180,255,0.07) 0%, transparent 65%)',
          filter   : 'blur(80px)',
        }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>

        {/* label */}
        <div
          ref={labelRef}
          className="cta-up"
          style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}
        >
          <div style={{ width:28, height:1, background:'#38BDF8' }}/>
          <span style={{
            fontFamily   : SYNE,
            fontSize     : 10,
            fontWeight   : 600,
            letterSpacing: '0.35em',
            color        : '#38BDF8',
          }}>WORK WITH US</span>
          <div style={{ width:28, height:1, background:'#38BDF8' }}/>
        </div>

        {/* heading */}
        <h2
          ref={headRef}
          className="cta-up"
          style={{
            fontFamily   : HND,
            fontSize     : 'clamp(48px, 7.5vw, 112px)',
            fontWeight   : 700,
            color        : '#fff',
            letterSpacing: '-0.03em',
            lineHeight   : 0.95,
            margin       : '0 0 28px',
            animationDelay: '0.08s',
          }}
        >
          Let's leave a mark together.
        </h2>

        {/* subtext */}
        <p
          ref={subRef}
          className="cta-up"
          style={{
            fontFamily  : SYNE,
            fontSize    : 'clamp(14px, 1.2vw, 18px)',
            fontWeight  : 400,
            color       : 'rgba(255,255,255,0.72)',
            letterSpacing: '0.04em',
            margin      : '0 0 52px',
            animationDelay: '0.16s',
          }}
        >
          Book a free discovery call.
        </p>

        {/* CTA button */}
        <a
          ref={btnRef}
          href="https://calendly.com/kyro-partners"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-up"
          style={{
            display        : 'inline-block',
            padding        : '11px 22px',
            background     : 'rgba(123,47,255,0.15)',
            border         : '1px solid rgba(123,47,255,0.5)',
            borderRadius   : 2,
            color          : '#fff',
            fontFamily     : SYNE,
            fontSize       : 11,
            fontWeight     : 400,
            letterSpacing  : '0.1em',
            textTransform  : 'uppercase',
            textDecoration : 'none',
            backdropFilter : 'blur(8px)',
            transition     : 'background 0.2s, border-color 0.2s',
            cursor         : 'none',
            animationDelay : '0.24s',
            userSelect     : 'none',
            whiteSpace     : 'nowrap',
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
          Book Intro Call
        </a>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .globe-section { padding: 80px 24px !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .globe-section { padding: 100px 40px !important; }
        }
        .cta-up {
          opacity  : 0;
          transform: translateY(24px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1),
                      transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .cta-up.cta-visible { opacity:1; transform:translateY(0); }
      `}</style>
    </section>
  )
}
