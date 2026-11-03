/* Section 1: device and browser. Reads only what the page can read locally. */
(function () {
  'use strict';
  var U = window.UIW, box = document.getElementById('device-items'), nav = navigator;

  function parseUA(ua) {
    var os = null, br = null, m;
    if (/Windows NT 10/.test(ua)) os = 'Windows 10 or 11';
    else if ((m = ua.match(/Windows NT ([\d.]+)/))) os = 'Windows NT ' + m[1];
    else if ((m = ua.match(/(iPhone|iPad|iPod).*? OS ([\d_]+)/))) os = 'iOS / iPadOS ' + m[2].replace(/_/g, '.');
    else if ((m = ua.match(/Mac OS X ([\d_.]+)/))) os = 'macOS ' + m[1].replace(/_/g, '.');
    else if ((m = ua.match(/Android ([\d.]+)/))) os = 'Android ' + m[1];
    else if (/CrOS/.test(ua)) os = 'ChromeOS';
    else if (/Linux/.test(ua)) os = 'Linux';
    if ((m = ua.match(/Edg(?:A|iOS)?\/([\d.]+)/))) br = 'Microsoft Edge ' + m[1];
    else if ((m = ua.match(/OPR\/([\d.]+)/))) br = 'Opera ' + m[1];
    else if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) br = 'Samsung Internet ' + m[1];
    else if ((m = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/))) br = 'Firefox ' + m[1];
    else if ((m = ua.match(/CriOS\/([\d.]+)/))) br = 'Chrome (iOS) ' + m[1];
    else if ((m = ua.match(/(?:HeadlessChrome|Chrome)\/([\d.]+)/))) br = (/HeadlessChrome/.test(ua) ? 'Headless Chrome ' : 'Chrome or Chromium ') + m[1];
    else if ((m = ua.match(/Version\/([\d.]+).*Safari/))) br = 'Safari ' + m[1];
    return { os: os, browser: br };
  }
  U.parseUA = parseUA;

  var ua = nav.userAgent || '', p = parseUA(ua);
  var uad = nav.userAgentData;
  if (uad && uad.brands) {
    var real = uad.brands.filter(function (b) { return !/Not.?A.?Brand|Chromium/i.test(b.brand); })[0];
    if (real && !/Brave/.test(p.browser || '')) p.browser = real.brand + ' ' + (p.browser || '').replace(/^.*? ([\d.]+)$/, '$1');
  }
  if (nav.brave) p.browser = 'Brave (Chromium ' + ((ua.match(/Chrome\/([\d.]+)/) || [])[1] || '?') + ')';

  U.item(box, { label: 'Operating system', value: p.os, risk: 'low',
    info: { what: 'Your operating system and version, read from the User-Agent string your browser sends with every request.', why: 'Old versions tell attackers which known bugs might work on you, and it narrows down who you are.', how: 'Keep your OS updated. Some privacy browsers (Tor Browser, Firefox with resistFingerprinting) report a generic value.' } });
  U.item(box, { label: 'Browser and version', value: p.browser, risk: 'low',
    info: { what: 'Which browser you use and its exact version.', why: 'Sites tailor content and ads to it, and an outdated version can be targeted with known exploits.', how: 'Keep the browser updated so you blend in with the many people on the latest version.' } });
  U.item(box, { label: 'User-Agent string', value: ua, risk: 'medium', wide: true,
    info: { what: 'The raw text your browser sends to identify itself on every request.', why: 'It is one of the biggest inputs to fingerprinting, and every server you contact logs it.', how: 'Use a mainstream, up-to-date browser. Changing it by hand often makes you stand out more.' } });

  var ch = U.item(box, { label: 'Client Hints', risk: 'medium', wide: true,
    info: { what: 'A newer Chromium feature (User-Agent Client Hints) that lets sites ask for exact platform version, device model, CPU architecture and full browser version.', why: 'High-entropy hints reveal more detail than the User-Agent string does, which helps fingerprinting.', how: 'Firefox and Safari do not support Client Hints. Brave limits them.' } });
  ch.valueEl.style.minHeight = (uad ? 11 : 0) + 'em';
  if (uad && uad.getHighEntropyValues) {
    uad.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'bitness', 'model', 'fullVersionList', 'wow64']).then(function (v) {
      ch.set(U.kv([
        ['Brands', (uad.brands || []).map(function (b) { return b.brand + ' ' + b.version; }).join(', ')],
        ['Mobile', String(uad.mobile)], ['Platform', v.platform], ['Platform version', v.platformVersion],
        ['Architecture', [v.architecture, v.bitness && v.bitness + '-bit'].filter(Boolean).join(' ')],
        ['Model', v.model || '(none reported)'],
        ['Full versions', (v.fullVersionList || []).map(function (b) { return b.brand + ' ' + b.version; }).join(', ')]
      ]), 'medium');
    }, function () { ch.set(null, 'low'); });
  } else ch.set(null, 'low');

  var s = window.screen || {};
  U.item(box, { label: 'Screen', risk: 'medium',
    value: U.kv([['Screen size', s.width + ' \u00d7 ' + s.height], ['Available', s.availWidth + ' \u00d7 ' + s.availHeight], ['Window', innerWidth + ' \u00d7 ' + innerHeight], ['Pixel ratio', window.devicePixelRatio], ['Colour depth', s.colorDepth + '-bit']]),
    info: { what: 'Your screen resolution, the space left after taskbars, your zoom/pixel ratio and colour depth.', why: 'Unusual screen sizes or multi-monitor setups make you easier to pick out.', how: 'Keeping the browser maximised on a common screen size helps a little; Tor Browser rounds window sizes ("letterboxing").' } });

  var ro = Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions() : {};
  var off = -new Date().getTimezoneOffset(), offs = 'UTC' + (off >= 0 ? '+' : '\u2212') + Math.floor(Math.abs(off) / 60) + (Math.abs(off) % 60 ? ':' + ('0' + Math.abs(off) % 60).slice(-2) : '');
  U.item(box, { label: 'Time zone, locale and languages', risk: 'medium',
    value: U.kv([['Time zone', (ro.timeZone || '') + ' (' + offs + ')'], ['Locale', ro.locale], ['Languages', (nav.languages || [nav.language]).join(', ')]]),
    info: { what: 'Your time zone, regional formats and preferred languages.', why: 'They reveal roughly where you live, even behind a VPN, and a mismatch with your IP location can flag VPN use.', how: 'There is little to do except use Tor Browser, which reports UTC and en-US for everyone.' } });

  U.item(box, { label: 'CPU cores and memory', risk: 'low',
    value: U.kv([['Logical CPU cores', nav.hardwareConcurrency], ['Device memory', nav.deviceMemory ? '\u2248 ' + nav.deviceMemory + ' GB (rounded; browsers cap the value they report)' : null]]),
    info: { what: 'How many processor threads you have and, in Chromium browsers, roughly how much RAM.', why: 'They hint at how expensive your device is and add to your fingerprint.', how: 'Firefox and Safari do not expose memory; Safari and Tor also cap the core count.' } });

  var gpu = U.item(box, { label: 'Graphics card (WebGL)', risk: 'medium',
    info: { what: 'The GPU vendor and model, read through WebGL.', why: 'GPU models are fairly distinctive and are a key part of most fingerprints.', how: 'Firefox with resistFingerprinting, Brave and Tor report generic values. You can also disable WebGL, which breaks some sites.' } });
  try {
    var c = document.createElement('canvas'), gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (gl) {
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      gpu.set(U.kv([['Vendor', ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)], ['Renderer', ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)]]), 'medium');
    } else gpu.set(null, 'low');
  } catch (e) { gpu.set(null, 'low'); }

  var bat = U.item(box, { label: 'Battery', risk: 'low',
    info: { what: 'Battery level and whether you are charging (Battery Status API, Chromium only).', why: 'Level and charge time can briefly link visits across sites, and a battery at all tells a site you are on a laptop or phone.', how: 'Firefox and Safari removed this API. Brave reports fixed values instead of the real ones.' } });
  U.battery.attach(bat, nav);

  var cn = nav.connection;
  U.item(box, { label: 'Connection type', risk: 'low',
    value: cn ? U.kv([['Effective type', cn.effectiveType], ['Type', cn.type || '(hidden)'], ['Downlink', cn.downlink != null ? cn.downlink + ' Mb/s' : null], ['Round trip', cn.rtt != null ? cn.rtt + ' ms' : null], ['Data saver', cn.saveData ? 'on' : 'off']]) : null,
    info: { what: 'An estimate of your connection speed and type (Network Information API, Chromium only).', why: 'It hints whether you are on mobile data or Wi-Fi and adds a little to your fingerprint.', how: 'Firefox and Safari do not expose it.' } });

  function mm(q) { return window.matchMedia ? matchMedia(q).matches : null; }
  U.item(box, { label: 'Dark mode and reduced motion', risk: 'low',
    value: U.kv([['Prefers dark', mm('(prefers-color-scheme: dark)') ? 'yes' : 'no'], ['Reduced motion', mm('(prefers-reduced-motion: reduce)') ? 'yes' : 'no'], ['High contrast', mm('(forced-colors: active)') ? 'yes' : 'no']]),
    info: { what: 'Display preferences set in your operating system.', why: 'Each one is a small bit of fingerprint; accessibility settings can also reveal personal needs.', how: 'Keep the settings you need; just know sites can read them.' } });

  U.item(box, { label: 'Touch', risk: 'low',
    value: U.kv([['Touch points', nav.maxTouchPoints], ['Coarse pointer', mm('(pointer: coarse)') ? 'yes' : 'no'], ['Hover', mm('(hover: hover)') ? 'yes' : 'no']]),
    info: { what: 'Whether you have a touchscreen and how many fingers it tracks.', why: 'It separates phones, tablets and touch laptops from desktops.', how: 'Not something you can usefully change.' } });

  var gpc = nav.globalPrivacyControl, dnt = nav.doNotTrack || window.doNotTrack;
  U.item(box, { label: 'Do Not Track / Global Privacy Control', risk: gpc ? 'low' : 'medium',
    value: U.kv([['Do Not Track', dnt === '1' ? 'on' : dnt === '0' ? 'off' : 'not set'], ['Global Privacy Control', gpc === true ? 'on' : gpc === false ? 'off' : null]]),
    info: { what: 'Signals asking sites not to track or sell your data. DNT is ignored by almost everyone; GPC is legally binding in some US states (e.g. California, Colorado).', why: 'Without them, sites assume you agree to tracking where the law allows it. Ironically, turning on DNT alone adds to your fingerprint.', how: 'Turn on GPC: built into Brave, Firefox (Settings > Privacy) and DuckDuckGo, or via an extension such as Privacy Badger.' } });

  var storageOk = null;
  try { storageOk = !!window.localStorage; } catch (e) { storageOk = false; }
  U.item(box, { label: 'Cookies and storage enabled', risk: nav.cookieEnabled ? 'medium' : 'low',
    value: U.kv([['Cookies', nav.cookieEnabled ? 'enabled' : 'disabled'], ['Local storage', storageOk ? 'available' : 'blocked'], ['IndexedDB', window.indexedDB ? 'available' : 'blocked']]),
    info: { what: 'Whether this site could store cookies or data on your device. This page only checks; it never writes anything.', why: 'Cookies and storage are the classic way sites recognise you on return visits.', how: 'Clear cookies regularly or on browser close, and block third-party cookies.' } });

  U.item(box, { label: 'Referrer', risk: document.referrer ? 'medium' : 'low', value: document.referrer || '(none: you came here directly or your browser hid it)',
    info: { what: 'The page you came from, sent when you click a link.', why: 'Sites learn what you were reading before. Full URLs can leak search terms or private links.', how: 'Modern browsers send only the domain to other sites by default. Extensions or strict settings can strip it entirely.' } });

  U.item(box, { label: 'Automation (webdriver)', risk: nav.webdriver ? 'high' : 'low', value: nav.webdriver ? 'yes: this browser says it is being controlled by automation' : 'no',
    info: { what: 'A flag set when the browser is driven by a script (Selenium, Puppeteer, Playwright).', why: 'Anti-bot systems check it; real users should always see "no".', how: 'If it says yes and you did not expect it, check for unwanted software.' } });
})();
