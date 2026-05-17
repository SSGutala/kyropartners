import React from 'react'

const HND  = "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif"
const SYNE = "'Syne',sans-serif"

const navCols = [
  {
    label: 'AGENCY',
    links: ['About Us', 'Our Craft', 'Featured Projects', 'Work With Us'],
    ids  : ['about', 'who-we-are', 'featured-projects', 'work-with-us'],
  },
  {
    label: 'SERVICES',
    links: ['Custom Website Design', 'SEO & Local Search', 'Motion & Animation', 'App Development', 'E-Commerce & Booking'],
    ids  : ['services', 'services', 'services', 'services', 'services'],
  },
  {
    label: 'CONNECT',
    links: ['Book Intro Call'],
    hrefs: ['https://calendly.com/kyro-partners'],
  },
]

export default function FooterSection() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer style={{
      position  : 'relative',
      background: '#000',
      pointerEvents: 'auto',
      overflow  : 'hidden',
    }}>
      <style>{`
        @media (max-width: 767px) {
          .footer-grid   {
            grid-template-columns: 1fr !important;
            padding: 60px 24px 40px !important;
            gap: 40px !important;
          }
          .footer-bottom {
            grid-template-columns: 1fr !important;
            padding: 24px 24px !important;
            gap: 20px !important;
            text-align: center;
          }
          .footer-bottom > div:last-child { align-items: center !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .footer-grid   {
            grid-template-columns: 1fr 1fr !important;
            padding: 60px 40px 48px !important;
            gap: 40px !important;
          }
          .footer-bottom {
            padding: 24px 40px !important;
          }
        }
      `}</style>

      {/* ── top glow line ── */}
      <div style={{
        position  : 'absolute',
        top       : 0,
        left      : 0,
        right     : 0,
        height    : 1,
        background: 'linear-gradient(to right, transparent 0%, rgba(123,47,255,0.0) 10%, rgba(123,47,255,0.9) 40%, rgba(160,80,255,1) 50%, rgba(123,47,255,0.9) 60%, rgba(123,47,255,0.0) 90%, transparent 100%)',
        zIndex    : 1,
      }} />
      <div style={{
        position  : 'absolute',
        top       : 0,
        left      : '20%',
        right     : '20%',
        height    : 80,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(123,47,255,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex    : 0,
      }} />

      {/* ── main body ── */}
      <div className="footer-grid" style={{
        position: 'relative',
        zIndex  : 1,
        padding : '80px 64px 60px',
        display : 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1.4fr',
        gap     : 48,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>

        {/* ── col 1: brand ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* logo */}
          <div style={{
            fontFamily   : HND,
            fontSize     : 'clamp(48px, 5vw, 72px)',
            fontWeight   : 700,
            letterSpacing: '-0.03em',
            lineHeight   : 1,
            background   : 'linear-gradient(135deg, #7B2FFF 0%, #A855F7 50%, #38BDF8 100%)',
            WebkitBackgroundClip  : 'text',
            WebkitTextFillColor   : 'transparent',
            backgroundClip        : 'text',
            userSelect   : 'none',
          }}>
            KYRO
          </div>

          <div style={{
            fontFamily   : SYNE,
            fontSize     : 9,
            fontWeight   : 600,
            letterSpacing: '0.32em',
            color        : 'rgba(255,255,255,0.35)',
          }}>
            EXPERIENCE IS EVERYTHING
          </div>

          <p style={{
            fontFamily: SYNE,
            fontSize  : 13,
            fontWeight: 400,
            lineHeight: 1.8,
            color     : 'rgba(255,255,255,0.55)',
            margin    : 0,
            maxWidth  : 280,
          }}>
            We design and build cinematic digital experiences that push boundaries and leave lasting impressions.
          </p>

          <button
            onClick={() => scrollTo('work-with-us')}
            style={{
              display      : 'flex',
              alignItems   : 'center',
              gap          : 8,
              background   : 'none',
              border       : 'none',
              padding      : 0,
              cursor       : 'none',
              fontFamily   : SYNE,
              fontSize     : 12,
              fontWeight   : 600,
              letterSpacing: '0.12em',
              color        : '#7B2FFF',
              textTransform: 'uppercase',
              userSelect   : 'none',
              width        : 'fit-content',
              borderBottom : '1px solid rgba(123,47,255,0.4)',
              paddingBottom: 4,
              transition   : 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#A855F7'
              e.currentTarget.style.borderBottomColor = 'rgba(168,85,247,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#7B2FFF'
              e.currentTarget.style.borderBottomColor = 'rgba(123,47,255,0.4)'
            }}
          >
            Work With Us <span style={{ fontSize:14 }}>→</span>
          </button>
        </div>

        {/* ── nav columns ── */}
        {navCols.map((col) => (
          <div key={col.label} style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <div style={{
              fontFamily   : SYNE,
              fontSize     : 10,
              fontWeight   : 600,
              letterSpacing: '0.28em',
              color        : 'rgba(255,255,255,0.35)',
              marginBottom : 28,
            }}>{col.label}</div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {col.links.map((link, li) => {
                const href = col.hrefs?.[li]
                const id   = col.ids?.[li]
                return href ? (
                  <a
                    key={link}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      fontFamily  : SYNE,
                      fontSize    : 13,
                      fontWeight  : 400,
                      color       : 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      cursor      : 'none',
                      transition  : 'color 0.2s',
                      width       : 'fit-content',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >{link}</a>
                ) : (
                  <button
                    key={link}
                    onClick={() => scrollTo(id)}
                    style={{
                      fontFamily  : SYNE,
                      fontSize    : 13,
                      fontWeight  : 400,
                      color       : 'rgba(255,255,255,0.6)',
                      background  : 'none',
                      border      : 'none',
                      padding     : 0,
                      cursor      : 'none',
                      textAlign   : 'left',
                      transition  : 'color 0.2s',
                      userSelect  : 'none',
                      width       : 'fit-content',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >{link}</button>
                )
              })}
            </div>
          </div>
        ))}

        {/* ── col 5: CTA ── */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <p style={{
              fontFamily  : SYNE,
              fontSize    : 13,
              fontWeight  : 400,
              color       : '#7B2FFF',
              margin      : '0 0 16px',
              letterSpacing: '0.02em',
            }}>
              Ready to build something unforgettable?
            </p>

            <h3 style={{
              fontFamily   : HND,
              fontSize     : 'clamp(24px, 2.8vw, 40px)',
              fontWeight   : 700,
              color        : '#fff',
              margin       : '0 0 32px',
              letterSpacing: '-0.02em',
              lineHeight   : 1.05,
            }}>
              LET'S CREATE<br/>WHAT'S NEXT.
            </h3>

            <a
              href="#work-with-us"
              onClick={e => { e.preventDefault(); scrollTo('work-with-us') }}
              style={{
                display      : 'flex',
                alignItems   : 'center',
                justifyContent: 'space-between',
                padding      : '16px 24px',
                background   : 'rgba(123,47,255,0.12)',
                border       : '1px solid rgba(123,47,255,0.4)',
                borderRadius : 4,
                color        : '#fff',
                fontFamily   : SYNE,
                fontSize     : 11,
                fontWeight   : 600,
                letterSpacing: '0.18em',
                textDecoration: 'none',
                textTransform: 'uppercase',
                cursor       : 'none',
                transition   : 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(123,47,255,0.28)'
                e.currentTarget.style.borderColor = 'rgba(123,47,255,0.8)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(123,47,255,0.12)'
                e.currentTarget.style.borderColor = 'rgba(123,47,255,0.4)'
              }}
            >
              START A PROJECT <span style={{ fontSize:16 }}>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── bottom bar ── */}
      <div className="footer-bottom" style={{
        position: 'relative',
        zIndex  : 1,
        padding : '24px 64px',
        display : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily  : SYNE,
          fontSize    : 11,
          color       : 'rgba(255,255,255,0.35)',
          letterSpacing: '0.04em',
        }}>
          © 2026 KYRO. All rights reserved.
        </span>
      </div>

    </footer>
  )
}
