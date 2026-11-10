import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crawlWebsiteTree,
  isDeepCrawlCommand,
  extractCrawlTarget,
} from '../src/services/deepWebCrawlerService.js';
import {
  aggregateCrossWebSearch,
  isCrossWebCommand,
  extractCrossWebQuery,
  CROSS_WEB_SOURCES,
} from '../src/services/crossWebAggregatorService.js';
import {
  executeHeadlessWebAgent,
  isHeadlessAgentCommand,
  extractHeadlessTask,
  HEADLESS_EXECUTION_STAGES,
} from '../src/services/headlessWebAgentService.js';

test('Autonomous Deep Web Crawler: maps sitemap, discovers subpages, and extracts structured entities', async () => {
  const crawl = await crawlWebsiteTree('apple.com', { depth: 2, maxPages: 6 });
  assert.ok(crawl);
  assert.equal(crawl.domain, 'apple.com');
  assert.equal(crawl.status, 'COMPLETED');
  assert.ok(crawl.sitemapUrl.includes('sitemap.xml'));
  assert.ok(crawl.pages.length >= 6);
  assert.ok(crawl.totalWordsCount > 1000);
  assert.equal(typeof crawl.crawlSpeed, 'string');
  assert.ok(crawl.pages[0].entities.length > 0);

  // Command detection & target extraction
  assert.equal(isDeepCrawlCommand('เจาะเว็บ tesla.com ให้หน่อย'), true);
  assert.equal(isDeepCrawlCommand('กวาดข้อมูลเว็บ shopee.co.th'), true);
  assert.equal(isDeepCrawlCommand('deep crawl ทั้งเว็บ'), true);
  assert.equal(isDeepCrawlCommand('เปิดเพลงฟัง'), false);

  assert.equal(extractCrawlTarget('กวาดข้อมูลเว็บ tesla.com'), 'tesla.com');
  assert.equal(extractCrawlTarget('deep crawl https://openai.com/research'), 'openai.com');
});

test('Cross-Web Aggregator: synthesizes intelligence across Commerce, Community, News, and Tech', async () => {
  const { synthesis, reply, speech } = await aggregateCrossWebSearch('iPhone 16 Pro Max', 'คุณไลท์');
  assert.ok(synthesis);
  assert.equal(synthesis.query, 'iPhone 16 Pro Max');
  assert.ok(synthesis.items.length >= 4);
  assert.ok(synthesis.priceRange.includes('฿'));
  assert.ok(synthesis.sentimentScore.includes('%'));
  assert.ok(synthesis.bestDeal.length > 0);
  assert.ok(reply.includes('Cross-Web Aggregator'));
  assert.ok(speech.includes('คุณไลท์'));
  assert.equal(CROSS_WEB_SOURCES.length, 4);

  // Command detection & query extraction
  assert.equal(isCrossWebCommand('เปรียบเทียบทุกเว็บ ราคา iPad Pro'), true);
  assert.equal(isCrossWebCommand('ค้นทุกแพลตฟอร์ม หุ้น NVIDIA'), true);
  assert.equal(isCrossWebCommand('cross web search macbook'), true);
  assert.equal(isCrossWebCommand('กี่โมงแล้ว'), false);

  assert.equal(extractCrossWebQuery('เปรียบเทียบทุกเว็บ กล้อง Sony A7IV ให้หน่อย'), 'กล้อง Sony A7IV');
});

test('Live Headless Web Agent: executes robotic DOM navigation pipeline and harvests dynamic data', async () => {
  const task = await executeHeadlessWebAgent('https://www.tradingview.com', 'SET Index');
  assert.ok(task);
  assert.equal(task.domain, 'www.tradingview.com');
  assert.equal(task.query, 'SET Index');
  assert.equal(task.status, 'COMPLETED');
  assert.ok(task.steps.length >= 5);
  assert.ok(task.totalTimeMs > 0);
  assert.ok(task.harvestedData.length >= 3);
  assert.ok(HEADLESS_EXECUTION_STAGES.length >= 5);

  // Command detection & task extraction
  assert.equal(isHeadlessAgentCommand('สวมร่างเบราว์เซอร์ไปค้นหาในเว็บ shopee'), true);
  assert.equal(isHeadlessAgentCommand('headless agent ค้นในเว็บโดยตรง'), true);
  assert.equal(isHeadlessAgentCommand('สั่งเอไอไปค้นในเว็บ tradingview'), true);
  assert.equal(isHeadlessAgentCommand('สวัสดีตอนเช้า'), false);

  const parsed = extractHeadlessTask('สวมร่างเบราว์เซอร์ไปค้นหา ราคาทอง บน https://goldtraders.or.th');
  assert.ok(parsed.targetUrl.includes('goldtraders.or.th'));
  assert.ok(parsed.query.length > 0);
});
