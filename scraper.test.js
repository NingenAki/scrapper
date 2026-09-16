import test from 'node:test';
import assert from 'node:assert/strict';

import { getInnerHtmlByClass } from './scraper.js';

test('extracts inner HTML from the first matching class element', () => {
  const html = `
    <div class="card"><p>Hello</p><span>World</span></div>
    <div class="card"><strong>Again</strong></div>
  `;

  const result = getInnerHtmlByClass(html, 'card');

  assert.equal(result, '<p>Hello</p><span>World</span>');
});

test('returns null when no class matches', () => {
  const html = '<div class="title">Hello</div>';

  const result = getInnerHtmlByClass(html, 'card');

  assert.equal(result, null);
});

test('extracts the href from the first matching link', () => {
  const html = `
    <nav>
      <a class="chapter-link" href="https://example.com/chapter-1">Chapter 1</a>
      <a href="https://example.com/chapter-2">Chapter 2</a>
    </nav>
  `;

  const result = getUrlFromLink(html, '.chapter-link');

  assert.equal(result, 'https://example.com/chapter-1');
});
