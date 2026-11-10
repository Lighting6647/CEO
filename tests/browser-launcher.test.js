import test from 'node:test';
import assert from 'node:assert/strict';
import { extractWebTarget, isBrowserOpenCommand } from '../src/services/browserLauncherService.js';

test('Browser Launcher: detects browser open intent accurately', () => {
  assert.equal(isBrowserOpenCommand('เปิดเว็บ google ให้หน่อย'), true);
  assert.equal(isBrowserOpenCommand('เปิดยูทูปฟังเพลง'), true);
  assert.equal(isBrowserOpenCommand('เปิดกิตฮับ'), true);
  assert.equal(isBrowserOpenCommand('เปิดเว็บไซต์ github.com'), true);
  assert.equal(isBrowserOpenCommand('เปิด sanook.com'), true);
  assert.equal(isBrowserOpenCommand('เปิดแผนที่ไปสยาม'), true);
  assert.equal(isBrowserOpenCommand('สั่งเปิด google map'), true);
  assert.equal(isBrowserOpenCommand('เปิด google map'), true);
  assert.equal(isBrowserOpenCommand('เปิด google maps'), true);
  assert.equal(isBrowserOpenCommand('เปิดกูเกิลแมพ'), true);
  assert.equal(isBrowserOpenCommand('สั่งให้เปิดแผนที่'), true);
  assert.equal(isBrowserOpenCommand('สั่ง ให้ เปิด แผนที่'), true);
  assert.equal(isBrowserOpenCommand('เปิด แผนที่'), true);
  assert.equal(isBrowserOpenCommand('เปิด แมพ'), true);
  assert.equal(isBrowserOpenCommand('สภาพจราจรวันนี้เป็นไง'), false);
  assert.equal(isBrowserOpenCommand('อากาศวันนี้'), false);
});

test('Browser Launcher: extracts web target URLs and shortcuts accurately', () => {
  const g = extractWebTarget('เปิดกูเกิล');
  assert.equal(g.url, 'https://www.google.com');

  const gmapSingular = extractWebTarget('สั่งเปิด google map');
  assert.equal(gmapSingular.url, 'https://maps.google.com');

  const gmapsPlural = extractWebTarget('เปิด google maps');
  assert.equal(gmapsPlural.url, 'https://maps.google.com');

  const gmapThai = extractWebTarget('เปิดกูเกิลแมพ');
  assert.equal(gmapThai.url, 'https://maps.google.com');

  const yt = extractWebTarget('เปิดเว็บ youtube');
  assert.equal(yt.url, 'https://www.youtube.com');

  const direct = extractWebTarget('เปิดเว็บ https://github.com/Lighting6647');
  assert.equal(direct.url, 'https://github.com/Lighting6647');

  const domainOnly = extractWebTarget('เปิดหน้าเว็บ sanook.com');
  assert.equal(domainOnly.url, 'https://sanook.com');

  const maps = extractWebTarget('เปิดแผนที่');
  assert.equal(maps.url, 'https://maps.google.com');

  const mapsSpaced = extractWebTarget('สั่ง ให้ เปิด แผนที่');
  assert.equal(mapsSpaced.url, 'https://maps.google.com');

  const mapsSpaced2 = extractWebTarget('เปิด แผนที่');
  assert.equal(mapsSpaced2.url, 'https://maps.google.com');

  const mapsThai = extractWebTarget('เปิด แมพ');
  assert.equal(mapsThai.url, 'https://maps.google.com');

  const search = extractWebTarget('ค้นหา ข่าวเทคโนโลยี AI ล่าสุด');
  assert.ok(search.url.includes('google.com/search?q='));
});
