/* Section 3: network. Nothing leaves the browser until "Show my IP" is clicked. */
(function () {
  'use strict';
  var U = window.UIW, box = document.getElementById('network-items');

  // Primary and fallback IP APIs (both free, client-side, HTTPS, CORS). Listed in the CSP connect-src.
  var APIS = [
    { name: 'ipwho.is', url: 'https://ipwho.is/', parse: function (d) {
      if (d.success === false) throw new Error(d.message || 'failed');
      var c = d.connection || {};
      return { ip: d.ip, city: d.city, region: d.region, country: d.country, isp: c.isp || c.org, org: c.org, asn: c.asn ? 'AS' + c.asn : null, tz: d.timezone && d.timezone.id };
    } },
    { name: 'ipapi.co', url: 'https://ipapi.co/json/', parse: function (d) {
      if (d.error) throw new Error(d.reason || 'failed');
      return { ip: d.ip, city: d.city, region: d.region, country: d.country_name, isp: d.org, org: d.org, asn: d.asn, tz: d.timezone };
    } }
  ];
  U.IP_APIS = APIS;

  function fetchJSON(url) {
    var ctl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    return fetch(url, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctl && ctl.signal })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function lookup(i, errs) {
    if (i >= APIS.length) return Promise.reject(errs);
    var a = APIS[i];
    return fetchJSON(a.url).then(function (d) { var r = a.parse(d); r.source = a.name; r.tried = errs; return r; })
      .catch(function (e) { return lookup(i + 1, errs.concat(a.name + ': ' + (e && e.message || 'blocked'))); });
  }

  var HOSTING = /amazon|aws|google cloud|microsoft|azure|digitalocean|linode|akamai|ovh|hetzner|vultr|m247|datacamp|choopa|leaseweb|contabo|cloudflare|oracle|hosting|server|data ?cent|vpn|proxy|mullvad|nord|express|surfshark|proton|private internet|torguard|tor\b/i;

  var ipInfo = { what: 'Your public IP address and what IP databases say about it: approximate city, internet provider (ISP) and network number (ASN).', why: 'Every site already gets your IP. It reveals your rough location and provider, and can link your visits.', how: 'A VPN or Tor hides your real IP from sites (but the VPN provider sees it). This lookup sends your IP to ' + APIS[0].name + ' (or ' + APIS[1].name + ' if the first fails); that is the only outside request this page makes, and only when you click.' };
  var ipItem = U.item(box, { label: 'Your IP address', risk: 'info', wide: true, value: 'Not looked up yet. Click the button to check.', info: ipInfo });
  var btn = U.button('Show my IP', true);
  var note = U.el('p', { class: 'item-value text', text: 'Clicking sends one request to ' + APIS[0].name + ' (fallback: ' + APIS[1].name + '). Those services see your IP and browser, as any site would.' });
  ipItem.card.appendChild(U.el('div', { class: 'actions' }, [btn]));
  ipItem.card.appendChild(note);
  btn.addEventListener('click', function () {
    btn.disabled = true; ipItem.set('Looking up\u2026', 'info');
    lookup(0, []).then(function (r) {
      var bTz = Intl.DateTimeFormat().resolvedOptions().timeZone, hints = [];
      if (r.tz && bTz && r.tz !== bTz) hints.push('IP time zone (' + r.tz + ') differs from your browser (' + bTz + '): often a sign of a VPN or proxy.');
      if (HOSTING.test((r.isp || '') + ' ' + (r.org || ''))) hints.push('The network belongs to a hosting, cloud or VPN company, so this is probably a VPN, proxy or Tor exit, not your home connection.');
      if (!hints.length) hints.push('No VPN or proxy signs: this looks like a normal home or mobile connection, so sites see your real IP.');
      var t = U.kv([['IP', r.ip], ['Location', [r.city, r.region, r.country].filter(Boolean).join(', ')], ['ISP', r.isp], ['ASN', r.asn], ['IP time zone', r.tz], ['VPN / Tor hints', hints.join(' ')], ['Looked up with', r.source + (r.tried.length ? ' (fallback; failed: ' + r.tried.join('; ') + ')' : '')]]);
      ipItem.set(t, hints[0].indexOf('No VPN') === 0 ? 'high' : 'medium');
    }, function (errs) {
      ipItem.set('Both lookups failed (' + errs.join('; ') + '). A privacy extension or network filter may be blocking them.', 'info');
    }).then(function () { btn.disabled = false; btn.textContent = 'Look up again'; });
  });

  var rtcItem = U.item(box, { label: 'WebRTC IP leak', risk: 'info', value: 'Not checked yet.',
    info: { what: 'WebRTC (used for video calls) can reveal your device\u2019s local network addresses, and sometimes your real IP even behind a VPN.', why: 'A leak lets sites see past your VPN or map your home network.', how: 'Modern browsers hide local IPs behind random ".local" names (mDNS). If you see real IPs here, use a VPN with WebRTC leak protection, uBlock Origin\u2019s "Prevent WebRTC from leaking local IP addresses", or Firefox\u2019s media.peerconnection settings. This check uses no STUN server, so it makes no outside request.' } });
  var rtcBtn = U.button('Check WebRTC');
  rtcItem.card.appendChild(U.el('div', { class: 'actions' }, [rtcBtn]));
  rtcBtn.addEventListener('click', function () {
    var PC = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    if (!PC) { rtcItem.set('WebRTC is ' + U.NA + ' (or disabled): no leak possible.', 'low'); return; }
    rtcBtn.disabled = true; rtcItem.set('Checking\u2026', 'info');
    var found = {}, pc;
    try { pc = new PC({ iceServers: [] }); } catch (e) { rtcItem.set('WebRTC is blocked in this browser: no leak possible.', 'low'); rtcBtn.disabled = false; return; }
    pc.createDataChannel('x');
    pc.onicecandidate = function (e) {
      if (!e.candidate || !e.candidate.candidate) return;
      var m = e.candidate.candidate.split(' ');
      if (m[4]) found[m[4]] = m[7] || 'host';
    };
    pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).catch(function () {});
    setTimeout(function () {
      try { pc.close(); } catch (e) {}
      rtcBtn.disabled = false;
      var addrs = Object.keys(found);
      var real = addrs.filter(function (a) { return !/\.local$/i.test(a); });
      if (!addrs.length) rtcItem.set('No addresses gathered: WebRTC is restricted. No leak.', 'low');
      else if (!real.length) rtcItem.set('Only hidden mDNS names (' + addrs.join(', ') + '). Your local IP is protected.', 'low');
      else rtcItem.set('Leaked addresses: ' + real.join(', ') + (addrs.length > real.length ? '\nAlso hidden mDNS names: ' + (addrs.length - real.length) : ''), 'high');
    }, 1500);
  });

  var dns = U.item(box, { label: 'DNS leak test', risk: 'info', text: true, value: U.el('span', null, ['DNS lookups can go to your ISP even when you use a VPN, revealing every site you visit. This page cannot test that without contacting other servers, so use an external test: ', U.link('https://www.dnsleaktest.com/', 'dnsleaktest.com'), ' (opens a new tab; that site will see your IP).']),
    info: { what: 'DNS turns names like example.com into IP addresses. Whoever answers those lookups sees every site you visit.', why: 'With a VPN, lookups should go through the VPN. A "leak" sends them to your ISP instead.', how: 'Use your VPN\u2019s DNS leak protection, or turn on encrypted DNS (DNS over HTTPS) in your browser or OS.' } });
})();
