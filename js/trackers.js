/* Section 4: trackers. Checks use no outside requests. */
(function () {
  'use strict';
  var U = window.UIW, box = document.getElementById('trackers-items'), nav = navigator;

  var ab = U.item(box, { label: 'Ad blocker', risk: 'info', value: 'Checking\u2026',
    info: { what: 'Whether you run a content blocker. The page hides a fake ad element and loads a harmless local file named like an ad script, then checks if either was blocked. Nothing leaves this site.', why: 'Blockers stop most tracking scripts and pixels before they load. Sites can detect them too, which is itself a small fingerprint signal.', how: 'Install uBlock Origin (Firefox, Edge, Chrome) or use Brave\u2019s or Safari\u2019s built-in protection. Avoid "ad blockers" from unknown publishers; some sell your data.' } });
  var bait = U.el('div', { class: 'adsbox ad-banner adsbygoogle ad-placement pub_300x250 textads banner-ads', 'aria-hidden': 'true' }, ['\u00a0']);
  bait.style.cssText = 'position:absolute;left:-9999px;top:0;width:300px;height:250px';
  document.body.appendChild(bait);
  var scriptBlocked = null;
  var sc = document.createElement('script'); sc.src = 'ads/advert.js?' + Date.now();
  sc.onload = function () { scriptBlocked = !window.UIW_AD_BAIT; };
  sc.onerror = function () { scriptBlocked = true; };
  document.head.appendChild(sc);
  setTimeout(function () {
    var cs = getComputedStyle(bait), hidden = bait.offsetHeight === 0 || cs.display === 'none' || cs.visibility === 'hidden' || !bait.isConnected;
    var on = hidden || scriptBlocked === true;
    ab.set(U.kv([['Result', on ? 'Ad blocker detected' : 'No ad blocker detected'], ['Fake ad element', hidden ? 'hidden (blocked)' : 'visible'], ['Ad-named script', scriptBlocked === null ? 'still loading' : scriptBlocked ? 'blocked' : 'loaded']]), on ? 'low' : 'high');
    if (bait.parentNode) bait.parentNode.removeChild(bait);
  }, 1200);

  // Third-party cookies: a real test needs a second site, which would be an outside request. So this is a best estimate.
  var ua = nav.userAgent, p = U.parseUA(ua), est, risk;
  var isFx = /Firefox|FxiOS/.test(ua), isSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Android/.test(ua), isIOS = /iPhone|iPad|iPod/.test(ua);
  if (!nav.cookieEnabled) { est = 'Blocked: all cookies are disabled.'; risk = 'low'; }
  else if (nav.brave) { est = 'Blocked by default in Brave.'; risk = 'low'; }
  else if (isSafari || isIOS) { est = 'Blocked by default (Safari / iOS Intelligent Tracking Prevention).'; risk = 'low'; }
  else if (isFx) { est = 'Partitioned by default (Firefox Total Cookie Protection): each site gets its own separate cookie jar, so they cannot follow you across sites.'; risk = 'low'; }
  else { est = 'Probably allowed: Chrome and Edge allow third-party cookies unless you block them in settings.'; risk = 'high'; }
  U.item(box, { label: 'Third-party cookies', risk: risk, wide: true,
    value: U.kv([['Estimate for ' + (p.browser || 'this browser'), est], ['Cookies in general', nav.cookieEnabled ? 'enabled' : 'disabled'], ['Storage Access API', document.hasStorageAccess ? 'supported' : U.NA], ['How we know', 'Based on your browser\u2019s default and its settings flags. A definite test needs a cookie from another site, and this page makes no outside requests.']]),
    info: { what: 'Cookies set by a site other than the one in your address bar, such as an ad network embedded on many pages.', why: 'They are the classic way ad networks follow you from site to site and build a profile.', how: 'Chrome: Settings > Privacy and security > Third-party cookies > Block. Edge: Settings > Cookies > Block third-party cookies, and Tracking prevention: Strict. Firefox and Safari already block or partition them.' } });

  var ex = [
    ['Tracking pixels', 'A tiny invisible image or request in a page or email. Loading it tells the tracker you opened the page or email, when, from what IP and device.', 'Email open tracking and cross-site profiles.', 'Block remote images in your email app; use a content blocker; Apple Mail Privacy Protection preloads images to hide opens.'],
    ['Meta Pixel', 'Meta (Facebook) code on millions of sites. It reports pages you view, products you buy and forms you submit back to Meta, linked to your Facebook or Instagram account even if you are logged out.', 'Meta sees much of your browsing outside its apps and uses it for ads.', 'Use a content blocker, block third-party cookies, and review Meta\u2019s "Your activity off Meta technologies" (link in section 6).'],
    ['Google Analytics and ads tags', 'Google scripts on most websites that record visits, clicks and conversions. Combined with Google\u2019s ad network they help build an interest profile.', 'Google sees a large share of the web you visit.', 'Use a content blocker; turn off personalised ads in My Ad Center (section 6).'],
    ['Real-time bidding (RTB)', 'When a page with ads loads, your device, location, page and profile IDs are broadcast to dozens of ad companies who bid in milliseconds to show you an ad.', 'Your data reaches many companies at once, even those that lose the auction, and can end up with data brokers.', 'Block ads and trackers; on phones, turn off ad personalisation and limit location sharing.'],
    ['Data brokers', 'Companies that buy and merge data from apps, sites, loyalty cards and public records into profiles sold to advertisers, insurers and anyone else.', 'Profiles can include your address, income, health interests and family, all without you ever dealing with the broker.', 'Use opt-out services or opt out yourself (links in section 6). Some US states give you a legal right to delete.']
  ];
  ex.forEach(function (e) { U.item(box, { label: e[0], risk: 'info', text: true, value: e[1], info: { what: e[1], why: e[2], how: e[3] } }); });
})();
