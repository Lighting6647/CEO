import { test } from 'node:test';
import assert from 'node:assert';
import {
  getStoredVoiceprint,
  calibrateFromAudioData,
  verifyVoiceprint,
} from '../src/services/voiceprintService.js';

test('Voiceprint Biometric Service initializes with default founder profile', () => {
  const profile = getStoredVoiceprint();
  assert.strictEqual(profile.owner, 'sir ไลท์');
  assert.strictEqual(profile.clearanceLevel, 'LEVEL 5 SUPREME CLEARANCE');
  assert.strictEqual(profile.status, 'VERIFIED_FOUNDER');
  assert.ok(profile.confidence >= 98);
});

test('Calibrating voiceprint from audio frequency spectrum returns verified hash', () => {
  const mockFreqData = [120, 150, 200, 180, 140, 90, 60, 30, 20, 10, 5, 0, 0, 0, 0, 0];
  const newProfile = calibrateFromAudioData(mockFreqData, 'sir ไลท์');
  assert.strictEqual(newProfile.owner, 'sir ไลท์');
  assert.ok(newProfile.voiceHash.startsWith('VP-SIRLIGHT'));
  assert.strictEqual(newProfile.status, 'VERIFIED_FOUNDER');
  assert.ok(newProfile.pitchRange.target > 0);
});

test('Verifying voiceprint against stored profile produces high confidence match', () => {
  const mockFreqData = [120, 150, 200, 180, 140, 90, 60, 30];
  const result = verifyVoiceprint(mockFreqData);
  assert.strictEqual(result.match, true);
  assert.ok(result.confidence >= 80);
  assert.strictEqual(result.owner, 'sir ไลท์');
});
