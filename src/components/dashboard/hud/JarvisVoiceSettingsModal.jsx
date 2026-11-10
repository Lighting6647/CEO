import { useState } from 'react';
import { Volume2, Play, Check, X, Sliders, Music, Sparkles, Mic } from 'lucide-react';
import { playClickSound, playSciFiBeep } from '../../../utils/soundEffects';
import { JARVIS_MALE_VOICES } from '../../../data/jarvisVoices';

export function JarvisVoiceSettingsModal({
  isOpen,
  onClose,
  selectedVoiceId,
  onSelectVoice,
  voiceSpeed,
  onSelectSpeed,
  customPitch = 0.98,
  onSelectPitch,
  ambientEnabled,
  onToggleAmbient,
  onPreviewVoice,
  micGain = 2.0,
  onSelectMicGain,
}) {
  const [testingId, setTestingId] = useState(null);

  if (!isOpen) return null;

  const handleTest = (voice) => {
    playSciFiBeep();
    setTestingId(voice.id);
    if (onPreviewVoice) {
      onPreviewVoice(voice);
    }
    setTimeout(() => setTestingId(null), 3000);
  };

  const speedOptions = [
    { val: 0.90, label: '0.90x ไอรอนแมน (สุขุม นิ่ง)' },
    { val: 0.94, label: '0.94x JARVIS Startup (แนะนำ)' },
    { val: 1.00, label: '1.00x มาตรฐานผ่อนคลาย' },
    { val: 1.12, label: '1.12x สุภาพ คล่องแคล่ว' },
    { val: 1.25, label: '1.25x ฉับไว ทันใจ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-mono font-bold tracking-wider text-cyan-200">
              J.A.R.V.I.S. ACOUSTIC ENGINE // 5 MALE VOICES & SPEED
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
          {/* Section 1: Voice Persona Selection */}
          <div>
            <div className="text-xs font-mono font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              เลือกเสียงภาษาไทยผู้ชาย (5 สไตล์บุคลิกภาพ):
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {JARVIS_MALE_VOICES.map((voice) => {
                const isSelected = selectedVoiceId === voice.id;
                return (
                  <div
                    key={voice.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{voice.name}</span>
                          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                            {voice.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{voice.desc}</p>
                        <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-slate-500">
                          <span className="text-purple-400">{voice.dspBadge}</span>
                          <span>•</span>
                          <span>Pitch พื้นฐาน: {voice.pitch}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Play Sample */}
                        <button
                          type="button"
                          onClick={() => handleTest(voice)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer shadow-sm hover:scale-105"
                          title="ฟังตัวอย่างเสียงพูด"
                        >
                          <Play className={`w-3 h-3 text-cyan-400 ${testingId === voice.id ? 'animate-spin' : ''}`} />
                          <span>ฟังตัวอย่าง</span>
                        </button>

                        {/* Select Voice */}
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onSelectVoice(voice.id);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-sm ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 border border-cyan-400'
                              : 'bg-slate-800 border border-slate-700 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-500/60'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>กำลังใช้งาน</span>
                            </>
                          ) : (
                            <span>เลือกเสียงนี้</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Custom Pitch Slider (ความทุ้ม - แหลม) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                ระดับความทุ้ม - แหลม (Custom Pitch Slider):
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {customPitch.toFixed(2)}{' '}
                {customPitch <= 0.72
                  ? '(ทุ้มต่ำลึก)'
                  : customPitch <= 0.88
                  ? '(ทุ้มนุ่ม Paul Bettany)'
                  : customPitch <= 1.05
                  ? '(ธรรมชาติ)'
                  : '(แหลมเฉียบคม)'}
              </span>
            </div>

            {/* Range Input Slider */}
            <div className="px-1 py-1">
              <input
                type="range"
                min="0.55"
                max="1.35"
                step="0.02"
                value={customPitch}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onSelectPitch(val);
                }}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0.55 (Sub-Bass ทุ้มต่ำพิเศษ)</span>
                <span>0.80 (Paul Bettany)</span>
                <span>1.00 (ปกติ)</span>
                <span>1.35 (แหลมสูง)</span>
              </div>
            </div>

            {/* Quick Pitch Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              {[
                { label: 'ทุ้มต่ำลึก (0.65)', pitch: 0.65 },
                { label: 'Paul Bettany (0.80)', pitch: 0.80 },
                { label: 'Executive (0.92)', pitch: 0.92 },
                { label: 'แหลมเฉียบ (1.15)', pitch: 1.15 },
              ].map((preset) => (
                <button
                  key={preset.pitch}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onSelectPitch(preset.pitch);
                  }}
                  className={`py-1 px-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer text-center ${
                    Math.abs(customPitch - preset.pitch) < 0.03
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Speech Speed Control */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                ความเร็วการพูด (News & Dialogue Speed):
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">{voiceSpeed}x</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {speedOptions.map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onSelectSpeed(opt.val);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer text-center ${
                    voiceSpeed === opt.val
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Microphone Sensitivity & Gain Booster (for Quiet Mics) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                ความไวและการขยายสัญญาณไมโครโฟน (Microphone Sensitivity & Gain Boost):
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">{micGain}x ({Math.round(micGain * 100)}%)</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              สำหรับอุปกรณ์หรือไมโครโฟนที่มีเสียงเบา ระบบจะเร่งสัญญาณเสียง (Gain Pre-amp) และเปิด Auto-Gain ให้โดยอัตโนมัติ
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 1.0, label: '1.0x (ปกติ)' },
                { val: 1.5, label: '1.5x (ไวขึ้น)' },
                { val: 2.0, label: '2.0x (บูสต์ 2 เท่า)' },
                { val: 3.0, label: '3.0x (ไมค์เบามาก)' },
                { val: 4.0, label: '4.0x (บูสต์สูงสุด)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    if (onSelectMicGain) onSelectMicGain(opt.val);
                  }}
                  className={`py-1.5 px-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer text-center ${
                    Math.abs(micGain - opt.val) < 0.1
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Ambient Sci-Fi Soundscape (Tony Stark Lab Drone) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <Music className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  Tony Stark Lab Ambient Soundscape (บรรยากาศห้องแล็บ)
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  เสียงสังเคราะห์ 55Hz คลอเบา ๆ ปรับลดเสียงลงอัตโนมัติ (Auto-ducking) เมื่อ sir ไลท์ เริ่มพูด
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                onToggleAmbient();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                ambientEnabled
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
              }`}
            >
              {ambientEnabled ? 'ON // เปิดใช้งาน' : 'OFF // ปิดเสียง'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-cyan-500/30 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-lg hover:scale-105"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
}
