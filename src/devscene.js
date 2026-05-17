// LED color-cycling overlay for hero right panel
// Animates #led-overlay radial gradient color

const LED_PALETTE = [
  [180, 20,  20],   // deep red
  [140, 10,  50],   // burgundy
  [20,  40, 180],   // cool blue
  [90,  15, 170],   // violet
  [10, 110, 120],   // teal
  [160, 80,  10],   // amber
];

const LED_SPEED = 0.0014;

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function smooth(t) { return t * t * (3 - 2 * t); }

export function initLedOverlay(overlayEl) {
  let fromColor = LED_PALETTE[0];
  let toColor   = LED_PALETTE[1];
  let ledT = 0, ledIdx = 0;
  let rafId = null;

  function tick() {
    ledT += LED_SPEED;
    if (ledT >= 1) {
      ledT = 0;
      ledIdx = (ledIdx + 1) % LED_PALETTE.length;
      fromColor = LED_PALETTE[ledIdx];
      toColor   = LED_PALETTE[(ledIdx + 1) % LED_PALETTE.length];
    }
    const [r, g, b] = lerpColor(fromColor, toColor, smooth(ledT));
    overlayEl.style.background =
      `radial-gradient(ellipse 100% 65% at 50% -5%, rgba(${r},${g},${b},0.48) 0%, rgba(0,0,0,0) 68%)`;
    rafId = requestAnimationFrame(tick);
  }

  return {
    start() { tick(); },
    stop()  { if (rafId) cancelAnimationFrame(rafId); },
  };
}

// ── Case study mockup renderer ────────────────────────────────
export function drawCaseMockup(el, type) {
  const W = el.offsetWidth  || 400;
  const H = el.offsetHeight || 225;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');

  if (type === 'corporate') {
    c.fillStyle = '#0a0a0f'; c.fillRect(0,0,W,H);
    c.fillStyle = '#111118'; c.fillRect(0,0,W,H*0.13);
    c.fillStyle = '#7B2FFF'; c.fillRect(W*.06,H*.04,W*.12,H*.05);
    [0,1,2].forEach(i=>{ c.fillStyle='rgba(255,255,255,0.25)'; c.fillRect(W*(.55+i*.13),H*.045,W*.1,H*.04); });
    c.fillStyle='rgba(255,255,255,0.85)'; c.fillRect(W*.06,H*.22,W*.55,H*.1);
    c.fillStyle='rgba(255,255,255,0.4)';  c.fillRect(W*.06,H*.35,W*.4,H*.04);
    c.fillRect(W*.06,H*.41,W*.32,H*.04);
    c.fillStyle='#7B2FFF'; c.fillRect(W*.06,H*.52,W*.2,H*.09);
    [0,1,2].forEach(i=>{
      c.fillStyle='rgba(255,255,255,0.04)'; c.fillRect(W*(.06+i*.31),H*.68,W*.28,H*.27);
      c.fillStyle='rgba(255,255,255,0.5)';  c.fillRect(W*(.08+i*.31),H*.72,W*.15,H*.04);
      c.fillStyle='rgba(255,255,255,0.2)';  c.fillRect(W*(.08+i*.31),H*.78,W*.2,H*.025);
    });
  } else {
    c.fillStyle='#060608'; c.fillRect(0,0,W,H);
    c.fillStyle='#000'; c.fillRect(0,0,W,H*0.13);
    c.fillStyle='#7B2FFF'; c.beginPath(); c.arc(W*.08,H*.065,H*.028,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.8)'; c.fillRect(W*.13,H*.05,W*.15,H*.03);
    [0,1,2,3].forEach(i=>{ c.fillStyle='rgba(255,255,255,0.25)'; c.fillRect(W*(.42+i*.13),H*.05,W*.1,H*.03); });
    c.fillStyle='rgba(255,255,255,0.04)'; c.fillRect(0,H*.14,W,H*.07);
    c.fillStyle='rgba(255,255,255,0.88)'; c.fillRect(W*.1,H*.27,W*.8,H*.14);
    c.fillStyle='rgba(255,255,255,0.35)'; c.fillRect(W*.2,H*.44,W*.6,H*.04);
    c.fillRect(W*.24,H*.5,W*.52,H*.04);
    c.fillStyle='#7B2FFF'; c.fillRect(W*.28,H*.6,W*.22,H*.1);
    c.fillStyle='rgba(255,255,255,0.07)'; c.fillRect(W*.53,H*.6,W*.18,H*.1);
  }

  el.style.backgroundImage = `url(${cv.toDataURL()})`;
  el.style.backgroundSize  = '100% 100%';
}
