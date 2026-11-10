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
  assert.equal(isBrowserOpenCommand('เปิด tiktok'), true);
  assert.equal(isBrowserOpenCommand('เปิด shopee'), true);
  assert.equal(isBrowserOpenCommand('เปิด facebook'), true);
  assert.equal(isBrowserOpenCommand('เปิด chatgpt'), true);
  assert.equal(isBrowserOpenCommand('เปิด ข่าวสด'), true);
  assert.equal(isBrowserOpenCommand('เปิด รถไฟฟ้าสายสีส้ม'), true);
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

  const tiktok = extractWebTarget('เปิด ติ๊กต๊อก');
  assert.equal(tiktok.url, 'https://www.tiktok.com');

  const chatgpt = extractWebTarget('เปิด แชทจีพีที');
  assert.equal(chatgpt.url, 'https://chatgpt.com');

  const shopee = extractWebTarget('เปิด ช้อปปี้');
  assert.equal(shopee.url, 'https://shopee.co.th');

  const generalVoice = extractWebTarget('เปิด รถไฟฟ้าสายสีส้ม');
  assert.ok(generalVoice.url.includes('google.com/search?q='));
});

test('Browser Launcher: openUrlSync opens new tab with target _blank and returns status', async () => {
  const { openUrlSync } = await import('../src/services/browserLauncherService.js');
  // Without browser window object, handles cleanly without crashing
  const result = openUrlSync('https://maps.google.com');
  assert.equal(typeof result, 'object');
  assert.equal(result.url, 'https://maps.google.com');
  assert.equal(result.opened, false);
});

test('Browser Launcher: detects download commands and extracts official app download URLs accurately', async () => {
  const { isDownloadAppCommand, extractDownloadAppTarget } = await import('../src/services/browserLauncherService.js');
  
  // Exact user command from screenshot
  const prompt1 = 'ดาวน์โหลด โปรแกรม ซูม ให้ หน่อย';
  assert.equal(isDownloadAppCommand(prompt1), true);
  const target1 = extractDownloadAppTarget(prompt1);
  assert.ok(target1);
  assert.equal(target1.url, 'https://zoom.us/download');
  assert.equal(target1.name, 'Zoom Workplace');

  // LINE PC
  const prompt2 = 'โหลด ไลน์ ให้หน่อย';
  assert.equal(isDownloadAppCommand(prompt2), true);
  const target2 = extractDownloadAppTarget(prompt2);
  assert.ok(target2);
  assert.equal(target2.url, 'https://line.me/th/download');

  // Discord
  const prompt3 = 'ติดตั้ง discord';
  assert.equal(isDownloadAppCommand(prompt3), true);
  const target3 = extractDownloadAppTarget(prompt3);
  assert.ok(target3);
  assert.equal(target3.url, 'https://discord.com/download');

  // Generic app fallback
  const prompt4 = 'ดาวน์โหลด โปรแกรม winrar';
  assert.equal(isDownloadAppCommand(prompt4), true);
  const target4 = extractDownloadAppTarget(prompt4);
  assert.ok(target4);
  assert.ok(target4.url.includes('google.com/search?q='));
});

test('J.A.R.V.I.S. Brain: responds with active command execution on obedience commands', async () => {
  const { processJarvisCommand } = await import('../src/utils/jarvisBrain.js');
  const res = processJarvisCommand('ต้องให้ทำตามคำสั่งทุกอย่าง');
  assert.equal(res.action, 'COMMAND_AUTHORITY_ENGAGED');
  assert.ok(res.reply.includes('100% Autonomous Active Execution'));
});
