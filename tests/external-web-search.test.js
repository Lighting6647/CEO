import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isExternalSearchQuery,
  searchExternalWeb,
  extractKeyFiguresAndSummary,
  saveExternalWebToMem0,
  getExternalWebBookmarks,
  isExternalWebBookmarked,
  clearSearchCache,
  getHistoricalMarketTrend,
  checkPriceShiftAlert,
  generateWebIntelligenceReport,
  buildMediaGallery,
  saveMediaToMem0Gallery,
  getMem0MediaGallery,
  isMediaSavedInMem0,
  deleteMediaFromMem0Gallery,
  clearMem0MediaGallery,
  prefetchAndCacheImage,
  getCachedImageStatus,
  clearImageCache,
  parseMediaVoiceCommand,
} from '../src/services/externalWebService.js';

test('External Web Search: correctly detects external information and search queries', () => {
  // Real-time market prices & commodity triggers
  assert.equal(isExternalSearchQuery('ราคาทองวันนี้เป็นยังไงบ้าง'), true);
  assert.equal(isExternalSearchQuery('เช็คราคาน้ำมันหน่อย'), true);
  assert.equal(isExternalSearchQuery('ราคา bitcoin ตอนนี้เท่าไหร่'), true);
  assert.equal(isExternalSearchQuery('อัตราแลกเปลี่ยนเงินดอลลาร์'), true);

  // Search intent triggers
  assert.equal(isExternalSearchQuery('ค้นหา ข้อมูลเกี่ยวกับ Quantum Computing'), true);
  assert.equal(isExternalSearchQuery('หาข้อมูลเรื่องยานอวกาศ Artemis'), true);
  assert.equal(isExternalSearchQuery('เสิร์ช google ข่าวเทคโนโลยี AI ล่าสุด'), true);

  // Comparison & Historical trend triggers
  assert.equal(isExternalSearchQuery('เปรียบเทียบราคาทองย้อนหลัง'), true);
  assert.equal(isExternalSearchQuery('กราฟราคา bitcoin 7 วัน'), true);

  // General knowledge queries
  assert.equal(isExternalSearchQuery('ใครคือ Nikola Tesla'), true);
  assert.equal(isExternalSearchQuery('Superconductor คืออะไร'), true);
  assert.equal(isExternalSearchQuery('ประวัติของ Steve Jobs'), true);

  // Must NOT trigger for internal app commands or greetings
  assert.equal(isExternalSearchQuery('เปิดโปรเจกต์ pos'), false);
  assert.equal(isExternalSearchQuery('รายงานยอดขาย krob fit'), false);
  assert.equal(isExternalSearchQuery('สวัสดีจาร์วิส'), false);
  assert.equal(isExternalSearchQuery('เปิดเพลง'), false);
});

test('External Web Search: searchExternalWeb returns structured data without internal company projects', async () => {
  clearSearchCache();
  const result = await searchExternalWeb('ราคาทองวันนี้', 'sir ไลท์');

  assert.equal(result.success, true);
  assert.equal(result.action, 'EXTERNAL_WEB_SEARCH_RESULT');
  assert.ok(result.query.includes('ราคาทอง'));
  assert.ok(result.reply.includes('sir ไลท์'));
  assert.ok(Array.isArray(result.results));
  assert.ok(result.results.length > 0);

  // Verify each result item has proper shape
  const first = result.results[0];
  assert.ok(first.title, 'Should have a title');
  assert.ok(first.url, 'Should have a URL');
  assert.ok(first.domain, 'Should have a domain');
  assert.ok(first.snippet, 'Should have a snippet');

  // Verify strict scoping: NO company internal products (Krob POS, ThaiTicket, Krob Fit, Pass App)
  const fullText = (result.reply + ' ' + result.speech).toLowerCase();
  assert.equal(fullText.includes('krob pos'), false, 'Should not contain Krob POS');
  assert.equal(fullText.includes('thaiticket'), false, 'Should not contain ThaiTicket');
  assert.equal(fullText.includes('krob fit'), false, 'Should not contain Krob Fit');
  assert.equal(fullText.includes('pass app'), false, 'Should not contain Pass App');
});

test('Feature 1: In-Memory Search Cache provides sub-50ms repeat retrieval with cached flag', async () => {
  clearSearchCache();
  const q = 'ราคาทองวันนี้';

  // First fetch (uncached)
  const first = await searchExternalWeb(q, 'sir ไลท์');
  assert.equal(first.success, true);

  // Second fetch (should hit in-memory cache instantly)
  const start = performance.now();
  const second = await searchExternalWeb(q, 'sir ไลท์');
  const elapsed = performance.now() - start;

  assert.equal(second.success, true);
  assert.equal(second.cached, true, 'Second call should be flagged as cached');
  assert.ok(elapsed < 50, `Cached retrieval took ${elapsed}ms, should be sub-50ms`);
});

test('Feature 2: Key figures & metrics extraction parses gold, crypto, and general knowledge into concise speech', () => {
  // 1. Gold price extraction
  const sampleGoldText = 'ประกาศสมาคมค้าทองคำ ราคาทองคำแท่ง ขายออกบาทละ 44,200 บาท รับซื้อบาทละ 44,100 บาท';
  const goldIntel = extractKeyFiguresAndSummary('ราคาทองวันนี้', sampleGoldText, [], 'sir ไลท์');

  assert.ok(goldIntel.highlightedMetrics.length > 0);
  assert.ok(goldIntel.highlightedMetrics[0].value.includes('44,200') || goldIntel.highlightedMetrics[0].value.includes('44,100'));
  assert.ok(goldIntel.conciseVoiceSummary.includes('ราคาทองคำ'));
  assert.ok(goldIntel.conciseVoiceSummary.includes('sir ไลท์'));

  // 2. Crypto extraction
  const cryptoIntel = extractKeyFiguresAndSummary('ราคา bitcoin วันนี้', 'Bitcoin BTC spot price at $68,450', [], 'sir ไลท์');
  assert.ok(cryptoIntel.highlightedMetrics.length > 0);
  assert.ok(cryptoIntel.conciseVoiceSummary.includes('บิทคอยน์'));

  // 3. General knowledge concise speech
  const elonSummary = 'อีลอน รีฟ มัสก์ เป็นนักธุรกิจและนักลงทุน เขาเป็นผู้ก่อตั้ง ซีอีโอ และหัวหน้าวิศวกรของสเปซเอ็กซ์ และเทสลา';
  const personIntel = extractKeyFiguresAndSummary('ใครคือ Elon Musk', elonSummary, [{ domain: 'th.wikipedia.org' }], 'sir ไลท์');
  assert.ok(personIntel.conciseVoiceSummary.includes('อีลอน รีฟ มัสก์'));
  assert.ok(personIntel.conciseVoiceSummary.includes('sir ไลท์'));
  assert.ok(personIntel.conciseVoiceSummary.length <= 160, 'Speech should be concise Butler phrasing');
});

test('Feature 3: Mem0 Web Bookmark storage records and retrieves reference items', () => {
  if (typeof globalThis.localStorage === 'undefined') {
    const memoryStore = new Map();
    globalThis.localStorage = {
      getItem: (k) => memoryStore.get(k) || null,
      setItem: (k, v) => memoryStore.set(k, String(v)),
      removeItem: (k) => memoryStore.delete(k),
      clear: () => memoryStore.clear(),
    };
  }

  const sampleItem = {
    query: 'ราคาทองคำ',
    title: 'สมาคมค้าทองคำแห่งประเทศไทย',
    url: 'https://www.goldtraders.or.th',
    summary: 'ราคาทองคำแท่งและทองรูปพรรณ 96.5% ประกาศทางการ',
    domain: 'goldtraders.or.th',
  };

  const saveRes = saveExternalWebToMem0(sampleItem);
  assert.equal(saveRes.success, true);
  assert.ok(saveRes.count >= 1);

  const bookmarks = getExternalWebBookmarks();
  assert.ok(Array.isArray(bookmarks));
  assert.ok(bookmarks.some((b) => b.url === sampleItem.url));

  assert.equal(isExternalWebBookmarked(sampleItem.url), true);
  assert.equal(isExternalWebBookmarked('https://non-existent-site-12345.com'), false);
});

test('Feature 4: 7-Day Historical Market Trend generator creates Sparkline data for gold & crypto', () => {
  const goldTrend = getHistoricalMarketTrend('ราคาทองวันนี้', '44,200');
  assert.ok(goldTrend);
  assert.equal(goldTrend.type, 'gold');
  assert.equal(goldTrend.points.length, 7);
  assert.equal(goldTrend.current, 44200);
  assert.ok(goldTrend.min <= goldTrend.max);
  assert.ok(goldTrend.changePercent !== undefined);

  const btcTrend = getHistoricalMarketTrend('ราคา bitcoin', '68,450');
  assert.ok(btcTrend);
  assert.equal(btcTrend.type, 'crypto');
  assert.equal(btcTrend.points.length, 7);
  assert.equal(btcTrend.current, 68450);

  const nonMarket = getHistoricalMarketTrend('ใครคือ Elon Musk');
  assert.equal(nonMarket, null);
});

test('Feature 5: Price shift detector triggers alert on >= 0.5% fluctuation', () => {
  // Gold price change from 44,000 to 44,300 (+0.68%)
  const shiftAlert = checkPriceShiftAlert('44,000', '44,300');
  assert.equal(shiftAlert.shifted, true);
  assert.equal(shiftAlert.trend, 'up');
  assert.ok(shiftAlert.alertMessage.includes('+0.68%'));

  // Minor fluctuation from 44,000 to 44,050 (+0.11%) -> should not trigger alert
  const minorShift = checkPriceShiftAlert('44,000', '44,050');
  assert.equal(minorShift.shifted, false);
});

test('Feature 6: Executive Web Intelligence Report exporter generates Markdown and CSV formats', () => {
  const mockPayload = {
    query: 'ราคาทองคำวันนี้',
    summary: 'สมาคมค้าทองคำประกาศราคาทองคำแท่ง ขายออกบาทละ 44,200 บาท',
    results: [
      {
        title: 'สมาคมค้าทองคำ',
        domain: 'goldtraders.or.th',
        url: 'https://www.goldtraders.or.th',
        snippet: 'ประกาศราคาทองคำประจำวัน',
      },
    ],
    highlightedMetrics: [{ label: 'ทองคำแท่ง', value: '44,200', unit: 'บาท' }],
    historicalData: getHistoricalMarketTrend('ราคาทอง', '44,200'),
    userTitle: 'sir ไลท์',
  };

  const mdReport = generateWebIntelligenceReport({ ...mockPayload, format: 'md' });
  assert.ok(mdReport.includes('J.A.R.V.I.S. EXTERNAL WEB INTELLIGENCE EXECUTIVE REPORT'));
  assert.ok(mdReport.includes('sir ไลท์'));
  assert.ok(mdReport.includes('44,200'));
  assert.ok(mdReport.includes('goldtraders.or.th'));

  const csvReport = generateWebIntelligenceReport({ ...mockPayload, format: 'csv' });
  assert.ok(csvReport.includes('Title,Domain,URL,Snippet'));
  assert.ok(csvReport.includes('goldtraders.or.th'));
});

test('Feature 7: External Media Extraction captures verified illustrations for queries', async () => {
  clearSearchCache();
  // Gold query returns verified commodity illustration media
  const goldRes = await searchExternalWeb('ราคาทองวันนี้', 'sir ไลท์');
  assert.ok(goldRes.media, 'Should have media payload');
  assert.equal(goldRes.media.type, 'image');
  assert.ok(goldRes.media.url.startsWith('http'));
  assert.ok(goldRes.media.caption.includes('ทอง'));

  // Bitcoin query returns crypto market illustration media
  clearSearchCache();
  const btcRes = await searchExternalWeb('ราคา bitcoin วันนี้', 'sir ไลท์');
  assert.ok(btcRes.media, 'Should have media payload for Bitcoin');
  assert.equal(btcRes.media.type, 'image');
  assert.ok(btcRes.media.url.startsWith('http'));

  // Ensure mediaGallery is attached
  assert.ok(Array.isArray(btcRes.mediaGallery), 'Should have mediaGallery array');
  assert.ok(btcRes.mediaGallery.length >= 1, 'Should contain at least 1 slide');
});

test('Feature 8: Multi-Image Carousel builds up to 4 thematic slides for market telemetry', () => {
  // Gold gallery has 4 distinct slides
  const goldGallery = buildMediaGallery('ราคาทองวันนี้');
  assert.equal(goldGallery.length, 4, 'Gold inquiry should generate 4 slides');
  assert.ok(goldGallery[0].caption.includes('ทองคำแท่ง'));
  assert.ok(goldGallery[1].caption.includes('Spot Gold'));
  assert.ok(goldGallery[2].caption.includes('ทองคำสำรอง'));
  assert.ok(goldGallery[3].caption.includes('ทองรูปพรรณ'));

  // Bitcoin gallery has 4 distinct slides
  const btcGallery = buildMediaGallery('ราคา bitcoin');
  assert.equal(btcGallery.length, 4, 'Bitcoin inquiry should generate 4 slides');
  assert.ok(btcGallery[0].caption.includes('Digital Gold'));
  assert.ok(btcGallery[1].caption.includes('Order Book'));
  assert.ok(btcGallery[2].caption.includes('Cold Storage'));
  assert.ok(btcGallery[3].caption.includes('Hashrate'));

  // Oil gallery has 2 slides
  const oilGallery = buildMediaGallery('ราคาน้ำมัน');
  assert.equal(oilGallery.length, 2, 'Oil inquiry should generate 2 slides');
});

test('Feature 9: Interactive Hotspot Callout Overlays provide calibrated coordinate pins and HUD descriptions', () => {
  const goldGallery = buildMediaGallery('ราคาทอง');
  const slide1 = goldGallery[0];

  assert.ok(Array.isArray(slide1.hotspots), 'Slide 1 should contain hotspots array');
  assert.ok(slide1.hotspots.length >= 2, 'Should have at least 2 hotspot callout pins');

  // Verify hotspot coordinate ranges (0% to 100%) and required properties
  for (const h of slide1.hotspots) {
    assert.ok(typeof h.x === 'number' && h.x >= 0 && h.x <= 100, 'X coordinate must be 0-100%');
    assert.ok(typeof h.y === 'number' && h.y >= 0 && h.y <= 100, 'Y coordinate must be 0-100%');
    assert.ok(h.label && h.label.length > 0, 'Must have a descriptive label');
    assert.ok(h.desc && h.desc.length > 0, 'Must have detailed explanatory content');
  }

  // Check specific domain accuracy (15.244 grams standard)
  const weightHotspot = slide1.hotspots.find((h) => h.label.includes('15.244'));
  assert.ok(weightHotspot, 'Should contain 15.244 grams standard weight hotspot for Thai gold');
});

test('Feature 10: Mem0 Long-Term Media Gallery persists visual assets with tags and recall capability', () => {
  if (typeof globalThis.localStorage === 'undefined') {
    const mem = new Map();
    globalThis.localStorage = {
      getItem: (k) => mem.get(k) || null,
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
      clear: () => mem.clear(),
    };
  }

  const sampleMedia = {
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d',
    caption: 'ทองคำแท่ง 96.5% มาตรฐานสมาคมค้าทองคำ',
    source: 'goldtraders.or.th',
    hotspots: [{ x: 50, y: 50, label: 'ตราประทับ', desc: 'เลเซอร์รับรอง' }],
  };

  const saveRes = saveMediaToMem0Gallery(sampleMedia, 'ราคาทองคำแท่ง');
  assert.equal(saveRes.success, true);
  assert.ok(saveRes.count >= 1);

  const gallery = getMem0MediaGallery();
  assert.ok(Array.isArray(gallery));
  assert.ok(gallery.some((m) => m.url === sampleMedia.url));

  assert.equal(isMediaSavedInMem0(sampleMedia.url), true);
  assert.equal(isMediaSavedInMem0('https://unknown-image-url-999.jpg'), false);
});

test('Feature 11: Image Memory Cache stores visual assets and provides sub-10ms retrieval status', async () => {
  clearImageCache();
  const testUrl = 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&q=80';

  // Before cache
  const statusBefore = getCachedImageStatus(testUrl);
  assert.equal(statusBefore.cached, false);

  // Prefetch & cache
  await prefetchAndCacheImage(testUrl);
  const statusAfter = getCachedImageStatus(testUrl);
  assert.equal(statusAfter.cached, true);
  assert.ok(statusAfter.loadTimeMs <= 10, `Retrieval time ${statusAfter.loadTimeMs}ms must be sub-10ms`);

  clearImageCache();
  assert.equal(getCachedImageStatus(testUrl).cached, false);
});

test('Feature 12: Media Voice Commands parse carousel navigation (next, prev), hotspot callout inspection (1-9), toggle, and saving', () => {
  // Navigation commands
  assert.equal(parseMediaVoiceCommand('จาร์วิส ดูภาพถัดไป')?.type, 'next_slide');
  assert.equal(parseMediaVoiceCommand('สไลด์ถัดไป')?.type, 'next_slide');
  assert.equal(parseMediaVoiceCommand('รูปถัดไป')?.type, 'next_slide');
  assert.equal(parseMediaVoiceCommand('ภาพก่อนหน้า')?.type, 'prev_slide');
  assert.equal(parseMediaVoiceCommand('ย้อนกลับภาพ')?.type, 'prev_slide');

  // Hotspot callout inspection commands
  const p1 = parseMediaVoiceCommand('ดูจุดที่ 2');
  assert.equal(p1?.type, 'inspect_hotspot');
  assert.equal(p1?.pointNum, 2);
  assert.equal(p1?.index, 1);

  const p4 = parseMediaVoiceCommand('ขยายจุดที่ 4');
  assert.equal(p4?.type, 'inspect_hotspot');
  assert.equal(p4?.pointNum, 4);
  assert.equal(p4?.index, 3);

  // Toggle hotspots
  assert.equal(parseMediaVoiceCommand('เปิด hotspot')?.type, 'toggle_hotspots');
  assert.equal(parseMediaVoiceCommand('ปิดจุดชี้')?.type, 'toggle_hotspots');

  // Save media to Mem0
  assert.equal(parseMediaVoiceCommand('บันทึกภาพนี้')?.type, 'save_media');
  assert.equal(parseMediaVoiceCommand('เซฟรูป')?.type, 'save_media');
  assert.equal(parseMediaVoiceCommand('บันทึกรูปลง mem0')?.type, 'save_media');

  // Irrelevant commands should return null
  assert.equal(parseMediaVoiceCommand('สวัสดีจาร์วิส'), null);
  assert.equal(parseMediaVoiceCommand('เปิดเพลง'), null);
});

test('Feature 13: Mem0 Visual Album Explorer supports listing, searching, deleting, and clearing visual memories', () => {
  if (typeof globalThis.localStorage === 'undefined') {
    const mem = new Map();
    globalThis.localStorage = {
      getItem: (k) => mem.get(k) || null,
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
      clear: () => mem.clear(),
    };
  }

  clearMem0MediaGallery();
  assert.equal(getMem0MediaGallery().length, 0);

  const item1 = {
    id: 'img_test_1',
    url: 'https://images.unsplash.com/photo-gold-1',
    caption: 'ราคาทองคำแท่ง 96.5%',
    source: 'goldtraders.or.th',
    hotspots: [{ x: 30, y: 40, label: 'ตราเลเซอร์', desc: 'รับรองสมาคม' }],
  };
  const item2 = {
    id: 'img_test_2',
    url: 'https://images.unsplash.com/photo-btc-2',
    caption: 'Bitcoin Spot Telemetry Chart',
    source: 'binance.com',
    hotspots: [{ x: 50, y: 50, label: 'Order Book', desc: 'สภาพคล่อง' }],
  };

  saveMediaToMem0Gallery(item1, 'ราคาทอง');
  saveMediaToMem0Gallery(item2, 'bitcoin');

  let list = getMem0MediaGallery();
  assert.equal(list.length, 2);

  // Delete item 1
  const delRes = deleteMediaFromMem0Gallery(item1.id);
  assert.equal(delRes.success, true);
  list = getMem0MediaGallery();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, item2.id);

  // Clear all
  clearMem0MediaGallery();
  assert.equal(getMem0MediaGallery().length, 0);
});

