import React, { useEffect, useRef, useState } from 'react'

const services = [
  {
    num  : '01',
    title: 'Custom Website Design',
    body : 'Custom-coded from a blank canvas. Every pixel designed for your brand. No Wix, no Squarespace, no templates. Ever.',
    tags : ['CUSTOM DESIGN', 'MOBILE-FIRST', 'PERFORMANCE'],
    accent: '#7B2FFF',
  },
  {
    num  : '02',
    title: 'SEO & Local Search',
    body : 'Page one of Google for every search that matters: "near me," local intent, your exact services. Full-stack from day one.',
    tags : ['LOCAL SEO', 'GOOGLE MAPS', 'CONTENT'],
    accent: '#4ECDC4',
  },
  {
    num  : '03',
    title: 'Motion & Animation',
    body : 'Scroll-triggered reveals, parallax layers, magnetic buttons, custom cursors. Motion that makes visitors stop scrolling.',
    tags : ['SCROLL FX', 'PARALLAX', '3D TILT'],
    accent: '#FF6B9D',
  },
  {
    num  : '04',
    title: 'Custom App Design & Development',
    body : 'From concept to launch, fully custom web and mobile apps built for your workflow. Clean UI, solid architecture, no off-the-shelf shortcuts.',
    tags : ['WEB APPS', 'MOBILE APPS', 'UI/UX DESIGN'],
    accent: '#7B2FFF',
  },
  {
    num  : '05',
    title: 'Photography & Video',
    body : "Our partner team captures your brand at its best: real spaces, real product, styled to match your site's visual direction.",
    tags : ['BRAND SHOOTS', 'PRODUCT', 'REELS'],
    accent: '#4ECDC4',
  },
  {
    num  : '06',
    title: 'E-Commerce & Booking',
    body : 'Sell products, take appointments, accept payments. All wired in and working while you sleep. Revenue on autopilot.',
    tags : ['SHOPIFY', 'BOOKING', 'PAYMENTS'],
    accent: '#FF6B9D',
  },
]

export default function WhatWeDoSection() {
  const headRef  = useRef(null)
  const subRef   = useRef(null)
  const labelRef = useRef(null)
  const cardsRef = useRef([])
  const [hov, setHov] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('wd-visible')
      }),
      { threshold: 0.06 }
    )
    ;[labelRef.current, headRef.current, subRef.current, ...cardsRef.current]
      .filter(Boolean)
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" className="wd-section" style={{
      position : 'relative',
      background: '#000',
      minHeight: '100vh',
      pointerEvents: 'auto',
      padding  : '120px 64px 120px',
      overflow : 'hidden',
    }}>
      {/* background orbs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{
          position:'absolute', top:'-15%', right:'-8%',
          width:'55vw', height:'55vw',
          background:'radial-gradient(circle, rgba(123,47,255,0.14) 0%, transparent 65%)',
          filter:'blur(80px)',
        }}/>
        <div style={{
          position:'absolute', bottom:'-10%', left:'-5%',
          width:'40vw', height:'40vw',
          background:'radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 70%)',
          filter:'blur(70px)',
        }}/>
        <div style={{
          position:'absolute', top:'45%', left:'40%',
          width:'25vw', height:'25vw',
          background:'radial-gradient(circle, rgba(255,107,157,0.07) 0%, transparent 70%)',
          filter:'blur(60px)',
        }}/>
      </div>

      <div style={{ maxWidth:1200, position:'relative', zIndex:1 }}>

        {/* label */}
        <div
          ref={labelRef}
          className="wd-slide-right"
          style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}
        >
          <div style={{ width:28, height:1, background:'#4ECDC4' }}/>
          <span style={{
            fontFamily:'Syne, sans-serif', fontSize:10, fontWeight:600,
            letterSpacing:'0.35em', color:'#4ECDC4',
          }}>WHAT WE DO</span>
        </div>

        {/* headline */}
        <h2
          ref={headRef}
          className="wd-slide-right"
          style={{
            fontFamily   : "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif",
            fontSize     : 'clamp(44px, 7vw, 104px)',
            fontWeight   : 700,
            lineHeight   : 0.95,
            color        : '#fff',
            margin       : 0,
            marginBottom : 36,
            letterSpacing: '-0.025em',
            animationDelay: '0.05s',
          }}
        >
          Everything your business<br/>needs to win.
        </h2>

        {/* subtext */}
        <p
          ref={subRef}
          className="wd-slide-right"
          style={{
            fontFamily  : "'Syne', sans-serif",
            fontSize    : 'clamp(13px, 1.1vw, 16px)',
            fontWeight  : 400,
            lineHeight  : 1.8,
            color       : 'rgba(255,255,255,0.72)',
            margin      : 0,
            marginBottom: 72,
            maxWidth    : 680,
            animationDelay: '0.1s',
          }}
        >
          From the first pixel to the first customer inquiry we handle design, development,
          content, photography, and growth marketing. One team, one vision, zero guesswork.
        </p>

        {/* cards */}
        <div className="wd-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
          {services.map((s, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className="wd-slide-right"
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(-1)}
              style={{
                borderRadius: 18,
                padding     : '36px 28px 32px',
                display     : 'flex',
                flexDirection: 'column',
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
                animationDelay: `${0.14 + i * 0.07}s`,
              }}
            >
              <span style={{
                fontFamily:'Syne, sans-serif', fontSize:11, fontWeight:600,
                letterSpacing:'0.18em', color:'rgba(255,255,255,0.18)',
                marginBottom:28, display:'block',
              }}>{s.num}</span>

              <div style={{
                width:24, height:2, background:s.accent,
                borderRadius:2, marginBottom:16, opacity:0.75,
              }}/>

              <div style={{
                fontFamily:'Syne, sans-serif', fontSize:15, fontWeight:700,
                color:'#fff', marginBottom:12, letterSpacing:'-0.01em', lineHeight:1.3,
              }}>{s.title}</div>

              <div style={{
                fontFamily:'Syne, sans-serif', fontSize:13, fontWeight:400,
                lineHeight:1.75, color:'rgba(255,255,255,0.72)',
                flexGrow:1, marginBottom:24,
              }}>{s.body}</div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {s.tags.map((tag, ti) => (
                  <span key={ti} style={{
                    fontFamily:'Syne, sans-serif', fontSize:9, fontWeight:600,
                    letterSpacing:'0.15em', color:'rgba(255,255,255,0.3)',
                    border:'1px solid rgba(255,255,255,0.1)',
                    borderRadius:4, padding:'3px 8px',
                    background:'rgba(255,255,255,0.02)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .wd-slide-right {
          opacity  : 0;
          transform: translateX(60px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1),
                      transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .wd-slide-right.wd-visible { opacity:1; transform:translateX(0); }
        @media (max-width: 767px) {
          .wd-section { padding: 80px 24px !important; }
          .wd-grid    { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .wd-section { padding: 100px 40px !important; }
          .wd-grid    { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
