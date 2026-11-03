/* Battery Status API: live values, spoof detection, missing-API state. No network. */
(function () {
  'use strict';
  var U = window.UIW;
  var EVENTS = ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'];
  var SPOOF_TEXT = 'Likely spoofed by your browser (privacy protection)';
  var SPOOF_INFO = { what: 'Your browser reports exactly 100%, charging, 0 minutes to full and no time to empty. These are the fixed values browsers such as Brave, and some privacy settings or extensions, return instead of the real battery state.', why: 'Real battery readings can briefly link your visits across sites, so privacy-focused browsers hide them. That makes this reading much less useful to trackers.', how: 'Nothing to do: this is protection working. Note that a laptop that is fully charged and plugged in reports the same values, so this is a best guess, not proof.' };

  function isSpoofed(b) { return b.level === 1 && b.charging === true && b.chargingTime === 0 && b.dischargingTime === Infinity; }
  function mins(t) { return isFinite(t) ? Math.round(t / 60) + ' min' : '\u2014'; }
  function rows(b) { return [['Level', Math.round(b.level * 100) + '%'], ['Charging', b.charging ? 'yes' : 'no'], ['Time to full', b.charging ? mins(b.chargingTime) : '\u2014'], ['Time to empty', mins(b.dischargingTime)]]; }

  function render(h, b) {
    if (isSpoofed(b)) {
      var bub = U.bubble('Why the battery looks spoofed', SPOOF_INFO);
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
