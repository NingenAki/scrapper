import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

function runScraper(args) {
  return spawnSync(process.execPath, [resolve('scraper.js'), ...args], {
    cwd: resolve('.'),
    encoding: 'utf8',
  });
}

test('returns an error when no URL is provided', () => {
  const result = runScraper([]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /A URL deve usar o protocolo http ou https\./);
});

test('returns an error for malformed URLs', () => {
  const result = runScraper(['not a url']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /A URL deve usar o protocolo http ou https\./);
});

test('returns an error for non-http protocols', () => {
  const result = runScraper(['ftp://example.com']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /A URL deve usar o protocolo http ou https\./);
});
