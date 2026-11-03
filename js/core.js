/* The U in Web: shared helpers. No storage, no network. */
(function () {
  'use strict';
  var UIW = (window.UIW = {});
  var RISK_TEXT = { low: 'Low risk', medium: 'Medium risk', high: 'High risk', info: 'Info' };
  var seq = 0;
  var openPop = null;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  UIW.el = el;
  UIW.NA = 'not available in this browser';

  function closePop(restoreFocus) {
    if (!openPop) return;
    var p = openPop; openPop = null;
    p.pop.hidden = true;
    p.btn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) p.btn.focus();
  }
  UIW.closePop = closePop;

  // Info bubble: (i) button + popover with what / why / how.
  UIW.bubble = function (label, info) {
    var id = 'pop-' + (++seq);
    var btn = el('button', { type: 'button', class: 'info-btn', 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': 'About ' + label, text: 'i' });
    var close = el('button', { type: 'button', class: 'close', 'aria-label': 'Close', text: '\u00d7' });
    var body = [close, el('h3', { class: 'sr', text: label })];
    body[1].style.cssText = 'margin:0 1.5em .2em 0;font-size:1rem';
    if (info.what) body.push(el('h4', { text: 'What it is' }), el('p', { text: info.what }));
    if (info.why) body.push(el('h4', { text: 'Why it matters' }), el('p', { text: info.why }));
    if (info.how) body.push(el('h4', { text: 'How to reduce it' }), el('p', { text: info.how }));
    var pop = el('div', { id: id, class: 'pop', role: 'dialog', 'aria-label': label, hidden: '' }, body);
    var entry = { btn: btn, pop: pop };
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (openPop === entry) { closePop(false); return; }
      closePop(false);
      pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); openPop = entry;
      close.focus();
    });
    close.addEventListener('click', function (e) { e.stopPropagation(); closePop(true); });
    pop.addEventListener('click', function (e) { e.stopPropagation(); });
    return { btn: btn, pop: pop };
  };

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openPop) { e.preventDefault(); closePop(true); } });
  document.addEventListener('click', function () { closePop(false); });

  /* Item card. opts: {label, value, risk, info, wide, text}. Returns handle with set(value, risk). */
  UIW.item = function (container, opts) {
    var b = UIW.bubble(opts.label, opts.info || {});
    var riskEl = el('span', { class: 'risk' });
    var valEl = el('div', { class: 'item-value' + (opts.text ? ' text' : ''), 'aria-live': 'polite' });
    var card = el('article', { class: 'item' + (opts.wide ? ' wide' : '') }, [
      el('div', { class: 'item-head' }, [el('h3', { class: 'item-label', text: opts.label }), riskEl, b.btn]),
      valEl, b.pop
    ]);
    container.appendChild(card);
    var h = {
      card: card, valueEl: valEl,
      set: function (v, risk) {
        valEl.textContent = '';
        if (v === null || v === undefined || v === '') { valEl.appendChild(el('span', { class: 'na', text: UIW.NA })); }
        else if (v instanceof Node) valEl.appendChild(v);
        else valEl.textContent = String(v);
        if (risk) { riskEl.className = 'risk risk-' + risk; riskEl.textContent = RISK_TEXT[risk]; }
        return h;
      },
      risk: function (r) { riskEl.className = 'risk risk-' + r; riskEl.textContent = RISK_TEXT[r]; return h; }
    };
    h.set(opts.value === undefined ? '\u2026' : opts.value, opts.risk || 'info');
    return h;
  };

  UIW.kv = function (rows) {
    var t = el('table', { class: 'kv' });
    rows.forEach(function (r) {
      t.appendChild(el('tr', null, [el('th', { scope: 'row', text: r[0] }), el('td', { text: r[1] === null || r[1] === undefined || r[1] === '' ? UIW.NA : String(r[1]) })]));
    });
    return t;
  };

  UIW.button = function (text, primary) { return el('button', { type: 'button', class: 'btn' + (primary ? ' btn-primary' : ''), text: text }); };

  UIW.link = function (href, text) { return el('a', { href: href, rel: 'noopener noreferrer', target: '_blank', text: text }); };

  // Hashing: SHA-256 when available (secure context), else FNV-1a 64-ish fallback.
  UIW.hash = function (str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      });
    }
    var h1 = 0x811c9dc5, h2 = 0x01000193 ^ 0x5bd1e995;
    for (var i = 0; i < str.length; i++) { var c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 2246822519) >>> 0; }
    return Promise.resolve(('0000000' + h1.toString(16)).slice(-8) + ('0000000' + h2.toString(16)).slice(-8));
  };

  // Theme: follows system; toggle overrides for this visit only (not saved).
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  var override = null;
  function applyTheme() {
    var dark = override !== null ? override : !!(mq && mq.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var t = document.getElementById('theme-toggle');
    if (t) { t.textContent = dark ? 'Light theme' : 'Dark theme'; t.setAttribute('aria-pressed', String(override !== null)); t.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme (not saved)'); }
  }
  UIW.isDark = function () { return document.documentElement.getAttribute('data-theme') === 'dark'; };
  applyTheme();
  if (mq) { var f = function () { if (override === null) applyTheme(); }; mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f); }
  document.addEventListener('DOMContentLoaded', applyTheme);
  document.getElementById('theme-toggle').addEventListener('click', function () { override = !UIW.isDark(); applyTheme(); });
})();
