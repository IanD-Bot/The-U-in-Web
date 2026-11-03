/* Sections 6-9: explainers and links. */
(function () {
  'use strict';
  var U = window.UIW, el = U.el;
  function links(list) { return el('ul', null, list.map(function (l) { return el('li', null, [U.link(l[0], l[1])].concat(l[2] ? [' ' + l[2]] : [])); })); }
  function body(text, extra) { return el('div', null, [el('p', { text: text, class: 'item-value text' })].concat(extra ? [extra] : [])); }

  var cs = document.getElementById('cant-see-items');
  document.getElementById('h-cant-see').insertAdjacentElement('afterend', el('p', { class: 'intro', text: 'Browsers keep some things away from websites. This page cannot read them, but the companies that run your apps and OS can, so here is where to see or limit them.' }));
  [
    ['Other sites\u2019 cookies', 'A site can only read its own cookies, not your bank\u2019s or your email\u2019s. Trackers work around this by being embedded on many sites (see section 4).', null, 'Block third-party cookies and clear cookies regularly.'],
    ['Your Google and Facebook IDs', 'Sites cannot read your Google or Facebook account. But Google and Meta scripts embedded on a site can recognise you if you are logged in, and report your visit to their owner.', links([['https://myadcenter.google.com/', 'Google My Ad Center', '(see and limit ad personalisation)'], ['https://takeout.google.com/', 'Google Takeout', '(download what Google has on you)'], ['https://accountscenter.facebook.com/info_and_permissions/off_facebook_activity', 'Meta: Your activity off Meta technologies', '(see and disconnect what other sites sent to Meta)']]), 'Log out of Google and Meta when browsing, or use a separate browser profile for them.'],
    ['Advertising IDs (Google ad ID, Apple IDFA)', 'Phones have an advertising ID that apps (not websites) can read to link your activity for ads.', el('ul', null, [el('li', { text: 'Android: Settings > Google > Ads (or Privacy > Ads) > Delete advertising ID.' }), el('li', { text: 'iPhone / iPad: Settings > Privacy & Security > Tracking > turn off "Allow Apps to Request to Track".' })]), 'Delete or disable the ID; it stops most cross-app ad tracking.'],
    ['Windows Global Device ID and Microsoft account data', 'Windows has device IDs (including the Global Device ID, GDID) and diagnostic data tied to your Microsoft account. Websites cannot read them, but Microsoft collects them.', links([['https://account.microsoft.com/privacy', 'Microsoft privacy dashboard', '(see and clear activity, ad settings)'], ['https://support.microsoft.com/en-us/windows/diagnostics-feedback-and-privacy-in-windows-28808a2b-a31b-dd73-dcd3-4559a5199319', 'Windows diagnostics and privacy settings', '(Microsoft guide)']]), 'Windows: Settings > Privacy & security > General (turn off advertising ID) and > Diagnostics & feedback (send only required data).'],
    ['Your name, email and contacts', 'A site does not know who you are unless you tell it, sign in, or your browser autofills a form. Data brokers then link those details to your IP and device.', links([['https://privacy.ca.gov/drop/', 'California Delete Request and Opt-out Platform (DROP)', '(delete from all registered brokers, California residents)'], ['https://privacyrights.org/data-brokers', 'Privacy Rights Clearinghouse data broker list'], ['https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List', 'Big Ass Data Broker Opt-Out List', '(step-by-step opt-outs)']]), 'Be careful which forms you fill in and opt out of data brokers.']
  ].forEach(function (x) { U.item(cs, { label: x[0], risk: 'info', text: true, value: body(x[1], x[2]), info: { what: x[1], how: x[3] } }); });

  var ck = document.getElementById('checklist-items');
  [
    ['Tighten browser privacy settings', 'Block third-party cookies, turn on Global Privacy Control, use strict tracking protection (Firefox: Strict; Edge: Strict; Safari: on by default), and clear data on exit if you can live with signing in again.'],
    ['Choose extensions carefully', 'One good content blocker (uBlock Origin) does more than many. Each extension can read pages you visit, so install few, from known developers, and remove ones you do not use.'],
    ['Know what a VPN does and does not do', 'A VPN hides your IP from sites and your traffic from the local network, but the VPN provider sees it instead. It does not stop cookies, fingerprinting or logged-in tracking. Avoid free VPNs.'],
    ['Be careful on public Wi-Fi', 'Anyone on the network may see which sites you visit. Stick to HTTPS sites, avoid signing in to sensitive accounts, turn off auto-join, and consider a trusted VPN.'],
    ['Understand HTTPS', 'The padlock means the connection is encrypted and the site really owns that domain. It does not mean the site is honest: phishing sites use HTTPS too.'],
    ['Spot phishing', 'Check the address bar before you sign in, distrust urgent messages asking you to log in or pay, and open sites yourself instead of clicking links in emails or texts.'],
    ['Use a password manager, passkeys and 2FA', 'A password manager gives every site a unique password and will not autofill on fake sites. Use passkeys where offered, and turn on two-factor authentication (app or key, not SMS where possible) on email and banking.'],
    ['Private mode has limits', 'Private windows forget history and cookies when closed. They do not hide you from websites, your employer, your ISP or fingerprinting.']
  ].forEach(function (x) { U.item(ck, { label: x[0], risk: 'info', text: true, value: x[1], info: { what: x[0] + '.', how: x[1] } }); });

  var pv = document.getElementById('privacy-items');
  U.item(pv, { label: 'What this page keeps', risk: 'low', text: true, wide: true,
    value: el('div', null, [el('ul', null, [
      el('li', { text: 'Nothing is stored: no cookies, no local storage, no analytics, no accounts. Everything above is worked out in your browser and forgotten when you close or reload the page.' }),
      el('li', { text: 'This site is hosted on GitHub Pages. GitHub keeps standard server access logs (such as IP address and browser) for security, as every web host does.' }),
      el('li', { text: 'The IP lookup in section 3 runs only when you click "Show my IP". It asks ipwho.is (or ipapi.co if that fails), which receives your IP address and browser details to answer.' }),
      el('li', { text: 'Outside links (such as the DNS leak test and the tools below) only load when you click them.' })
    ]), el('p', { class: 'item-value text' }, ['Full policy: ', U.link('https://iand-bot.github.io/privacy/the-u-in-web', 'The U in Web privacy policy'), '.'])]),
    info: { what: 'How this page handles your data.', why: 'A privacy tool should practise what it preaches.', how: 'Check it yourself: open your browser\u2019s developer tools (F12), Network tab, and reload. Only this site\u2019s own files load until you click "Show my IP".' } });

  var sim = document.getElementById('similar-items');
  [
    ['https://coveryourtracks.eff.org/', 'EFF Cover Your Tracks', 'Tests how well your browser resists tracking and fingerprinting.'],
    ['https://amiunique.org/', 'AmIUnique', 'Compares your fingerprint against a large research dataset.'],
    ['https://browserleaks.com/', 'BrowserLeaks', 'Detailed technical tests for every browser API.'],
    ['https://webkay.robinlinus.com/', 'Webkay', 'A quick demo of what your browser knows about you.']
  ].forEach(function (x) { U.item(sim, { label: x[1], risk: 'info', text: true, value: el('span', null, [x[2] + ' ', U.link(x[0], 'Open ' + x[1])]), info: { what: x[2], why: 'Opening it sends your IP and browser details to that site, like any website visit.' } }); });
})();
document.documentElement.classList.add('ready');
