// SIGNAL_FIELD: particles tracing a moving vector field on a 2D canvas.
// Pointer pushes the field locally. Pauses when off-screen.

export function initField({ reducedMotion }) {
  const canvas = document.getElementById('field-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const freq = document.getElementById('f-freq');
  const drift = document.getElementById('f-drift');
  const hue = document.getElementById('f-hue');
  const reseed = document.getElementById('f-reset');
  const readout = document.getElementById('field-readout');

  let w = 0, h = 0, dpr = 1;
  let parts = [];
  let t = 0;
  let raf = 0;
  let visible = false;
  let last = performance.now();
  let seed = Math.random() * 1000;
  const ptr = { x: -9999, y: -9999, on: false };

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spawn();
  }

  function spawn() {
    const n = Math.round(Math.min(1400, (w * h) / 220));
    parts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, a: Math.random() * 120 + 40 }));
    ctx.fillStyle = '#0a0f0c';
    ctx.fillRect(0, 0, w, h);
  }

  function color() {
    // 0 = phosphor green, 50 = emerald/cyan, 100 = cold white
    const v = +hue.value / 100;
    const hh = 145 + v * 40;
    const s = 70 - v * 60;
    const l = 62 + v * 26;
    return `hsla(${hh.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%, 0.55)`;
  }

  function angle(x, y) {
    const f = +freq.value * 0.0016;
    return (
      Math.sin(x * f + seed + t * 0.3) * 2.2 +
      Math.cos(y * f * 1.3 - seed * 0.5 + t * 0.21) * 2.2 +
      Math.sin((x + y) * f * 0.5 + t * 0.1)
    );
  }

  function step(dt) {
    const speed = 30 + +drift.value * 14;
    ctx.fillStyle = 'rgba(10, 15, 12, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color();
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const p of parts) {
      let a = angle(p.x, p.y);
      if (ptr.on) {
        const dx = p.x - ptr.x, dy = p.y - ptr.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) a += Math.atan2(dy, dx) * (1 - d2 / 14000) * 1.6;
      }
      const nx = p.x + Math.cos(a) * speed * dt;
      const ny = p.y + Math.sin(a) * speed * dt;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      p.x = nx;
      p.y = ny;
      p.a -= 1;
      if (p.a <= 0 || p.x < -5 || p.x > w + 5 || p.y < -5 || p.y > h + 5) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.a = Math.random() * 120 + 40;
      }
    }
    ctx.stroke();
  }

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt * (0.2 + +drift.value * 0.08);
    step(dt);
    raf = visible && !reducedMotion.value ? requestAnimationFrame(loop) : 0;
  }

  // Reduced motion: draw a settled still frame from the same field.
  function still() {
    ctx.fillStyle = '#0a0f0c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) step(1 / 30);
  }

  function play() {
    if (reducedMotion.value) { still(); return; }
    if (!raf && visible) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  }

  function updateReadout() {
    readout.textContent = `F ${freq.value.padStart(2, '0')} · D ${drift.value.padStart(2, '0')} · S ${hue.value.padStart(3, '0')} · N ${parts.length}`;
  }

  [freq, drift, hue].forEach((el) =>
    el.addEventListener('input', () => {
      updateReadout();
      if (reducedMotion.value) still();
    })
  );
  reseed.addEventListener('click', () => {
    seed = Math.random() * 1000;
    spawn();
    updateReadout();
    play();
  });

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    ptr.on = true;
  });
  canvas.addEventListener('pointerleave', () => { ptr.on = false; });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
  }, { rootMargin: '100px' }).observe(canvas);

  let rt;
  new ResizeObserver(() => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); updateReadout(); play(); }, 120);
  }).observe(canvas.parentElement);

  resize();
  updateReadout();

  return { refresh: play };
}
