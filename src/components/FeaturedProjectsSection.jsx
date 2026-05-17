import React, { useEffect, useRef } from 'react'
import oneBotVid        from '../assets/One-Bot-Site.mov'
import mobileStretchVid from '../assets/Mobile-Stretch-Site.mov'
import phloxVid         from '../assets/Phlox-Partners-Site.mov'
import corpStretchVid   from '../assets/Corporate-Stretch-Site.mov'

const HND  = "'Helvetica Now Display','Helvetica Neue',Helvetica,Arial,sans-serif"
const SYNE = "'Syne',sans-serif"

const projects = [
  {
    name: 'One-Bot',
    src : oneBotVid,
    desc: 'An immersive digital experience crafted for a next-generation AI learning companion designed for children. Built with cinematic 3D visuals, interactive motion systems, and a personality-first design approach, the experience was engineered to make advanced technology feel approachable, intelligent, and emotionally engaging for both kids and parents. From responsive interactions to premium visual storytelling, every detail was designed to transform a product showcase into a world users could genuinely connect with.',
  },
  {
    name: 'Mobile Stretch Therapy',
    src : mobileStretchVid,
    desc: 'A full-scale brand revision and digital transformation for a growing wellness company looking to reposition itself with a more modern, premium, and enterprise-ready identity. The project focused on redefining the company\'s visual language, refining brand perception, and rebuilding the website experience from the ground up to better reflect the professionalism and quality of the services offered. Alongside the redesign, we streamlined inquiry and data collection workflows to create a cleaner user journey, stronger conversion flow, and a scalable digital foundation built for long-term growth.',
  },
  {
    name: 'Phlox Partners',
    src : phloxVid,
    desc: 'A strategic brand revision and website redesign focused on clarity, structure, and refined simplicity. The goal was to transform the company\'s digital presence into something more organized, intentional, and professionally aligned with the caliber of work and partnerships the brand represents. Through cleaner visual systems, streamlined information architecture, and a more cohesive user experience, the platform was rebuilt to feel modern, focused, and effortlessly navigable while maintaining a premium and understated aesthetic.',
  },
  {
    name: 'Corporate Stretch',
    src : corpStretchVid,
    desc: 'A complete brand and digital repositioning for a wellness company evolving from a traditional consumer-focused service into a more enterprise-ready corporate wellness brand. The project centered around transforming an outdated early-2000s web presence into a modern, credible, and professionally structured platform capable of resonating with corporate clients, offices, and larger organizational partnerships. Through a refined visual identity, cleaner user experience, and elevated brand presentation, the new experience was designed to build trust, communicate legitimacy, and position the company for long-term growth within the corporate wellness space.',
  },
]

/* ── Video visual ── */
function VideoVisual({ src }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const tryPlay = () => video.play().catch(() => {})

    // Mobile / tablet (≤1024px): just play immediately and leave it running —
    // no IntersectionObserver pausing so all videos play regardless of scroll
    if (window.innerWidth <= 1024) {
      tryPlay()
      return
    }

    // Desktop: pause when card scrolls fully off screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryPlay()
        } else {
          video.pause()
          video.currentTime = 0
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      style={{ width:'100%', height:'100%', objectFit:'contain', display:'block', background:'#000' }}
    />
  )
}

/* ── Card ── */
function ProjectCard({ project, zIndex, top, sticky = true }) {
  return (
    <div className="fp-card" style={{
      position  : sticky ? 'sticky' : 'relative',
      top       : sticky ? top : undefined,
      height    : '56vh',
      display   : 'grid',
      gridTemplateColumns: '62% 38%',
      border    : '1px solid rgba(255,255,255,0.08)',
      background: '#000',
      zIndex,
      overflow  : 'hidden',
      borderRadius: 4,
    }}>
      {/* LEFT — video */}
      <div style={{ position:'relative', overflow:'hidden', height:'100%', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <VideoVisual src={project.src} />
      </div>

      {/* RIGHT — info */}
      <div style={{
        display       : 'flex',
        flexDirection : 'column',
        justifyContent: 'center',
        gap           : 20,
        padding       : '36px 48px',
        background    : '#000',
        borderLeft    : '1px solid rgba(255,255,255,0.08)',
        height        : '100%',
        boxSizing     : 'border-box',
        overflow      : 'hidden',
      }}>
        <h3 style={{
          fontFamily   : HND,
          fontSize     : 'clamp(22px, 2vw, 30px)',
          fontWeight   : 700,
          color        : '#fff',
          margin       : 0,
          letterSpacing: '-0.02em',
          lineHeight   : 1,
          whiteSpace   : 'nowrap',
          overflow     : 'hidden',
          textOverflow : 'ellipsis',
        }}>{project.name}</h3>

        <p style={{
          fontFamily: SYNE,
          fontSize  : 'clamp(13px, 1vw, 15px)',
          fontWeight: 400,
          lineHeight: 1.8,
          color     : 'rgba(255,255,255,0.78)',
          margin    : 0,
          overflow  : 'hidden',
        }}>{project.desc}</p>
      </div>
    </div>
  )
}

/* ── Section ── */
export default function FeaturedProjectsSection() {
  const labelRef = useRef(null)
  const headRef  = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('fp-visible')
      }),
      { threshold: 0.08 }
    )
    ;[labelRef.current, headRef.current].filter(Boolean).forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* sticky top = nav (56px) + header height (~158px) */
  const CARD_TOP = 'calc(56px + 158px)'

  /*
    Cards 1–3 are sticky (stack/cover each other as you scroll).
    Card 4 is position:relative — slides in over card 3 naturally
    then flows straight into the next section with no sticky floor.
    Card 1  : 56vh  (sticky, DOM pos 0)
    Card 2  : 56vh  (sticky, DOM pos 56vh)
    Card 3  : 56vh  (sticky, DOM pos 112vh)
    Card 4  : 56vh  (relative, DOM pos 168vh)
    Total   : 224vh — no tail, no floor
  */

  return (
    <section id="featured-projects" style={{ background:'#000', position:'relative', pointerEvents:'auto' }}>

      <style>{`
        .fp-slide {
          opacity  : 0;
          transform: translateX(-50px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1),
                      transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .fp-slide.fp-visible { opacity:1; transform:translateX(0); }

        @media (max-width: 767px) {
          /* disable sticky stacking on mobile — just scroll naturally */
          .fp-stack  { padding: 0 16px !important; height: auto !important; }
          .fp-header { padding: 20px 20px 16px !important; position: relative !important; top: auto !important; }
          .fp-card   {
            position: relative !important;
            top: auto !important;
            grid-template-columns: 1fr !important;
            height: auto !important;
            margin-bottom: 16px;
          }
          .fp-card > div:first-child { height: 56vw !important; }
          .fp-card > div:last-child  {
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding: 20px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .fp-header { padding: 20px 32px 16px !important; }
          .fp-card   { height: 52vh !important; }
          .fp-card > div:last-child { padding: 24px 28px !important; }
        }
      `}</style>

      {/* ── Sticky header ── */}
      <div className="fp-header" style={{
        position    : 'sticky',
        top         : 56,
        zIndex      : 30,
        background  : '#000',
        padding     : '24px 64px 20px',
        boxShadow   : '0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <div ref={labelRef} className="fp-slide" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:28, height:1, background:'#FF6B9D' }}/>
          <span style={{ fontFamily:SYNE, fontSize:10, fontWeight:600, letterSpacing:'0.35em', color:'#FF6B9D' }}>
            OUR WORKS
          </span>
        </div>
        <h2 ref={headRef} className="fp-slide" style={{
          fontFamily  : HND,
          fontSize    : 'clamp(36px, 5vw, 72px)',
          fontWeight  : 700,
          color       : '#fff',
          margin      : 0,
          letterSpacing: '-0.03em',
          lineHeight  : 1,
        }}>Featured Projects</h2>
      </div>

      {/* ── Card stack ── */}
      <div className="fp-stack" style={{ position:'relative', padding:'0 64px', boxSizing:'border-box', height:'224vh', zIndex:0 }}>

        <ProjectCard project={projects[0]} zIndex={1} top={CARD_TOP} />
        <ProjectCard project={projects[1]} zIndex={2} top={CARD_TOP} />
        <ProjectCard project={projects[2]} zIndex={3} top={CARD_TOP} />
        <ProjectCard project={projects[3]} zIndex={4} top={CARD_TOP} />

      </div>

    </section>
  )
}
