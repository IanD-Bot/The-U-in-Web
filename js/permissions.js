/* Section 5: permission demos. Each runs only on a click; results are shown, then discarded. */
(function () {
  'use strict';
  var U = window.UIW, box = document.getElementById('permissions-items'), nav = navigator;
  var KEEP = ' Nothing is stored; reload to clear it. Your browser may remember the permission itself: reset it from the padlock / site-info icon in the address bar.';

  function demo(label, btnText, info, run) {
    var h = U.item(box, { label: label, risk: 'info', text: true, value: 'Not requested. Nothing is asked until you click.', info: info });
    var b = U.button(btnText);
    h.card.appendChild(U.el('div', { class: 'actions' }, [b]));
    b.addEventListener('click', function () {
      b.disabled = true;
      Promise.resolve().then(function () { return run(h); }).catch(function (e) { h.set(denied(e), 'low'); }).then(function () { b.disabled = false; });
    });
    return h;
  }
  function denied(e) {
    var n = e && (e.name || e.code), msg = e && e.message;
    if (n === 1 || n === 'NotAllowedError' || n === 'PermissionDeniedError' || n === 'SecurityError') return 'Denied or blocked. A site gets nothing, which is the safe choice.';
    return 'Did not work: ' + (msg || n || 'unknown error') + '.';
  }

  demo('Location', 'Try location', { what: 'Your device\u2019s position from GPS, Wi-Fi or IP, via the Geolocation API.', why: 'Precise location can reveal your home, workplace and routine.', how: 'Only allow it for sites that truly need it (maps, delivery), choose "once" or "approximate" where offered, and review allowed sites in browser settings.' + KEEP }, function (h) {
    if (!nav.geolocation) { h.set('Geolocation is ' + U.NA + '.', 'low'); return; }
    h.set('Waiting for your answer\u2026', 'info');
    return new Promise(function (res, rej) {
      nav.geolocation.getCurrentPosition(function (p) {
        var c = p.coords;
        h.set(U.kv([['Latitude', c.latitude.toFixed(5)], ['Longitude', c.longitude.toFixed(5)], ['Accuracy', '\u00b1 ' + Math.round(c.accuracy) + ' m'], ['What a site gets', 'These numbers, which it could store or share. This page discards them.']]), 'high');
        res();
      }, rej, { timeout: 15000, maximumAge: 0 });
    });
  });

  demo('Camera and microphone devices', 'List my devices', { what: 'The cameras, microphones and speakers attached to your device. Without permission sites see only how many there are; with it, they also see their names.', why: 'Device names (e.g. a headset model) add to your fingerprint. With camera/mic access a site could record you.', how: 'Grant camera/mic only during calls, then revoke it. This demo never turns them on; it lists devices only.' + KEEP }, function (h) {
    var md = nav.mediaDevices;
    if (!md || !md.enumerateDevices) { h.set('Device list is ' + U.NA + '.', 'low'); return; }
    return md.enumerateDevices().then(function (list) {
      var kinds = { videoinput: 'Camera', audioinput: 'Microphone', audiooutput: 'Speaker' };
      var named = list.some(function (d) { return d.label; });
      var rows = list.map(function (d, i) { return [(kinds[d.kind] || d.kind) + ' ' + (i + 1), d.label || '(name hidden until you grant camera/mic access)']; });
      if (!rows.length) rows.push(['Devices', 'none reported']);
      rows.push(['What a site gets', named ? 'Device names, because you allowed camera/mic for this site before.' : 'Only the number and type of devices.']);
      h.set(U.kv(rows), named ? 'medium' : 'low');
    });
  });

  demo('Notifications', 'Try notifications', { what: 'Permission to show pop-up notifications even when the site is not open.', why: 'Scam and spam sites abuse it to push fake virus alerts and ads.', how: 'Block notification prompts by default in browser settings; allow only sites you trust (e.g. chat or email).' + KEEP }, function (h) {
    if (!window.Notification) { h.set('Notifications are ' + U.NA + '.', 'low'); return; }
    var go = function (perm) {
      if (perm === 'granted') {
        try { new Notification('The U in Web', { body: 'This is what a site can push to you, even from the background.' }); } catch (e) {}
        h.set('Allowed. A test notification was shown. A site could now send you messages at any time.', 'high');
      } else h.set(perm === 'denied' ? 'Denied. A site gets nothing, which is the safe choice.' : 'Dismissed without an answer. The site can ask again later.', 'low');
    };
    var r = Notification.requestPermission(go);
    if (r && r.then) return r.then(go);
  });

  demo('Clipboard', 'Read my clipboard', { what: 'Reading what you last copied, via the Clipboard API.', why: 'Clipboards often hold passwords, addresses or one-time codes.', how: 'Deny clipboard-read prompts unless you just pressed a site\u2019s paste button. Password managers that clear the clipboard help. Sites can always write to it, so check before pasting commands.' + KEEP }, function (h) {
    if (!nav.clipboard || !nav.clipboard.readText) { h.set('Reading the clipboard is ' + U.NA + ' (Firefox only allows it from a paste menu).', 'low'); return; }
    return nav.clipboard.readText().then(function (t) {
      var preview = t ? (t.length > 60 ? t.slice(0, 60) + '\u2026' : t) : '(empty)';
      h.set(U.kv([['Characters', t.length], ['Preview', preview], ['What a site gets', 'The full text. This page discards it.']]), 'high');
    });
  });
})();
