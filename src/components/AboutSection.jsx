import React, { useEffect, useRef, useState } from 'react'

const metrics = [
  { value: '14d', label: 'TO YOUR\nFIRST DRAFT' },
  { value: '2',   label: 'REVISION ROUNDS,\nINCLUDED.' },
  { value: '4wk', label: 'AVERAGE\nLAUNCH TIMELINE' },
]


export default function AboutSection() {
  const cardsRef  = useRef([])
  const labelRef  = useRef(null)
  const headRef   = useRef(null)
  const subRef    = useRef(null)
  const [hov, setHov] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('k-visible')
      }),
      { threshold: 0.12 }
    )
    ;[labelRef.current, headRef.current, subRef.current, ...cardsRef.current]
      .filter(Boolean)
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="about-section" style={{
      position     : 'relative',
      minHeight    : '100vh',
      pointerEvents: 'auto',
      padding      : '130px 64px 120px',
      display      : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow     : 'hidden',
      background   : '#000',
    }}>
      {/* background orbs — needed so backdrop-filter has texture to blur */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{
          position:'absolute', top:'-10%', left:'-5%',
          width:'60vw', height:'60vw',
          background:'radial-gradient(circle, rgba(100,40,255,0.16) 0%, transparent 65%)',
          filter:'blur(60px)',
        }}/>
        <div style={{
          position:'absolute', bottom:'-10%', right:'-5%',
          width:'50vw', height:'50vw',
          background:'radial-gradient(circle, rgba(40,60,220,0.14) 0%, transparent 65%)',
          filter:'blur(60px)',
        }}/>
        <div style={{
          position:'absolute', top:'40%', left:'35%',
          width:'30vw', height:'30vw',
          background:'radial-gradient(circle, rgba(180,40,255,0.10) 0%, transparent 70%)',
          filter:'blur(80px)',
        }}/>
      </div>

      <div style={{ maxWidth:1200, position:'relative', zIndex:1 }}>

        {/* label */}
        <div ref={labelRef} className="k-fade-up" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
          <div style={{ width:28, height:1, background:'#FF6B6B' }}/>
          <span style={{
            fontFamily   : "'Syne', sans-serif",
            fontSize     : 10,
            fontWeight   : 600,
            letterSpacing: '0.35em',
            color        : '#FF6B6B',
          }}>WHO WE ARE</span>
        </div>

        <h1
          ref={headRef}
          className="k-fade-up"
          style={{
            fontFamily  : "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif",
            fontSize    : 'clamp(48px, 7.5vw, 112px)',
            fontWeight  : 700,
            lineHeight  : 0.95,
            color       : '#fff',
            margin      : 0,
            marginBottom: 28,
            letterSpacing: '-0.025em',
          }}
        >
          We Build<br/>Digital Worlds.
        </h1>

        <p
          ref={subRef}
          className="k-fade-up"
          style={{
            fontFamily  : "'Syne', sans-serif",
            fontSize    : 'clamp(14px, 1.3vw, 17px)',
            fontWeight  : 400,
            lineHeight  : 1.8,
            color       : 'rgba(255,255,255,0.72)',
            margin      : 0,
            marginBottom: 80,
            maxWidth    : 460,
            animationDelay: '0.1s',
          }}
        >
          Kyro is a next-generation design studio. Custom websites, brands, and digital
          experiences that make your competitors irrelevant. No templates, no shortcuts,
          only results.
        </p>

        {/* metric cards */}
        <div className="about-cards" style={{
          display            : 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 260px))',
          gap                : 24,
        }}>
          {metrics.map((m, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className="k-fade-up"
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(-1)}
              style={{
                borderRadius: 20,
                padding     : '44px 28px 40px',
                display     : 'flex',
                flexDirection: 'column',
                alignItems  : 'center',
                justifyContent: 'center',
                gap         : 14,
                textAlign   : 'center',
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
                animationDelay: `${0.15 + i * 0.12}s`,
              }}
            >
              <span style={{
                fontFamily  : "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif",
                fontSize    : 'clamp(52px, 5vw, 76px)',
                fontWeight  : 300,
                color       : '#fff',
                lineHeight  : 1,
                letterSpacing: '-0.03em',
              }}>
                {m.value}
              </span>
              <span style={{
                fontFamily  : "'Syne', sans-serif",
                fontSize    : 10,
                fontWeight  : 600,
                letterSpacing: '0.22em',
                color       : 'rgba(255,255,255,0.65)',
                whiteSpace  : 'pre-line',
                lineHeight  : 1.7,
              }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .k-fade-up {
          opacity  : 0;
          transform: translateY(32px);
          transition: opacity 0.95s cubic-bezier(0.16,1,0.3,1),
                      transform 0.95s cubic-bezier(0.16,1,0.3,1);
        }
        .k-fade-up.k-visible { opacity:1; transform:translateY(0); }
        @media (max-width: 767px) {
          .about-section { padding: 80px 24px 80px !important; }
          .about-cards   { grid-template-columns: 1fr !important; max-width: 100% !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .about-section { padding: 100px 40px 100px !important; }
          .about-cards   { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
