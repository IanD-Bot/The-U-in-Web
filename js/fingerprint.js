/* Section 2: fingerprint. Computed live, never sent anywhere. */
(function () {
  'use strict';
  var U = window.UIW, box = document.getElementById('fingerprint-items'), nav = navigator;

  function canvasFP() {
    var c = document.createElement('canvas'); c.width = 280; c.height = 60;
    var x = c.getContext('2d'); if (!x) return null;
    x.textBaseline = 'top'; x.font = '16px Arial'; x.fillStyle = '#f60'; x.fillRect(120, 1, 70, 22);
    x.fillStyle = '#069'; x.fillText('The U in Web \u263a \ud83d\udd0d 1.0', 4, 6);
    x.fillStyle = 'rgba(102,204,0,0.7)'; x.font = 'italic 18px Georgia'; x.fillText('fingerprint ~ \u00e9\u00df', 6, 30);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgb(255,0,255)'; x.beginPath(); x.arc(230, 30, 22, 0, Math.PI * 2); x.fill();
    return c.toDataURL();
  }

  function audioFP() {
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return Promise.resolve(null);
    return new Promise(function (res) {
      try {
        var ctx = new OAC(1, 5000, 44100), osc = ctx.createOscillator(), comp = ctx.createDynamicsCompressor();
        osc.type = 'triangle'; osc.frequency.value = 10000;
        [['threshold', -50], ['knee', 40], ['ratio', 12], ['attack', 0], ['release', 0.25]].forEach(function (p) { if (comp[p[0]]) comp[p[0]].value = p[1]; });
        osc.connect(comp); comp.connect(ctx.destination); osc.start(0);
        var done = false, t = setTimeout(function () { if (!done) { done = true; res(null); } }, 3000);
        var finish = function (buf) {
          if (done) return; done = true; clearTimeout(t);
          var d = buf.getChannelData(0), s = 0; for (var i = 4500; i < 5000; i++) s += Math.abs(d[i]);
          res(s.toFixed(10));
        };
        var pr = ctx.startRendering(); if (pr && pr.then) pr.then(finish, function () { res(null); }); else ctx.oncomplete = function (e) { finish(e.renderedBuffer); };
      } catch (e) { res(null); }
    });
  }

  var FONTS = ['Arial', 'Arial Black', 'Calibri', 'Cambria', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Franklin Gothic Medium', 'Gabriola', 'Georgia', 'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Sylfaen', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Helvetica', 'Helvetica Neue', 'Menlo', 'Monaco', 'Avenir', 'Futura', 'Geneva', 'Optima', 'Gill Sans', 'Baskerville', 'Didot', 'American Typewriter', 'Ubuntu', 'DejaVu Sans', 'Liberation Sans', 'Noto Sans', 'Cantarell', 'Droid Sans', 'Roboto', 'Open Sans', 'Lato', 'Source Code Pro', 'Fira Code', 'Garamond', 'Bookman Old Style', 'Century Gothic', 'MS Gothic', 'MS Mincho', 'SimSun', 'Microsoft YaHei', 'Meiryo', 'Malgun Gothic', 'Wingdings', 'Webdings', 'Symbol', 'Marlett', 'Bahnschrift', 'Ink Free', 'Cascadia Code', 'Aptos'];
  function fontsFP() {
    var c = document.createElement('canvas'), x = c.getContext('2d'); if (!x) return null;
    var txt = 'mmmmmmmmmmlli1WQ@#\u00e9\u4e2d', bases = ['monospace', 'sans-serif', 'serif'], w = {};
    bases.forEach(function (b) { x.font = '72px ' + b; w[b] = x.measureText(txt).width; });
    var found = [], i = 0;
    return new Promise(function (res) {
      (function step() {
        var end = Math.min(i + 2, FONTS.length);
        for (; i < end; i++) { var f = FONTS[i]; if (bases.some(function (b) { x.font = '72px "' + f + '",' + b; return x.measureText(txt).width !== w[b]; })) found.push(f); }
        if (i < FONTS.length) setTimeout(step, 0); else res(found);
      })();
    });
  }

  function webglFP() {
    try {
      var c = document.createElement('canvas'), gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return null;
      var ext = gl.getExtension('WEBGL_debug_renderer_info'), out = [];
      out.push(ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR));
      out.push(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      out.push(gl.getParameter(gl.VERSION), gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
      ['MAX_TEXTURE_SIZE', 'MAX_RENDERBUFFER_SIZE', 'MAX_VERTEX_ATTRIBS', 'MAX_VERTEX_UNIFORM_VECTORS', 'MAX_FRAGMENT_UNIFORM_VECTORS', 'MAX_VARYING_VECTORS', 'MAX_COMBINED_TEXTURE_IMAGE_UNITS'].forEach(function (k) { out.push(k + '=' + gl.getParameter(gl[k])); });
      out.push('ALIASED_LINE=' + Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)).join(','));
      out.push('VIEWPORT=' + Array.from(gl.getParameter(gl.MAX_VIEWPORT_DIMS)).join(','));
      out.push((gl.getSupportedExtensions() || []).sort().join(','));
      return out.join('|');
    } catch (e) { return null; }
  }

  var info = {
    canvas: { what: 'The page draws hidden text and shapes, then reads the pixels back. Tiny differences in your GPU, drivers, fonts and anti-aliasing change the result.', why: 'The same device gives the same picture every time, so it works as an ID without cookies.', how: 'Brave and Firefox (Enhanced Tracking Protection, strict mode or resistFingerprinting) add noise or block canvas readback. Safari adds noise in private windows.' },
    audio: { what: 'A short sound is processed silently and the output measured. Audio stacks round numbers slightly differently.', why: 'It is another stable signal that needs no permission.', how: 'Brave and Tor randomise or block it.' },
    fonts: { what: 'Which common fonts are installed, detected by measuring text width. Only the list below is tested.', why: 'Installed fonts reflect your OS, language packs and apps (Office, Adobe), and the combination is often rare.', how: 'Avoid installing many unusual fonts; Tor, Brave and Safari limit font detection.' },
    webgl: { what: 'GPU model, driver strings, limits and supported WebGL extensions.', why: 'These are very stable and vary between devices.', how: 'Brave and Firefox resistFingerprinting mask it; disabling WebGL also works but breaks some sites.' },
    id: { what: 'A SHA-256 hash of all the signals below, computed in your browser. It is never sent anywhere or stored by this page.', why: 'Trackers compute IDs like this to follow you across sites and visits without cookies. Clearing cookies or opening a private window does not change it.', how: 'Use a browser with fingerprinting protection (Brave, Tor Browser, Firefox with strict protection or resistFingerprinting, Safari). Protection that randomises values makes the ID change on each visit, which is good.' }
  };

  var hId = U.item(box, { label: 'Your fingerprint ID', risk: 'high', wide: true, info: info.id });
  var hCanvas = U.item(box, { label: 'Canvas fingerprint', risk: 'medium', info: info.canvas });
  var hAudio = U.item(box, { label: 'Audio fingerprint', risk: 'medium', info: info.audio });
  var hFonts = U.item(box, { label: 'Fonts fingerprint', risk: 'medium', info: info.fonts });
  var hGl = U.item(box, { label: 'WebGL fingerprint', risk: 'medium', info: info.webgl });

  var s = window.screen || {}, ro = Intl.DateTimeFormat().resolvedOptions();
  var canvas = null, fonts = null, gl = null;
  function later() { return new Promise(function (r) { (window.requestIdleCallback || setTimeout)(function () { r(); }); }); }

  // Run after the page has rendered, yielding between steps, so the page stays responsive.
  function run() {
  later().then(function () { gl = webglFP(); return later(); })
  .then(function () { try { canvas = canvasFP(); } catch (e) {} return later(); })
  .then(function () { return Promise.resolve(fontsFP()).catch(function () { return null; }); })
  .then(function (f) { fonts = f; return audioFP(); })
  .then(function (audio) {
    // Signals, with a rough estimate of how much each narrows you down (bits, from public fingerprinting studies).
    var signals = [
      ['Canvas', canvas, 8], ['WebGL', gl, 7], ['Fonts', fonts && fonts.join(','), 6], ['Audio', audio, 5],
      ['User-Agent', nav.userAgent, 10], ['Screen', [s.width, s.height, s.colorDepth, window.devicePixelRatio].join('x'), 5],
      ['Time zone', ro.timeZone, 3], ['Languages', (nav.languages || []).join(','), 4],
      ['CPU cores', nav.hardwareConcurrency, 2], ['Memory', nav.deviceMemory, 1.5], ['Touch points', nav.maxTouchPoints, 1],
      ['Platform', nav.platform, 2], ['Do Not Track', nav.doNotTrack, 1]
    ];
    var present = signals.filter(function (x) { return x[1] !== null && x[1] !== undefined && x[1] !== ''; });
    return Promise.all([U.hash(present.map(function (x) { return x[0] + '=' + x[1]; }).join('\n'))].concat(
      [canvas, audio, fonts && fonts.join(','), gl].map(function (v) { return v ? U.hash(String(v)) : Promise.resolve(null); })
    )).then(function (h) {
      hCanvas.set(h[1] ? 'Hash ' + h[1].slice(0, 16) : null, h[1] ? 'medium' : 'low');
      hAudio.set(h[2] ? 'Hash ' + h[2].slice(0, 16) + ' (value ' + audio + ')' : null, h[2] ? 'medium' : 'low');
      hFonts.set(fonts ? 'Hash ' + (h[3] || '').slice(0, 16) + '\n' + fonts.length + ' of ' + FONTS.length + ' tested fonts found: ' + fonts.join(', ') : null, fonts ? (fonts.length > 25 ? 'high' : 'medium') : 'low');
      hGl.set(h[4] ? 'Hash ' + h[4].slice(0, 16) : null, h[4] ? 'medium' : 'low');

      var total = present.reduce(function (a, x) { return a + x[2]; }, 0);
      var wrap = U.el('div');
      wrap.appendChild(U.el('p', { class: 'fp-id', text: h[0].slice(0, 32) }));
      wrap.appendChild(U.el('p', { class: 'item-value text', text: 'Roughly ' + Math.round(total) + ' bits of identifying information. About 33 bits is enough to single out one person among everyone online, so this ID is likely near-unique to your browser. It works without cookies and stays the same in private windows.' }));
      wrap.appendChild(U.el('p', { class: 'item-value text', text: 'Signals that drove it (largest first):' }));
      present.sort(function (a, b) { return b[2] - a[2]; });
      wrap.appendChild(U.kv(present.map(function (x) { return [x[0], '\u2248 ' + x[2] + ' bits'] })));
      var missing = signals.filter(function (x) { return present.indexOf(x) < 0; }).map(function (x) { return x[0]; });
      if (missing.length) wrap.appendChild(U.el('p', { class: 'item-value text', text: 'Blocked or unavailable (good for privacy): ' + missing.join(', ') }));
      hId.set(wrap, total >= 33 ? 'high' : 'medium');
      window.UIW.fingerprintId = h[0];
    });
  }).catch(function () { hId.set(null, 'low'); });
  }
  if (document.readyState === 'complete') setTimeout(run, 50); else addEventListener('load', function () { setTimeout(run, 50); });
})();
