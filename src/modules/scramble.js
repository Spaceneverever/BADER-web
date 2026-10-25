// Text scramble: characters resolve from noise into the final word.
// Used on a handful of headings only. The real text stays in an aria-label.
const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF';

export function scramble(el, { duration = 900 } = {}) {
  const final = el.dataset.text || el.textContent;
  el.dataset.text = final;
  if (/^H[1-6]$/.test(el.tagName) && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', final);
  // Hold the box steady so swapping glyphs never shifts the layout.
  const box = el.getBoundingClientRect();
  const inline = getComputedStyle(el).display.startsWith('inline');
  if (inline) { el.style.width = `${box.width}px`; el.style.whiteSpace = 'nowrap'; }
  el.style.minHeight = `${box.height}px`;
  el.style.overflow = 'hidden';
  const chars = [...final];
  const start = performance.now();
  const pass = (c) => c === ' ' || c === '\u200B';
  const reveal = chars.map((c, i) => (pass(c) ? 0 : (i / chars.length) * 0.65 + Math.random() * 0.35));

  return new Promise((resolve) => {
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      let out = '';
      for (let i = 0; i < chars.length; i++) {
        if (pass(chars[i]) || p >= reveal[i]) out += chars[i];
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else {
        el.textContent = final;
        el.style.width = '';
        el.style.minHeight = '';
        el.style.overflow = '';
        el.style.whiteSpace = '';
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}
