import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredFirecrawlKey,
  setStoredFirecrawlKey,
  scrapeWebPage,
  extractCompetitorIntelligence,
} from '../src/services/firecrawlService.js';

test('Firecrawl: getStoredFirecrawlKey and setStoredFirecrawlKey work with storage or fallback', () => {
  const initial = getStoredFirecrawlKey();
  assert.equal(typeof initial, 'string');

  setStoredFirecrawlKey('fc-test-key-12345');
  // In node environment without window, it safely doesn't throw
  assert.doesNotThrow(() => getStoredFirecrawlKey());
});

test('Firecrawl: scrapeWebPage returns structured markdown extraction and metadata', async () => {
  const result = await scrapeWebPage('https://example.com/test-product', {
    fallbackTitle: 'Test Product Title',
  });

  assert.equal(result.success, true);
  assert.equal(result.url, 'https://example.com/test-product');
  assert.ok(result.markdown.includes('Web Intelligence Extract'));
  assert.ok(result.title.includes('Test Product Title'));
  assert.equal(typeof result.metadata, 'object');
});

test('Firecrawl: extractCompetitorIntelligence produces price matrix and margin advice for AI Sales', async () => {
  const result = await extractCompetitorIntelligence('POS Cloud');

  assert.equal(result.success, true);
  assert.ok(result.competitors.length > 0);
  assert.ok(result.summaryMarkdown.includes('วิเคราะห์คู่แข่งและราคาในตลาด'));
  assert.ok(result.recommendedPrice.includes('฿390'));
  assert.equal(result.marginEstimate, '84.2%');
});
