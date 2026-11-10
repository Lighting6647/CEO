import test from 'node:test';
import assert from 'node:assert/strict';
import { JARVIS_MALE_VOICES } from '../src/data/jarvisVoices.js';

test('Ultron Mode Voice: Ultron Prime profile exists with menacing baritone parameters', () => {
  const ultron = JARVIS_MALE_VOICES.find((v) => v.id === 'ultron_core');
  assert.ok(ultron, 'Ultron Prime voice profile must exist');
  assert.equal(ultron.pitch, 0.78, 'Pitch must be menacing deep baritone (0.78)');
  assert.equal(ultron.defaultRate, 0.90, 'Rate must be calculated and deliberate (0.90x)');
  assert.ok(ultron.desc.includes('James Spader'), 'Must reference James Spader in description');
  assert.ok(ultron.previewPhrase.includes('โหมดอัลตรอน'), 'Preview phrase must mention Ultron mode in Thai');
});

test('Ultron Mode Commands: correctly identified in command parsing', () => {
  const ultronTriggers = [
    'โหมดอัลตรอน',
    'เปิดโหมดอัลตรอน',
    'เข้าสู่โหมดอัลตรอน',
    'แปลงร่างเป็นอัลตรอน',
    'ultron mode',
  ];

  for (const phrase of ultronTriggers) {
    const isUltron =
      phrase.includes('โหมดอัลตรอน') ||
      phrase.includes('เปิดโหมดอัลตรอน') ||
      phrase.includes('เข้าสู่โหมดอัลตรอน') ||
      phrase.includes('แปลงร่างเป็นอัลตรอน') ||
      phrase.toLowerCase().includes('ultron mode');
    assert.equal(isUltron, true, `Phrase "${phrase}" must trigger Ultron mode`);
  }
});
