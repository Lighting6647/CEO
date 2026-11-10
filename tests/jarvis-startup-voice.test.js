import test from 'node:test';
import assert from 'node:assert/strict';
import { JARVIS_MALE_VOICES } from '../src/data/jarvisVoices.js';

test('J.A.R.V.I.S. Voice: Movie Startup Original profile is primary default', () => {
  const primary = JARVIS_MALE_VOICES[0];
  assert.equal(primary.id, 'jarvis_startup_original');
  assert.equal(primary.pitch, 0.86, 'Pitch must be deep baritone (0.86)');
  assert.equal(primary.defaultRate, 0.94, 'Pacing must be calm and dignified (0.94x)');
  assert.ok(primary.desc.includes('JARVIS Startup'), 'Must be based on JARVIS Startup reference clip');
  assert.ok(primary.previewPhrase.includes('กำลังเริ่มต้นระบบ'), 'Must contain iconic startup phrase in Thai');
});

test('J.A.R.V.I.S. Voice: all male voice presets are valid with distinct pitch and rate', () => {
  assert.equal(JARVIS_MALE_VOICES.length, 5);
  for (const v of JARVIS_MALE_VOICES) {
    assert.ok(v.id);
    assert.ok(v.name);
    assert.ok(v.pitch >= 0.75 && v.pitch <= 1.15, `Pitch out of range: ${v.pitch}`);
    assert.ok(v.defaultRate >= 0.85 && v.defaultRate <= 1.35, `Rate out of range: ${v.defaultRate}`);
    assert.ok(v.previewPhrase.length > 10);
  }
});
