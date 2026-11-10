import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDestination, isTrafficText, buildDirectionsUrl, buildMapEmbedUrl } from '../src/utils/routeIntel.js';
import {
  addShortcut,
  removeShortcut,
  resolveShortcut,
  getShortcuts,
  normalizeTrigger,
  parseShortcutDefinition,
  parseShortcutRemoval,
  isListShortcutsCommand,
  __resetShortcutsForTests,
} from '../src/services/voiceShortcutService.js';

test('Route Intel: extracts Thai destinations and strips conversational fillers', () => {
  assert.equal(extractDestination('การจราจรไปสยามพารากอนเป็นยังไงบ้าง'), 'สยามพารากอน');
  assert.equal(extractDestination('เส้นทางไปสนามบินสุวรรณภูมิ ติดไหมครับ'), 'สนามบินสุวรรณภูมิ');
  assert.equal(extractDestination('ขับรถไปถึงเซ็นทรัลเวิลด์ใช้เวลาเท่าไหร่'), 'เซ็นทรัลเวิลด์');
  assert.equal(extractDestination('รถติดไหม'), null);
  assert.equal(isTrafficText('สภาพจราจรตอนนี้'), true);
  assert.equal(isTrafficText('สวัสดีครับ'), false);
});

test('Route Intel: builds safe, encoded Google Maps URLs', () => {
  assert.match(buildDirectionsUrl('สยาม & พารากอน'), /destination=%E0.*%26/);
  assert.match(buildMapEmbedUrl(null), /output=embed/);
});

test('Voice Shortcuts: teach, resolve (with wake word & particles), list, and remove', () => {
  __resetShortcutsForTests();
  const res = addShortcut('ไปออฟฟิศ', 'สภาพจราจรไปสาทรตอนนี้');
  assert.equal(res.ok, true);
  assert.equal(resolveShortcut('จาร์วิส ไปออฟฟิศครับ'), 'สภาพจราจรไปสาทรตอนนี้');
  assert.equal(resolveShortcut('ไปออฟฟิศพรุ่งนี้'), null);
  assert.equal(getShortcuts()[0].uses, 1);
  assert.equal(removeShortcut('ไปออฟฟิศ'), true);
  assert.equal(resolveShortcut('ไปออฟฟิศ'), null);
});

test('Voice Shortcuts: validates input and rejects bad definitions', () => {
  __resetShortcutsForTests();
  assert.equal(addShortcut('a', 'อะไรก็ได้').ok, false);
  assert.equal(addShortcut('ข่าว', '').ok, false);
  assert.equal(addShortcut('ข่าวเช้า', 'ข่าวเช้า').ok, false);
  assert.equal(normalizeTrigger('Jarvis  ไป ออฟฟิศ ครับ'), 'ไปออฟฟิศ');
});

test('Voice Shortcuts: parses spoken teach / remove / list sentences', () => {
  assert.deepEqual(parseShortcutDefinition('จำคำสั่ง ไปออฟฟิศ ให้หมายถึง สภาพจราจรไปสาทรตอนนี้'), {
    trigger: 'ไปออฟฟิศ',
    command: 'สภาพจราจรไปสาทรตอนนี้',
  });
  assert.deepEqual(parseShortcutDefinition('ถ้าผมพูดว่า ข่าวเช้า ให้ สรุปข่าวสำคัญวันนี้'), {
    trigger: 'ข่าวเช้า',
    command: 'สรุปข่าวสำคัญวันนี้',
  });
  assert.equal(parseShortcutDefinition('สภาพอากาศวันนี้'), null);
  assert.equal(parseShortcutRemoval('ลบคำสั่งลัด ไปออฟฟิศ'), 'ไปออฟฟิศ');
  assert.equal(isListShortcutsCommand('ดูคำสั่งลัดทั้งหมด'), true);
});
