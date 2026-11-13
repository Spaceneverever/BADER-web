import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { identity, profile, contact, skills, topics, reading, library } from './data/content.js';
import { runBoot } from './modules/boot.js';
import { initArchive } from './modules/archive.js';
import { initTerminal } from './modules/terminal.js';
import { initField } from './modules/field.js';
import { initFalcon } from './modules/falcon.js';

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

// ── Content from the content file ────────────────────────────

// Small line drawings, one per interest area. Decorative only.
const MOTIFS = [
  // agents: a hub linked to three nodes
  '<svg class="tblock__motif" viewBox="0 0 40 40"><circle cx="20" cy="20" r="3.2"/><circle cx="7" cy="9" r="2"/><circle cx="33" cy="12" r="2"/><circle cx="24" cy="34" r="2"/><path d="M17.4 18 8.6 10.4M23 19l8.2-5.8M21 23.1l2.4 9"/></svg>',
  // multimodal: overlapping inputs
  '<svg class="tblock__motif" viewBox="0 0 40 40"><circle cx="15" cy="16" r="8"/><circle cx="25" cy="16" r="8"/><circle cx="20" cy="25" r="8"/></svg>',
  // dev tools: brackets around a cursor
  '<svg class="tblock__motif" viewBox="0 0 40 40"><path d="M13 10 5 20l8 10M27 10l8 10-8 10M18 27h6"/></svg>',
  // appsec: a frame being scanned
  '<svg class="tblock__motif" viewBox="0 0 40 40"><path d="M6 13V6h7M27 6h7v7M34 27v7h-7M13 34H6v-7"/><path class="tblock__scan" d="M10 20h20"/></svg>',
];

function renderContent() {
  $('#hero-label').textContent = identity.label;
  // Name: hero lines, top bar, identity heading, footer.
  const words = identity.name.toUpperCase().split(/\s+/);
  $$('.hero__word').forEach((el, i) => { el.textContent = words[i] || ''; });
  $$('[data-name]').forEach((el) => { el.textContent = identity.name; });
  $$('[data-name-ar]').forEach((el) => { el.textContent = identity.nameAr; });
  document.title = `${identity.name} · ${identity.nameAr}`;
  $('#profile-summary').textContent = profile.summary;
  $('#story').innerHTML = (profile.story || []).map((p) => `<p class="story__p reveal">${esc(p)}</p>`).join('');

  $('#awards').innerHTML = (profile.recognition || [])
    .map((a) => `<li class="award reveal"><span class="award__y mono">${esc(a.year)}</span><span class="award__t">${esc(a.title)}</span><span class="award__d">${esc(a.detail)}</span></li>`)
    .join('');

  // Stack ribbon: the tools I use, on a slow loop. Listed twice so the loop is seamless.
  const ribbonWords = skills.groups.flatMap((g) => g.using);
  const ribbonRun = ribbonWords.map((w) => `<span>${esc(w)}</span><i>✦</i>`).join('');
  $('#ribbon').innerHTML = `<div class="ribbon__run">${ribbonRun}</div><div class="ribbon__run">${ribbonRun}</div>`;

  // Library: spines on a shelf; each opens to its cover.
  const TONES = ['#0c1a12', '#10241a', '#0a140f', '#13301f', '#0e1c15', '#16382a'];
  let n = 0;
  $('#shelves').innerHTML = library
    .map((rack, ri) => {
      const books = rack.books
        .map((b, i) => {
          n += 1;
          const h = 330 + ((n * 37) % 70);
          const w = 62 + ((b.title.length * 7) % 22);
          const tone = TONES[(n * 5) % TONES.length];
          const kind = `${b.doc ? 'Framework' : 'Book'}${b.year ? ` · ${esc(b.year)}` : ''}`;
          const inner = `
            <span class="vol__spine"><span class="vol__no mono">${String(n).padStart(2, '0')}</span><span class="vol__st">${esc(b.title)}</span><span class="vol__sa mono">${esc(b.author)}</span></span>
            <span class="vol__cover">
              <span class="vol__kind mono">${kind}</span>
              <span class="vol__ct">${esc(b.title)}</span>
              <span class="vol__ca">${esc(b.author)}</span>
              <span class="vol__note">${esc(b.note)}</span>
              ${b.url ? '<span class="vol__go mono">Open <span aria-hidden="true">↗</span></span>' : ''}
            </span>`;
          const tag = b.url
            ? `<a class="vol__a" href="${esc(b.url)}" target="_blank" rel="noopener" aria-label="${esc(b.title)} by ${esc(b.author)}, opens in a new tab">${inner}</a>`
            : `<div class="vol__a" tabindex="0" aria-label="${esc(b.title)} by ${esc(b.author)}">${inner}</div>`;
          return `<li class="vol${b.doc ? ' vol--doc' : ''}${i === 0 ? ' is-open' : ''}" style="--h:${h}px;--w:${w}px;--tone:${tone}">${tag}</li>`;
        })
        .join('');
      return `<div class="rack reveal"><p class="rack__name mono"><span>Shelf ${String(ri + 1).padStart(2, '0')}</span>${esc(rack.name)}</p><ul class="rack__books">${books}</ul></div>`;
    })
    .join('');

  // Reading list
  $('#shelf').innerHTML = reading
    .map(
      (r, i) => `<li class="book">
        <a class="book__a" href="${esc(r.url)}" target="_blank" rel="noopener">
          <span class="book__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="book__topic mono">${esc(r.topic)}</span>
          <span class="book__title">${esc(r.title)}</span>
          <span class="book__note">${esc(r.note)}</span>
          <span class="book__src mono"><span>${esc(r.source)}${r.year ? ` · ${esc(r.year)}` : ''}</span><span class="book__go" aria-hidden="true">↗</span></span>
          <span class="sr-only"> (opens in a new tab)</span>
        </a>
      </li>`
    )
    .join('');
  $('#interests').innerHTML = profile.interests
    .map(
      (it) => `<li class="interest reveal">
        <span class="interest__k">${esc(it.key.replace(/_/g, ' '))}</span>
        <span class="interest__note">${esc(it.note)}</span>
      </li>`
    )
    .join('');



  // Skills: editorial groups, no levels or ratings.
  // Solid words appear in my code; italic serif words are still being explored.
  $('#skillset').innerHTML = skills.groups
    .map((g, i) => {
      const words = [
        ...g.using.map((t) => `<li class="skill">${esc(t)}</li>`),
        ...g.exploring.map((t) => `<li class="skill skill--explore"><span>${esc(t)}</span><span class="skill__mark mono">exploring</span></li>`),
      ].join('');
      return `<article class="sgroup sgroup--${g.size || 'md'} reveal">
        <h3 class="sgroup__head mono"><span class="sgroup__no">${String(i + 1).padStart(2, '0')}</span>${esc(g.name)}</h3>
        <ul class="sgroup__list">${words}</ul>
      </article>`;
    })
    .join('');

  // Topics: four interest areas, each tied to a project I follow. Not a ranking.
  $('#topic-map').innerHTML = topics.themes
    .map(
      (th, i) => `<article class="tblock reveal">
        <div class="tblock__top mono" aria-hidden="true"><span>${String(i + 1).padStart(2, '0')} / ${esc(th.label || '')}</span>${MOTIFS[i % MOTIFS.length]}</div>
        <h3 class="tblock__title"><a class="tblock__link" href="${esc(th.url)}" target="_blank" rel="noopener">${esc(th.name)}<span class="sr-only"> (${esc(th.repo)} on GitHub, opens in a new tab)</span></a></h3>
        <p class="tblock__about">${esc(th.about)}</p>
        <ul class="tblock__tags mono">${th.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <p class="tblock__repo mono" aria-hidden="true"><span>${esc(th.repo)}</span><span class="tblock__arrow">↗</span></p>
      </article>`
    )
    .join('');
  $('#topics-shared').innerHTML = topics.shared.length
    ? `Across all four <span class="tblock__tags">${topics.shared.map((t) => `<span>${esc(t)}</span>`).join('')}</span>`
    : '';

  // Contact: one clear way in, the email address.
  const cta = $('#contact-cta');
  if (contact.email) {
    cta.innerHTML = `
      <p class="contact__label mono">Contact Email</p>
      <a class="contact__mail" href="mailto:${esc(contact.email)}">${esc(contact.email)}<span class="contact__arrow" aria-hidden="true">↗</span></a>
      ${contact.phone ? `<p class="contact__label mono contact__label--phone">Mobile</p>
      <a class="contact__phone" href="tel:${esc(contact.phone.tel)}" dir="ltr">${esc(contact.phone.label)}</a>` : ''}
      <div class="contact__row">
        <a class="btn btn--solid" href="mailto:${esc(contact.email)}">Send an email <span aria-hidden="true">→</span></a>
        <button type="button" class="btn" id="copy-email">Copy address</button>
        <span class="contact__copy-state mono" id="copy-state" aria-live="polite"></span>
      </div>`;
    $('#copy-email').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(contact.email);
        $('#copy-state').textContent = 'Copied';
      } catch {
        $('#copy-state').textContent = contact.email;
      }
    });
  } else {
    cta.innerHTML = '<p>Email is not set up yet.</p>';
  }
  const list = $('#channels');
  list.innerHTML = contact.channels
    .filter((c) => c.url)
    .map((c) => `<li><a class="channel__a" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(c.label)}</span><span class="channel__h">${esc(c.handle || '')} <span aria-hidden="true">↗</span></span></a></li>`)
    .join('');
  list.hidden = !list.children.length;
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
function heroEntrance() {
  if (reducedMotion.value) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__word', { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.08 }, 0)
    .to('.hero .reveal', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.35);
}

// Topic blocks: a faint light follows the pointer. Fine pointers only.
function initTopicGlow() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.tblock').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// Reading shelf: sideways scroll with snap, buttons, drag, a progress bar,
// and a light coverflow tilt as cards move away from the center.
function initShelf() {
  const shelf = $('#shelf');
  if (!shelf) return;
  const cards = [...shelf.children];
  const bar = $('#reading-bar');
  const count = $('#reading-count');
  const total = String(cards.length).padStart(2, '0');
  const step = () => (cards[0]?.getBoundingClientRect().width || 320) + 20;
  const go = (dir) => shelf.scrollBy({ left: dir * step(), behavior: reducedMotion.value ? 'auto' : 'smooth' });
  $('#reading-prev').addEventListener('click', () => go(-1));
  $('#reading-next').addEventListener('click', () => go(1));

  let raf = 0;
  const update = () => {
    raf = 0;
    const max = shelf.scrollWidth - shelf.clientWidth;
    const p = max > 0 ? shelf.scrollLeft / max : 0;
    bar.style.transform = `scaleX(${Math.max(0.04, p).toFixed(3)})`;
    const box = shelf.getBoundingClientRect();
    let first = 0;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      if (!first && r.right > box.left + 40) first = i + 1;
      if (reducedMotion.value) { c.style.transform = ''; return; }
      // -1 at the left edge, 1 at the right edge of the shelf
      const d = Math.max(-1, Math.min(1, ((r.left + r.width / 2) - (box.left + box.width / 2)) / box.width));
      c.style.transform = `perspective(1200px) rotateY(${(-d * 7).toFixed(2)}deg) translateZ(${(-Math.abs(d) * 30).toFixed(1)}px)`;
    });
    count.textContent = `${String(first || 1).padStart(2, '0')} / ${total}`;
    $('#reading-prev').disabled = shelf.scrollLeft <= 2;
    $('#reading-next').disabled = shelf.scrollLeft >= max - 2;
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
  shelf.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();

  // Drag to scroll with a mouse. Touch already scrolls natively.
  let down = null;
  let moved = false;
  shelf.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = { x: e.clientX, left: shelf.scrollLeft };
    moved = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 4) { moved = true; shelf.classList.add('is-dragging'); }
    shelf.scrollLeft = down.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = null;
    shelf.classList.remove('is-dragging');
  });
  // A drag should not open the article under the pointer.
  shelf.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
}

// Library: pointing at or focusing a book opens it; one open book per shelf.
function initLibrary() {
  document.querySelectorAll('.rack__books').forEach((rack) => {
    const open = (vol) => {
      if (!vol || vol.classList.contains('is-open')) return;
      rack.querySelectorAll('.vol.is-open').forEach((v) => v.classList.remove('is-open'));
      vol.classList.add('is-open');
    };
    rack.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') open(e.target.closest('.vol')); });
    rack.addEventListener('focusin', (e) => open(e.target.closest('.vol')));
  });
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
}

// Core states per section. Values are fractions; the core module maps them to space.
const CORE_STATES = {
  top:      { x: 0.42, y: 0.02,  scale: 0.92, distort: 0.17, freq: 1.1,  shell: 0.16, spread: 1.0,  glow: 1.0, opacity: 1.0,  spin: 1.0 },
  identity: { x: 0.74, y: -0.04, scale: 0.7, distort: 0.18, freq: 2.2,  shell: 0.34, spread: 1.3,  glow: 0.7, opacity: 0.7,  spin: 0.7 },
  skills:   { x: 0.56, y: 0.0,   scale: 1.02, distort: 0.2,  freq: 1.5,  shell: 0.3,  spread: 1.15, glow: 1.0, opacity: 0.95, spin: 0.6 },
  topics:   { x: -0.62, y: 0.04, scale: 0.9,  distort: 0.26, freq: 2.0,  shell: 0.24, spread: 1.4,  glow: 0.85, opacity: 0.8, spin: 0.45 },
  reading:  { x: 0.0,  y: 0.62,  scale: 0.5,  distort: 0.3,  freq: 2.4,  shell: 0.2,  spread: 1.6,  glow: 0.8, opacity: 0.45, spin: 0.8 },
  library:  { x: -0.66, y: 0.36, scale: 0.55, distort: 0.22, freq: 1.8, shell: 0.2,  spread: 1.3,  glow: 0.7, opacity: 0.4, spin: 0.4 },
  archive:  { x: -0.7, y: 0.25,  scale: 1.35, distort: 0.3,  freq: 1.6,  shell: 0.1,  spread: 1.6,  glow: 0.6, opacity: 0.14, spin: 0.5 },
  lab:      { x: 0.0,  y: 0.0,   scale: 0.62, distort: 0.55, freq: 3.2,  shell: 0.28, spread: 0.85, glow: 1.0, opacity: 0.3,  spin: 1.6 },
  contact:  { x: 0.62, y: 0.1,   scale: 0.62, distort: 0.08, freq: 1.0,  shell: 0.22, spread: 1.1,  glow: 0.6, opacity: 0.4,  spin: 0.3 },
};

function initCoreScroll() {
  if (!core) return;
  Object.assign(core.state, CORE_STATES.top);
  const order = ['identity', 'skills', 'topics', 'reading', 'library', 'archive', 'lab', 'contact'];
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
  initTopicGlow();
  initShelf();
  initLibrary();
  initNav();

  const archive = initArchive();
  initTerminal({ openCase: (id) => archive.open(id), goTo });
  const field = initField({ reducedMotion });
  initFalcon($('#falcon'), { reducedMotion });

  initPointer((nx, ny) => core?.setPointer(nx, ny));

  const webgl = hasWebGL();
  const start = () => {
    loadCore(webgl);
    initReveals();
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
      gsap.set('.reveal, .hero__word', { clearProps: 'transform,opacity' });
      root.classList.add('reveals-done');
      core?.stop();
      core?.renderOnce();
    } else {
      core?.start();
    }
    field?.refresh();
    ScrollTrigger.refresh();
  });
}

main();
