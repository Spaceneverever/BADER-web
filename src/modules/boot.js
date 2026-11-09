import { identity } from '../data/content.js';

// Fictional start-up sequence. Visual only: nothing is checked or verified.

const LINES = [
  'INITIALIZING PERSONAL SYSTEM',
  'LOADING CREATIVE MODULES',
  'ESTABLISHING SECURE SESSION',
];

function stamp(t0) {
  const ms = performance.now() - t0;
  return `[${(ms / 1000).toFixed(3).padStart(7, '0')}]`;
}

export function runBoot({ onDone }) {
  const el = document.getElementById('boot');
  const log = document.getElementById('boot-log');
  const bar = document.getElementById('boot-bar');
  const skip = document.getElementById('boot-skip');

  // Returning visitors in the same tab get the short version.
  let fast = false;
  try { fast = sessionStorage.getItem('bs-booted') === '1'; } catch (_) {}

  el.hidden = false;
  document.body.classList.add('is-booting');
  // Content behind the overlay is out of reach until the sequence ends.
  const behind = [document.getElementById('main'), document.querySelector('.topbar'), document.getElementById('footer')];
  behind.forEach((n) => { n.inert = true; });

  const t0 = performance.now();
  const timers = [];
  let finished = false;
  const step = fast ? 90 : 340;
  const typeSpeed = fast ? 4 : 16;

  function typeLine(text, isFinal) {
    const li = document.createElement('li');
    if (isFinal) li.className = 'final';
    const t = document.createElement('span');
    t.className = 't';
    t.textContent = stamp(t0);
    const body = document.createElement('span');
    li.append(t, body);
    log.appendChild(li);
    let i = 0;
    const full = isFinal ? text : `${text}...`;
    const iv = setInterval(() => {
      i++;
      body.textContent = full.slice(0, i);
      if (i >= full.length) {
        clearInterval(iv);
        if (!isFinal) {
          const ok = document.createElement('span');
          ok.className = 'ok';
          ok.textContent = 'OK';
          li.appendChild(ok);
        }
      }
    }, typeSpeed);
    timers.push({ clear: () => clearInterval(iv) });
  }

  LINES.forEach((line, i) => {
    const id = setTimeout(() => {
      typeLine(line, false);
      bar.style.transition = `transform ${step}ms cubic-bezier(.16,1,.3,1)`;
      bar.style.transform = `scaleX(${(i + 1) / (LINES.length + 1)})`;
    }, i * step);
    timers.push({ clear: () => clearTimeout(id) });
  });
  const finalAt = LINES.length * step;
  const id1 = setTimeout(() => {
    typeLine(`IDENTITY VERIFIED: ${identity.name.toUpperCase()}`, true);
    bar.style.transform = 'scaleX(1)';
  }, finalAt);
  const id2 = setTimeout(finish, finalAt + (fast ? 260 : 700));
  timers.push({ clear: () => clearTimeout(id1) }, { clear: () => clearTimeout(id2) });

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); finish(); }
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach((t) => t.clear());
    document.removeEventListener('keydown', onKey);
    try { sessionStorage.setItem('bs-booted', '1'); } catch (_) {}
    el.classList.add('is-leaving');
    behind.forEach((n) => { n.inert = false; });
    document.body.classList.remove('is-booting');
    onDone(el);
  }

  skip.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
  skip.focus({ preventScroll: true });
}
