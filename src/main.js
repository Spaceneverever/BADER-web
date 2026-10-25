import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { identity, profile, contact } from './data/content.js';
import { runBoot } from './modules/boot.js';
import { scramble } from './modules/scramble.js';
import { initArchive } from './modules/archive.js';
import { initTerminal } from './modules/terminal.js';
import { initField } from './modules/field.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── Motion preference, honoured live in both directions ──────
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion = { value: mq.matches };
const root = document.documentElement;
root.classList.toggle('motion-off', reducedMotion.value);

// ── Grain texture generated once, no image file needed ───────
(function grain() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const img = x.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  root.style.setProperty('--grain', `url(${c.toDataURL('image/png')})`);
})();

// ── Content from the content file ────────────────────────────
function renderContent() {
  $('#hero-label').textContent = identity.label;
  // Name: hero lines, top bar, identity heading, footer.
  const words = identity.name.toUpperCase().split(/\s+/);
  $$('.hero__word').forEach((el, i) => { el.textContent = words[i] || ''; delete el.dataset.text; });
  $$('[data-name]').forEach((el) => { el.textContent = identity.name; });
  $$('[data-name-ar]').forEach((el) => { el.textContent = identity.nameAr; });
  document.title = `${identity.name} · ${identity.nameAr}`;
  $('#profile-summary').textContent = profile.summary;
  $('#profile-direction').textContent = profile.direction;
  $('#interests').innerHTML = profile.interests
    .map(
      (it) => `<li class="interest reveal">
        <span class="interest__k">${esc(it.key.replace(/_/g, ' '))}</span>
        <span class="interest__note">${esc(it.note)}</span>
      </li>`
    )
    .join('');

  if (identity.portrait) {
    const frame = $('.portrait__frame');
    const img = new Image();
    img.alt = `Portrait of ${identity.name}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onload = () => { $('#portrait-empty')?.remove(); $('#portrait-state').textContent = 'ON FILE'; };
    img.onerror = () => { img.remove(); $('#portrait-state').textContent = 'LOAD FAILED'; };
    img.src = identity.portrait;
    frame.prepend(img);
  }

  // Contact
  const cta = $('#contact-cta');
  if (contact.email) {
    cta.innerHTML = `
      <p>Send a message. It goes straight to my inbox.</p>
      <a class="btn btn--solid" href="mailto:${esc(contact.email)}">OPEN CHANNEL <span aria-hidden="true">→</span></a>
      <button type="button" class="btn" id="copy-email">COPY ADDRESS</button>
      <span class="contact__copy-state" id="copy-state" aria-live="polite"></span>`;
    $('#copy-email').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(contact.email);
        $('#copy-state').textContent = `COPIED: ${contact.email}`;
      } catch {
        $('#copy-state').textContent = contact.email;
      }
    });
  } else {
    const gh = contact.channels.find((c) => c.url);
    cta.innerHTML = `
      <p>Email is not set up yet. GitHub is the open line for now.</p>
      ${gh ? `<a class="btn btn--solid" href="${esc(gh.url)}" target="_blank" rel="noopener noreferrer">OPEN CHANNEL · ${esc(gh.label)} <span aria-hidden="true">↗</span></a>` : ''}`;
  }
  const rows = [];
  rows.push(
    contact.email
      ? { label: 'EMAIL', url: `mailto:${contact.email}`, handle: contact.email, ext: false }
      : { label: 'EMAIL', url: null }
  );
  contact.channels.forEach((c) => rows.push({ ...c, ext: true }));
  $('#channels').innerHTML = rows
    .map((r) => {
      if (!r.url) {
        return `<li><div class="channel__pending"><span>${esc(r.label)}</span><span class="channel__h">pending</span></div></li>`;
      }
      const ext = r.ext ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<li><a class="channel__a" href="${esc(r.url)}"${ext}><span>${esc(r.label)}</span><span class="channel__h">${esc(r.handle || '')} <span aria-hidden="true">${r.ext ? '↗' : '→'}</span></span></a></li>`;
    })
    .join('');
}

// ── Clock & session (real values only) ───────────────────────
function initClock() {
  const clock = $('#status-clock');
  const zone = $('#status-zone');
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
  zone.textContent = identity.location || (tz ? tz.replace(/_/g, ' ') : 'local time');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  function tick() {
    const now = new Date();
    clock.textContent = fmt.format(now);
    clock.dateTime = now.toISOString();
  }
  tick();
  // Align ticks to the second boundary so the clock never drifts visibly.
  setTimeout(() => { tick(); setInterval(tick, 1000); }, 1000 - (Date.now() % 1000));
}

// ── Navigation ──────────────────────────────────────────────
function initNav() {
  const links = $$('[data-nav]');
  const sections = $$('[data-section]');
  const setActive = (id) => {
    links.forEach((a) => {
      const on = a.dataset.nav === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => io.observe(s));
  new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(null); }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#top'));

  // Move focus with the jump so keyboard users land in the section.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    goTo(id);
  });
}

function goTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: reducedMotion.value ? 'auto' : 'smooth', block: 'start' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`);
}

// ── Pointer and scroll listeners ────────────────────────────
function initPointer(onPointer) {
  window.addEventListener('pointermove', (e) => {
    onPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });
  const bar = document.querySelector('.topbar');
  window.addEventListener('scroll', () => {
    bar.classList.toggle('is-scrolled', window.scrollY > 24);
  }, { passive: true });
}

// ── Motion ──────────────────────────────────────────────────
let core = null;
const titleDrift = [];
function heroEntrance() {
  if (reducedMotion.value) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__word', { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.08 }, 0)
    .to('.hero .reveal', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.25)
    .add(() => $$('.hero [data-scramble]').forEach((el, i) => setTimeout(() => scramble(el, { duration: 700 }), i * 90)), 0.1);
}

function initReveals() {
  if (reducedMotion.value) {
    root.classList.add('reveals-done');
    return;
  }
  ScrollTrigger.batch('main > section:not(.hero) .reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, overwrite: true }),
  });
  $$('main > section:not(.hero) [data-scramble]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => scramble(el) });
  });
  // Section titles drift a little slower than the page: layered parallax.
  $$('.section__title, .contact__big').forEach((el) => {
    titleDrift.push(gsap.fromTo(el, { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
  });
}

// Core states per section. Values are fractions; the core module maps them to space.
const CORE_STATES = {
  top:      { x: 0.42, y: 0.02,  scale: 0.92, distort: 0.17, freq: 1.1,  shell: 0.16, spread: 1.0,  glow: 1.0, opacity: 1.0,  spin: 1.0 },
  identity: { x: 0.66, y: -0.08, scale: 0.78, distort: 0.18, freq: 2.2,  shell: 0.34, spread: 1.3,  glow: 0.7, opacity: 0.5,  spin: 0.7 },
  archive:  { x: -0.7, y: 0.25,  scale: 1.35, distort: 0.3,  freq: 1.6,  shell: 0.1,  spread: 1.6,  glow: 0.6, opacity: 0.14, spin: 0.5 },
  lab:      { x: 0.0,  y: 0.0,   scale: 0.62, distort: 0.55, freq: 3.2,  shell: 0.28, spread: 0.85, glow: 1.0, opacity: 0.3,  spin: 1.6 },
  contact:  { x: 0.38, y: 0.0,   scale: 0.72, distort: 0.08, freq: 1.0,  shell: 0.22, spread: 1.1,  glow: 0.8, opacity: 0.9,  spin: 0.3 },
};

function initCoreScroll() {
  if (!core) return;
  Object.assign(core.state, CORE_STATES.top);
  const order = ['identity', 'archive', 'lab', 'contact'];
  order.forEach((id, i) => {
    const prev = i === 0 ? 'top' : order[i - 1];
    const el = document.getElementById(id);
    gsap.fromTo(core.state, { ...CORE_STATES[prev] }, {
      ...CORE_STATES[id],
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 15%',
        scrub: 0.8,
        onUpdate: () => { if (reducedMotion.value) core.renderOnce(); },
      },
    });
  });
}

function initStandby() {
  const label = $('#standby-text');
  ScrollTrigger.create({
    trigger: '#footer',
    start: 'top bottom',
    onEnter: () => { document.body.classList.add('standby'); label.textContent = 'Standby · page still active'; },
    onLeaveBack: () => { document.body.classList.remove('standby'); label.textContent = 'System active'; },
  });
}

function initParallax() {
  const layers = [
    { el: $('.hero__label'), x: 6, y: 4 },
    { el: $('.hero__title'), x: -6, y: -3 },
  ].filter((l) => l.el);
  const setters = layers.map((l) => ({
    ...l,
    qx: gsap.quickTo(l.el, 'x', { duration: 0.9, ease: 'power3.out' }),
    qy: gsap.quickTo(l.el, 'y', { duration: 0.9, ease: 'power3.out' }),
  }));
  return (nx, ny) => {
    if (reducedMotion.value || window.scrollY > window.innerHeight) return;
    setters.forEach((s) => { s.qx(nx * s.x); s.qy(ny * s.y); });
  };
}

// ── Boot the page ───────────────────────────────────────────
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function loadCore(webgl) {
  const status = { set textContent(v) { document.documentElement.dataset.render = v; } };
  const canvas = $('#core-canvas');
  if (!webgl) {
    const { createFallback } = await import('./modules/core.js');
    createFallback($('#core-fallback'));
    status.textContent = 'SVG FALLBACK';
    return;
  }
  try {
    const mod = await import('./modules/core.js');
    core = mod.createCore(canvas, { reducedMotion, onStatus: (t) => { status.textContent = t; } });
    if (!core) throw new Error('no context');
    canvas.classList.add('is-ready');
    setTimeout(() => canvas.classList.add('is-live'), 1300);
    if (reducedMotion.value) core.renderOnce();
    else core.start();
    initCoreScroll();
    ScrollTrigger.refresh();
  } catch (err) {
    console.warn('[blacksite] 3D core unavailable, using fallback.', err);
    const { createFallback } = await import('./modules/core.js');
    createFallback($('#core-fallback'));
    status.textContent = 'SVG FALLBACK';
  }
}

function main() {
  renderContent();
  initClock();
  initNav();

  const archive = initArchive({ onFilter: () => ScrollTrigger.refresh() });
  initTerminal({ openCase: (id) => archive.open(id), goTo });
  const field = initField({ reducedMotion });


  const parallax = initParallax();
  initPointer((nx, ny) => {
    core?.setPointer(nx, ny);
    parallax(nx, ny);
  });

  const webgl = hasWebGL();
  const start = () => {
    loadCore(webgl);
    initReveals();
    initStandby();
    heroEntrance();
  };

  if (reducedMotion.value) {
    // No boot sequence: direct path into the site.
    root.classList.add('reveals-done');
    start();
  } else {
    // Hero content waits hidden until the boot ends.
    gsap.set('.hero__word', { yPercent: 110, opacity: 0 });
    runBoot({
      webgl,
      onDone: (bootEl) => {
        gsap.set('.hero__word', { clearProps: 'all' });
        gsap.to(bootEl, {
          opacity: 0,
          duration: reducedMotion.value ? 0 : 0.6,
          ease: 'power2.inOut',
          onComplete: () => { bootEl.hidden = true; bootEl.style.opacity = ''; },
        });
        if (location.hash && location.hash.length > 1) {
          const id = location.hash.slice(1);
          setTimeout(() => goTo(id), 50);
        } else {
          $('#main').focus({ preventScroll: true });
        }
        start();
      },
    });
  }

  // Pause animation work on hidden tabs.
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('paused', document.hidden);
    if (!core) return;
    if (document.hidden) core.stop();
    else if (!reducedMotion.value) core.start();
  });

  // Reduced motion, honoured live in both directions.
  mq.addEventListener('change', (e) => {
    reducedMotion.value = e.matches;
    root.classList.toggle('motion-off', e.matches);
    if (e.matches) {
      // Pin everything to its final state and stop the drives.
      $('#boot')?.hidden || $('#boot-skip')?.click();
      gsap.set('.reveal, .hero__word, .section__title, .contact__big, .hero__label, .hero__title', { clearProps: 'transform,opacity' });
      titleDrift.forEach((t) => { t.scrollTrigger?.disable(false); });
      gsap.set('.section__title, .contact__big', { clearProps: 'transform' });
      root.classList.add('reveals-done');
      $$('[data-scramble]').forEach((el) => { if (el.dataset.text) el.textContent = el.dataset.text; });
      core?.stop();
      core?.renderOnce();
    } else {
      titleDrift.forEach((t) => t.scrollTrigger?.enable());
      core?.start();
    }
    field?.refresh();
    ScrollTrigger.refresh();
  });
}

main();
