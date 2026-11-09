// shell_sim: a simulated terminal. Commands are a fixed table in this file.
// Nothing is executed, no files are read, no network is touched.
import { identity, profile, contact, projects } from '../data/content.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const SECTIONS = ['top', 'identity', 'skills', 'topics', 'reading', 'archive', 'lab', 'contact'];

export function initTerminal({ openCase, goTo }) {
  const out = document.getElementById('term-out');
  const form = document.getElementById('term-form');
  const input = document.getElementById('term-input');
  const history = [];
  let hIndex = -1;
  const bootTime = Date.now();

  const files = {
    'readme.md': () =>
      [
        'shell_sim is a pretend terminal inside this page.',
        'It knows a short list of commands and nothing else.',
        'Try: ls, cat identity.rec, archive, open op-002, goto lab',
      ].join('\n'),
    'intro.txt': () =>
      'I explore the intersection of technology, design, and digital experimentation, turning ambitious ideas into interactive experiences.',
    'identity.rec': () =>
      [`NAME       ${identity.name}`, `ARABIC     ${identity.nameAr}`, `ROLE       ${identity.label}`, '', profile.summary].join('\n'),
    'interests.log': () => profile.interests.map((x, i) => `${String(i + 1).padStart(2, '0')}  ${x.key}`).join('\n'),
    'contact.cfg': () => {
      const rows = [`EMAIL      ${contact.email || '(not configured)'}`];
      contact.channels.forEach((c) => rows.push(`${c.label.padEnd(10)} ${c.url || '(not configured)'}`));
      return rows.join('\n');
    },
  };

  const commands = {
    help: {
      desc: 'list commands',
      run: () =>
        Object.entries(commands)
          .filter(([, c]) => !c.hidden)
          .map(([k, c]) => `<span class="l-ok">${k.padEnd(10)}</span>${esc(c.desc)}`)
          .join('\n'),
      html: true,
    },
    whoami: { desc: 'whose system this is', run: () => `${identity.name} (${identity.nameAr}) · ${identity.label}` },
    ls: { desc: 'list files', run: () => Object.keys(files).join('   ') },
    cat: {
      desc: 'print a file, e.g. cat readme.md',
      run: (args) => {
        if (!args[0]) return { err: 'cat: missing file name. Try: ls' };
        const f = files[args[0].toLowerCase()];
        return f ? f() : { err: `cat: ${args[0]}: no such file` };
      },
    },
    archive: {
      desc: 'list archive entries',
      run: () =>
        projects
          .map(
            (p) =>
              `<button type="button" class="l-link" data-term-open="${esc(p.id)}">${esc(p.id)}</button>  ${esc(p.title.padEnd(14))} <span class="l-dim">${esc(p.status)}</span>`
          )
          .join('\n'),
      html: true,
    },
    open: {
      desc: 'open an archive entry, e.g. open op-001',
      run: (args) => {
        if (!args[0]) return { err: 'open: which entry? Try: archive' };
        return openCase(args[0]) ? `opening case file ${args[0].toUpperCase()}` : { err: `open: ${args[0]}: no such entry` };
      },
    },
    goto: {
      desc: `jump to a section: ${SECTIONS.join(', ')}`,
      run: (args) => {
        const s = (args[0] || '').toLowerCase().replace(/^#/, '');
        if (!SECTIONS.includes(s)) return { err: `goto: choose one of ${SECTIONS.join(', ')}` };
        setTimeout(() => goTo(s), 250);
        return `moving to #${s}`;
      },
    },
    date: { desc: 'local date and time', run: () => new Date().toString() },
    uptime: {
      desc: 'time since this page loaded',
      run: () => {
        const s = Math.floor((Date.now() - bootTime) / 1000);
        return `session up ${Math.floor(s / 60)}m ${s % 60}s`;
      },
    },
    history: { desc: 'commands you typed', run: () => history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join('\n') || '(empty)' },
    echo: { desc: 'print text back', run: (args) => args.join(' ') },
    clear: { desc: 'clear the screen', run: () => { out.innerHTML = ''; return null; } },
    sudo: { hidden: true, run: () => ({ err: 'sudo: not available. This is a simulated shell with no real system behind it.' }) },
    rm: { hidden: true, run: () => ({ err: 'rm: nothing here can be deleted. The files are part of the page.' }) },
    ssh: { hidden: true, run: () => ({ err: 'ssh: shell_sim has no network access.' }) },
    exit: { hidden: true, run: () => { input.blur(); return 'session kept open. Click the prompt to type again.'; } },
  };

  function print(html, cls = '') {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = html;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  }

  function run(raw) {
    const line = raw.trim();
    print(`<b>$</b> ${esc(line)}`, 'l-cmd');
    if (!line) return;
    history.push(line);
    hIndex = history.length;
    const [name, ...args] = line.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    if (!cmd) {
      print(esc(`${name}: command not found. Type help for the list.`), 'l-err');
      return;
    }
    const res = cmd.run(args);
    if (res == null) return;
    if (typeof res === 'object' && res.err) print(esc(res.err), 'l-err');
    else print(cmd.html ? res : esc(res));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIndex > 0) hIndex--;
      input.value = history[hIndex] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIndex < history.length) hIndex++;
      input.value = history[hIndex] || '';
    } else if (e.key === 'Tab' && input.value.trim()) {
      const v = input.value.trim().toLowerCase();
      const parts = v.split(/\s+/);
      let pool = [];
      if (parts.length === 1) pool = Object.keys(commands).filter((k) => !commands[k].hidden);
      else if (parts[0] === 'cat') pool = Object.keys(files);
      else if (parts[0] === 'open') pool = projects.map((p) => p.id.toLowerCase());
      else if (parts[0] === 'goto') pool = SECTIONS;
      const last = parts[parts.length - 1];
      const hits = pool.filter((k) => k.startsWith(last));
      if (hits.length === 1) {
        e.preventDefault();
        parts[parts.length - 1] = hits[0];
        input.value = parts.join(' ') + (parts.length === 1 ? ' ' : '');
      } else if (hits.length > 1) {
        e.preventDefault();
        print(hits.join('   '), 'l-dim');
      }
      // No match: let Tab move focus as normal.
    }
  });

  out.addEventListener('click', (e) => {
    const b = e.target.closest('[data-term-open]');
    if (b) openCase(b.dataset.termOpen);
  });

  print('shell_sim 0.1 · simulated, local only', 'l-dim');
  print('type <span class="l-ok">help</span> to list commands');
}
