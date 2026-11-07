/* زَادُ النَّحْوِ — Zād an-Nahw · moteur de l'appli
   Fiche → Entraînement → Examen, pour le nahw du tome 3 de Médine.
   JavaScript simple, sans dépendance. La progression est gardée sur l'appareil. */
(function () {
  'use strict';

  const Z = window.ZAD;
  const VERSION = '1.0';
  const EXAM_N = 12;
  const app = document.getElementById('app');

  /* ================================================================ outils */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const AR_RUN = /[؀-ۿﭐ-﷿ﹰ-﻿«»﴿﴾]+(?:(?:[ \u00A0]*[←][ \u00A0]*|[ \u00A0]+)[؀-ۿﭐ-﷿ﹰ-﻿«»﴿﴾]+)*/g;
  const hasAr = (s) => /[؀-ۿ]/.test(s);
  const hasLat = (s) => /[A-Za-zÀ-ÿ]/.test(s);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const clean = (s) => String(s).replace(/\[\[|\]\]|\{\{|\}\}|\(\(|\)\)/g, '');

  /* texte arabe avec repères [[souligné]] {{encadré}} ((visé)) */
  function mk(s) {
    return esc(s)
      .replace(/\^\^(.+?)\^\^/g, '<span class="ref">$1</span>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/==(.+?)==/g, '$1')
      .replace(/\[\[(.+?)\]\]/g, '<span class="u">$1</span>')
      .replace(/\{\{(.+?)\}\}/g, '<span class="bx">$1</span>')
      .replace(/\(\((.+?)\)\)/g, '<span class="cible">$1</span>')
      .replace(/\uFDFA/g, '<span class="saw">\uFDFA</span>'); /* ﷺ isolé : sinon Chrome casse la ligne entière */
  }
  /* texte français contenant de l'arabe */
  /* Dans une phrase française, un mot arabe cité se lit à la pause : pas de voyelle sur sa dernière lettre
     (la chadda reste). Les phrases arabes citées entre « » gardent toutes leurs voyelles,
     comme les mots marqués ==…== dans les données. */
  const pause = (m) => m.replace(/([\u0621-\u063F\u0641-\u064A\u0671])([\u064B-\u0652]+)(?=[^\u0621-\u063F\u0641-\u064A\u0671]*$)/, (x, l, mks) => l + mks.replace(/[^\u0651]/g, ''));
  const arIn = (m, keep) => {
    const inner = m.replace(/[«»]/g, '').trim();
    if (!keep && !(/^«/.test(m) && /\s/.test(inner))) m = pause(m);
    return '<span class="ar-i' + (m.replace(/[\u064B-\u0652\u0670]/g, '').length <= 24 ? ' nw' : '') + '" dir="rtl" lang="ar">' + m + '</span>';
  };
  function fr(s) {
    return String(s).split(/(==.+?==)/).map((part) => {
      if (/^==.+==$/.test(part)) return arIn(esc(part.slice(2, -2)), true);
      /* une citation arabe entre « » forme un bloc unique (même avec ← ! + ؟), pour garder l'ordre et les guillemets */
      return part.split(/(«[^«»A-Za-zÀ-ÿ]*[\u0621-\u064A][^«»A-Za-zÀ-ÿ]*»)/).map((q, i) => (i % 2 ? arIn(esc(q.replace(/«\s+/, '«').replace(/\s+»/, '»')), false) : esc(q).replace(AR_RUN, (m) => arIn(m, false)))).join('');
    }).join('');
  }
  const AR = (s, cls) => '<div class="ar' + (cls ? ' ' + cls : '') + '" dir="rtl" lang="ar">' + mk(s) + '</div>';

  /* ================================================================ pictogrammes */
  const P = (d, extra) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '>' + d + '</svg>';
  const I = {
    back: P('<path d="M15 5l-7 7 7 7"/>'),
    close: P('<path d="M6 6l12 12M18 6L6 18"/>'),
    gear: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    fiche: P('<path d="M2 5.5C4.5 4 7.5 4 12 6c4.5-2 7.5-2 10-.5V19c-2.5-1.5-5.5-1.5-10 .5-4.5-2-7.5-2-10-.5z"/><path d="M12 6v13.5"/>'),
    train: P('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    exam: P('<circle cx="12" cy="9" r="6"/><path d="M8.5 13.8L7 22l5-3 5 3-1.5-8.2"/><path d="M9.8 9l1.5 1.5L14.5 7.5"/>'),
    ok: P('<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>'),
    ko: P('<circle cx="12" cy="12" r="10"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>'),
    redo: P('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
    next: P('<path d="M9 5l7 7-7 7"/>'),
    down: P('<path d="M12 3v18M6 15l6 6 6-6"/>', ' stroke-width="1.8"'),
    // types d'exercices
    qcm: P('<circle cx="5" cy="7" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="5" cy="17" r="1.6"/><path d="M10 7h10M10 12h10M10 17h10"/>', ' stroke-width="2.4"'),
    trou: P('<path d="M3 17h5M16 17h5"/><rect x="9.5" y="13" width="5" height="6" rx="1"/><path d="M3 9h18"/>', ' stroke-width="2.4"'),
    vf: P('<path d="M3 12l3.5 3.5L12 9"/><path d="M15 9l6 6M21 9l-6 6"/>', ' stroke-width="2.6"'),
    ordre: P('<path d="M4 7h9M4 12h13M4 17h7"/><path d="M19 4v7M16.5 8.5L19 11l2.5-2.5"/>', ' stroke-width="2.4"'),
    touche: P('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>', ' stroke-width="2.4"'),
    assoc: P('<circle cx="5" cy="7" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="19" cy="17" r="2"/><path d="M7 7l10 10M7 17L17 7"/>', ' stroke-width="2.2"'),
    irab: P('<path d="M12 4v5M12 9l-6 5M12 9l6 5"/><circle cx="12" cy="4" r="1.5"/><rect x="3" y="15" width="6" height="5" rx="1.3"/><rect x="15" y="15" width="6" height="5" rx="1.3"/>', ' stroke-width="2.2"')
  };
  const TYPES = {
    qcm: { nom: 'QCM', c: '#2F63A8' },
    trou: { nom: 'Phrase à trous', c: '#93670F' },
    vf: { nom: 'Vrai ou faux', c: '#A63F55' },
    ordre: { nom: 'Remettre dans l’ordre', c: '#5A48B0' },
    touche: { nom: 'Touche le mot', c: '#117884' },
    assoc: { nom: 'Associer', c: '#2C7A3A' },
    irab: { nom: 'Iʿrāb', c: '#B05306' }
  };
  const ASSOC_COLORS = ['#2563EB', '#E8590C', '#D6336C', '#0CA678', '#9C6B00', '#7048E8'];

  /* ================================================================ mémoire */
  const KEY = 'zad.v1';
  let DB = {};
  try { DB = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { DB = {}; }
  DB.pref = DB.pref || {};
  DB.l = DB.l || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* stockage indisponible */ } }
  function LS(id) { return (DB.l[id] = DB.l[id] || { vus: [], qa: {}, ex: {}, exam: {} }); }
  function applyPref() {
    const r = document.documentElement;
    if (DB.pref.font === 'naskh') r.dataset.font = 'naskh'; else delete r.dataset.font;
    if (DB.pref.taille && DB.pref.taille !== 'm') r.dataset.taille = DB.pref.taille; else delete r.dataset.taille;
  }

  /* ================================================================ leçons */
  const CAT = Z.catalogue;
  const LES = (id) => Z.lecons[id];
  const catOf = (id) => CAT.find((c) => c.id === id);
  const slug = (id) => String(catOf(id).n);
  const lessonFromSlug = (s) => { const c = CAT.find((x) => String(x.n) === s && x.pret && Z.lecons[x.id]); return c ? c.id : null; };
  const pname = (L, p) => (p === 0 ? 'Synthèse' : L.points[p - 1].court || L.points[p - 1].titre);

  function stats(id) {
    const L = LES(id), s = LS(id);
    const ok = L.exos.filter((e) => s.ex[e.id] === 1).length;
    const ko = L.exos.filter((e) => s.ex[e.id] === 0).length;
    return { npts: L.points.length, vus: s.vus.length, nex: L.exos.length, ok, ko, pct: Math.round((ok / L.exos.length) * 100), best: s.exam.best, last: s.exam.last };
  }
  function nextStep(id) {
    const st = stats(id);
    if (st.vus < st.npts) return 'fiche';
    if (st.pct < 80) return 'train';
    return 'exam';
  }
  const STEP = {
    fiche: { nom: 'Fiche', route: 'fiche' },
    train: { nom: 'Entraînement', route: 'entrainement' },
    exam: { nom: 'Examen', route: 'examen' }
  };
  const note20 = (ok, n) => Math.round((ok / n) * 40) / 2;
  const fmt = (x) => String(x).replace('.', ',');

  /* ================================================================ état de l'écran */
  const V = { fiche: {}, session: null, exam: null, modal: null, route: '' };
  window.__zad = { V, Z, fr: (s) => fr(s), mk: (s) => mk(s) };

  function parse() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'reglages') return { v: 'reglages' };
    const m = /^lecon-([\d-]+?)(?:-(fiche|entrainement|examen))?$/.exec(h);
    if (m) { const id = lessonFromSlug(m[1]); if (id) return { v: m[2] || 'lecon', id }; }
    return { v: 'accueil' };
  }
  function go(h) { if (location.hash.slice(1) === h) render(); else location.hash = h; }

  /* ================================================================ rendu commun */
  function top(left, title, right) {
    return '<header class="top">' + (left || '<span class="ib"></span>') + '<div class="t">' + (title || '') + '</div>' + (right || '<span class="ib"></span>') + '</header>';
  }
  const backBtn = (to, label) => '<button class="ib" data-go="' + esc(to) + '" aria-label="' + esc(label || 'Retour') + '">' + I.back + '</button>';
  const gearBtn = () => '<button class="ib" data-go="reglages" aria-label="Réglages">' + I.gear + '</button>';
  const pic = (k, sm) => '<span class="pic ' + k + (sm ? ' sm' : '') + '">' + I[k] + '</span>';
  const typeIcon = (t) => '<span class="ti" style="background:' + TYPES[t].c + '">' + I[t] + '</span>';
  function ring(frac, color) {
    const r = 56, c = 2 * Math.PI * r;
    return '<svg viewBox="0 0 132 132"><circle cx="66" cy="66" r="' + r + '" fill="none" stroke="rgba(27,33,48,.08)" stroke-width="12"/>' +
      '<circle cx="66" cy="66" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (c * Math.max(0, Math.min(1, frac))).toFixed(1) + ' ' + c.toFixed(1) + '"/></svg>';
  }

  /* ================================================================ ACCUEIL */
  function viewAccueil() {
    let resume = '';
    const lastId = DB.last && LES(DB.last) ? DB.last : (CAT.find((c) => c.pret) || {}).id;
    if (lastId) {
      const st = nextStep(lastId);
      const started = DB.last ? 'Reprendre' : 'Commencer';
      resume = '<button class="card resume" data-go="lecon-' + slug(lastId) + '-' + STEP[st].route + '">' + pic(st) +
        '<span class="txt"><span class="k">' + started + '</span><br><span class="v">Leçon ' + esc(slug(lastId)) + ' · ' + STEP[st].nom + '</span></span>' +
        '<span class="go" style="background:var(--' + st + ')">' + I.next + '</span></button>';
    }
    const cards = CAT.map((c) => {
      const pts = '<div class="pts" dir="rtl" lang="ar">' + esc(c.points.join('، ')) + '</div>';
      const numCls = String(c.n).length > 2 ? 'num wide' : 'num';
      if (!(c.pret && LES(c.id))) {
        return '<div class="card lesson soon"><span class="' + numCls + '">' + esc(c.n) + '</span><div class="body"><div class="lt">Leçon ' + esc(c.n) + ' <span class="muted small">· bientôt</span></div>' + pts + '</div></div>';
      }
      const s = stats(c.id);
      const chips = '<div class="chips">' +
        '<span class="chip fiche">' + I.fiche + s.vus + '/' + s.npts + '</span>' +
        '<span class="chip train">' + I.train + s.pct + ' %</span>' +
        '<span class="chip exam">' + I.exam + (s.best != null ? fmt(s.best) + '/20' : '—') + '</span></div>';
      return '<button class="card lesson" data-go="lecon-' + slug(c.id) + '"><span class="' + numCls + '">' + esc(c.n) + '</span><div class="body"><div class="lt">Leçon ' + esc(c.n) + '</div>' + pts + chips + '</div></button>';
    }).join('');
    return {
      top: top(null, '', gearBtn()),
      main: '<div class="brand"><div class="ar" dir="rtl" lang="ar">زَادُ النَّحْوِ</div><div class="sub">Nahw · tome 3 de Médine</div></div>' + resume +
        '<div class="h2">Leçons</div>' + cards +
        '<div class="foot">Zād an-Nahw · v' + VERSION + '</div>'
    };
  }

  /* ================================================================ PAGE LEÇON */
  function viewLecon(id) {
    const L = LES(id), s = stats(id), st = nextStep(id), sl = slug(id), ls = LS(id);
    DB.last = id; save();
    const step = (k, desc, status) => {
      const isNext = k === st;
      return '<button class="card step' + (isNext ? ' next ' + k : '') + '" data-go="lecon-' + sl + '-' + STEP[k].route + '">' +
        (isNext ? '<span class="badge-next"><span>Étape suivante</span></span>' : '') + pic(k) +
        '<span class="txt"><span class="nm">' + STEP[k].nom + '</span><br><span class="ds">' + desc + '</span></span><span class="st">' + status + '</span></button>';
    };
    const ficheSt = s.vus >= s.npts ? '<span class="done">' + I.ok.replace('<svg', '<svg width="22" height="22"') + '</span>' : s.vus + '/' + s.npts;
    const rows = L.points.map((p, i) => {
      const ex = L.exos.filter((e) => e.p === i + 1);
      const ok = ex.filter((e) => ls.ex[e.id] === 1).length;
      return '<button class="prow" data-act="openPoint" data-p="' + i + '"><span class="pn' + (ls.vus.includes(i) ? ' seen' : '') + '">' + (i + 1) + '</span>' + AR(p.court || p.titre) + '<span class="sc">' + ok + '/' + ex.length + '</span></button>';
    }).join('');
    return {
      top: top(backBtn('accueil'), 'Leçon ' + esc(sl), gearBtn()),
      main: '<div class="lhead"><div class="ar" dir="rtl" lang="ar">' + esc(catOf(id).points.join('، ')) + '</div></div>' +
        '<div class="steps">' +
        step('fiche', s.npts + ' points · questions pour s’interroger', ficheSt) +
        step('train', s.nex + ' questions · erreurs à refaire', s.pct + ' %') +
        step('exam', EXAM_N + ' questions · note sur 20', s.best != null ? fmt(s.best) + '/20' : '—') +
        '</div><div class="h2">Points de la leçon</div><div class="card plist">' + rows + '</div>'
    };
  }

  /* ================================================================ FICHE */
  function tagH(b) { return b.tag ? '<div class="tag" dir="rtl">' + mk(b.tag) + '</div>' : ''; }
  /* traduction française d'un mot de la fiche : en face, à gauche, reliée par un pointillé */
  function exH(b) { return b.ex ? [].concat(b.ex).map((x) => '<div class="ar exl" dir="rtl" lang="ar"><span class="mk vert">' + mk(x) + '</span></div>').join('') : ''; }
  function lineH(inner, b) {
    const ar = '<div class="ar" dir="rtl" lang="ar">' + inner + '</div>';
    const line = b.fr ? '<div class="trow">' + ar + '<span class="tr" lang="fr"><span>' + esc(b.fr) + '</span></span></div>' : ar;
    return line + (b.frnote ? '<div class="frnote">' + fr(b.frnote) + '</div>' : '');
  }
  function corrBtn(key) { return '<button class="corr" data-act="corr" data-k="' + key + '" aria-label="Correction">✎</button>'; }
  function addBox(title, items, note) {
    items = [].concat(items || []);
    let inner;
    if (items.length > 1 || title) inner = (title ? '<span class="at">' + mk(title) + '</span>' : '') + '<ul>' + items.map((x) => '<li>' + mk(x) + '</li>').join('') + '</ul>';
    else inner = mk(items[0]);
    return '<div class="add"><div class="lb">sharh</div><div class="ar" dir="rtl" lang="ar">' + inner + (note ? '<div class="nt">' + mk(note) + '</div>' : '') + '</div></div>';
  }
  function irabsH(b) {
    if (!b.irab) return '';
    const h = b.irab.map(([w, t]) => '<div class="ar irabs" dir="rtl"><span class="w">' + mk(w) + ' :</span> <span class="a" style="color:var(--f-orange)">' + mk(t) + '</span></div>').join('');
    return b.irabSharh ? '<div class="add"><div class="lb">sharh</div>' + h + '</div>' : h;
  }
  function blocH(b, key, compact) {
    const corr = b.corr ? corrBtn(key) : '';
    let c = '';
    switch (b.k) {
      case 'regle':
        c = tagH(b) + lineH('<span class="mk rose">' + mk(b.ar) + '</span>', b) + exH(b);
        break;
      case 'simple':
        c = tagH(b) + lineH(mk(b.ar), b) + exH(b);
        break;
      case 'liste':
        c = tagH(b) + '<div class="liste">' + b.items.map((x) => '<div class="li"><div class="ar" dir="rtl" lang="ar"><b>' + mk(x.h) + '</b>' + (x.t ? ' : ' + mk(x.t) : '') + '</div>' +
          (x.ex ? '<div class="ar exl" dir="rtl" lang="ar"><span class="mk vert">' + mk(x.ex) + '</span></div>' : '') +
          (x.pairs ? '<div class="pairs" dir="rtl" lang="ar">' + x.pairs.map((pr) => '<span class="pr">' + mk(pr[0]) + '<i>←</i>' + mk(pr[1]) + '</span>').join('') + '</div>' : '') + '</div>').join('') + '</div>' + (b.frnote ? '<div class="frnote">' + fr(b.frnote) + '</div>' : '');
        break;
      case 'tableau': {
        const corrs = [];
        if (b.sous) {
          /* 2 colonnes ; la 3e (origine, étapes, explication) passe en dessous, sur toute la largeur */
          const rows = b.rows.map((r, i) => {
            let rc = '';
            if (r.corr) { const k = key + '-r' + i; corrs.push([k, r.corr]); rc = corrBtn(k); }
            const sub = r.ch || r.r ? '<tr class="sb"><td colspan="2">' + (r.ch ? '<div class="rch">' + r.ch.map((f, j) => '<span class="f">' + (j ? '<i>←</i>' : '') + mk(f) + '</span>').join('') + '</div>' : '') + (r.r ? '<div class="rx">' + mk(r.r) + '</div>' : '') + '</td></tr>' : '';
            return '<tr class="' + (sub ? 'hd' : '') + '"><td class="v">' + mk(r.c[0]) + (r.cap ? '<span class="cap">' + mk(r.cap) + '</span>' : '') + rc + '</td><td class="v m">' + mk(r.c[1]) + '</td></tr>' + sub;
          }).join('');
          c = tagH(b) + (b.titre ? '<div class="ttl" dir="rtl"><span>' + mk(b.titre) + '</span></div>' : '') +
            '<div class="tbl dessous" dir="rtl" lang="ar"><table><thead><tr>' + b.cols.slice(0, 2).map((x) => '<th>' + mk(x) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
            corrs.map(([k, t]) => '<div class="corrtxt" data-corr="' + k + '" hidden>' + fr(t) + '</div>').join('') + (b.frnote ? '<div class="frnote">' + fr(b.frnote) + '</div>' : '');
          break;
        }
        let skip = 0;
        const rows = b.rows.map((r, i) => {
          let rc = '';
          if (r.corr) { const k = key + '-r' + i; corrs.push([k, r.corr]); rc = corrBtn(k); }
          const c0 = '<td class="v">' + mk(r.c[0]) + (r.cap ? '<span class="cap">' + mk(r.cap) + '</span>' : '') + rc + '</td>';
          const c1 = '<td class="v m">' + mk(r.c[1]) + '</td>';
          let c2 = '';
          if (skip > 0) skip--;
          else if (r.r != null || r.ch) { c2 = '<td class="rl"' + (r.span ? ' rowspan="' + r.span + '"' : '') + '>' + (r.ch ? '<div class="rch">' + r.ch.map((f, j) => '<span class="f">' + (j ? '<i>←</i>' : '') + mk(f) + '</span>').join('') + '</div>' + (r.r ? '<div class="rx">' + mk(r.r) + '</div>' : '') : mk(r.r)) + '</td>'; if (r.span) skip = r.span - 1; }
          return '<tr>' + c0 + c1 + c2 + '</tr>';
        }).join('');
        c = tagH(b) + (b.titre ? '<div class="ttl" dir="rtl"><span>' + mk(b.titre) + '</span></div>' : '') +
          '<div class="tbl' + (b.large ? ' large' : '') + '" dir="rtl" lang="ar"><table><thead><tr>' + b.cols.map((x) => '<th>' + mk(x) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
          corrs.map(([k, t]) => '<div class="corrtxt" data-corr="' + k + '" hidden>' + fr(t) + '</div>').join('') + (b.frnote ? '<div class="frnote">' + fr(b.frnote) + '</div>' : '');
        break;
      }
      case 'exemple':
        c = tagH(b) + lineH('<span class="mk vert">' + mk(b.ar) + '</span>', b) + irabsH(b);
        break;
      case 'serie':
        c = tagH(b) + '<div class="serie' + (b.grille ? ' grille' : '') + '" dir="rtl">' + b.items.map((x, i) => (i && !b.grille ? '<span class="sa">' + I.back + '</span>' : '') +
          '<span class="si"><span class="sw" lang="ar">' + mk(x.ar) + '</span><span class="sc" lang="ar">' + mk(x.cap) + '</span></span>').join('') + '</div>' + (b.frnote ? '<div class="frnote">' + fr(b.frnote) + '</div>' : '');
        break;
      case 'irab':
        c = '<div class="ar irab" dir="rtl" lang="ar"><span class="w">' + mk(b.mot) + ' :</span> <span class="a">' + mk(b.ar) + '</span>' + '</div>';
        break;
      case 'titre':
        c = '<div class="ititre" dir="rtl"><b>' + mk(b.ar) + '</b></div>';
        break;
      case 'sharh':
        c = addBox(b.titre, b.items, b.note);
        break;
      case 'chaine':
        c = '<div class="chaine">' + b.etapes.map((e, i) => {
          const arrow = i < b.etapes.length - 1 ? '<div class="ar-down">' + I.down + (e.note ? '<span class="nt" dir="rtl">' + mk(e.note) + '</span>' : '') + '</div>' : '';
          return '<div class="et' + (e.boite ? ' box' : '') + '" dir="rtl" lang="ar">' + mk(e.ar) + '</div>' + arrow;
        }).join('') + '</div>';
        break;
      case 'conditions':
        c = '<div class="cond"><div class="bx2"><div class="h">يَسْبِقُهَا :</div><div class="ar" dir="rtl">' + b.sabaq.map(mk).join(' <span class="muted">/</span> ') + '</div></div>' +
          '<div class="plus">+</div><div class="bx2"><div class="ar" dir="rtl">' + mk(b.majrur) + '</div></div></div>';
        break;
      case 'schemes':
        c = b.lignes.map((l) => '<div class="sch"><span class="lb">' + l.n + '</span><span class="cases">' +
          l.cases.map((x) => '<span class="cs' + (x ? ' k' : '') + '">' + esc(x) + '</span>').join('') + '</span><span class="ex" dir="rtl">' + mk(l.ex) + '</span></div>').join('') +
          (b.precision ? '<div class="prec">' + fr(b.precision) + '</div>' : '');
        break;
    }
    if (b.sharh && b.k !== 'sharh') c += addBox(null, b.sharh);
    if (b.corr) c += '<div class="corrtxt" data-corr="' + key + '" hidden>' + fr(b.corr) + '</div>';
    const num = '<span class="nc">' + (b.n ? '<span class="n">' + b.n + '</span>' : '<span class="n vide"></span>') + corr + '</span>';
    return '<div class="bloc">' + num + '<div class="c">' + c + '</div></div>';
  }
  function blocsH(L, p, ids, compact) {
    const pt = L.points[p];
    const list = ids ? ids.map((x) => pt.blocs.find((b) => b.id === x)).filter(Boolean) : pt.blocs;
    return '<div class="blocs">' + list.map((b) => blocH(b, L.id + '-' + p + '-' + b.id + (compact ? '-c' : ''), compact)).join('') + '</div>';
  }

  function ficheState(id) { return (V.fiche[id] = V.fiche[id] || { mode: 'fiche', p: firstUnseen(id), open: {} }); }
  function firstUnseen(id) { const v = LS(id).vus; const L = LES(id); for (let i = 0; i < L.points.length; i++) if (!v.includes(i)) return i; return 0; }

  function viewFiche(id) {
    const L = LES(id), F = ficheState(id), ls = LS(id), sl = slug(id);
    DB.last = id;
    const p = Math.min(F.p, L.points.length - 1);
    const pt = L.points[p];
    if (F.mode === 'fiche' && !ls.vus.includes(p)) { ls.vus.push(p); }
    save();
    const tabs = '<div class="tabs">' + L.points.map((_, i) => '<button class="tab' + (i === p ? ' on' : '') + (ls.vus.includes(i) ? ' seen' : '') + '" data-act="ficheP" data-p="' + i + '" aria-label="Point ' + (i + 1) + '">' + (i + 1) + '</button>').join('') + '</div>';
    const seg = '<div class="seg"><button class="' + (F.mode === 'fiche' ? 'on' : '') + '" data-act="ficheMode" data-m="fiche">Fiche</button><button class="' + (F.mode === 'qa' ? 'on' : '') + '" data-act="ficheMode" data-m="qa">Je m’interroge</button></div>';
    const head = '<div class="ptitle"><div class="ar" dir="rtl" lang="ar"><span>' + mk(pt.titre) + '</span></div>' +
      '<button class="mini" data-act="trainPoint" data-p="' + (p + 1) + '">' + I.train + 'S’entraîner</button></div>';
    let body;
    if (F.mode === 'fiche') {
      body = '<div class="card sheet">' + head + blocsH(L, p) + '</div>';
    } else {
      body = '<div class="card sheet" style="padding-bottom:12px">' + head.replace('class="ptitle"', 'class="ptitle" style="margin-bottom:2px"') + '</div>' +
        '<div style="margin-top:10px">' + pt.questions.map((q, qi) => {
          const k = p + '-' + qi;
          const open = F.open[k];
          const r = ls.qa[k];
          const st = r === 1 ? '<span class="qs" style="color:var(--ok)">' + I.ok + '</span>' : r === 0 ? '<span class="qs" style="color:var(--train)">' + I.redo + '</span>' : '';
          return '<div class="card qa"><div class="qq"><span class="qn">' + (qi + 1) + '</span><div class="qt">' + fr(q.q) + '</div>' + st + '</div>' +
            (open ? '<div class="ans">' + blocsH(L, p, q.a) + '</div><div class="rate"><button class="n' + (r === 0 ? ' on' : '') + '" data-act="rate" data-k="' + k + '" data-v="0">À revoir</button><button class="y' + (r === 1 ? ' on' : '') + '" data-act="rate" data-k="' + k + '" data-v="1">Je savais</button></div>'
              : '<button class="btn ghost fiche rev" style="min-height:44px" data-act="reveal" data-k="' + k + '">Voir la réponse</button>') + '</div>';
        }).join('') + '</div>';
    }
    const last = p === L.points.length - 1;
    const bar = '<div class="bar"><div class="bar-in">' +
      (p > 0 ? '<button class="btn ghost narrow" data-act="ficheP" data-p="' + (p - 1) + '" aria-label="Point précédent">' + I.back + '</button>' : '') +
      (last ? '<button class="btn train" data-go="lecon-' + sl + '-entrainement">S’entraîner' + I.next + '</button>'
        : '<button class="btn fiche" data-act="ficheP" data-p="' + (p + 1) + '">Point suivant' + I.next + '</button>') + '</div></div>';
    return { top: top(backBtn('lecon-' + sl), 'Fiche · Leçon ' + esc(sl)), main: seg + tabs + body, bar };
  }

  /* ================================================================ EXERCICES : préparation */
  function tokens(s) { return s.split(/\s+/).filter(Boolean).map((w) => ({ w: w.replace(/^\*/, ''), t: w.startsWith('*') })); }
  function prep(e) {
    const c = { answered: false, ok: null };
    if (e.o) c.order = shuffle(range(e.o.length));
    if (e.t === 'ordre') { c.bank = shuffle(e.tuiles.map((t, i) => ({ t, k: i })).concat((e.intrus || []).map((t, i) => ({ t, k: 100 + i })))); c.picked = []; }
    if (e.t === 'touche') { c.toks = tokens(e.s); c.sel = []; }
    if (e.t === 'assoc') { c.right = shuffle(range(e.paires.length)); c.pairs = {}; c.pick = null; }
    return c;
  }
  function isOk(e, c) {
    switch (e.t) {
      case 'qcm': case 'trou': case 'irab': return c.sel === 0;
      case 'vf': return c.sel === e.a;
      case 'ordre': return c.picked.length === e.tuiles.length && c.picked.every((k, i) => k === i);
      case 'touche': { const tg = c.toks.map((t, i) => (t.t ? i : -1)).filter((i) => i >= 0); return tg.length === c.sel.length && tg.every((i) => c.sel.includes(i)); }
      case 'assoc': return e.paires.every((_, i) => c.pairs[i] === i);
    }
    return false;
  }
  function hasAnswer(e, c) {
    switch (e.t) {
      case 'qcm': case 'trou': case 'irab': case 'vf': return c.sel != null;
      case 'ordre': return c.picked.length > 0;
      case 'touche': return c.sel.length > 0;
      case 'assoc': return Object.keys(c.pairs).length === e.paires.length;
    }
    return false;
  }
  function answerText(e) { // la bonne réponse, en texte
    switch (e.t) {
      case 'qcm': case 'trou': case 'irab': return e.o[0];
      case 'vf': return e.a ? 'صَحِيحٌ' : 'خَطَأٌ';
      case 'ordre': return e.tuiles.join(' ');
      case 'touche': return tokens(e.s).filter((t) => t.t).map((t) => t.w).join(' ');
      case 'assoc': return null;
    }
    return '';
  }
  function givenText(e, c) {
    switch (e.t) {
      case 'qcm': case 'trou': case 'irab': return c.sel == null ? null : e.o[c.sel];
      case 'vf': return c.sel == null ? null : c.sel ? 'صَحِيحٌ' : 'خَطَأٌ';
      case 'ordre': return c.picked.length ? c.picked.map((k) => (k >= 100 ? e.intrus[k - 100] : e.tuiles[k])).join(' ') : null;
      case 'touche': return c.sel.length ? c.sel.map((i) => c.toks[i].w).join(' ') : null;
    }
    return null;
  }
  const asFr = (s) => (hasLat(s) && !hasAr(s) ? ' fr' : '');
  const textH = (s) => (hasAr(s) && !hasLat(s) ? AR(s) : '<div>' + fr(s) + '</div>');

  /* ================================================================ EXERCICES : affichage d'une carte */
  function cardH(e, c, L, exam) {
    const T = TYPES[e.t];
    const ptName = e.p ? (L.points[e.p - 1].court || L.points[e.p - 1].titre) : '';
    let h = '<div class="card q' + (exam ? ' exam' : '') + '"><div class="qtype">' + typeIcon(e.t) + '<span>' + T.nom + '</span>' + (ptName ? '<span class="pt">' + esc(ptName) + '</span>' : '') + '</div>';
    if (e.q) h += '<div class="qprompt">' + fr(e.q) + '</div>';
    const showRes = c.answered && !exam;
    switch (e.t) {
      case 'qcm': case 'trou': case 'irab': {
        if (e.t === 'trou') {
          const parts = esc(e.s).split('___');
          let fill = '&nbsp;';
          let cls = 'blank';
          if (showRes) { fill = esc(e.o[c.sel]); cls += c.sel === 0 ? ' ok' : ' ko'; } else if (exam && c.sel != null) fill = esc(e.o[c.sel]);
          h += '<div class="qstem big"><div class="ar" dir="rtl" lang="ar">' + parts[0] + '<span class="' + cls + '">' + fill + '</span>' + (parts[1] || '') + '</div></div>';
        } else if (e.t === 'irab') {
          h += '<div class="qstem big">' + AR(e.s) + '</div>';
        }
        const long = e.o.some((o) => clean(o).length > 38);
        h += '<div class="opts' + (showRes ? ' done' : '') + '">' + c.order.map((i) => {
          const o = e.o[i];
          let cls = 'opt';
          const isAr = hasAr(o) && !hasLat(o);
          if (!isAr) cls += ' fr'; else if (long) cls += ' long';
          let mark = '';
          if (showRes) { if (i === 0) { cls += ' ok'; mark = '<span class="mk2" style="color:var(--ok)">' + I.ok + '</span>'; } else if (i === c.sel) { cls += ' ko'; mark = '<span class="mk2" style="color:var(--ko)">' + I.ko + '</span>'; } }
          else if (c.sel === i) cls += ' sel';
          return '<button class="' + cls + '" data-act="opt" data-i="' + i + '">' + (isAr ? '<span class="ar" dir="rtl" lang="ar">' + mk(o) + '</span>' : '<span>' + fr(o) + '</span>') + mark + '</button>';
        }).join('') + '</div>';
        break;
      }
      case 'vf': {
        h += '<div class="qstem big">' + textH(e.s) + '</div><div class="vf">' + [true, false].map((v) => {
          let cls = 'opt';
          if (showRes) { if (v === e.a) cls += ' ok'; else if (v === c.sel) cls += ' ko'; } else if (c.sel === v) cls += ' sel';
          return '<button class="' + cls + '" data-act="vf" data-v="' + (v ? 1 : 0) + '"><span class="ar" dir="rtl" lang="ar">' + (v ? 'صَحِيحٌ' : 'خَطَأٌ') + '</span></button>';
        }).join('') + '</div>';
        break;
      }
      case 'ordre': {
        const zc = showRes ? (c.ok ? ' ok' : ' ko') : '';
        h += '<div class="zone' + zc + '">' + (c.picked.length ? c.picked.map((k, j) => '<button class="tile" data-act="unpick" data-j="' + j + '">' + esc(k >= 100 ? e.intrus[k - 100] : e.tuiles[k]) + '</button>').join('') : '<span class="ph">Touche les étiquettes dans l’ordre</span>') + '</div>';
        h += '<div class="bank">' + c.bank.map((b) => '<button class="tile' + (c.picked.includes(b.k) ? ' used' : '') + '" data-act="pick" data-k="' + b.k + '">' + esc(b.t) + '</button>').join('') + '</div>';
        break;
      }
      case 'touche': {
        h += '<div class="words">' + c.toks.map((t, i) => {
          let cls = 'word';
          if (showRes) { if (t.t && c.sel.includes(i)) cls += ' ok'; else if (!t.t && c.sel.includes(i)) cls += ' ko'; else if (t.t) cls += ' miss'; }
          else if (c.sel.includes(i)) cls += ' sel';
          return '<button class="' + cls + '" data-act="tok" data-i="' + i + '" dir="rtl" lang="ar">' + esc(t.w) + '</button>';
        }).join('') + '</div>';
        break;
      }
      case 'assoc': {
        const pairOfRight = {};
        Object.keys(c.pairs).forEach((l) => { pairOfRight[c.pairs[l]] = +l; });
        const order = Object.keys(c.pairs).map(Number).sort((a, b) => a - b);
        const colorOf = (l) => ASSOC_COLORS[order.indexOf(l) % ASSOC_COLORS.length];
        const numOf = (l) => order.indexOf(l) + 1;
        const left = e.paires.map((pr, i) => {
          let cls = 'as', st = '', badge = '';
          if (showRes) cls += c.pairs[i] === i ? ' ok' : ' ko';
          else if (c.pairs[i] != null) { cls += ' pr'; st = ' style="--pc:' + colorOf(i) + '"'; badge = '<span class="pnum">' + numOf(i) + '</span>'; }
          else if (c.pick && c.pick.side === 'l' && c.pick.i === i) cls += ' pick';
          const fix = showRes && c.pairs[i] !== i ? '<span class="fix">' + mk(pr[1]) + '</span>' : '';
          return '<button class="' + cls + asFr(pr[0]) + '"' + st + ' data-act="as" data-side="l" data-i="' + i + '" dir="rtl" lang="ar">' + badge + mk(pr[0]) + fix + '</button>';
        }).join('');
        const right = c.right.map((j) => {
          let cls = 'as', st = '', badge = '';
          const l = pairOfRight[j];
          if (showRes) cls += l === j ? ' ok' : ' ko';
          else if (l != null) { cls += ' pr'; st = ' style="--pc:' + colorOf(l) + '"'; badge = '<span class="pnum">' + numOf(l) + '</span>'; }
          else if (c.pick && c.pick.side === 'r' && c.pick.i === j) cls += ' pick';
          return '<button class="' + cls + asFr(e.paires[j][1]) + '"' + st + ' data-act="as" data-side="r" data-i="' + j + '" dir="rtl" lang="ar">' + badge + mk(e.paires[j][1]) + '</button>';
        }).join('');
        h += '<div class="assoc"><div class="col">' + left + '</div><div class="col">' + right + '</div></div>';
        break;
      }
    }
    return h + '</div>';
  }

  /* retour après une réponse (entraînement) */
  function feedbackH(e, c, L) {
    const okk = c.ok;
    let h = '<div class="fb ' + (okk ? 'ok' : 'ko') + '"><div class="fb-in"><div class="res">' + (okk ? I.ok + 'Juste' : I.ko + 'Pas tout à fait') + '</div>';
    const ans = answerText(e);
    if (!okk && ans && e.t !== 'qcm' && e.t !== 'irab' && e.t !== 'trou' && e.t !== 'vf') h += '<div class="good"><div class="lb">Réponse</div>' + textH(ans) + '</div>';
    if (e.x && e.p) h += '<div class="why"><div class="lb">' + pic('fiche', true) + 'Fiche</div>' + blocsH(L, e.p - 1, e.x, true) + '</div>';
    if (e.xt) h += '<div class="xt">' + (hasAr(e.xt) && !hasLat(e.xt) ? AR(e.xt) : fr(e.xt)) + '</div>';
    h += '<button class="btn ' + (okk ? 'ok' : '') + '" data-act="next">Continuer' + I.next + '</button></div></div>';
    return h;
  }

  /* ================================================================ ENTRAÎNEMENT */
  function startSession(id, items, label) {
    if (!items.length) return;
    V.session = { id, items, i: 0, res: [], label, cur: prep(items[0]) };
    go('lecon-' + slug(id) + '-entrainement');
  }
  function viewTrain(id) {
    const L = LES(id), sl = slug(id);
    const S = V.session && V.session.id === id ? V.session : null;
    if (S && S.i < S.items.length) return viewSession(S, L);
    if (S && S.i >= S.items.length) return viewSessionEnd(S, L);
    // écran de départ
    const ls = LS(id), st = stats(id);
    const wrong = L.exos.filter((e) => ls.ex[e.id] === 0);
    const rows = L.points.map((p, i) => {
      const ex = L.exos.filter((e) => e.p === i + 1);
      const ok = ex.filter((e) => ls.ex[e.id] === 1).length;
      return '<button class="prow" data-act="trainPoint" data-p="' + (i + 1) + '"><span class="pn">' + (i + 1) + '</span>' + AR(p.court || p.titre) + '<span class="sc">' + ok + '/' + ex.length + '</span></button>';
    }).join('');
    const counts = {};
    L.exos.forEach((e) => { counts[e.t] = (counts[e.t] || 0) + 1; });
    const chips = Object.keys(TYPES).filter((t) => counts[t]).map((t) => '<button class="tc" data-act="trainType" data-t="' + t + '">' + typeIcon(t) + TYPES[t].nom + '<span class="ct">' + counts[t] + '</span></button>').join('');
    return {
      top: top(backBtn('lecon-' + sl), 'Entraînement · Leçon ' + esc(sl)),
      main: '<div class="shead">' + pic('train') + '<div><div class="nm">Entraînement</div><div class="ds">' + st.ok + ' justes sur ' + st.nex + ' · ' + st.pct + ' %</div></div></div>' +
        '<div class="stack" style="margin-top:16px"><button class="btn train" data-act="trainAll">Tout l’entraînement (' + L.exos.length + ')</button>' +
        (wrong.length ? '<button class="btn ghost train" data-act="trainWrong">' + I.redo.replace('<svg', '<svg width="20" height="20"') + 'Refaire mes erreurs (' + wrong.length + ')</button>' : '') + '</div>' +
        '<div class="h2">Par point</div><div class="card plist">' + rows + '</div>' +
        '<div class="h2">Par type</div><div class="typechips">' + chips + '</div>'
    };
  }
  function viewSession(S, L) {
    const e = S.items[S.i], c = S.cur;
    const n = S.items.length;
    const prog = '<div class="prog"><span class="pb"><i style="width:' + ((S.i / n) * 100).toFixed(1) + '%"></i></span><span class="pt">' + (S.i + 1) + '/' + n + '</span></div>';
    const needValidate = ['ordre', 'touche', 'assoc'].includes(e.t);
    let bar = '';
    if (!c.answered && needValidate) bar = '<div class="bar"><div class="bar-in"><button class="btn" data-act="validate"' + (hasAnswer(e, c) ? '' : ' disabled') + '>Valider</button></div></div>';
    return {
      top: '<header class="top"><button class="ib" data-act="quitTrain" aria-label="Quitter">' + I.close + '</button>' + prog + '<span style="width:6px"></span></header>',
      main: cardH(e, c, L, false),
      bar: c.answered ? feedbackH(e, c, L) : bar,
      withBar: true
    };
  }
  function viewSessionEnd(S, L) {
    const ok = S.res.filter(Boolean).length, n = S.items.length;
    const frac = ok / n;
    const msg = frac >= 0.9 ? 'Très bien !' : frac >= 0.7 ? 'Bien.' : frac >= 0.5 ? 'Encore un effort.' : 'Revois la fiche, puis recommence.';
    const wrong = S.items.filter((_, i) => !S.res[i]);
    const sl = slug(S.id);
    return {
      top: top('<button class="ib" data-act="endTrain" aria-label="Fermer">' + I.close + '</button>', S.label),
      main: '<div class="card score"><div class="ring">' + ring(frac, 'var(--train)') + '<div class="v"><span>' + ok + '<small>sur ' + n + '</small></span></div></div><div class="msg">' + msg + '</div></div>' +
        '<div class="stack" style="margin-top:14px">' +
        (wrong.length ? '<button class="btn train" data-act="redoWrong">' + I.redo.replace('<svg', '<svg width="20" height="20"') + 'Refaire mes erreurs (' + wrong.length + ')</button>' : '') +
        '<button class="btn ghost fiche" data-act="endTo" data-to="lecon-' + sl + '-fiche">' + I.fiche.replace('<svg', '<svg width="20" height="20"') + 'Revoir la fiche</button>' +
        '<button class="btn ' + (wrong.length ? 'ghost exam' : 'exam') + '" data-act="endTo" data-to="lecon-' + sl + '-examen">' + I.exam.replace('<svg', '<svg width="20" height="20"') + 'Passer à l’examen</button></div>'
    };
  }

  /* ================================================================ EXAMEN */
  function drawExam(L) {
    const pool = L.examen.slice();
    const chosen = [];
    for (let p = 1; p <= L.points.length; p++) {
      const of = shuffle(pool.filter((e) => e.p === p));
      if (of.length) chosen.push(of[0]);
    }
    const rest = shuffle(pool.filter((e) => !chosen.includes(e)));
    while (chosen.length < Math.min(EXAM_N, pool.length) && rest.length) chosen.push(rest.shift());
    return chosen.sort((a, b) => a.p - b.p);
  }
  function viewExam(id) {
    const L = LES(id), sl = slug(id), ls = LS(id);
    const X = V.exam && V.exam.id === id ? V.exam : null;
    if (X && !X.done) {
      const e = X.items[X.i], c = X.cur, n = X.items.length;
      const prog = '<div class="prog exam"><span class="pb"><i style="width:' + ((X.i / n) * 100).toFixed(1) + '%"></i></span><span class="pt">' + (X.i + 1) + '/' + n + '</span></div>';
      const lastQ = X.i === n - 1;
      return {
        top: '<header class="top"><button class="ib" data-act="quitExam" aria-label="Quitter">' + I.close + '</button>' + prog + '<span style="width:6px"></span></header>',
        main: cardH(e, c, L, true),
        bar: '<div class="bar"><div class="bar-in"><button class="btn exam" data-act="examNext"' + (hasAnswer(e, c) ? '' : ' disabled') + '>' + (lastQ ? 'Terminer' : 'Question suivante') + I.next + '</button></div></div>',
        withBar: true
      };
    }
    if (X && X.done) {
      const n = X.items.length, ok = X.res.filter(Boolean).length, nt = note20(ok, n);
      const msg = nt >= 16 ? 'Très bien !' : nt >= 14 ? 'Bien.' : nt >= 10 ? 'Peut mieux faire.' : 'À retravailler.';
      const list = X.items.map((e, i) => {
        const good = X.res[i];
        const given = X.given[i];
        const ans = e.t === 'assoc' ? '' : answerText(e);
        const stem = e.s && e.t !== 'touche' ? '<div style="margin-top:4px">' + AR(e.s.replace(/\*/g, '').replace('___', '…')) + '</div>' : '';
        return '<div class="ci"><div class="ch"><span style="color:var(--' + (good ? 'ok' : 'ko') + ')">' + (good ? I.ok : I.ko) + '</span><span>' + (e.q ? fr(e.q) : TYPES[e.t].nom) + '</span></div>' + stem +
          (!good && given ? '<div class="lb ko">Ta réponse</div>' + (hasAr(given) && !hasLat(given) ? '<div class="ar strike" dir="rtl">' + mk(given) + '</div>' : '<div>' + fr(given) + '</div>') : '') +
          (!good ? '<div class="lb ok">Réponse</div>' + textH(ans) : '') + '</div>';
      }).join('');
      return {
        top: top('<button class="ib" data-act="endExam" aria-label="Fermer">' + I.close + '</button>', 'Examen · Leçon ' + esc(sl)),
        main: '<div class="card score"><div class="ring">' + ring(nt / 20, 'var(--exam)') + '<div class="v"><span>' + fmt(nt) + '<small>sur 20</small></span></div></div><div class="msg">' + msg + '</div><div class="ds">' + ok + ' bonnes réponses sur ' + n + (ls.exam.best != null ? ' · meilleure note : ' + fmt(ls.exam.best) + '/20' : '') + '</div></div>' +
          '<div class="h2">Correction</div><div class="card corrlist">' + list + '</div>' +
          '<div class="stack" style="margin-top:16px"><button class="btn exam" data-act="examStart">' + I.redo.replace('<svg', '<svg width="20" height="20"') + 'Repasser l’examen</button>' +
          '<button class="btn ghost" data-act="endExam">Retour à la leçon</button></div>'
      };
    }
    // écran de départ
    return {
      top: top(backBtn('lecon-' + sl), 'Examen · Leçon ' + esc(sl)),
      main: '<div class="shead">' + pic('exam') + '<div><div class="nm">Examen</div><div class="ds">' + (ls.exam.best != null ? 'Meilleure note : ' + fmt(ls.exam.best) + '/20' : 'Pas encore passé') + '</div></div></div>' +
        '<div class="card" style="padding:16px;margin-top:14px"><div style="font-weight:600">' + EXAM_N + ' questions tirées au hasard</div>' +
        '<div class="small muted" style="margin-top:4px">Tous les points de la leçon sont interrogés. Pas d’aide ni de correction avant la fin. Note sur 20.</div></div>' +
        '<div style="margin-top:16px"><button class="btn exam" data-act="examStart">Commencer l’examen</button></div>'
    };
  }

  /* ================================================================ RÉGLAGES */
  function viewReglages() {
    const f = DB.pref.font === 'naskh' ? 'naskh' : 'sch', t = DB.pref.taille || 'm';
    const fontBtn = (k, fam, cap) => '<button class="' + (f === k ? 'on' : '') + '" data-act="pref" data-k="font" data-v="' + k + '"><div class="ar" style="font-family:' + fam + ';font-size:' + (k === 'sch' ? 26 : 22) + 'px" dir="rtl">مِنْ الزَّائِدَةُ</div><div class="cap">' + cap + '</div></button>';
    const sizeBtn = (k, cap, px) => '<button class="' + (t === k ? 'on' : '') + '" data-act="pref" data-k="taille" data-v="' + k + '"><div class="ar" style="font-size:' + px + 'px" dir="rtl">لَدَيَّ</div><div class="cap">' + cap + '</div></button>';
    const rm = V.confirmReset;
    return {
      top: top(backBtn('accueil'), 'Réglages'),
      main: '<div class="card" style="margin-top:8px">' +
        '<div class="set"><div class="sl">Police arabe</div><div class="opts-row">' + fontBtn('sch', "'ZadSch'", 'Proche du sharh') + fontBtn('naskh', "'ZadNaskh'", 'Naskh moderne') + '</div></div>' +
        '<div class="set"><div class="sl">Taille de l’arabe</div><div class="opts-row">' + sizeBtn('s', 'Petite', 20) + sizeBtn('m', 'Moyenne', 25) + sizeBtn('l', 'Grande', 30) + '</div></div>' +
        '<div class="set"><div class="sl">Progression</div><div class="sd">Elle est gardée sur cet appareil.</div>' +
        (rm ? '<div class="row" style="display:flex;gap:8px;margin-top:10px"><button class="btn ghost" data-act="resetNo">Annuler</button><button class="btn" style="background:var(--ko)" data-act="resetYes">Tout effacer</button></div>'
          : '<button class="btn ghost" style="margin-top:10px;color:var(--ko)" data-act="reset">Effacer ma progression</button>') + '</div></div>' +
        '<div class="foot">Zād an-Nahw · v' + VERSION + ' · fiches manuscrites vérifiées avec le sharh du tome 3</div>'
    };
  }

  /* ================================================================ RENDU */
  function modalH() {
    const m = V.modal;
    if (!m) return '';
    return '<div class="modal" data-act="modalBg"><div class="box" data-stop="1"><div class="mt">' + esc(m.title) + '</div><div class="md">' + esc(m.text) + '</div><div class="row"><button class="btn ghost" data-act="modalNo">' + esc(m.no) + '</button><button class="btn ' + (m.cls || '') + '" data-act="modalYes">' + esc(m.yes) + '</button></div></div></div>';
  }
  let toastT = null;
  function toast(msg) {
    const old = document.querySelector('.toast'); if (old) old.remove();
    const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; document.body.appendChild(d);
    clearTimeout(toastT); toastT = setTimeout(() => d.remove(), 1800);
  }
  function render() {
    const r = parse();
    const key = r.v + ':' + (r.id || '');
    let out;
    switch (r.v) {
      case 'lecon': out = viewLecon(r.id); break;
      case 'fiche': out = viewFiche(r.id); break;
      case 'entrainement': out = viewTrain(r.id); break;
      case 'examen': out = viewExam(r.id); break;
      case 'reglages': out = viewReglages(); break;
      default: out = viewAccueil();
    }
    app.innerHTML = '<div class="app">' + out.top + '<main class="main' + (out.bar || out.withBar ? ' with-bar' : '') + '">' + out.main + '</main>' + (out.bar || '') + modalH() + '</div>';
    if (key !== V.route || V.scrollTop) { window.scrollTo(0, 0); V.scrollTop = false; }
    const tab = app.querySelector('.tab.on');
    if (tab) { const tb = tab.parentNode; tb.scrollLeft = tab.offsetLeft - tb.offsetLeft - (tb.clientWidth - tab.offsetWidth) / 2; }
    V.route = key;
  }

  /* ================================================================ ACTIONS */
  const cur = () => { const r = parse(); return r; };
  function answerTrain() {
    const S = V.session, e = S.items[S.i], c = S.cur;
    c.answered = true; c.ok = isOk(e, c);
    S.res[S.i] = c.ok;
    LS(S.id).ex[e.id] = c.ok ? 1 : 0; save();
  }
  const ACT = {
    openPoint(el) { const id = cur().id; ficheState(id).p = +el.dataset.p; ficheState(id).mode = 'fiche'; go('lecon-' + slug(id) + '-fiche'); },
    ficheP(el) { const id = cur().id; ficheState(id).p = +el.dataset.p; V.scrollTop = true; render(); },
    ficheMode(el) { const id = cur().id; ficheState(id).mode = el.dataset.m; render(); },
    reveal(el) { const id = cur().id; ficheState(id).open[el.dataset.k] = true; render(); },
    rate(el) { const id = cur().id; LS(id).qa[el.dataset.k] = +el.dataset.v; save(); render(); },
    corr(el) { const t = document.querySelector('[data-corr="' + el.dataset.k + '"]'); if (t) t.hidden = !t.hidden; },
    trainPoint(el) { const id = cur().id; const L = LES(id); const p = +el.dataset.p; startSession(id, L.exos.filter((e) => e.p === p), 'Point ' + p); },
    trainAll() { const id = cur().id; startSession(id, LES(id).exos.slice(), 'Entraînement'); },
    trainType(el) { const id = cur().id; startSession(id, LES(id).exos.filter((e) => e.t === el.dataset.t), TYPES[el.dataset.t].nom); },
    trainWrong() { const id = cur().id; const ls = LS(id); startSession(id, LES(id).exos.filter((e) => ls.ex[e.id] === 0), 'Mes erreurs'); },
    opt(el) {
      const i = +el.dataset.i;
      if (V.exam && !V.exam.done && cur().v === 'examen') { V.exam.cur.sel = i; render(); return; }
      const S = V.session; if (!S || S.cur.answered) return;
      S.cur.sel = i; answerTrain(); render();
    },
    vf(el) {
      const v = el.dataset.v === '1';
      if (V.exam && !V.exam.done && cur().v === 'examen') { V.exam.cur.sel = v; render(); return; }
      const S = V.session; if (!S || S.cur.answered) return;
      S.cur.sel = v; answerTrain(); render();
    },
    pick(el) { const c = activeCur(); if (!c || c.answered) return; const k = +el.dataset.k; if (!c.picked.includes(k)) c.picked.push(k); render(); },
    unpick(el) { const c = activeCur(); if (!c || c.answered) return; c.picked.splice(+el.dataset.j, 1); render(); },
    tok(el) { const c = activeCur(); if (!c || c.answered) return; const i = +el.dataset.i; const k = c.sel.indexOf(i); if (k >= 0) c.sel.splice(k, 1); else c.sel.push(i); render(); },
    as(el) {
      const c = activeCur(); if (!c || c.answered) return;
      const side = el.dataset.side, i = +el.dataset.i;
      // toucher un élément déjà relié : on défait la paire
      if (side === 'l' && c.pairs[i] != null) { delete c.pairs[i]; c.pick = null; render(); return; }
      if (side === 'r') { const l = Object.keys(c.pairs).find((k) => c.pairs[k] === i); if (l != null) { delete c.pairs[l]; c.pick = null; render(); return; } }
      if (!c.pick || c.pick.side === side) { c.pick = { side, i }; render(); return; }
      const l = side === 'l' ? i : c.pick.i, r = side === 'r' ? i : c.pick.i;
      c.pairs[l] = r; c.pick = null; render();
    },
    validate() { const S = V.session; if (!S || S.cur.answered) return; if (!hasAnswer(S.items[S.i], S.cur)) return; answerTrain(); render(); },
    next() {
      const S = V.session; if (!S) return;
      S.i++;
      if (S.i < S.items.length) S.cur = prep(S.items[S.i]);
      V.scrollTop = true; render();
    },
    quitTrain() { V.session = null; render(); },
    endTrain() { V.session = null; render(); },
    redoWrong() { const S = V.session; const wrong = S.items.filter((_, i) => !S.res[i]); startSession(S.id, wrong, 'Mes erreurs'); render(); },
    endTo(el) { V.session = null; go(el.dataset.to); },
    examStart() { const id = cur().id; const items = drawExam(LES(id)); V.exam = { id, items, i: 0, res: [], given: [], cur: prep(items[0]), done: false }; V.scrollTop = true; render(); },
    examNext() {
      const X = V.exam; if (!X || X.done) return;
      const e = X.items[X.i];
      if (!hasAnswer(e, X.cur)) return;
      X.res[X.i] = isOk(e, X.cur); X.given[X.i] = givenText(e, X.cur);
      X.i++;
      if (X.i >= X.items.length) {
        X.done = true;
        const ls = LS(X.id), nt = note20(X.res.filter(Boolean).length, X.items.length);
        ls.exam.last = nt; ls.exam.best = ls.exam.best == null ? nt : Math.max(ls.exam.best, nt); ls.exam.n = (ls.exam.n || 0) + 1; save();
      } else X.cur = prep(X.items[X.i]);
      V.scrollTop = true; render();
    },
    quitExam() { V.modal = { title: 'Quitter l’examen ?', text: 'Tes réponses ne seront pas gardées.', yes: 'Quitter', no: 'Continuer', cls: 'exam', fn: () => { V.exam = null; } }; render(); },
    endExam() { const id = V.exam && V.exam.id; V.exam = null; go(id ? 'lecon-' + slug(id) : 'accueil'); },
    modalYes() { const m = V.modal; V.modal = null; if (m && m.fn) m.fn(); render(); },
    modalNo() { V.modal = null; render(); },
    modalBg(el, ev) { if (ev.target === el) { V.modal = null; render(); } },
    pref(el) { DB.pref[el.dataset.k] = el.dataset.v; save(); applyPref(); render(); },
    reset() { V.confirmReset = true; render(); },
    resetNo() { V.confirmReset = false; render(); },
    resetYes() { DB = { pref: DB.pref, l: {} }; save(); V.confirmReset = false; V.session = null; V.exam = null; V.fiche = {}; render(); toast('Progression effacée'); }
  };
  function activeCur() {
    if (cur().v === 'examen' && V.exam && !V.exam.done) return V.exam.cur;
    return V.session ? V.session.cur : null;
  }

  document.addEventListener('click', (ev) => {
    const g = ev.target.closest('[data-go]');
    if (g) { ev.preventDefault(); go(g.dataset.go); return; }
    const a = ev.target.closest('[data-act]');
    if (!a) return;
    const fn = ACT[a.dataset.act];
    if (fn) { ev.preventDefault(); fn(a, ev); }
  });

  /* ================================================================ démarrage */
  applyPref();
  window.addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.ZAD_DEMO) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* hors ligne indisponible */ });
  }
})();
