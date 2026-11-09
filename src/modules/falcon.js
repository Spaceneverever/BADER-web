// Falcon of light: a low-poly falcon head (الصقر) drawn as emerald wire and points.
// Particles drift in from a scatter and settle on the falcon as the section scrolls in,
// then shy away from the pointer and spring back. Reduced motion draws it settled and still.

// Profile facing left, in a 100 x 100 box.
const V = {
  tip: [14, 60], under: [19, 55], jaw: [25, 53], gape: [31, 51], throat: [35, 61], chin: [41, 72],
  neckF: [49, 90], f0: [53, 98], f1: [61, 92], f2: [69, 99], f3: [77, 93], neckB: [86, 99],
  nape: [88, 76], occ: [86, 52], crownB: [78, 30], crown: [62, 19], brow: [44, 23], cere: [28, 33],
  bill: [19, 37], curve: [11, 46],
  eye: [42, 37], malar: [44, 45], malar2: [42, 61], cheek: [58, 50], low: [64, 74], temple: [70, 40], lore: [58, 31],
};
const OUTLINE = ['tip', 'under', 'jaw', 'gape', 'throat', 'chin', 'neckF', 'f0', 'f1', 'f2', 'f3', 'neckB', 'nape', 'occ', 'crownB', 'crown', 'brow', 'cere', 'bill', 'curve', 'tip'];
const INNER = [
  ['cere', 'eye'], ['brow', 'eye'], ['eye', 'malar'], ['malar', 'gape'], ['malar', 'malar2'], ['malar2', 'throat'],
  ['malar2', 'chin'], ['malar', 'cheek'], ['cheek', 'lore'], ['lore', 'crown'], ['lore', 'temple'], ['temple', 'crownB'],
  ['temple', 'occ'], ['cheek', 'temple'], ['cheek', 'low'], ['low', 'malar2'], ['low', 'nape'], ['low', 'f3'],
  ['low', 'f1'], ['low', 'chin'], ['temple', 'nape'], ['eye', 'lore'], ['bill', 'cere'], ['curve', 'jaw'], ['cere', 'gape'],
];

function edges() {
  const list = [];
  for (let i = 0; i < OUTLINE.length - 1; i++) list.push([OUTLINE[i], OUTLINE[i + 1], true]);
  INNER.forEach(([a, b]) => list.push([a, b, false]));
  return list;
}

export function initFalcon(canvas, { reducedMotion }) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const E = edges();

  // Targets: every vertex, plus points sampled along each edge.
  const targets = Object.values(V).map(([x, y]) => ({ x, y, node: true }));
  E.forEach(([a, b]) => {
    const [x1, y1] = V[a];
    const [x2, y2] = V[b];
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 3.2));
    for (let i = 1; i < n; i++) targets.push({ x: x1 + ((x2 - x1) * i) / n, y: y1 + ((y2 - y1) * i) / n, node: false });
  });

  // Seeded scatter so the start looks the same on every visit.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const parts = targets.map((t) => ({
    tx: t.x, ty: t.y, node: t.node,
    sx: -40 + rand() * 180, sy: -30 + rand() * 160,
    ox: 0, oy: 0, vx: 0, vy: 0,
    phase: rand() * Math.PI * 2,
  }));

  let size = 0;
  let dpr = 1;
  let progress = reducedMotion.value ? 1 : 0; // 0 scattered, 1 settled
  let goal = progress;
  let pointer = null;
  let visible = false;
  let raf = 0;
  let t0 = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    draw(performance.now());
  }

  const ease = (x) => 1 - Math.pow(1 - x, 3);

  function draw(now) {
    if (!size) return;
    const k = size / 100;
    const time = (now - t0) / 1000;
    const p = ease(progress);
    const still = reducedMotion.value;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // positions
    parts.forEach((q) => {
      const drift = still ? 0 : (1 - p * 0.85) * 1.6;
      const bx = q.sx + (q.tx - q.sx) * p + Math.sin(time * 0.7 + q.phase) * drift;
      const by = q.sy + (q.ty - q.sy) * p + Math.cos(time * 0.6 + q.phase) * drift;
      if (!still && pointer) {
        const dx = bx * k - pointer.x;
        const dy = by * k - pointer.y;
        const d = Math.hypot(dx, dy);
        const r = size * 0.16;
        if (d < r && d > 0.01) {
          const f = ((r - d) / r) * 1.4;
          q.vx += (dx / d) * f;
          q.vy += (dy / d) * f;
        }
      }
      q.vx += -q.ox * 0.08; q.vy += -q.oy * 0.08;
      q.vx *= 0.82; q.vy *= 0.82;
      q.ox += q.vx; q.oy += q.vy;
      if (still) { q.ox = 0; q.oy = 0; }
      q.x = (bx + q.ox / k) * k;
      q.y = (by + q.oy / k) * k;
    });

    // wire, fading in as the falcon settles
    if (p > 0.35) {
      const a = (p - 0.35) / 0.65;
      const nodes = parts.slice(0, Object.keys(V).length);
      const idx = Object.fromEntries(Object.keys(V).map((key, i) => [key, i]));
      E.forEach(([s, e, outer]) => {
        const A = nodes[idx[s]];
        const B = nodes[idx[e]];
        ctx.strokeStyle = `rgba(87, 227, 143, ${(outer ? 0.55 : 0.22) * a})`;
        ctx.lineWidth = outer ? 1.2 : 0.8;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      });
      // the eye
      const eye = nodes[idx.eye];
      ctx.strokeStyle = `rgba(139, 245, 179, ${0.9 * a})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(eye.x, eye.y, k * 3.2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(242, 247, 245, ${a})`;
      ctx.beginPath(); ctx.arc(eye.x - k * 0.6, eye.y - k * 0.4, k * 1.1, 0, Math.PI * 2); ctx.fill();
    }

    // points
    parts.forEach((q) => {
      const tw = still ? 1 : 0.65 + 0.35 * Math.sin(time * 2 + q.phase * 3);
      ctx.fillStyle = q.node ? `rgba(139, 245, 179, ${0.95 * tw})` : `rgba(87, 227, 143, ${0.6 * tw})`;
      const r = q.node ? 1.9 : 1.1;
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.fill();
    });
  }

  function loop(now) {
    raf = 0;
    progress += (goal - progress) * 0.05;
    if (Math.abs(goal - progress) < 0.001) progress = goal;
    draw(now);
    if (visible && !reducedMotion.value) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf && visible && !reducedMotion.value) raf = requestAnimationFrame(loop); };

  // Settles while the section is on screen; scatters again when it leaves.
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    goal = e.intersectionRatio > 0.25 || reducedMotion.value ? 1 : 0;
    kick();
  }, { threshold: [0, 0.25, 0.5] }).observe(canvas);

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  canvas.addEventListener('pointerleave', () => { pointer = null; });

  // main.js updates reducedMotion.value on the same media change; read it on the next tick.
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => setTimeout(() => {
    if (reducedMotion.value) { progress = goal = 1; draw(performance.now()); } else kick();
  }, 0));

  new ResizeObserver(resize).observe(canvas);
  resize();
}
