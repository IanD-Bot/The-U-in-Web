// Run with: node --test tests/
// Loads js/battery.js in a sandbox with a stub UIW and a mocked navigator.getBattery. No network, no dependencies.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'battery.js'), 'utf8');

function load() {
  const text = n => n == null ? '' : typeof n === 'string' ? n : (n.text || '') + (n.kids || []).map(text).join('');
  const UIW = {
    el: (tag, a, kids) => ({ tag, text: a && a.text, kids: kids || [] }),
    kv: rows => ({ tag: 'table', kids: rows.map(r => ({ text: r[0] + ': ' + r[1] + '\n' })) }),
    bubble: (label, info) => ({ btn: { tag: 'button', text: '' }, pop: { tag: 'div', info } })
  };
  const ctx = { window: { UIW }, Infinity, isFinite, Math, Promise };
  vm.runInNewContext(SRC, ctx);
  const handle = { valueEl: { style: {} }, set(v, risk) { this.value = v; this.text = text(v); this.risk = risk; return this; } };
  return { B: UIW.battery, handle };
}

function mockBattery(init) {
  const listeners = {};
  const b = Object.assign({ addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); } }, init);
  b.fire = (ev, changes) => { Object.assign(b, changes); (listeners[ev] || []).forEach(fn => fn()); };
  b.listeners = listeners;
  return b;
}
const REAL = { level: 0.7, charging: false, chargingTime: Infinity, dischargingTime: 5400 };
const SPOOF = { level: 1, charging: true, chargingTime: 0, dischargingTime: Infinity };

test('real values are shown with medium risk', async () => {
  const { B, handle } = load();
  const state = await B.attach(handle, { getBattery: () => Promise.resolve(mockBattery(REAL)) });
  assert.strictEqual(state, 'real');
  assert.strictEqual(handle.risk, 'medium');
  assert.match(handle.text, /Level: 70%/);
  assert.match(handle.text, /Charging: no/);
  assert.match(handle.text, /Time to empty: 90 min/);
  assert.doesNotMatch(handle.text, /Fixed values/);
});

test('known fixed values are flagged as fixed values with lower risk and an info bubble', async () => {
  const { B, handle } = load();
  const state = await B.attach(handle, { getBattery: () => Promise.resolve(mockBattery(SPOOF)) });
  assert.strictEqual(state, 'spoofed');
  assert.strictEqual(handle.risk, 'low');
  assert.match(handle.text, /Fixed values: no battery, fully charged, or spoofed/);
  const pop = handle.value.kids.find(k => k.tag === 'div' && k.info);
  assert.ok(pop, 'spoof info bubble present');
  assert.match(pop.info.why, /no battery/);
  assert.match(pop.info.why, /fully charged and plugged in/);
  assert.match(pop.info.how, /Brave/);
});

test('isSpoofed needs all four fixed values', () => {
  const { B } = load();
  assert.ok(B.isSpoofed(SPOOF));
  assert.ok(!B.isSpoofed(Object.assign({}, SPOOF, { level: 0.99 })));
  assert.ok(!B.isSpoofed(Object.assign({}, SPOOF, { chargingTime: 60 })));
  assert.ok(!B.isSpoofed(Object.assign({}, SPOOF, { dischargingTime: 3600 })));
  assert.ok(!B.isSpoofed(Object.assign({}, SPOOF, { charging: false })));
});

test('subscribes to all four events and updates live', async () => {
  const { B, handle } = load();
  const bat = mockBattery(SPOOF);
  await B.attach(handle, { getBattery: () => Promise.resolve(bat) });
  for (const ev of ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange']) assert.strictEqual((bat.listeners[ev] || []).length, 1, ev);
  bat.fire('chargingchange', { charging: false, chargingTime: Infinity });
  bat.fire('dischargingtimechange', { dischargingTime: 7200 });
  bat.fire('levelchange', { level: 0.69 });
  assert.strictEqual(handle.state, 'real');
  assert.strictEqual(handle.risk, 'medium');
  assert.match(handle.text, /Level: 69%/);
  assert.match(handle.text, /Time to empty: 120 min/);
  bat.fire('chargingtimechange', {});
  assert.match(handle.text, /Charging: no/);
});

test('missing API shows Not available', async () => {
  const { B, handle } = load();
  assert.strictEqual(await B.attach(handle, {}), 'missing');
  assert.match(handle.text, /^Not available/);
  assert.strictEqual(handle.risk, 'low');
});

test('rejected getBattery shows Not available', async () => {
  const { B, handle } = load();
  assert.strictEqual(await B.attach(handle, { getBattery: () => Promise.reject(new Error('blocked')) }), 'error');
  assert.match(handle.text, /^Not available/);
});
