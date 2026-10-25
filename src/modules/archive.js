import { projects } from '../data/content.js';
import { projectVisual } from './visuals.js';

const STATUS = {
  LIVE_ON_SITE: { cls: 'tag--live', text: 'LIVE_ON_SITE' },
  PLACEHOLDER: { cls: 'tag--hold', text: 'PLACEHOLDER' },
  PUBLISHED: { cls: 'tag--pub', text: 'PUBLISHED' },
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function initArchive({ onFilter } = {}) {
  const list = document.getElementById('ops');
  const filters = document.getElementById('filters');
  const count = document.getElementById('archive-count');
  const dialog = document.getElementById('case');
  let lastTrigger = null;

  // Entries
  list.innerHTML = projects
    .map((p, i) => {
      const st = STATUS[p.status] || STATUS.PLACEHOLDER;
      return `<li class="op op--${p.size || 'md'} ${p.status === 'PLACEHOLDER' ? 'op--placeholder' : ''} reveal" data-cat="${esc(p.category)}">
        <button type="button" class="op__btn" data-op="${esc(p.id)}" aria-haspopup="dialog">
          <span class="op__visual">${projectVisual(p.visual, i * 97 + 13)}<span class="op__scan"></span></span>
          <span class="op__meta">
            <span class="op__row"><span>${esc(p.id)} · ${esc(p.category)}</span><i class="tag ${st.cls}">${st.text}</i></span>
            <span class="op__title">${esc(p.title)}</span>
            <span class="op__sum">${esc(p.summary)}</span>
            <span class="op__row"><span class="op__stack">${p.stack.map(esc).join(' / ')}</span><span class="op__open">OPEN FILE <span aria-hidden="true">→</span></span></span>
          </span>
        </button>
      </li>`;
    })
    .join('');

  // Filters built from the categories that actually exist
  const cats = ['ALL', ...new Set(projects.map((p) => p.category))];
  filters.innerHTML = cats
    .map((c) => {
      const n = c === 'ALL' ? projects.length : projects.filter((p) => p.category === c).length;
      return `<button type="button" class="filter" data-filter="${esc(c)}" aria-pressed="${c === 'ALL'}">${esc(c)}<span class="filter__n">${n}</span></button>`;
    })
    .join('');

  function applyFilter(cat) {
    let shown = 0;
    list.querySelectorAll('.op').forEach((li) => {
      const on = cat === 'ALL' || li.dataset.cat === cat;
      li.classList.toggle('is-hidden', !on);
      if (on) shown++;
    });
    filters.querySelectorAll('.filter').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    count.textContent = `${String(shown).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')} ENTRIES · FILTER: ${cat}`;
    onFilter?.();
  }
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('.filter');
    if (b) applyFilter(b.dataset.filter);
  });
  applyFilter('ALL');

  // Case file dialog
  function open(id, trigger) {
    const p = projects.find((x) => x.id.toLowerCase() === String(id).toLowerCase());
    if (!p) return false;
    const st = STATUS[p.status] || STATUS.PLACEHOLDER;
    lastTrigger = trigger || document.activeElement;
    document.getElementById('case-id').textContent = `CASE_FILE / ${p.id}`;
    document.getElementById('case-visual').innerHTML = projectVisual(p.visual, projects.indexOf(p) * 97 + 13);
    document.getElementById('case-cat').textContent = p.category;
    document.getElementById('case-title').textContent = p.title;
    document.getElementById('case-summary').textContent = p.summary;
    document.getElementById('case-meta').innerHTML = `
      <div><dt>STATUS</dt><dd><i class="tag ${st.cls}">${st.text}</i></dd></div>
      <div><dt>STACK</dt><dd>${p.stack.map(esc).join(', ')}</dd></div>
      <div><dt>IDENTIFIER</dt><dd>${esc(p.id)}</dd></div>`;
    document.getElementById('case-brief').textContent = p.brief;
    document.getElementById('case-notes').innerHTML = p.notes.map((n) => `<li>${esc(n)}</li>`).join('');
    const actions = document.getElementById('case-actions');
    if (p.link) {
      const ext = /^https?:/.test(p.link.href);
      actions.innerHTML = `<a class="btn btn--solid" href="${esc(p.link.href)}" ${ext ? 'target="_blank" rel="noopener noreferrer"' : 'data-close'}>${esc(p.link.label)} <span aria-hidden="true">${ext ? '↗' : '→'}</span></a>`;
    } else {
      actions.innerHTML = `<p class="case__pending">NO PUBLIC BUILD YET. THIS SLOT IS WAITING FOR A REAL PROJECT.</p>`;
    }
    dialog.showModal();
    document.getElementById('case-close').focus();
    return true;
  }
  function close() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener('close', () => {
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close(); // backdrop
    const link = e.target.closest('[data-close]');
    if (link) {
      lastTrigger = null;
      close();
    }
  });
  document.getElementById('case-close').addEventListener('click', close);
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-op]');
    if (b) open(b.dataset.op, b);
  });

  return { open, list: () => projects };
}
