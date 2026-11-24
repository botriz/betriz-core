import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');

test('PWA manifest declares a Persian standalone app', () => {
  assert.equal(manifest.lang, 'fa');
  assert.equal(manifest.dir, 'rtl');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.src === './icon.svg'));
});

test('HTML links manifest and registers service worker on HTTPS', () => {
  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(html, /navigator\.serviceWorker\.register\('\.\/sw\.js'\)/);
  assert.match(html, /id="offlineStatus"/);
});

test('service worker caches local shell and excludes cross-origin requests', () => {
  assert.match(worker, /'\.\/index\.html'/);
  assert.match(worker, /url\.origin !== self\.location\.origin/);
  assert.match(worker, /caches\.match\('\.\/index\.html'\)/);
});

test('service worker does not intercept non-GET requests', () => {
  assert.match(worker, /request\.method !== 'GET'/);
});
