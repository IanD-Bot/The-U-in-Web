# The U in Web (UIW) – Plan

## Objective
One static page that shows each visitor what their browser reveals, to raise awareness. Every item has an info bubble (what it is, why it matters, how to reduce it) and a risk color (low / medium / high).

## In scope
- Single page: `index.html` plus CSS and vanilla JS files at the repo root. No build step, no CDNs, no web fonts, no third parties except the opt-in IP lookup.
- Info bubble on every item: an (i) button opening a popover; keyboard accessible (Tab, Enter/Space, Esc closes).
- Risk color per item, with a text label too (not color alone).
- Sections:
  1. **Your device and browser**: OS, browser and version, Client Hints, screen, timezone / locale / languages, CPU cores and memory, GPU via WebGL, battery (if available), connection type, dark mode and reduced motion, touch, DNT / GPC, cookies and storage enabled, referrer, webdriver.
  2. **Fingerprint**: canvas, audio, fonts and WebGL fingerprints, plus a combined ID (a hash of the signals). Explain that it is a near-unique ID that works without cookies, and show which signals drove it.
  3. **Your network**: "Show my IP" button (IP, city, ISP, ASN, VPN/Tor hints), WebRTC IP leak check, link to a DNS leak test.
  4. **Trackers**: ad-blocker detection, third-party cookie support check; explain tracking pixels, Meta Pixel, Google Analytics, real-time bidding and data brokers.
  5. **Permission demos**: location, camera/mic device list, notifications, clipboard. Each runs only on a click, shows what a site would get, and keeps nothing.
  6. **What sites can't see**: other sites' cookies, Google/Facebook IDs, Google advertising ID / IDFA, Windows' Global Device ID (GDID) and Microsoft account data, your name. Links to see or limit them: Google My Ad Center, Google Takeout, Meta "Your activity off Meta technologies", Microsoft privacy dashboard, Windows privacy / diagnostic settings, data-broker opt-outs.
  7. **Stay safer checklist**: browser privacy settings, extensions, VPN limits, public Wi-Fi, what HTTPS means, phishing, password managers / passkeys / 2FA, private-mode limits.
  8. **Privacy note**: nothing stored; GitHub keeps standard access logs; the IP API is called only on click. Link to https://iand-bot.github.io/privacy/the-u-in-web.
  9. **Similar tools footer**: EFF Cover Your Tracks, AmIUnique, BrowserLeaks, Webkay.
- Light/dark theme (follows system, with a toggle that is not saved).

## Out of scope
- Accounts, a backend, or storing any visitor data.
- Cookies, localStorage, analytics or tracking of our own.
- Reading things browsers don't expose (GDID, advertising IDs, other sites' cookies). These are explained, not shown.
- Custom domain (later).

## Decisions
- Hosting: GitHub Pages from `main` root, for now. Use relative paths only, so a later move to a custom domain just works.
- IP lookup: only on a "Show my IP" click, using a free client-side API, with a fallback API if the first fails. Its bubble says the lookup itself shares your IP with that service, and names the service.
- Fingerprint ID: computed live in the page, never sent anywhere.
- Permission demos: opt-in per click, results shown and then discarded.
- No data leaves the browser except the IP lookup on click.
- Graceful "not available in this browser" state for any missing API.

## Tasks (Code Writer builds, Code Tester checks; each is done when its check passes)
1. **Page shell**: layout of all 9 sections, the info bubble component, risk colors, light/dark theme. Done when every section heading exists, bubbles open and close by mouse and keyboard, and both themes pass WCAG AA contrast.
2. **Device and browser data**: all section 1 items with bubbles and risk colors. Done when each value matches BrowserLeaks in 2 browsers, and missing APIs show "not available in this browser".
3. **Fingerprint**: canvas, audio, fonts, WebGL and the combined ID, with "which signals drove it". Done when the ID is stable across reloads in one browser and differs between browsers.
4. **Network**: Show my IP button (with fallback API) and WebRTC leak check, plus DNS leak test link. Done when the IP and location match BrowserLeaks, the fallback works when the first API is blocked, and no request goes out before the click.
5. **Trackers**: ad-blocker and third-party cookie checks plus explainers. Done when results flip correctly with an ad blocker on and off, and with third-party cookies allowed and blocked. Checks use no outside requests.
6. **Permission demos**: location, camera/mic device list, notifications, clipboard. Done when nothing is requested before a click, each shows what a site gets, denial is handled cleanly, and nothing persists after reload.
7. **Can't-see, safety checklist and privacy**: sections 6–8 and the footer, plus a privacy page at `the-u-in-web` in IanD-Bot/privacy. Done when every link works and the privacy page is live.
8. **Polish**: responsive, accessibility, cross-browser, speed. Done when it works in Chrome, Edge, Firefox and Safari, is fully keyboard usable, looks right on phone and desktop, and loads fast (Lighthouse performance and accessibility 90+).

## Verification
- Code Tester compares each shown value against BrowserLeaks in at least 2 browsers.
- Network check (DevTools): zero requests to anything but the page's own files until "Show my IP" is clicked; then only the IP API.
- Confirm no cookies or storage are written (DevTools Application tab empty).
- Keyboard-only and screen-reader pass; contrast check in both themes.

## Done means
The page is live on GitHub Pages, every item shows a correct value or a clear "not available" state with a working info bubble and risk color, nothing is stored or sent except the IP lookup on click, it passes the checks above in Chrome, Edge, Firefox and Safari, and the privacy page is linked and live.
