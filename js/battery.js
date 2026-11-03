/* Battery Status API: live values, spoof detection, missing-API state. No network. */
(function () {
  'use strict';
  var U = window.UIW;
  var EVENTS = ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'];
  var SPOOF_TEXT = 'Fixed values: no battery, fully charged, or spoofed';
  var SPOOF_INFO = { what: 'Your browser reports exactly 100%, charging, 0 minutes to full and no time to empty.', why: 'These exact values appear when there is no battery (desktops), when a laptop is fully charged and plugged in, or when the browser fakes them for privacy.', how: 'Brave fakes them. Edge and Chrome show real values on laptops, so on a laptop running on battery you should see real numbers.' };

  function isSpoofed(b) { return b.level === 1 && b.charging === true && b.chargingTime === 0 && b.dischargingTime === Infinity; }
  function mins(t) { return isFinite(t) ? Math.round(t / 60) + ' min' : '\u2014'; }
  function rows(b) { return [['Level', Math.round(b.level * 100) + '%'], ['Charging', b.charging ? 'yes' : 'no'], ['Time to full', b.charging ? mins(b.chargingTime) : '\u2014'], ['Time to empty', mins(b.dischargingTime)]]; }

  function render(h, b) {
    if (isSpoofed(b)) {
      var bub = U.bubble('Why the battery shows fixed values', SPOOF_INFO);
      var head = U.el('div', { class: 'item-head' }, [U.el('span', { class: 'spoof', text: SPOOF_TEXT }), bub.btn]);
      var wrap = U.el('div', { class: 'spoof-wrap' }, [head, bub.pop, U.kv(rows(b))]);
      h.set(wrap, 'low');
      return 'spoofed';
    }
    h.set(U.kv(rows(b)), 'medium');
    return 'real';
  }

  // Returns a promise of the state: 'missing' | 'error' | 'real' | 'spoofed'.
  function attach(h, nav) {
    if (!nav || typeof nav.getBattery !== 'function') { h.set('Not available in this browser (Firefox and Safari removed the Battery API).', 'low'); return Promise.resolve('missing'); }
    h.valueEl.style.minHeight = '7em';
    return nav.getBattery().then(function (b) {
      var update = function () { h.state = render(h, b); };
      EVENTS.forEach(function (ev) {
        if (b.addEventListener) b.addEventListener(ev, update); else b['on' + ev] = update;
      });
      update();
      return h.state;
    }, function () { h.set('Not available in this browser (blocked).', 'low'); return 'error'; });
  }

  U.battery = { attach: attach, isSpoofed: isSpoofed, rows: rows, EVENTS: EVENTS, SPOOF_TEXT: SPOOF_TEXT };
})();
