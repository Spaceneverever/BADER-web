import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { identity, profile, contact, skills, topics } from './data/content.js';
import { runBoot } from './modules/boot.js';
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

// ── Content from the content file ────────────────────────────
function renderContent() {
  $('#hero-label').textContent = identity.label;
  // Name: hero lines, top bar, identity heading, footer.
  const words = identity.name.toUpperCase().split(/\s+/);
  $$('.hero__word').forEach((el, i) => { el.textContent = words[i] || ''; });
  $$('[data-name]').forEach((el) => { el.textContent = identity.name; });
  $$('[data-name-ar]').forEach((el) => { el.textContent = identity.nameAr; });
  document.title = `${identity.name} · ${identity.nameAr}`;
  $('#profile-summary').textContent = profile.summary;
  $('#interests').innerHTML = profile.interests
    .map(
      (it) => `<li class="interest reveal">
        <span class="interest__k">${esc(it.key.replace(/_/g, ' '))}</span>
        <span class="interest__note">${esc(it.note)}</span>
      </li>`
    )
    .join('');



  // Skills: grouped tags, no levels or ratings.
  $('#skillset').innerHTML = skills.groups
    .map((g) => {
      const chips = [
        ...g.using.map((t) => `<li class="chip">${esc(t)}</li>`),
        ...g.exploring.map((t) => `<li class="chip chip--explore" title="Exploring">${esc(t)}</li>`),
      ].join('');
      return `<div class="skillset__row reveal"><dt class="skillset__name mono">${esc(g.name)}</dt><dd><ul class="chips">${chips}</ul></dd></div>`;
    })
    .join('');

  // Topics: projects I follow, grouped by theme. Not a ranking.
  const tag = (t, url, repo) =>
    url
      ? `<li><a class="topic" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(t)}, see ${esc(repo)} on GitHub">${esc(t)}</a></li>`
      : `<li><span class="topic">${esc(t)}</span></li>`;
  $('#topic-map').innerHTML =
    topics.themes
      .map(
        (th) => `<div class="tmap__row reveal">
        <dt class="tmap__name mono">${esc(th.name)}</dt>
        <dd>
          <ul class="tmap__tags mono">${th.tags.map((t) => tag(t, th.url, th.repo)).join('')}</ul>
          <p class="tmap__src"><a class="tmap__repo mono" href="${esc(th.url)}" target="_blank" rel="noopener">${esc(th.repo)}<span aria-hidden="true"> ↗</span></a> <span class="tmap__about">${esc(th.about)}</span></p>
        </dd>
      </div>`
      )
      .join('') +
    (topics.shared.length
      ? `<div class="tmap__row tmap__row--shared reveal"><dt class="tmap__name mono">Across all</dt><dd><ul class="tmap__tags mono">${topics.shared.map((t) => tag(t)).join('')}</ul></dd></div>`
      : '');

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
  initNav();

  const archive = initArchive();
  initTerminal({ openCase: (id) => archive.open(id), goTo });
  const field = initField({ reducedMotion });

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
