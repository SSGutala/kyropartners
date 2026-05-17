import React, { useState, useEffect, useRef } from 'react'

const FONT = "'Space Grotesk', 'Inter', sans-serif"

const links = ['About', 'Services', 'Projects', 'Work With Us']
const idMap  = {
  'About'       : 'about',
  'Services'    : 'services',
  'Projects'    : 'featured-projects',
  'Work With Us': 'work-with-us',
}

export default function NavOverlay() {
  const [hovered,   setHovered]   = useState(null)
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const scrolledRef = useRef(false)

  useEffect(() => {
    const initial = window.scrollY > 40
    scrolledRef.current = initial
    setScrolled(initial)
    const onScroll = () => {
      const s = window.scrollY > 40
      if (s !== scrolledRef.current) { scrolledRef.current = s; setScrolled(s) }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (label) => {
    const el = document.getElementById(idMap[label])
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <style>{`
        .nav-bar {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000;
          display: flex; align-items: center;
          padding: 0 36px;
          height: 56px;
          font-family: ${FONT};
          user-select: none;
          transition: background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
        }
        .nav-logo {
          font-size: 17px; font-weight: 300; color: #fff;
          letter-spacing: 0.18em; margin-right: 56px;
          cursor: none; flex-shrink: 0;
        }
        .nav-links {
          display: flex; gap: 36px; align-items: center; flex: 1;
        }
        .nav-link {
          font-size: 13px; color: rgba(255,255,255,0.72);
          text-decoration: none;
          letter-spacing: 0.08em;
          transition: color 0.2s;
          font-weight: 400;
          background: none; border: none; padding: 0;
          font-family: ${FONT};
          white-space: nowrap;
        }
        .nav-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          background: none; border: none; padding: 8px;
          cursor: auto;
          z-index: 1002;
        }
        .nav-hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: #fff;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .nav-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity: 0; }
        .nav-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile full-screen menu */
        .nav-mobile-menu {
          position: fixed; inset: 0;
          z-index: 1001;
          background: rgba(2,2,2,0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .nav-mobile-menu.open {
          opacity: 1;
          pointer-events: auto;
        }
        .nav-mobile-link {
          font-family: ${FONT};
          font-size: clamp(28px, 8vw, 48px);
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          background: none; border: none;
          padding: 20px 0;
          transition: color 0.2s;
          cursor: auto;
        }
        .nav-mobile-link:active { color: #fff; }

        @media (max-width: 767px) {
          .nav-bar { padding: 0 20px; }
          .nav-logo { margin-right: 0; font-size: 15px; }
          .nav-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .nav-bar { padding: 0 28px; }
          .nav-logo { margin-right: 32px; }
          .nav-links { gap: 24px; }
          .nav-link { font-size: 12px; }
        }
      `}</style>

      {/* Mobile full-screen menu */}
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        {/* Close button — top left */}
        <button
          onClick={() => setMenuOpen(false)}
          style={{
            position    : 'absolute',
            top         : 20,
            left        : 20,
            background  : 'none',
            border      : 'none',
            color       : 'rgba(255,255,255,0.6)',
            fontSize    : 28,
            lineHeight  : 1,
            padding     : 8,
            cursor      : 'auto',
            transition  : 'color 0.2s',
          }}
          onTouchStart={e => e.currentTarget.style.color = '#fff'}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          aria-label="Close menu"
        >
          ✕
        </button>

        {links.map(label => (
          <button key={label} className="nav-mobile-link" onClick={() => scrollTo(label)}>
            {label}
          </button>
        ))}
      </div>

      <nav
        className="nav-bar"
        style={{
          background: scrolled ? 'rgba(0,0,0,0.92)' : 'linear-gradient(to bottom, rgba(2,2,2,0.7), transparent)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <span
          className="nav-logo"
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false) }}
        >
          KYRO.
        </span>

        <div className="nav-links">
          {links.map(label => (
            <button
              key={label}
              className="nav-link"
              style={{ color: hovered === label ? '#fff' : 'rgba(255,255,255,0.72)' }}
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => scrollTo(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className={`nav-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>
    </>
  )
}
