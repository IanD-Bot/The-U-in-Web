# The U in Web (UIW)

A single static web page that shows you what your browser reveals to every site you visit, and explains each item in plain words: what it is, why it matters, and how to reduce it.

- Live page: https://iand-bot.github.io/The-U-in-Web/
- Plan: [docs/PLAN.md](docs/PLAN.md)

Plain HTML, CSS and vanilla JavaScript. No build step, no cookies, no analytics, no third parties. The only outside request is an optional IP lookup that runs when you click "Show my IP".

Privacy policy: https://iand-bot.github.io/privacy/the-u-in-web

## Files

- `index.html`, `style.css`: the page and its styles.
- `js/core.js`: info bubbles, risk labels, theme toggle, hashing.
- `js/device.js`, `js/fingerprint.js`, `js/network.js`, `js/trackers.js`, `js/permissions.js`, `js/static.js`: one file per section group.
- `ads/advert.js`: a harmless bait file for the ad-blocker check.

To run it locally, serve the folder with any static server (for example `python3 -m http.server`) and open http://localhost:8000/.

Similar tools: [EFF Cover Your Tracks](https://coveryourtracks.eff.org/), [AmIUnique](https://amiunique.org/), [BrowserLeaks](https://browserleaks.com/), [Webkay](https://webkay.robinlinus.com/).
