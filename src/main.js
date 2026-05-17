import { gsap } from 'gsap';
import { drawCaseMockup } from './devscene.js';

// ── Scroll state ──────────────────────────────────────────────
let scrollP = 0, targetP = 0;
window.addEventListener('scroll', () => {
  const max = document.body.scrollHeight - window.innerHeight;
  targetP = max > 0 ? window.scrollY / max : 0;
}, { passive: true });

// ── DOM refs ──────────────────────────────────────────────────
const sceneCanvas   = document.getElementById('scene-canvas');
const sceneCtx      = sceneCanvas.getContext('2d');
const heroCopy      = document.getElementById('hero-copy');
const scrollHint    = document.getElementById('scroll-hint');
const screenContent = document.getElementById('screen-content');
const screenInner   = document.getElementById('screen-inner');
const dimmer        = document.getElementById('dimmer');
const ctaEl         = document.getElementById('cta');

// ── Canvas resize ─────────────────────────────────────────────
function resizeCanvas() {
  sceneCanvas.width  = window.innerWidth;
  sceneCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); positionScreen(); });

// ── Frame loading ─────────────────────────────────────────────
const TOTAL_FRAMES = 80;
const frameImgs = [];

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = `/frames/${String(i).padStart(2, '0')}.png`;
  frameImgs.push(img);
}

function drawFrame(p) {
  const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
  const img = frameImgs[idx];
  if (!img?.complete || !img.naturalWidth) {
    sceneCtx.fillStyle = '#000';
    sceneCtx.fillRect(0, 0, sceneCanvas.width, sceneCanvas.height);
    return;
  }
  const W = sceneCanvas.width, H = sceneCanvas.height;
  // cover: crop to fill canvas, maintaining aspect ratio
  const ar  = img.naturalWidth / img.naturalHeight;
  const car = W / H;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (ar > car) {
    sw = sh * car;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = sw / car;
    sy = (img.naturalHeight - sh) / 2;
  }
  sceneCtx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}

// ── Screen content position ───────────────────────────────────
// Calibrated to match the laptop display area in frames 35-50.
// Adjust these if the overlay doesn't line up with the screen.
const SCREEN = { left: 0.125, top: 0.055, w: 0.755, h: 0.635 };
const SECTION_COUNT = 5;

function positionScreen() {
  const W = window.innerWidth, H = window.innerHeight;
  screenContent.style.left   = (SCREEN.left * W) + 'px';
  screenContent.style.top    = (SCREEN.top  * H) + 'px';
  screenContent.style.width  = (SCREEN.w    * W) + 'px';
  screenContent.style.height = (SCREEN.h    * H) + 'px';
  screenContent.style.borderRadius = (SCREEN.w * W * 0.008) + 'px';
  document.querySelectorAll('.ss').forEach(el => {
    el.style.height = (SCREEN.h * H) + 'px';
  });
}

// ── Scroll phases ─────────────────────────────────────────────
// Frame breakdown (80 frames over 900vh):
//   1–22  : developer in room, camera pushes in
//  23–27  : developer exits, transition
//  28–52  : laptop alone, screen visible → content overlay here
//  53–65  : lid closes
//  66–79  : closed laptop, room dims
//     80  : pure black → CTA
const PH = {
  heroPush:    [0.00, 0.30],  // frames 1-24: dev in room + push
  contentIn:   [0.30, 0.36],  // frames 24-29: transition / fade in
  content:     [0.34, 0.65],  // frames 28-52: laptop screen, content scrolls
  contentOut:  [0.62, 0.68],  // overlap: content fades as lid begins
  lidClose:    [0.64, 0.82],  // frames 52-66: lid shuts
  dim:         [0.80, 0.93],  // frames 64-74: room goes dark
  cta:         [0.91, 1.00],  // frames 73-80: CTA
};

function ph(name, p) {
  const [s, e] = PH[name];
  return Math.max(0, Math.min(1, (p - s) / (e - s)));
}

// ── Main update loop ──────────────────────────────────────────
function update() {
  requestAnimationFrame(update);

  scrollP += (targetP - scrollP) * 0.055;
  const p = scrollP;

  // Video frame — pure linear scrub across all 80 frames
  drawFrame(p);

  // ── Hero copy ──────────────────────────────────────────────
  // Visible early, fades as camera pushes in past the developer
  const heroProg  = ph('heroPush', p);
  const heroFade  = Math.max(0, 1 - heroProg * 3.2);
  heroCopy.style.opacity   = heroFade;
  heroCopy.style.transform = `translateX(${-heroProg * 35 * Math.min(1, heroProg * 3)}px)`;

  // Scroll hint
  const shO = p < 0.04
    ? String(p / 0.04)
    : String(Math.max(0, 1 - heroProg * 4));
  scrollHint.style.opacity = shO;

  // ── Screen content overlay ─────────────────────────────────
  const contentProg   = ph('content', p);
  const fadeIn        = Math.min(1, ph('contentIn', p) * 2);
  const fadeOut       = Math.max(0, 1 - ph('contentOut', p));
  screenContent.style.opacity = String(Math.min(fadeIn, fadeOut));

  if (contentProg > 0) {
    const screenH = SCREEN.h * window.innerHeight;
    const ty = -contentProg * screenH * (SECTION_COUNT - 1);
    screenInner.style.transform = `translateY(${ty}px)`;
  }

  // ── Dimmer ─────────────────────────────────────────────────
  dimmer.style.opacity = String(Math.min(0.97, ph('dim', p) * 1.2));

  // ── CTA ────────────────────────────────────────────────────
  const ctaProg = ph('cta', p);
  ctaEl.style.opacity = String(Math.min(1, ctaProg * 3));
  ctaEl.classList.toggle('active', ctaProg > 0.3);
}

// ── Intro animation ───────────────────────────────────────────
function playIntro() {
  const eyebrow = heroCopy.querySelector('.eyebrow');
  const tagline = heroCopy.querySelector('.hero-tagline');
  const sub     = heroCopy.querySelector('.hero-sub');
  const btns    = heroCopy.querySelector('.hero-btns');

  gsap.timeline({ delay: 0.3 })
    .to(eyebrow,    { opacity:1, y:0, duration:.8,  ease:'power2.out' }, 0.2)
    .to(tagline,    { opacity:1, y:0, duration:1.0, ease:'power2.out' }, 0.5)
    .to(sub,        { opacity:1, y:0, duration:.9,  ease:'power2.out' }, 0.85)
    .to(btns,       { opacity:1,      duration:.7                      }, 1.2)
    .to(scrollHint, { opacity:1,      duration:.6                      }, 1.8);
}

// ── Boot ──────────────────────────────────────────────────────
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    positionScreen();

    const cs1 = document.getElementById('cs-1');
    const cs2 = document.getElementById('cs-2');
    if (cs1) drawCaseMockup(cs1, 'corporate');
    if (cs2) drawCaseMockup(cs2, 'phlox');

    document.querySelector('#cta .btn-primary-lg')
      ?.addEventListener('click', () => window.open('mailto:hello@kyro.partners', '_blank'));
    document.querySelector('#cta .btn-ghost-lg')
      ?.addEventListener('click', () => window.open('https://kyro.partners/book', '_blank'));

    update();
    playIntro();
  });
});
