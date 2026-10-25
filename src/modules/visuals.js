// Procedural SVG previews for archive entries. No images needed.
// Each kind draws a small diagram of what the project actually is.

const G = '#57e38f';
const L = '#4b6e5a';
const D = '#24352b';

function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const kinds = {
  grid(rand) {
    // the site's own layout: a 12-column grid with blocks, a boot log and a core
    let out = '';
    for (let i = 0; i <= 12; i++) out += `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="400" stroke="${D}" />`;
    for (let j = 0; j <= 8; j++) out += `<line x1="0" y1="${j * 50}" x2="600" y2="${j * 50}" stroke="${D}" />`;
    out += `<rect x="25" y="210" width="330" height="62" fill="none" stroke="${L}"/>`;
    out += `<rect x="25" y="285" width="200" height="8" fill="${L}" opacity=".6"/>`;
    out += `<rect x="25" y="300" width="160" height="8" fill="${L}" opacity=".4"/>`;
    out += `<rect x="455" y="60" width="120" height="110" fill="none" stroke="${L}"/>`;
    for (let k = 0; k < 5; k++) out += `<rect x="465" y="${72 + k * 18}" width="${50 + rand() * 50}" height="4" fill="${D}"/>`;
    out += `<circle cx="400" cy="200" r="96" fill="none" stroke="${G}" stroke-opacity=".7"/>`;
    out += `<ellipse cx="400" cy="200" rx="140" ry="34" fill="none" stroke="${L}" transform="rotate(-14 400 200)"/>`;
    out += `<path d="M25 40h80M25 52h130M25 64h100" stroke="${G}" stroke-opacity=".6"/>`;
    return out;
  },
  sphere() {
    let out = '';
    for (let i = 1; i < 10; i++) {
      const a = (i / 10) * Math.PI;
      out += `<ellipse cx="300" cy="200" rx="${(Math.sin(a) * 130).toFixed(1)}" ry="130" fill="none" stroke="${i % 3 ? D : L}"/>`;
      out += `<ellipse cx="300" cy="${(200 + Math.cos(a) * 130).toFixed(1)}" rx="${(Math.sin(a) * 130).toFixed(1)}" ry="${(Math.sin(a) * 22).toFixed(1)}" fill="none" stroke="${D}"/>`;
    }
    out += `<circle cx="300" cy="200" r="130" fill="none" stroke="${G}" stroke-opacity=".8"/>`;
    out += `<ellipse cx="300" cy="200" rx="200" ry="40" fill="none" stroke="${L}" transform="rotate(-18 300 200)"/>`;
    return out;
  },
  flow(rand) {
    let out = '';
    for (let i = 0; i < 46; i++) {
      let x = rand() * 600, y = rand() * 400;
      let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      for (let s = 0; s < 22; s++) {
        const a = Math.sin(x * 0.012) * 2 + Math.cos(y * 0.015) * 2;
        x += Math.cos(a) * 9;
        y += Math.sin(a) * 9;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      out += `<path d="${d}" fill="none" stroke="${i % 7 === 0 ? G : L}" stroke-opacity="${i % 7 === 0 ? 0.9 : 0.5}"/>`;
    }
    return out;
  },
  term() {
    let out = `<rect x="60" y="60" width="480" height="280" fill="none" stroke="${L}"/>`;
    out += `<line x1="60" y1="88" x2="540" y2="88" stroke="${D}"/>`;
    const rows = [120, 90, 150, 60, 110, 200];
    rows.forEach((w, i) => {
      out += `<rect x="84" y="${108 + i * 28}" width="10" height="6" fill="${G}" opacity=".7"/>`;
      out += `<rect x="104" y="${108 + i * 28}" width="${w}" height="6" fill="${L}" opacity=".7"/>`;
    });
    out += `<rect x="84" y="290" width="12" height="18" fill="${G}"/>`;
    return out;
  },
  empty() {
    let out = '';
    for (let i = -400; i < 600; i += 22) out += `<line x1="${i}" y1="400" x2="${i + 400}" y2="0" stroke="${D}" stroke-opacity=".7"/>`;
    out += `<rect x="200" y="160" width="200" height="80" fill="#0a0f0c" stroke="${L}" stroke-dasharray="4 4"/>`;
    out += `<text x="300" y="206" text-anchor="middle" fill="#93a99b" font-family="monospace" font-size="13" letter-spacing="2">SLOT RESERVED</text>`;
    return out;
  },
};

export function projectVisual(kind, seed = 7) {
  const draw = kinds[kind] || kinds.empty;
  return `<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${draw(seeded(seed))}</svg>`;
}
