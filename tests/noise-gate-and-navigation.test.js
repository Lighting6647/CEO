import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyNoiseGate,
  isNoiseGateOpen,
  estimateNoiseFloor,
  DEFAULT_NOISE_FLOOR,
  DEFAULT_HIGHPASS_FREQ,
} from '../src/utils/noiseGateProcessor.js';
import {
  getFavoriteSites,
  recordFavoriteSite,
  resolveFavoriteSite,
  getFavoriteRoutes,
  recordFavoriteRoute,
  resolveFavoriteRoute,
  isFavoriteSiteCommand,
  isFavoriteRouteCommand,
} from '../src/services/favoriteSitesService.js';

test('Acoustic Noise Gate: Suppresses steady AC/fan humming below threshold', () => {
  // Typical AC and fan background hum amplitude is between 0.015 and 0.038
  const fanNoise1 = 0.02;
  const fanNoise2 = 0.035;
  const gated1 = applyNoiseGate(fanNoise1, DEFAULT_NOISE_FLOOR);
  const gated2 = applyNoiseGate(fanNoise2, DEFAULT_NOISE_FLOOR);

  assert.equal(gated1, 0.0, 'Fan noise 0.02 should be clamped to 0.0');
  assert.equal(gated2, 0.0, 'Fan noise 0.035 should be clamped to 0.0');
  assert.equal(isNoiseGateOpen(fanNoise1, DEFAULT_NOISE_FLOOR), false);
  assert.equal(isNoiseGateOpen(fanNoise2, DEFAULT_NOISE_FLOOR), false);
  assert.equal(DEFAULT_HIGHPASS_FREQ, 85, 'Highpass rumble cut should default to 85 Hz');
});

test('Acoustic Noise Gate: Preserves and expands speech amplitudes above threshold', () => {
  const normalSpeech = 0.18;
  const whisperedSpeech = 0.075;

  const gatedSpeech = applyNoiseGate(normalSpeech, DEFAULT_NOISE_FLOOR);
  const gatedWhisper = applyNoiseGate(whisperedSpeech, DEFAULT_NOISE_FLOOR);

  assert.ok(gatedSpeech > normalSpeech, 'Voice should be dynamically expanded above threshold');
  assert.ok(gatedWhisper > 0.04, 'Soft speech above floor should pass through the gate');
  assert.equal(isNoiseGateOpen(normalSpeech, DEFAULT_NOISE_FLOOR), true);
  assert.equal(isNoiseGateOpen(whisperedSpeech, DEFAULT_NOISE_FLOOR), true);

  // Frequency noise estimator
  const ambientFrequencies = new Uint8Array([8, 10, 12, 9, 11, 8]);
  const estimated = estimateNoiseFloor(ambientFrequencies);
  assert.ok(estimated > 0.01 && estimated < 0.12, 'Estimated floor should be within realistic ambient range');
});

test('Favorite Sites & Mem0 Integration: Resolves and records favorite websites for sir ไลท์', () => {
  const defaultSites = getFavoriteSites();
  assert.ok(Array.isArray(defaultSites), 'Favorite sites should return an array');
  assert.ok(defaultSites.length >= 1, 'Should contain pre-seeded CEO sites');

  // Resolves top site
  const topSite = resolveFavoriteSite();
  assert.ok(topSite.url, 'Top site should have a valid URL');

  // Records new custom favorite site
  const saved = recordFavoriteSite('Antigravity Docs', 'https://antigravity.dev', true);
  assert.equal(saved.name, 'Antigravity Docs');
  assert.equal(saved.url, 'https://antigravity.dev');

  const resolved = resolveFavoriteSite('antigravity');
  assert.equal(resolved.url, 'https://antigravity.dev');

  // Command detection
  assert.equal(isFavoriteSiteCommand('เปิดเว็บประจำ'), true);
  assert.equal(isFavoriteSiteCommand('จาร์วิส เปิดเว็บประจำให้หน่อย'), true);
  assert.equal(isFavoriteSiteCommand('เข้าเว็บประจำ'), true);
  assert.equal(isFavoriteSiteCommand('เว็บโปรด'), true);
  assert.equal(isFavoriteSiteCommand('พรุ่งนี้ฝนตกไหม'), false);
});

test('Favorite Routes & Navigation: Resolves and records frequent travel destinations', () => {
  const defaultRoutes = getFavoriteRoutes();
  assert.ok(Array.isArray(defaultRoutes), 'Favorite routes should return an array');
  assert.ok(defaultRoutes.length >= 1, 'Should contain pre-seeded routes');

  // Resolves top route
  const topRoute = resolveFavoriteRoute();
  assert.ok(topRoute.destination, 'Top route should have a destination');

  // Records new custom frequent route
  const savedRoute = recordFavoriteRoute('อารีย์ พหลโยธิน', 'Co-working Ari', true);
  assert.equal(savedRoute.destination, 'อารีย์ พหลโยธิน');
  assert.equal(savedRoute.label, 'Co-working Ari');

  const resolved = resolveFavoriteRoute('ari');
  assert.equal(resolved.destination, 'อารีย์ พหลโยธิน');

  // Command detection
  assert.equal(isFavoriteRouteCommand('เส้นทางประจำ'), true);
  assert.equal(isFavoriteRouteCommand('จาร์วิส ไปที่ประจำ'), true);
  assert.equal(isFavoriteRouteCommand('นำทางไปที่ประจำ'), true);
  assert.equal(isFavoriteRouteCommand('สรุปข่าวเช้า'), false);
});

test('Screen Resizing & Viewport Voice Command Parsing', () => {
  const isFullscreen = (text) =>
    text.includes('เต็มจอ') ||
    text.includes('ขยายเต็มจอ') ||
    text.includes('เต็มหน้าจอ') ||
    text.includes('โหมดเต็มจอ') ||
    text.includes('เปิดเต็มจอ') ||
    text.toLowerCase().includes('fullscreen');

  const isMinimize = (text) =>
    text.includes('ย่อจอ') ||
    text.includes('ย่อหน้าจอ') ||
    text.includes('ย่อขนาด') ||
    text.includes('ย่อโฮโลแกรม') ||
    text.includes('ออกจากเต็มจอ') ||
    text.includes('ปิดเต็มจอ') ||
    text.toLowerCase().includes('exit fullscreen') ||
    text.toLowerCase().includes('minimize');

  const isPanoramicMap = (text) =>
    text.includes('แสดงแผนที่แบบเต็มผืน') ||
    text.includes('แผนที่เต็มผืน') ||
    text.includes('ขยายแผนที่') ||
    text.includes('แผนที่พาโนรามา') ||
    text.includes('กางแผนที่') ||
    text.includes('แผนที่กว้าง') ||
    text.includes('แผนที่เต็มจอ');

  const isNoiseGate = (text) =>
    text.includes('ตัดเสียงแอร์') ||
    text.includes('ตัดเสียงพัดลม') ||
    text.includes('ตัดเสียงรบกวน') ||
    text.includes('น้อยส์เกต') ||
    text.toLowerCase().includes('noise gate');

  // Assert Fullscreen
  assert.equal(isFullscreen('จาร์วิส เต็มจอ'), true);
  assert.equal(isFullscreen('ขยายเต็มจอเลย'), true);
  assert.equal(isFullscreen('โหมดเต็มจอ'), true);

  // Assert Minimize
  assert.equal(isMinimize('จาร์วิส ย่อจอ'), true);
  assert.equal(isMinimize('ย่อหน้าจอลงหน่อย'), true);
  assert.equal(isMinimize('ย่อโฮโลแกรม'), true);

  // Assert Panoramic Map
  assert.equal(isPanoramicMap('แสดงแผนที่แบบเต็มผืน'), true);
  assert.equal(isPanoramicMap('แผนที่เต็มผืน'), true);
  assert.equal(isPanoramicMap('กางแผนที่'), true);
  assert.equal(isPanoramicMap('ขยายแผนที่'), true);

  // Assert Map & Navigation
  const isCloseMap = (text) => {
    const cleanNoSpace = text.replace(/\s+/g, '').toLowerCase();
    return (
      /(?<!เ)ปิดแผนที่/.test(cleanNoSpace) ||
      cleanNoSpace.includes('ย่อแผนที่') ||
      /(?<!เ)ปิดแมพ/.test(cleanNoSpace) ||
      cleanNoSpace.includes('ย่อแมพ') ||
      text.toLowerCase().includes('close map') ||
      text.toLowerCase().includes('hide map')
    );
  };

  const isMapCommand = (text) => {
    if (isCloseMap(text)) return false;
    const cleanNoSpace = text.replace(/\s+/g, '').toLowerCase();
    return (
      isPanoramicMap(text) ||
      cleanNoSpace.includes('แผนที่') ||
      cleanNoSpace.includes('เปิดแผนที่') ||
      cleanNoSpace.includes('ดูแผนที่') ||
      cleanNoSpace.includes('นำทาง') ||
      cleanNoSpace.includes('แมพ') ||
      cleanNoSpace.includes('กูเกิลแมพ') ||
      text.toLowerCase().includes('google maps') ||
      text.toLowerCase().includes('google map') ||
      text.toLowerCase().includes('maps')
    );
  };

  assert.equal(isMapCommand('จาร์วิส เปิดแผนที่'), true);
  assert.equal(isMapCommand('สั่งให้เปิดแผนที่'), true);
  assert.equal(isMapCommand('สั่ง ให้ เปิด แผนที่'), true);
  assert.equal(isMapCommand('เปิด แผนที่'), true);
  assert.equal(isMapCommand('เปิด แผน ที่'), true);
  assert.equal(isMapCommand('เปิด แมพ'), true);
  assert.equal(isMapCommand('เปิดแผนที่หน่อย'), true);
  assert.equal(isMapCommand('ดูแผนที่ไปสยาม'), true);
  assert.equal(isMapCommand('นำทางไปพารากอน'), true);
  assert.equal(isMapCommand('เปิด google maps'), true);
  assert.equal(isCloseMap('ปิดแผนที่'), true);
  assert.equal(isCloseMap('ย่อแผนที่ลง'), true);
  assert.equal(isCloseMap('ปิดแมพ'), true);
  assert.equal(isMapCommand('ปิดแผนที่'), false);

  // Assert Noise Gate
  assert.equal(isNoiseGate('จาร์วิส ตัดเสียงแอร์ในห้อง'), true);
  assert.equal(isNoiseGate('ตัดเสียงพัดลม'), true);
  assert.equal(isNoiseGate('เปิด noise gate'), true);
});
