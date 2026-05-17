import React, { useEffect, useRef, useState } from 'react'

const values = [
  {
    num  : '01',
    title: 'Precision First',
    body : 'One thing done perfectly beats five things done adequately. Every decision is intentional.',
    accent: '#7B2FFF',
    icon : (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B2FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    num  : '02',
    title: 'Growth-Oriented',
    body : "A site that doesn't grow your business is just a bill. Every decision ties to your results.",
    accent: '#4ECDC4',
    icon : (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    num  : '03',
    title: 'Honest Partnership',
    body : "We'll tell you if something won't work. No jargon. No upsells you don't need.",
    accent: '#FF6B9D',
    icon : (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B9D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    num  : '04',
    title: 'Relentless Speed',
    body : "Fast doesn't mean sloppy. We respect your timeline without cutting corners.",
    accent: '#FFD93D',
    icon : (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD93D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
]

export default function WhoWeAreSection() {
  const sectionRef = useRef(null)
  const labelRef   = useRef(null)
  const headRef    = useRef(null)
  const textRef    = useRef(null)
  const cardsRef   = useRef([])
  const [hov, setHov] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('ww-visible')
      }),
      { threshold: 0.08 }
    )
    ;[labelRef.current, headRef.current, textRef.current, ...cardsRef.current]
      .filter(Boolean)
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="who-we-are"
      ref={sectionRef}
      className="ww-section"
      style={{
        position : 'relative',
        background: '#000',
        minHeight: '100vh',
        pointerEvents: 'auto',
        padding  : '120px 64px 120px',
        overflow : 'hidden',
      }}
    >
      {/* background orbs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{
          position:'absolute', bottom:'-20%', right:'-10%',
          width:'55vw', height:'55vw',
          background:'radial-gradient(circle, rgba(123,47,255,0.14) 0%, transparent 65%)',
          filter:'blur(80px)',
        }}/>
        <div style={{
          position:'absolute', top:'10%', left:'-5%',
          width:'30vw', height:'30vw',
          background:'radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 70%)',
          filter:'blur(60px)',
        }}/>
      </div>

      <div style={{ maxWidth:1200, position:'relative', zIndex:1 }}>

        {/* label */}
        <div ref={labelRef} className="ww-slide" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
          <div style={{ width:28, height:1, background:'#FFD93D' }}/>
          <span style={{
            fontFamily   : "'Syne', sans-serif",
            fontSize     : 10, fontWeight:600,
            letterSpacing: '0.35em', color:'#FFD93D',
          }}>OUR CRAFT</span>
        </div>

        {/* headline */}
        <h2
          ref={headRef}
          className="ww-slide"
          style={{
            fontFamily   : "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif",
            fontSize     : 'clamp(48px, 7.5vw, 112px)',
            fontWeight   : 700,
            lineHeight   : 0.95,
            color        : '#fff',
            margin       : 0,
            marginBottom : 52,
            letterSpacing: '-0.025em',
            animationDelay: '0.05s',
          }}
        >
          Designed to perform.<br/>
          Obsessed with craft.
        </h2>

        {/* body text */}
        <div
          ref={textRef}
          className="ww-slide ww-text-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            marginBottom: 80,
            animationDelay: '0.1s',
          }}
        >
          {[
            "Most businesses don't have a visibility problem. They have a perception problem. The quality is there. The work is real. But the website tells a different story, and customers make their decision in the first three seconds. Kyro was built around one conviction: design isn't decoration, it's leverage. A well-built website doesn't just look good. It earns trust, drives action, and compounds over time.",
            "The businesses that understand this grow faster than the ones that don't. We build for businesses that are serious about growth and serious about craft. Wherever you are, whatever you do — if you're ready to have a website that actually works for you, that's what we do.",
          ].map((t, i) => (
            <p key={i} style={{
              fontFamily: "'Syne', sans-serif",
              fontSize  : 'clamp(13px, 1.1vw, 16px)',
              fontWeight: 400,
              lineHeight: 1.85,
              color     : 'rgba(255,255,255,0.72)',
              margin    : 0,
            }}>{t}</p>
          ))}
        </div>

        {/* value cards */}
        <div className="ww-cards" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16 }}>
          {values.map((v, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className="ww-slide"
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(-1)}
              style={{
                borderRadius: 18,
                padding     : '32px 24px 28px',
                display     : 'flex',
                flexDirection: 'column',
                gap         : 16,
                background  : hov === i
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.03) 65%, rgba(255,255,255,0.09) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.02) 65%, rgba(255,255,255,0.06) 100%)',
                border      : `1px solid ${hov === i ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.09)'}`,
                boxShadow   : hov === i
                  ? `0 8px 24px rgba(0,0,0,0.32), 0 24px 48px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.26), inset 0 -1px 0 rgba(0,0,0,0.12)`
                  : `0 4px 16px rgba(0,0,0,0.3), 0 16px 36px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.08)`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition  : 'all 0.35s ease',
                cursor      : 'none',
                animationDelay: `${0.14 + i * 0.08}s`,
              }}
            >
              {/* icon + number */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                {v.icon}
                <span style={{
                  fontFamily:'Syne, sans-serif', fontSize:10, fontWeight:600,
                  letterSpacing:'0.18em', color:'rgba(255,255,255,0.2)',
                }}>{v.num}</span>
              </div>

              <div>
                <div style={{
                  fontFamily  : "'Syne', sans-serif",
                  fontSize    : 15, fontWeight:700,
                  color       : '#fff', marginBottom:10,
                  letterSpacing: '-0.01em',
                }}>{v.title}</div>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize  : 13, fontWeight:400,
                  lineHeight: 1.7,
                  color     : 'rgba(255,255,255,0.72)',
                }}>{v.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ww-slide {
          opacity  : 0;
          transform: translateX(-50px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1),
                      transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .ww-slide.ww-visible { opacity:1; transform:translateX(0); }
        @media (max-width: 767px) {
          .ww-section   { padding: 80px 24px !important; }
          .ww-text-grid { grid-template-columns: 1fr !important; gap: 24px !important; margin-bottom: 48px !important; }
          .ww-cards     { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .ww-section   { padding: 100px 40px !important; }
          .ww-text-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .ww-cards     { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
