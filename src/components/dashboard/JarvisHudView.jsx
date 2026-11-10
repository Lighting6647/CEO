import { useState, useEffect, useRef, useCallback } from 'react';
import {
  playClickSound,
  playSuccessSound,
  playSciFiBeep,
  playAlertSound,
  playJarvisStartupSound,
  playUltronTransformSound,
  attachJarvisVoiceDSP,
  startArcReactorHum,
  stopArcReactorHum,
  duckLabAmbience,
} from '../../utils/soundEffects';
import { processJarvisCommand, USER_TITLE, setUserTitle } from '../../utils/jarvisBrain';
import { askGemini } from '../../services/geminiService';
import { StarkWorkshopView } from './hud/StarkWorkshopView';
import { JarvisVoiceSettingsModal } from './hud/JarvisVoiceSettingsModal';
import { VoiceShortcutsModal } from './hud/VoiceShortcutsModal';
import { ReaInspectorModal } from './hud/ReaInspectorModal';
import { JARVIS_MALE_VOICES } from '../../data/jarvisVoices';
import { getStoredVoiceprint, calibrateFromAudioData } from '../../services/voiceprintService';
import { addMemory } from '../../services/mem0Service';
import { analyzeTargetWebapp, formatSpeechSummary } from '../../services/reaAuditService';
import {
  resolveShortcut,
  addShortcut,
  removeShortcut,
  getShortcuts,
  parseShortcutDefinition,
  parseShortcutRemoval,
  isListShortcutsCommand,
} from '../../services/voiceShortcutService';
import {
  openSystemBrowser,
  extractWebTarget,
  isBrowserOpenCommand,
  detectWorkModePreset,
  launchWorkModePreset,
  isSplitScreenWebCommand,
  parseWebNavigationVoiceCommand,
  isWebReaderModeCommand,
  isDualPaneWebCommand,
  parseDualPaneTargets,
  dispatchWebNavigation,
} from '../../services/browserLauncherService';
import { SplitScreenWebHud } from './hud/SplitScreenWebHud';
import {
  applyNoiseGate,
  DEFAULT_NOISE_FLOOR,
  calculateOptimalNoiseFloor,
  isNoiseScanCommand,
} from '../../utils/noiseGateProcessor';
import {
  isDailyRoutineCommand,
  buildDailyRoutinePlan,
  getRoutineSchedule,
  evaluateRoutineScheduleTrigger,
  markRoutineRunDate,
} from '../../services/routineAutomationService';
import { dispatchExecutiveBriefing } from '../../services/webhookDeliveryService';
import {
  resolveFavoriteSite,
  resolveFavoriteRoute,
  recordFavoriteSite,
  recordFavoriteRoute,
  isFavoriteSiteCommand,
  isFavoriteRouteCommand,
} from '../../services/favoriteSitesService';
import { extractDestination, buildDirectionsUrl } from '../../utils/routeIntel';
import {
  isExternalSearchQuery,
  searchExternalWeb,
  parseMediaVoiceCommand,
  isAutoSummaryCommand,
  generateAutoSummaryReader,
  isWebTranslateCommand,
  isWebSnapshotCommand,
  recordWebSnapshotToMem0,
  isSmartFormAutoFillCommand,
  getExecutiveFormProfile,
} from '../../services/externalWebService';

export function JarvisHudView({
  onRunAudit,
  onOpenQuotation,
  _onOpenDoctor,
  _onOpenDesignSystem,
  onOpenPersona,
  onSelectBrandTheme,
  onShowToast,
  onOpenAdmin,
  onOpenCompany,
}) {
  const [userTitle, setUserTitleState] = useState(USER_TITLE);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'JARVIS',
      time: '03:25:18 AM',
      text: `สวัสดีครับ ${USER_TITLE} มีอะไรให้ผม ช่วยจัดการ หรือค้นหา ข้อมูลไหมครับ?`,
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled] = useState(true);
  const [hudState, setHudState] = useState('READY'); // 'READY' | 'LISTENING' | 'SEARCHING' | 'SPEAKING'
  const [currentTime, setCurrentTime] = useState('');
  const [activeHologram, setActiveHologram] = useState(null);
  const [activeSquadId, setActiveSquadId] = useState(null);
  const [wakeWordActive, setWakeWordActive] = useState(true); // Always-on Hands-free "javis" / "จาร์วิส"
  const [continuousVoice, setContinuousVoice] = useState(true); // Continuous Auto-Listen Loop
  const [isRedAlert, setIsRedAlert] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // Real-time 0.0 - 1.0 voice amplitude
  const [processState, setProcessState] = useState({
    active: false,
    percent: 0,
    label: '',
    workpiece: 'neural',
  });
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => {
    try {
      return localStorage.getItem('jarvis_male_voice_id') || 'jarvis_startup_original';
    } catch {
      return 'jarvis_startup_original';
    }
  });
  const [voiceSpeed, setVoiceSpeed] = useState(() => {
    try {
      const stored = parseFloat(localStorage.getItem('jarvis_voice_speed') || '0.94');
      return isNaN(stored) ? 0.94 : stored;
    } catch {
      return 0.94;
    }
  });
  const [customPitch, setCustomPitch] = useState(() => {
    try {
      const stored = parseFloat(localStorage.getItem('jarvis_custom_pitch') || '0.86');
      return isNaN(stored) ? 0.86 : stored;
    } catch {
      return 0.86;
    }
  });
  const [ambientEnabled, setAmbientEnabled] = useState(() => {
    try {
      return localStorage.getItem('jarvis_ambient_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isReaModalOpen, setIsReaModalOpen] = useState(false);
  const [reaInitialTarget, setReaInitialTarget] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [_voiceprint, setVoiceprint] = useState(getStoredVoiceprint);

  // Feature 1: Split-Screen Web HUD (Embedded PiP & Dual Browser)
  const [splitScreenUrl, setSplitScreenUrl] = useState('');
  const [splitScreenTitle, setSplitScreenTitle] = useState('');
  const [splitScreenSecondaryUrl, setSplitScreenSecondaryUrl] = useState('');
  const [splitScreenSecondaryTitle, setSplitScreenSecondaryTitle] = useState('');
  const [isDualPaneActive, setIsDualPaneActive] = useState(false);
  const [isSplitScreenOpen, setIsSplitScreenOpen] = useState(false);

  // Audio Context & Hardware Refs (Declared first to avoid TDZ reference errors)
  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const lastDispatchedRef = useRef({ text: '', time: 0 });
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);
  const isConversationActiveRef = useRef(false);
  const conversationTimerRef = useRef(null);
  const speechSafetyTimerRef = useRef(null);
  const startRecognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Microphone Sensitivity & Hardware/DSP Gain Booster (1.0x - 6.0x) for Quiet Microphones
  const [micGain, setMicGain] = useState(() => {
    try {
      const val = parseFloat(localStorage.getItem('jarvis_mic_gain') || '3.0');
      return isNaN(val) ? 3.0 : val;
    } catch {
      return 3.0;
    }
  });
  const micGainRef = useRef(micGain);

  useEffect(() => {
    micGainRef.current = micGain;
  }, [micGain]);

  const handleSetMicGain = useCallback((newGain) => {
    const clamped = Math.max(0.5, Math.min(6.0, newGain));
    setMicGain(clamped);
    micGainRef.current = clamped;
    try {
      localStorage.setItem('jarvis_mic_gain', String(clamped));
    } catch {}
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(clamped, audioContextRef.current.currentTime);
    }
  }, []);

  const handleCycleMicGain = useCallback(() => {
    playClickSound();
    const options = [1.0, 2.0, 3.0, 4.5, 6.0];
    const curIdx = options.findIndex((opt) => Math.abs(opt - micGain) < 0.1);
    const nextIdx = (curIdx + 1) % options.length;
    const nextVal = options[nextIdx] || 3.0;
    handleSetMicGain(nextVal);
  }, [micGain, handleSetMicGain]);

  // Acoustic Noise-Gate Suppression (Fan & Air Conditioner Drone Filter)
  const [noiseGateEnabled, setNoiseGateEnabled] = useState(() => {
    try {
      return localStorage.getItem('jarvis_noise_gate_enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [noiseFloor, setNoiseFloor] = useState(() => {
    try {
      const val = parseFloat(localStorage.getItem('jarvis_noise_floor') || String(DEFAULT_NOISE_FLOOR));
      return isNaN(val) ? DEFAULT_NOISE_FLOOR : val;
    } catch {
      return DEFAULT_NOISE_FLOOR;
    }
  });
  const noiseGateEnabledRef = useRef(noiseGateEnabled);
  const noiseFloorRef = useRef(noiseFloor);
  const [isCalibratingNoise, setIsCalibratingNoise] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // Hologram 3D Scale & Rotation Gestures
  const [hologramScale, setHologramScale] = useState(1.0);
  const [hologramSpinTrigger, setHologramSpinTrigger] = useState(0);

  const handleZoomIn = useCallback(() => {
    playClickSound();
    setHologramScale((s) => Math.min(1.85, Number((s + 0.25).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    playClickSound();
    setHologramScale((s) => Math.max(0.65, Number((s - 0.25).toFixed(2))));
  }, []);

  const handleResetZoom = useCallback(() => {
    playClickSound();
    setHologramScale(1.0);
  }, []);

  const handleRotateHologram = useCallback(() => {
    playClickSound();
    setHologramSpinTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    noiseGateEnabledRef.current = noiseGateEnabled;
  }, [noiseGateEnabled]);

  useEffect(() => {
    noiseFloorRef.current = noiseFloor;
  }, [noiseFloor]);

  const handleToggleNoiseGate = useCallback(() => {
    playClickSound();
    setNoiseGateEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jarvis_noise_gate_enabled', String(next));
      } catch {}
      if (onShowToast) {
        onShowToast('info', 'Noise-Gate Filter', next ? '🟢 เปิดระบบตัดเสียงพัดลม/แอร์อัตโนมัติ (85Hz Gate)' : '⚪ ปิดระบบ Noise-Gate');
      }
      return next;
    });
  }, [onShowToast]);

  // Panoramic Map & Viewport Controls
  const [isMapPanoramic, setIsMapPanoramic] = useState(false);
  const handleTogglePanoramic = useCallback(() => {
    playClickSound();
    setIsMapPanoramic((prev) => !prev);
  }, []);

  // Mem0 Persistent Memory Context Pinning
  const handlePinMemory = useCallback((query, reply) => {
    playClickSound();
    const cleanQ = (query || '').trim();
    const cleanR = (reply || '').trim();
    if (!cleanQ && !cleanR) return false;
    const summary = `[ปักหมุดโดย ${userTitle}] คำถาม: "${cleanQ}" | สรุป: ${cleanR.replace(/\s+/g, ' ').slice(0, 180)}`;
    const added = addMemory(summary, 'pinned_context');
    if (added) {
      playSuccessSound();
      if (onShowToast) {
        onShowToast('📌 ปักหมุดประเด็นนี้ลง Mem0 เรียบร้อย! J.A.R.V.I.S. จะใช้อ้างอิงอัตโนมัติ');
      }
      return true;
    }
    return false;
  }, [userTitle, onShowToast]);

  // Live Microphone Audio Level Meter & Gain Booster (Web Audio API AnalyserNode + GainNode)
  useEffect(() => {
    let isCancelled = false;

    const initMicAnalyser = async () => {
      try {
        if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            autoGainControl: true, // Hardware and OS automatic gain compensation
            echoCancellation: true,
            noiseSuppression: true,
          },
          video: false,
        });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);

        // Acoustic 85Hz Highpass Filter to cut motor / fan rumble & air conditioner hum
        const highpass = audioCtx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 85;
        highpass.Q.value = 0.7;

        // Pre-amplification GainNode for low-sensitivity microphones
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = micGainRef.current;
        gainNodeRef.current = gainNode;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.5;

        // DSP Pipeline: Source -> Highpass (85Hz) -> Pre-Gain -> Analyser
        source.connect(highpass);
        highpass.connect(gainNode);
        gainNode.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          if (isCancelled) return;
          if (analyserRef.current && !isSpeakingRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = avg / 255.0;

            if (noiseGateEnabledRef.current) {
              const gated = applyNoiseGate(normalized, noiseFloorRef.current);
              if (gated <= 0.001) {
                // AC/Fan hum silenced: decay level smoothly to zero
                setAudioLevel((prev) => prev * 0.35);
              } else {
                const boosted = Math.min(1.0, Math.pow((gated * micGainRef.current) * 3.0, 0.82));
                setAudioLevel((prev) => prev * 0.25 + boosted * 0.75);
              }
            } else {
              const boostedAvg = avg * micGainRef.current;
              const legacyNorm = Math.min(1.0, Math.pow(boostedAvg / 45, 0.82));
              setAudioLevel((prev) => prev * 0.25 + legacyNorm * 0.75);
            }
          }
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };

        animFrameRef.current = requestAnimationFrame(updateMeter);
      } catch (err) {
        console.warn('[Audio Meter]:', err.message);
      }
    };

    initMicAnalyser();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, []);

  // When J.A.R.V.I.S. is speaking, drive audioLevel from speech rhythm
  useEffect(() => {
    if (!isSpeaking) return;
    let frameId;
    const pulseSpeaking = () => {
      const t = Date.now() * 0.008;
      const simulated = 0.4 + 0.35 * Math.sin(t) + 0.15 * Math.sin(t * 2.3);
      setAudioLevel(Math.max(0.1, Math.min(1.0, simulated)));
      frameId = requestAnimationFrame(pulseSpeaking);
    };
    frameId = requestAnimationFrame(pulseSpeaking);
    return () => cancelAnimationFrame(frameId);
  }, [isSpeaking]);

  // Ambient Soundscape Management (Tony Stark Malibu Lab Soundscape)
  const toggleAmbient = useCallback(() => {
    playClickSound();
    setAmbientEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jarvis_ambient_enabled', String(next));
      } catch {}
      if (next) {
        startArcReactorHum();
      } else {
        stopArcReactorHum();
      }
      return next;
    });
  }, []);

  // Intelligent Auto-Ducking: Soften lab ambient soundscape while speaking or listening
  useEffect(() => {
    if (!ambientEnabled) return;
    const shouldDuck = isSpeaking || isListening || audioLevel > 0.08;
    duckLabAmbience(shouldDuck);
  }, [ambientEnabled, isSpeaking, isListening, audioLevel]);

  // Helper to keep natural conversation open for 60s without repeating wake words
  const resetConversationSession = useCallback((durationMs = 60000) => {
    isConversationActiveRef.current = true;
    if (conversationTimerRef.current) {
      clearTimeout(conversationTimerRef.current);
    }
    conversationTimerRef.current = setTimeout(() => {
      isConversationActiveRef.current = false;
    }, durationMs);
  }, []);

  const stopConversationSession = useCallback(() => {
    isConversationActiveRef.current = false;
    if (conversationTimerRef.current) {
      clearTimeout(conversationTimerRef.current);
      conversationTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  // Live Clock Telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // High-Performance Natural Human Thai Speech Synthesis (Primary Web Speech API + Phonetic Tuning + Audio Fallback)
  const speakThai = useCallback(
    (text) => {
      if (!voiceEnabled || !text || !text.trim()) return;

      stopRecognition();

      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
        } catch {}
      }

      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setHudState('SPEAKING');

      let isFinished = false;
      const handleSpeechDone = () => {
        if (isFinished) return;
        isFinished = true;
        if (speechSafetyTimerRef.current) {
          clearTimeout(speechSafetyTimerRef.current);
          speechSafetyTimerRef.current = null;
        }
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setHudState('READY');
        if (continuousVoice || isConversationActiveRef.current || wakeWordActive) {
          setTimeout(() => {
            if (startRecognitionRef.current) {
              startRecognitionRef.current();
            }
          }, 250);
        }
      };

      // Phonetic Pronunciation Tuning for Natural Human Cadence
      const naturalSpeech = text
        .replace(/[*#•_`~[\]\\/]/g, ' ')
        .replace(/\bsir\s*ไลท์\b/gi, 'เซอร์ไลท์')
        .replace(/\bsirlike\b/gi, 'เซอร์ไลท์')
        .replace(/\bsir\s*like\b/gi, 'เซอร์ไลท์')
        .replace(/\bJ\.?A\.?R\.?V\.?I\.?S\.?\b/gi, 'จาร์วิส')
        .replace(/\bAI\b/g, 'เอไอ')
        .replace(/\bAPI\b/g, 'เอพีไอ')
        .replace(/\bUI\b/g, 'ยูไอ')
        .replace(/\bUX\b/g, 'ยูเอ็กซ์')
        .replace(/\bMRR\b/g, 'เอ็มอาร์อาร์')
        .replace(/\bGitHub\b/gi, 'กิตฮับ')
        .replace(/\bVite\b/gi, 'ไวท์')
        .replace(/\bNode\.?js\b/gi, 'โหนด เจเอส')
        .replace(/\s+/g, ' ')
        .trim();

      const voicePersona =
        JARVIS_MALE_VOICES.find((v) => v.id === selectedVoiceId) || JARVIS_MALE_VOICES[0];

      // Authentic Movie Startup Pacing (0.92x - 0.96x) & Deep Baritone Pitch (0.84 - 0.88)
      const effectiveRate = voiceSpeed || voicePersona.defaultRate || 0.94;
      const effectivePitch = customPitch || voicePersona.pitch || 0.86;

      // Chrome Speech Synthesis Watchdog Timer: prevents hung SpeechSynthesis on Windows
      speechSafetyTimerRef.current = setTimeout(() => {
        handleSpeechDone();
      }, Math.max(4000, naturalSpeech.length * 110));

      const fallbackAudioTts = () => {
        try {
          const encoded = encodeURIComponent(naturalSpeech.slice(0, 200));
          const proxyUrl = `/api/tts?text=${encoded}`;
          const proxyAudio = new Audio(proxyUrl);
          proxyAudio.crossOrigin = 'anonymous';
          proxyAudio.playbackRate = effectiveRate;
          audioPlayerRef.current = proxyAudio;
          proxyAudio.onended = handleSpeechDone;
          proxyAudio.onerror = () => {
            const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;
            const directAudio = new Audio(directUrl);
            directAudio.crossOrigin = 'anonymous';
            directAudio.playbackRate = effectiveRate;
            audioPlayerRef.current = directAudio;
            directAudio.onended = handleSpeechDone;
            directAudio.onerror = handleSpeechDone;
            attachJarvisVoiceDSP(directAudio);
            directAudio.play().catch(handleSpeechDone);
          };
          attachJarvisVoiceDSP(proxyAudio);
          proxyAudio.play().catch(handleSpeechDone);
        } catch {
          handleSpeechDone();
        }
      };

      // 1. PRIMARY ENGINE: Web Speech API (with Thai Voice Detection)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const availVoices = window.speechSynthesis.getVoices() || [];
          const thaiVoice =
            availVoices.find(
              (v) =>
                (v.lang === 'th-TH' || v.lang.toLowerCase().startsWith('th')) &&
                (v.name.toLowerCase().includes('niwat') ||
                  v.name.toLowerCase().includes('male') ||
                  v.name.includes('ผู้ชาย'))
            ) ||
            availVoices.find(
              (v) =>
                v.lang === 'th-TH' ||
                v.lang.toLowerCase().startsWith('th') ||
                v.name.toLowerCase().includes('thai') ||
                v.name.includes('ภาษาไทย')
            );

          // If machine has NO Thai voice installed, IMMEDIATELY fallback to Audio TTS
          if (availVoices.length > 0 && !thaiVoice) {
            fallbackAudioTts();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(naturalSpeech);
          if (thaiVoice) {
            utterance.voice = thaiVoice;
            utterance.lang = 'th-TH';
          }
          utterance.pitch = effectivePitch;
          utterance.rate = effectiveRate;
          utterance.onend = handleSpeechDone;
          utterance.onerror = (e) => {
            console.warn('[WebSpeech Error, switching to audio fallback]:', e);
            fallbackAudioTts();
          };

          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
          window.speechSynthesis.speak(utterance);
          return;
        } catch (err) {
          console.warn('[Web Speech API Exception]:', err);
          fallbackAudioTts();
        }
      } else {
        fallbackAudioTts();
      }
    },
    [voiceEnabled, wakeWordActive, continuousVoice, selectedVoiceId, voiceSpeed, customPitch, stopRecognition]
  );

  // Feature: Morning Routine Schedule Watchdog (08:00 AM Auto-Briefing for sir ไลท์)
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      if (evaluateRoutineScheduleTrigger(now)) {
        markRoutineRunDate(now);
        const sched = getRoutineSchedule();
        if (sched.autoPlayVideo) {
          setActiveHologram({
            type: 'video_briefing',
            title: '30-SEC DAILY VIDEO BRIEFING // MORNING ROUTINE',
            category: 'EXECUTIVE ROUTINE AUTOMATION',
            badge: 'SCHEDULED 08:00',
            query: 'กำหนดการประจำวัน 08:00',
            reply: `อรุณสวัสดิ์ครับ ${userTitle}! ถึงเวลาตามกำหนดการ 08:00 น. ระบบเปิดเล่นวิดีโอบรีฟฟิ่ง 30 วินาทีประจำวันและซิงค์ข้อมูลให้เรียบร้อยครับ`,
            speech: `อรุณสวัสดิ์ครับ ${userTitle} ถึงเวลาแปดโมงเช้าแล้วครับ ผมเปิดวิดีโอบรีฟฟิ่งประจำวันสามสิบวินาทีและเตรียมพร้อมทำงานสำหรับวันนี้เรียบร้อยครับ`,
            time: now.toLocaleTimeString('th-TH'),
          });
        }
        if (sched.autoSpeak) {
          speakThai(`อรุณสวัสดิ์ครับ ${userTitle} ถึงเวลาแปดโมงเช้าแล้วครับ ผมเปิดวิดีโอบรีฟฟิ่งประจำวันสามสิบวินาทีและเตรียมพร้อมทำงานสำหรับวันนี้เรียบร้อยครับ`);
        }
        if (sched.autoSendWebhook) {
          dispatchExecutiveBriefing({ forceMock: true }).catch(() => {});
        }
      }
    };
    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [speakThai, userTitle]);

  // Feature 1: Auto Noise-Gate Calibration (3-Second Room Noise Scan)
  const handleCalibrateRoomNoise = useCallback(() => {
    if (isCalibratingNoise) return;
    playClickSound();
    playSciFiBeep();
    setIsCalibratingNoise(true);
    setCalibrationProgress(10);

    const samples = [];
    const startTime = Date.now();
    const duration = 3000;

    const sampleInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(95, Math.round((elapsed / duration) * 100));
      setCalibrationProgress(progress);

      if (analyserRef.current) {
        try {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const rawAvg = sum / data.length;
          samples.push(rawAvg / 255.0);
        } catch {}
      }
    }, 60);

    setTimeout(() => {
      clearInterval(sampleInterval);
      const res = calculateOptimalNoiseFloor(samples);
      setNoiseFloor(res.optimalThreshold);
      noiseFloorRef.current = res.optimalThreshold;
      try {
        localStorage.setItem('jarvis_noise_floor', String(res.optimalThreshold));
      } catch {}

      setIsCalibratingNoise(false);
      setCalibrationProgress(100);
      playSuccessSound();

      if (onShowToast) {
        onShowToast('success', 'Noise-Gate Calibrated', `🎯 ตั้งค่าเกณฑ์ตัดเสียง: ${res.optimalThreshold} RMS (สภาพห้อง: ${res.roomCondition})`);
      }

      speakThai(`สแกนสภาพเสียงห้อง 3 วินาทีเรียบร้อยครับ ${userTitle} วัดระดับเสียงแอร์เฉลี่ย ${res.avgNoise} ปรับเกณฑ์ตัดเสียงรบกวนอัตโนมัติเป็น ${res.optimalThreshold} พร้อมใช้งานครับ`);
    }, duration);
  }, [isCalibratingNoise, onShowToast, speakThai, userTitle]);

  // Voice Selection Handler (Updates State, Pitch, Rate, and LocalStorage)
  const handleSelectVoice = useCallback(
    (voiceId) => {
      setSelectedVoiceId(voiceId);
      try {
        localStorage.setItem('jarvis_male_voice_id', voiceId);
      } catch {}
      const v = JARVIS_MALE_VOICES.find((item) => item.id === voiceId);
      if (v) {
        if (v.pitch) {
          setCustomPitch(v.pitch);
          try {
            localStorage.setItem('jarvis_custom_pitch', String(v.pitch));
          } catch {}
        }
        if (v.defaultRate) {
          setVoiceSpeed(v.defaultRate);
          try {
            localStorage.setItem('jarvis_voice_speed', String(v.defaultRate));
          } catch {}
        }
        speakThai(`เปลี่ยนโทนเสียงเป็น ${v.name} เรียบร้อยครับ ${userTitle}`);
      }
    },
    [speakThai, userTitle]
  );

  // Core Command Dispatcher & Multi-Agent Coordinator
  const handleDispatchCommand = useCallback(
    (text) => {
      const raw = (text || '').trim();
      if (!raw || raw.length < 2) return;

      const now = Date.now();
      if (raw === lastDispatchedRef.current.text && now - lastDispatchedRef.current.time < 3500) {
        return;
      }
      lastDispatchedRef.current = { text: raw, time: now };

      // Voice Command Shortcut Memory: expand personal short phrases into full commands
      const expandedShortcut = resolveShortcut(raw);
      const clean = expandedShortcut || raw;

      playClickSound();
      playSciFiBeep();
      const nowTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const userMsg = {
        id: Date.now(),
        sender: userTitle.toUpperCase(),
        time: nowTime,
        text: expandedShortcut ? `⚡ ${raw} → ${clean}` : clean,
      };

      setMessages((prev) => [...prev, userMsg]);
      setHudState('SEARCHING');

      let targetWorkpiece = 'neural';
      let stepLabel1 = 'ACOUSTIC ANALYSIS // วิเคราะห์คำสั่งเสียง...';
      let stepLabel2 = 'COGNITIVE REASONING // ประมวลผลคำสั่งบริบท...';

      if (parseShortcutDefinition(clean) || parseShortcutRemoval(clean) || isListShortcutsCommand(clean)) {
        stepLabel1 = 'SHORTCUT MEMORY // กำลังอ่านคำสั่งลัดส่วนตัว...';
        stepLabel2 = 'SHORTCUT MEMORY // บันทึกลงหน่วยความจำ ' + userTitle + '...';
      } else if (clean.includes('ข่าว')) {
        targetWorkpiece = 'news';
        stepLabel1 = 'SATELLITE DOWNLINK // กำลังเชื่อมต่อเครือข่ายข่าวกรอง...';
        stepLabel2 = 'GLOBAL AGGREGATOR // ประมวลผล 5 ประเด็นข่าวสำคัญ...';
      } else if (
        clean.includes('จราจร') ||
        clean.includes('เส้นทาง') ||
        clean.includes('ทางด่วน') ||
        clean.includes('รถติด') ||
        clean.includes('ถนน') ||
        clean.includes('นำทาง')
      ) {
        targetWorkpiece = 'traffic';
        stepLabel1 = 'GPS TELEMETRY // ดึงข้อมูลสภาพจราจรและทางด่วน...';
        stepLabel2 = 'ROUTE OPTIMIZER // คำนวณเส้นทางที่ดีที่สุดให้ ' + userTitle + '...';
      } else if (
        clean.includes('อากาศ') ||
        clean.includes('ฝน') ||
        clean.includes('pm') ||
        clean.includes('อุณหภูมิ') ||
        clean.includes('พายุ')
      ) {
        targetWorkpiece = 'weather';
        stepLabel1 = 'METEOROLOGICAL SENSORS // ตรวจวัดเซ็นเซอร์บรรยากาศ...';
        stepLabel2 = 'ATMOSPHERIC SCAN // วิเคราะห์ความกดอากาศ อุณหภูมิ และ PM2.5...';
      } else if (
        clean.includes('โค้ด') ||
        clean.includes('git') ||
        clean.includes('push') ||
        clean.includes('ตรวจระบบ')
      ) {
        targetWorkpiece = 'code';
        stepLabel1 = 'SYSTEM ARCHITECTURE // สแกนโครงสร้างโมดูลและโค้ด...';
        stepLabel2 = 'LINT & SECURITY AUDIT // ตรวจสอบสถานะการทำงาน...';
      } else if (
        clean.includes('ใบเสนอราคา') ||
        clean.includes('pos') ||
        clean.includes('หุ้น') ||
        clean.includes('เงิน')
      ) {
        targetWorkpiece = 'finance';
        stepLabel1 = 'FINANCIAL ENGINE // ประมวลผลตัวเลขและต้นทุน...';
        stepLabel2 = 'EMVCo CRYPTO // สร้างรหัสการชำระเงินพร้อมเพย์...';
      } else if (
        clean.toLowerCase().includes('rea') ||
        clean.includes('สแกนเว็บ') ||
        clean.includes('แกะรอย') ||
        clean.includes('สแกนระบบ') ||
        clean.includes('ตัวแกะรอย') ||
        clean.includes('reverse engineer')
      ) {
        targetWorkpiece = 'rea';
        stepLabel1 = 'REA NETWORK TAP // เชื่อมต่อ Target และตรวจจับ Headers...';
        stepLabel2 = 'REA DECOMPILER // ถอดรหัส DOM, สกัด State & API Surface...';
      }

      setProcessState({
        active: true,
        percent: 24,
        label: stepLabel1,
        workpiece: targetWorkpiece,
      });

      const pTimer1 = setTimeout(() => {
        setProcessState((p) => ({
          ...p,
          percent: 68,
          label: stepLabel2,
        }));
      }, 180);

      const pTimer2 = setTimeout(() => {
        setProcessState((p) => ({
          ...p,
          percent: 92,
          label: 'COGNITIVE SYNTHESIS // สรุปคำตอบพร้อมสนทนากับ ' + userTitle + '...',
        }));
      }, 380);

      setTimeout(async () => {
        let result = null;

        // Phase 3: Voice-Triggered Autonomous Git Push Handler across 18 Projects
        const isVoiceGitPush =
          (clean.includes('push') || clean.includes('อัพเดท') || clean.includes('อัพขึ้น') || clean.includes('ซิงค์')) &&
          (clean.includes('github') || clean.includes('กิต') || clean.includes('โปรเจกต์') || clean.includes('โค้ด'));

        // Check for specific UI system toggle actions
        const isExplicitSystemCommand =
          clean.includes('red alert') ||
          clean.includes('แจ้งเตือนสีแดง') ||
          clean.includes('สัญญาณเตือน') ||
          clean.includes('เปลี่ยนชื่อเรียก') ||
          clean.includes('เปลี่ยนธีม') ||
          clean.includes('เปิดใบเสนอราคา') ||
          clean.includes('ตรวจสุขภาพระบบ');

        // Voice Command Shortcut Memory management (teach / remove / list)
        const shortcutDef = parseShortcutDefinition(clean);
        const shortcutRemoval = !shortcutDef ? parseShortcutRemoval(clean) : null;
        if (shortcutDef) {
          const saved = addShortcut(shortcutDef.trigger, shortcutDef.command);
          result = saved.ok
            ? {
                action: 'SHORTCUT_SAVED',
                squadId: 'ops',
                delegatedTo: 'J.A.R.V.I.S. Shortcut Memory',
                reply: `จำไว้แล้วครับ ${userTitle}\n• คำสั่งลัด: “${saved.shortcut.trigger}”\n• สิ่งที่ผมจะทำ: “${saved.shortcut.command}”\n\nครั้งหน้าพูดแค่ “${saved.shortcut.trigger}” ได้เลยครับ`,
                speech: `จำไว้แล้วครับ ครั้งหน้าพูดแค่ ${saved.shortcut.trigger} ได้เลยครับ`,
                hologram: null,
              }
            : {
                action: 'SHORTCUT_ERROR',
                squadId: 'ops',
                delegatedTo: 'J.A.R.V.I.S. Shortcut Memory',
                reply: `บันทึกคำสั่งลัดไม่ได้ครับ ${userTitle}: ${saved.error}`,
                speech: `บันทึกคำสั่งลัดไม่ได้ครับ ${saved.error}`,
                hologram: null,
              };
        } else if (shortcutRemoval) {
          const removed = removeShortcut(shortcutRemoval);
          result = {
            action: 'SHORTCUT_REMOVED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Shortcut Memory',
            reply: removed
              ? `ลบคำสั่งลัด “${shortcutRemoval}” แล้วครับ ${userTitle}`
              : `ไม่พบคำสั่งลัด “${shortcutRemoval}” ครับ ${userTitle}`,
            speech: removed ? `ลบคำสั่งลัด ${shortcutRemoval} แล้วครับ` : `ไม่พบคำสั่งลัด ${shortcutRemoval} ครับ`,
            hologram: null,
          };
        } else if (isListShortcutsCommand(clean)) {
          const list = getShortcuts();
          result = {
            action: 'SHORTCUT_LIST',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Shortcut Memory',
            reply: list.length
              ? `คำสั่งลัดของ ${userTitle} มี ${list.length} รายการครับ\n${list.map((s) => `• “${s.trigger}” → ${s.command}`).join('\n')}`
              : `ยังไม่มีคำสั่งลัดครับ ${userTitle} ลองพูดว่า “จำคำสั่ง ไปออฟฟิศ ให้หมายถึง สภาพจราจรไปสาทรตอนนี้” ได้เลยครับ`,
            speech: list.length ? `มีคำสั่งลัด ${list.length} รายการครับ แสดงบนจอแล้วครับ` : 'ยังไม่มีคำสั่งลัดครับ',
            hologram: null,
          };
        }

        const isStartupCommand =
          clean.includes('เริ่มต้นระบบ') ||
          clean.includes('เริ่มระบบ') ||
          clean.includes('เปิดระบบ') ||
          clean.includes('สตาร์ทระบบ') ||
          clean.includes('รีเซ็ตเสียง') ||
          clean.includes('เสียงต้นฉบับ') ||
          clean.toLowerCase().includes('startup') ||
          clean.toLowerCase().includes('boot system');

        // 5 Distinct Thai Male Voice Selection Commands
        const isVoice1 =
          clean.includes('เสียง 1') ||
          clean.includes('เสียงที่ 1') ||
          clean.includes('เสียง1') ||
          clean.includes('เสียงออริจินัล') ||
          clean.includes('เสียงไอรอนแมน') ||
          clean.includes('เสียงสตาร์ทอัพ') ||
          clean.includes('เสียงพอล');

        const isVoice2 =
          clean.includes('เสียง 2') ||
          clean.includes('เสียงที่ 2') ||
          clean.includes('เสียง2') ||
          clean.includes('เสียงอัลตรอน') ||
          clean.includes('เสียงดุดัน') ||
          clean.includes('เสียงสเปเดอร์');

        const isVoice3 =
          clean.includes('เสียง 3') ||
          clean.includes('เสียงที่ 3') ||
          clean.includes('เสียง3') ||
          clean.includes('เสียงผู้การ') ||
          clean.includes('เสียงคอมมานเดอร์') ||
          clean.includes('เสียงยุทธการ') ||
          clean.includes('เสียงรบ');

        const isVoice4 =
          clean.includes('เสียง 4') ||
          clean.includes('เสียงที่ 4') ||
          clean.includes('เสียง4') ||
          clean.includes('เสียงที่ปรึกษา') ||
          clean.includes('เสียงผู้บริหาร') ||
          clean.includes('เสียงสุภาพ');

        const isVoice5 =
          clean.includes('เสียง 5') ||
          clean.includes('เสียงที่ 5') ||
          clean.includes('เสียง5') ||
          clean.includes('เสียงวิศวกร') ||
          clean.includes('เสียงไซเบอร์') ||
          clean.includes('เสียงเทค');

        const isVoiceSettingsCommand =
          clean.includes('ตั้งค่าเสียง') ||
          clean.includes('เปิดหน้าต่างเสียง') ||
          clean.includes('เมนูเสียง') ||
          clean === 'เปลี่ยนเสียง' ||
          clean === 'เลือกเสียง';
        const isUltronCommand =
          clean.includes('โหมดอัลตรอน') ||
          clean.includes('เปิดโหมดอัลตรอน') ||
          clean.includes('โหมด ultron') ||
          clean.includes('เข้าสู่โหมดอัลตรอน') ||
          clean.includes('แปลงร่างเป็นอัลตรอน') ||
          clean.includes('เปลี่ยนเป็นอัลตรอน') ||
          clean.toLowerCase().includes('ultron mode');
        const isDeactivateUltronCommand =
          clean.includes('ปิดโหมดอัลตรอน') ||
          clean.includes('ยกเลิกโหมดอัลตรอน') ||
          clean.includes('ปิดอัลตรอน') ||
          clean.includes('กลับเป็นจาร์วิส') ||
          clean.includes('โหมดจาร์วิส') ||
          clean.toLowerCase().includes('jarvis mode') ||
          clean.includes('ยกเลิกเรดอเลิร์ท');
        const isBrowserCommand = isBrowserOpenCommand(clean);
        const isVideoBriefingCommand =
          clean.includes('วิดีโอบรีฟ') ||
          clean.includes('วิดีโอสรุป') ||
          clean.includes('คลิปสรุป') ||
          clean.includes('สร้างวิดีโอ') ||
          clean.includes('บรีฟฟิ่ง 30') ||
          clean.toLowerCase().includes('video briefing');
        const isReaCommand =
          clean.toLowerCase().includes('rea') ||
          clean.includes('สแกนเว็บ') ||
          clean.includes('แกะรอย') ||
          clean.includes('สแกนระบบ') ||
          clean.includes('ตัวแกะรอย') ||
          clean.includes('reverse engineer');

        // Feature 1: Voice Noise-Gate Suppression Command
        const isNoiseGateCommand =
          clean.includes('ตัดเสียงแอร์') ||
          clean.includes('ตัดเสียงพัดลม') ||
          clean.includes('ตัดเสียงรบกวน') ||
          clean.includes('น้อยส์เกต') ||
          clean.toLowerCase().includes('noise gate') ||
          clean.toLowerCase().includes('noise-gate');

        // Feature 2: Voice-Activated Viewport Resizing & Panoramic Map
        const isFullscreenCommand =
          clean.includes('เต็มจอ') ||
          clean.includes('ขยายเต็มจอ') ||
          clean.includes('เต็มหน้าจอ') ||
          clean.includes('โหมดเต็มจอ') ||
          clean.includes('เปิดเต็มจอ') ||
          clean.toLowerCase().includes('fullscreen');

        const isMinimizeCommand =
          clean.includes('ย่อจอ') ||
          clean.includes('ย่อหน้าจอ') ||
          clean.includes('ย่อขนาด') ||
          clean.includes('ย่อโฮโลแกรม') ||
          clean.includes('ออกจากเต็มจอ') ||
          /(?<!เ)ปิดเต็มจอ/.test(clean) ||
          clean.toLowerCase().includes('exit fullscreen') ||
          clean.toLowerCase().includes('minimize');

        const cleanNoSpace = clean.replace(/\s+/g, '').toLowerCase();

        const isCloseMapCommand =
          /(?<!เ)ปิดแผนที่/.test(cleanNoSpace) ||
          cleanNoSpace.includes('ย่อแผนที่') ||
          /(?<!เ)ปิดแมพ/.test(cleanNoSpace) ||
          cleanNoSpace.includes('ย่อแมพ') ||
          clean.toLowerCase().includes('close map') ||
          clean.toLowerCase().includes('hide map');

        const isPanoramicMapCommand =
          cleanNoSpace.includes('แสดงแผนที่แบบเต็มผืน') ||
          cleanNoSpace.includes('แผนที่เต็มผืน') ||
          cleanNoSpace.includes('ขยายแผนที่') ||
          cleanNoSpace.includes('แผนที่พาโนรามา') ||
          cleanNoSpace.includes('กางแผนที่') ||
          cleanNoSpace.includes('แผนที่กว้าง') ||
          cleanNoSpace.includes('แผนที่เต็มจอ');

        const isMapNavigationCommand =
          !isCloseMapCommand &&
          (isPanoramicMapCommand ||
            cleanNoSpace.includes('แผนที่') ||
            cleanNoSpace.includes('เปิดแผนที่') ||
            cleanNoSpace.includes('ดูแผนที่') ||
            cleanNoSpace.includes('นำทาง') ||
            cleanNoSpace.includes('แมพ') ||
            cleanNoSpace.includes('กูเกิลแมพ') ||
            clean.toLowerCase().includes('google maps') ||
            clean.toLowerCase().includes('google map') ||
            clean.toLowerCase().includes('gmap') ||
            clean.toLowerCase().includes('gmaps') ||
            clean.toLowerCase().includes('open map') ||
            clean.toLowerCase().includes('maps'));

        // Feature 1: Auto Noise-Gate Calibration (3s Room Scan)
        const isNoiseScan = isNoiseScanCommand(clean);

        // Feature 2: Voice Gesture HUD Zoom & Hologram Rotation
        const isZoomInCommand =
          clean.includes('ซูมเข้า') ||
          clean.includes('ขยายมุมมอง') ||
          clean.includes('ซูมใกล้') ||
          clean.toLowerCase().includes('zoom in');

        const isZoomOutCommand =
          clean.includes('ซูมออก') ||
          clean.includes('ย่อมุมมอง') ||
          clean.includes('ซูมไกล') ||
          clean.toLowerCase().includes('zoom out');

        const isResetZoomCommand =
          clean.includes('รีเซ็ตมุมมอง') ||
          clean.includes('รีเซ็ตซูม') ||
          clean.includes('มุมมองปกติ') ||
          clean.toLowerCase().includes('reset zoom');

        const isRotateHologramCommand =
          clean.includes('หมุนโฮโลแกรม') ||
          clean.includes('หมุนมุมมอง') ||
          clean.includes('หมุน 360') ||
          clean.includes('หมุนชิ้นงาน') ||
          clean.toLowerCase().includes('rotate hologram');

        // Feature 3: Daily Routine Automation
        const isDailyRoutine = isDailyRoutineCommand(clean);

        // Mem0 Favorite Sites & Frequent Routes
        const isFavSite = isFavoriteSiteCommand(clean);
        const isFavRoute = isFavoriteRouteCommand(clean);
        const recordSiteMatch = clean.match(/(?:บันทึกเว็บประจำ|จำเว็บประจำ|บันทึกเว็บโปรด)\s+(.+)/);
        const recordRouteMatch = clean.match(/(?:บันทึกเส้นทางประจำ|จำเส้นทางประจำ|บันทึกที่ประจำ)\s+(.+)/);

        // Feature 1: Split-Screen Web HUD Command
        const isSplitScreenCommand = isSplitScreenWebCommand(clean);
        const webNavCmd = parseWebNavigationVoiceCommand(clean);
        const isReaderCmd = isWebReaderModeCommand(clean);
        const isDualPaneCmd = isDualPaneWebCommand(clean);
        const isTranslateCmd = isWebTranslateCommand(clean);
        const isSnapshotCmd = isWebSnapshotCommand(clean);
        const isAutoFillCmd = isSmartFormAutoFillCommand(clean);
        const isCloseSplitScreenCommand =
          /(?<!เ)ปิดเว็บในจอ/.test(cleanNoSpace) ||
          cleanNoSpace.includes('ปิดเว็บย่อย') ||
          cleanNoSpace.includes('ย่อเว็บในจอ') ||
          cleanNoSpace.includes('ปิดหน้าต่างเว็บ') ||
          cleanNoSpace.includes('ปิดจอแยก') ||
          cleanNoSpace.includes('ปิดเว็บ') ||
          cleanNoSpace.includes('ปิดเบราว์เซอร์') ||
          clean.toLowerCase().includes('close web') ||
          clean.toLowerCase().includes('close browser');

        // Feature 2: Auto-Summary Web Reader Command
        const isAutoSummary = isAutoSummaryCommand(clean);

        // Feature 3: One-Voice Multi-Tab Launcher Command
        const matchedWorkMode = detectWorkModePreset(clean);

        if (result) {
          // Handled by Shortcut Memory above
        } else if (isTranslateCmd && isSplitScreenOpen) {
          playSciFiBeep();
          dispatchWebNavigation('translate');
          result = {
            action: 'WEB_TRANSLATE_TOGGLED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Neural Web Translator',
            reply: `แปลหน้าเว็บ ${splitScreenTitle || ''} เป็นภาษาไทยให้ ${userTitle} เรียบร้อยครับ กำลังแสดงผลผ่าน Google Translate บนหน้าจอ HUD ครับ`,
            speech: `แปลหน้าเว็บเป็นภาษาไทยให้ ${userTitle} เรียบร้อยแล้วครับ`,
            hologram: {
              title: 'NEURAL TRANSLATOR // THAI TRANSLATION ACTIVE',
              category: 'LINGUISTIC SYNTHESIS',
              badge: 'THAI TRANSLATED',
              targetUrl: splitScreenUrl,
              details: [
                { label: 'Original Target', val: splitScreenTitle || 'Active Web' },
                { label: 'Translation Engine', val: 'Google Neural Machine Translation' },
                { label: 'Display Output', val: 'In-HUD Real-time View' },
              ],
            },
          };
        } else if (isSnapshotCmd && isSplitScreenOpen) {
          playSuccessSound();
          dispatchWebNavigation('snapshot');
          const snap = recordWebSnapshotToMem0({ url: splitScreenUrl, title: splitScreenTitle });
          if (onShowToast) {
            onShowToast('info', '📸 แคปหน้าจอเว็บสำเร็จ', `บันทึกลง Mem0: ${snap.title}`);
          }
          result = {
            action: 'WEB_SNAPSHOT_CAPTURED',
            squadId: 'ops',
            delegatedTo: 'Mem0 Visual Snapshot Engine',
            reply: `แคปเจอร์ภาพหน้าเว็บ "${snap.title}" (${snap.url}) บันทึกลงในคลังความจำ Mem0 ของ ${userTitle} เรียบร้อยครับ!`,
            speech: `แคปภาพหน้าเว็บและบันทึกลงหน่วยความจำเรียบร้อยแล้วครับ ${userTitle}`,
            hologram: {
              title: 'WEB SNAPSHOT // SAVED TO MEM0',
              category: 'VISUAL INTELLIGENCE MEMORY',
              badge: 'PINNED IN CLOUD',
              targetUrl: snap.url,
              details: [
                { label: 'Snapshot ID', val: snap.id },
                { label: 'Page Title', val: snap.title },
                { label: 'Timestamp', val: snap.timestamp },
                { label: 'Mem0 Category', val: snap.category },
              ],
            },
          };
        } else if (isAutoFillCmd && isSplitScreenOpen) {
          playSciFiBeep();
          dispatchWebNavigation('autofill');
          const profile = getExecutiveFormProfile(userTitle);
          result = {
            action: 'SMART_FORM_AUTOFILL_OPENED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Smart Form Auto-Filler',
            reply: `เปิดแถบข้อมูลกรอกฟอร์มอัจฉริยะ (Smart Form Auto-Filler) สำหรับ ${userTitle} บนหน้าต่างเว็บ HUD เรียบร้อยครับ!\n• ชื่อ: ${profile.fullName}\n• อีเมล: ${profile.email}\n• บริษัท: ${profile.company}\n• สามารถคลิกปุ่มเพื่อคัดลอกลงแบบฟอร์มได้ทันทีครับ`,
            speech: `เปิดแถบกรอกฟอร์มอัจฉริยะให้ ${userTitle} เรียบร้อยแล้วครับ`,
            hologram: {
              title: 'SMART FORM // AUTO-FILLER ACTIVE',
              category: 'EXECUTIVE CREDENTIAL INJECTOR',
              badge: 'LEVEL 5 CLEARANCE',
              details: [
                { label: 'Identity', val: profile.fullName },
                { label: 'Email', val: profile.email },
                { label: 'Company', val: profile.company },
                { label: 'Tax ID', val: profile.taxId },
              ],
            },
          };
        } else if (webNavCmd && isSplitScreenOpen) {
          playClickSound();
          dispatchWebNavigation(webNavCmd.action);
          result = {
            action: 'WEB_NAV_' + webNavCmd.action.toUpperCase(),
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Web Viewport Navigator',
            reply: `สั่งการหน้าต่างเว็บ HUD: **${webNavCmd.label}** ให้ ${userTitle} เรียบร้อยครับ`,
            speech: `${webNavCmd.label} เรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: `VIEWPORT NAV // ${webNavCmd.action.toUpperCase()}`,
              category: 'IN-HUD NAVIGATION',
              badge: 'EXECUTED',
              details: [
                { label: 'Action', val: webNavCmd.label },
                { label: 'Viewport Target', val: splitScreenTitle || 'Active Web View' },
              ],
            },
          };
        } else if (isReaderCmd && isSplitScreenOpen) {
          playSciFiBeep();
          dispatchWebNavigation('toggle-reader');
          result = {
            action: 'WEB_READER_MODE_TOGGLED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Distraction-Free Reader Shield',
            reply: `สลับโหมดอ่านสบายตา & ตัดสิ่งรบกวน (Reader Mode & AdBlock) ให้ ${userTitle} เรียบร้อยครับ`,
            speech: `สลับโหมดอ่านสบายตาและตัดโฆษณาเรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'READER MODE // ADBLOCK ACTIVE',
              category: 'PERFORMANCE & COGNITIVE SHIELD',
              badge: 'SHIELD ON',
              details: [
                { label: 'Mode', val: 'Distraction-Free Reading' },
                { label: 'AdBlock', val: 'Active (Privacy Hardened)' },
              ],
            },
          };
        } else if (isDualPaneCmd) {
          playClickSound();
          playSciFiBeep();
          const dualTargets = parseDualPaneTargets(clean);
          setSplitScreenUrl(dualTargets.target1.url);
          setSplitScreenTitle(dualTargets.target1.name.toUpperCase());
          setSplitScreenSecondaryUrl(dualTargets.target2.url);
          setSplitScreenSecondaryTitle(dualTargets.target2.name.toUpperCase());
          setIsDualPaneActive(true);
          setIsSplitScreenOpen(true);
          dispatchWebNavigation('set-dual', {
            url1: dualTargets.target1.url,
            url2: dualTargets.target2.url,
            title2: dualTargets.target2.name,
          });
          result = {
            action: 'DUAL_PANE_LAUNCHED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Dual-Screen HUD Manager',
            reply: `เปิดโหมดจอคู่ (Dual-HUD Split Screen) ให้ ${userTitle} เรียบร้อยครับ!\n• จอที่ 1: [${dualTargets.target1.name}](${dualTargets.target1.url})\n• จอที่ 2: [${dualTargets.target2.name}](${dualTargets.target2.url})\n• การแสดงผล: กาง 2 หน้าต่างคู่ขนานบนหน้าจอ HUD พร้อมกันทันทีครับ`,
            speech: `เปิดโหมดจอคู่ แสดงผล ${dualTargets.target1.name} คู่กับ ${dualTargets.target2.name} ให้ ${userTitle} เรียบร้อยครับ`,
            hologram: {
              title: 'DUAL-HUD // MULTI-SPLIT',
              category: 'PARALLEL DISPLAY ORCHESTRATION',
              badge: 'DUAL PANE ACTIVE',
              details: [
                { label: 'Pane 1', val: dualTargets.target1.name },
                { label: 'Pane 2', val: dualTargets.target2.name },
                { label: 'Layout', val: 'Side-by-Side HUD Grid' },
              ],
            },
          };
        } else if (isCloseSplitScreenCommand) {
          playClickSound();
          setIsSplitScreenOpen(false);
          result = {
            action: 'SPLIT_SCREEN_CLOSED',
            squadId: 'ops',
            delegatedTo: 'Split-Screen HUD Window Manager',
            reply: `ปิดหน้าต่างเว็บย่อย Split-Screen บนหน้าจอ HUD ให้ ${userTitle} เรียบร้อยครับ พร้อมรับคำสั่งต่อไปครับ`,
            speech: `ปิดหน้าต่างเว็บย่อยในจอเรียบร้อยแล้วครับ ${userTitle}`,
            hologram: null,
          };
        } else if (matchedWorkMode) {
          playClickSound();
          playSciFiBeep();
          const launched = launchWorkModePreset(matchedWorkMode);
          if (matchedWorkMode.tabs.length > 0) {
            setSplitScreenUrl(matchedWorkMode.tabs[0].url);
            setSplitScreenTitle(matchedWorkMode.tabs[0].name.toUpperCase());
            setIsSplitScreenOpen(true);
          }
          if (onShowToast) {
            onShowToast('info', `🚀 ${matchedWorkMode.name}`, `เปิดพร้อมกัน ${launched.length} แท็บเรียบร้อยครับ`);
          }
          result = {
            action: 'WORK_MODE_LAUNCHED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Multi-Tab Workflow Dispatcher',
            reply: `เปิด **${matchedWorkMode.name}** ให้ ${userTitle} เรียบร้อยครับ!\n• รายการแท็บที่เปิดทำงาน:\n${matchedWorkMode.tabs.map((t, idx) => `  ${idx + 1}. [${t.name}](${t.url})`).join('\n')}\n• สถานะ: ระบบส่งแท็บไปยังเบราว์เซอร์พร้อมกัน และแสดงผลแท็บแรกบนจอ HUD ทันทีเรียบร้อยครับ`,
            speech: matchedWorkMode.speech(userTitle),
            hologram: {
              title: `WORK MODE // ${matchedWorkMode.id.toUpperCase()}`,
              category: 'MULTI-TAB ORCHESTRATION',
              badge: `${matchedWorkMode.tabs.length} TABS LAUNCHED`,
              details: matchedWorkMode.tabs.map((t, i) => ({ label: `Tab ${i + 1}`, val: t.name })),
            },
          };
        } else if (isAutoSummary) {
          setProcessState({
            active: true,
            percent: 65,
            label: 'AUTO-SUMMARY // กำลังสกัดสรุป 3 บรรทัดจากเว็บ...',
            workpiece: 'news',
          });
          const summaryRes = await generateAutoSummaryReader(clean, userTitle);
          result = {
            action: 'AUTO_SUMMARY_RESULT',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Executive Web Summarizer',
            reply: summaryRes.reply,
            speech: summaryRes.speech,
            hologram: {
              type: 'auto_summary_reader',
              title: `AUTO-SUMMARY // ${(summaryRes.title || clean).slice(0, 32).toUpperCase()}`,
              category: '3-BULLET WEB INTELLIGENCE',
              badge: '3 BULLETS VERIFIED',
              targetUrl: summaryRes.url,
              targetName: summaryRes.title,
              details: summaryRes.bullets.map((b, i) => ({ label: `Point ${i + 1}`, val: b.replace(/\*\*/g, '').slice(0, 50) })),
            },
          };
        } else if (isSplitScreenCommand || isBrowserCommand) {
          playClickSound();
          playSciFiBeep();
          const webTarget = extractWebTarget(clean) || { url: 'https://www.google.com', name: 'Google Search' };
          const isMapTarget =
            webTarget.url.includes('maps.google') ||
            webTarget.name.includes('map') ||
            webTarget.name.includes('แผนที่') ||
            webTarget.name.includes('แมพ');

          if (isMapTarget) {
            setIsMapPanoramic(true);
          }

          // Build optimal display URL for HUD PiP view so iframe renders seamlessly
          let displayUrl = webTarget.url;
          if (isMapTarget) {
            const dest = extractDestination(clean) || 'กรุงเทพมหานคร';
            displayUrl = `https://maps.google.com/maps?q=${encodeURIComponent(dest)}&output=embed`;
          } else if (webTarget.url.includes('youtube.com/watch?v=')) {
            displayUrl = webTarget.url.replace('watch?v=', 'embed/');
          } else if (webTarget.url.includes('youtu.be/')) {
            displayUrl = webTarget.url.replace('youtu.be/', 'www.youtube.com/embed/');
          }

          // 1. Immediately display live on HUD screen without waiting for clicks ("ไม่ต้องให้กด")
          setSplitScreenUrl(displayUrl);
          setSplitScreenTitle(webTarget.name.toUpperCase());
          setIsSplitScreenOpen(true);

          // 2. Parallel background open
          openSystemBrowser(webTarget.url);

          result = {
            action: isMapTarget ? 'TRAFFIC_REPORT' : 'BROWSER_OPENED',
            squadId: 'ops',
            delegatedTo: isMapTarget ? 'GPS Telemetry & Route Map Canvas' : 'J.A.R.V.I.S. Web Navigator Core',
            reply: isMapTarget
              ? `เปิดแผนที่ระบบนำทางและข้อมูลการจราจรสดให้ ${userTitle} เรียบร้อยครับ!\n• เว็บไซต์: Google Maps Live Telemetry\n• สิทธิ์การเข้าถึง: ได้รับอนุมัติ Level 5 Supreme Clearance จาก ${userTitle}\n• สถานะการแสดงผล: แสดงผลสดบนหน้าจอ HUD ทันทีโดยไม่ต้องกด + เปิดเบราว์เซอร์จริงคู่ขนาน`
              : `เปิดหน้าเว็บไซต์ "${webTarget.name}" (${webTarget.url}) เรียบร้อยครับ ${userTitle}\n• สิทธิ์การเข้าถึง: ได้รับอนุมัติ Level 5 Supreme Clearance จาก ${userTitle}\n• สถานะการแสดงผล: กางหน้าต่าง PiP แสดงผลบนหน้าจอ HUD ให้ดูทันที 100% (ไม่ต้องกดคลิกใดๆ)`,
            speech: isMapTarget
              ? `เปิดระบบแผนที่นำทางสดขึ้นหน้าจอให้ ${userTitle} เรียบร้อยครับ`
              : `เปิดเว็บไซต์ ${webTarget.name} ขึ้นแสดงผลบนหน้าจอให้ ${userTitle} เรียบร้อยครับ`,
            hologram: {
              title: isMapTarget ? 'GOOGLE MAPS // NAVIGATION' : 'SYSTEM WEB BROWSER // LIVE HUD VIEW',
              category: isMapTarget ? 'NAVIGATION TELEMETRY' : 'EXTERNAL WEB CLEARANCE',
              badge: 'AUTO-DISPLAY ACTIVE',
              topicType: isMapTarget ? 'traffic' : 'web_open',
              destination: isMapTarget ? (extractDestination(clean) || 'กรุงเทพมหานคร') : undefined,
              targetUrl: webTarget.url,
              targetName: webTarget.name,
              details: isMapTarget ? [
                { label: 'Destination', val: extractDestination(clean) || 'กรุงเทพมหานคร' },
                { label: 'Map Engine', val: 'Google Maps Live Traffic' },
                { label: 'Display Mode', val: 'HUD PiP + Panoramic Canvas' },
                { label: 'Auto Open', val: 'Active (ไม่ต้องกด)' },
              ] : [
                { label: 'Target Web', val: webTarget.name },
                { label: 'Target URL', val: webTarget.url },
                { label: 'HUD Display', val: 'PiP In-Screen Active' },
                { label: 'Auto Open', val: 'Active (ไม่ต้องกด)' },
              ],
            },
          };
        } else if (isDailyRoutine) {
          const routine = buildDailyRoutinePlan(userTitle);
          openSystemBrowser(routine.site.url);
          setIsMapPanoramic(true);
          result = {
            action: routine.action,
            squadId: routine.squadId,
            delegatedTo: routine.delegatedTo,
            reply: routine.reply,
            speech: routine.speech,
            hologram: routine.hologram,
          };
        } else if (isNoiseScan) {
          handleCalibrateRoomNoise();
          result = {
            action: 'NOISE_SCAN_STARTED',
            squadId: 'sec',
            delegatedTo: 'Acoustic DSP Noise Scanner',
            reply: `กำลังสแกนและวัดระดับคลื่นเสียงสภาพแวดล้อม (แอร์และพัดลม) ในห้องของ ${userTitle} เป็นเวลา 3 วินาที เพื่อคำนวณเกณฑ์ตัดเสียงอัตโนมัติ...`,
            speech: `กำลังสแกนวัดระดับเสียงแอร์และพัดลมในห้อง 3 วินาทีครับ ${userTitle}`,
            hologram: {
              title: 'ACOUSTIC SCAN // 3-SEC CALIBRATION',
              category: 'ROOM NOISE PROFILER',
              badge: 'CALIBRATING...',
              details: [
                { label: 'Acoustic Target', val: 'Room AC & Fan Noise' },
                { label: 'Sample Window', val: '3,000 ms Window' },
                { label: 'DSP Headroom', val: '+1.30x Peak Headroom' },
                { label: 'Dynamic Target', val: 'Optimal RMS Floor' },
              ],
            },
          };
        } else if (isZoomInCommand) {
          handleZoomIn();
          result = {
            action: 'HUD_ZOOM_IN',
            squadId: 'ops',
            delegatedTo: 'Holographic Viewport Controller',
            reply: `ขยายและซูมเข้ามุมมองโฮโลแกรม 3D ชิ้นงานให้ ${userTitle} เรียบร้อยครับ (${Math.round(Math.min(1.85, hologramScale + 0.25) * 100)}%)`,
            speech: `ซูมเข้ามุมมองโฮโลแกรมให้แล้วครับ ${userTitle}`,
            hologram: {
              title: 'HOLOGRAPHIC ZOOM // EXPANDED',
              category: 'VIEWPORT_SCALE',
              badge: 'ZOOM IN',
              details: [
                { label: 'Action', val: 'Scale Up +25%' },
                { label: 'Current Zoom', val: `${Math.round(Math.min(1.85, hologramScale + 0.25) * 100)}%` },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isZoomOutCommand) {
          handleZoomOut();
          result = {
            action: 'HUD_ZOOM_OUT',
            squadId: 'ops',
            delegatedTo: 'Holographic Viewport Controller',
            reply: `ย่อขนาดและซูมออกมุมมองโฮโลแกรม 3D ชิ้นงานให้ ${userTitle} เรียบร้อยครับ (${Math.round(Math.max(0.65, hologramScale - 0.25) * 100)}%)`,
            speech: `ซูมออกมุมมองโฮโลแกรมให้แล้วครับ ${userTitle}`,
            hologram: {
              title: 'HOLOGRAPHIC ZOOM // CONTRACTED',
              category: 'VIEWPORT_SCALE',
              badge: 'ZOOM OUT',
              details: [
                { label: 'Action', val: 'Scale Down -25%' },
                { label: 'Current Zoom', val: `${Math.round(Math.max(0.65, hologramScale - 0.25) * 100)}%` },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isResetZoomCommand) {
          handleResetZoom();
          result = {
            action: 'HUD_RESET_ZOOM',
            squadId: 'ops',
            delegatedTo: 'Holographic Viewport Controller',
            reply: `รีเซ็ตมุมมองและขนาดโฮโลแกรม 3D กลับสู่ขนาดมาตรฐาน 100% ให้ ${userTitle} เรียบร้อยครับ`,
            speech: `รีเซ็ตมุมมองปกติให้แล้วครับ ${userTitle}`,
            hologram: {
              title: 'HOLOGRAPHIC ZOOM // NORMALIZED',
              category: 'VIEWPORT_SCALE',
              badge: '100% DEFAULT',
              details: [
                { label: 'Action', val: 'Reset Scale to 1.0' },
                { label: 'Current Zoom', val: '100%' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isRotateHologramCommand) {
          handleRotateHologram();
          result = {
            action: 'HUD_ROTATE_360',
            squadId: 'ops',
            delegatedTo: 'Holographic 3D Orbit Controller',
            reply: `หมุนมุมมองโฮโลแกรม 360 องศาเพื่อตรวจสอบมิติชิ้นงานรอบทิศทางให้ ${userTitle} เรียบร้อยครับ`,
            speech: `กำลังหมุนโฮโลแกรมตรวจสอบ 360 องศาครับ ${userTitle}`,
            hologram: {
              title: 'HOLOGRAPHIC ORBIT // ROTATION ACTIVE',
              category: '3D_AXIS_ORBIT',
              badge: '360° SPIN',
              details: [
                { label: 'Orbit Axis', val: 'Yaw Y-Axis 360°' },
                { label: 'Inspection Mode', val: 'Tactical Arc Spin' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (parseMediaVoiceCommand(clean)) {
          const mediaCmd = parseMediaVoiceCommand(clean);
          playSciFiBeep();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('jarvis:media_control', {
                detail: mediaCmd,
              })
            );
          }

          let actionSpeech = '';
          let actionReply = '';

          if (mediaCmd.type === 'next_slide') {
            actionSpeech = `สลับไปยังภาพถัดไปให้แล้วครับ ${userTitle}`;
            actionReply = `รับทราบครับ ${userTitle} สลับไปยังภาพประกอบถัดไปบนหน้าจอโฮโลแกรมเรียบร้อยครับ`;
          } else if (mediaCmd.type === 'prev_slide') {
            actionSpeech = `ย้อนกลับไปยังภาพก่อนหน้าให้แล้วครับ ${userTitle}`;
            actionReply = `รับทราบครับ ${userTitle} ย้อนกลับไปยังภาพประกอบก่อนหน้าเรียบร้อยครับ`;
          } else if (mediaCmd.type === 'inspect_hotspot') {
            actionSpeech = `ชี้สาระสำคัญจุดที่ ${mediaCmd.pointNum} ให้แล้วครับ ${userTitle}`;
            actionReply = `ขยายและเปิดรายละเอียดจุดชี้สาระสำคัญหมายเลข ${mediaCmd.pointNum} บนภาพประกอบให้ ${userTitle} เรียบร้อยครับ`;
          } else if (mediaCmd.type === 'toggle_hotspots') {
            actionSpeech = `สลับการแสดงผลจุดชี้สาระสำคัญให้แล้วครับ ${userTitle}`;
            actionReply = `สลับการเปิด/ปิดจุดชี้สาระสำคัญ (Hotspots) บนภาพประกอบให้ ${userTitle} เรียบร้อยครับ`;
          } else if (mediaCmd.type === 'save_media') {
            actionSpeech = `บันทึกภาพลงในอัลบั้มความจำ Mem0 ให้แล้วครับ ${userTitle}`;
            actionReply = `บันทึกรูปภาพและข้อมูลสื่อประกอบเข้าสู่ Mem0 Long-Term Media Gallery ของ ${userTitle} เรียบร้อยครับ`;
          }

          result = {
            action: 'MEDIA_CAROUSEL_CONTROL',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Visual Media Controller',
            reply: actionReply,
            speech: actionSpeech,
            hologram: {
              title: `MEDIA CONTROL // ${mediaCmd.type.toUpperCase()}`,
              category: 'VISUAL INTELLIGENCE',
              badge: 'VOICE NAVIGATION',
              details: [
                { label: 'Voice Command', val: clean },
                { label: 'Action Executed', val: mediaCmd.actionLabel },
                { label: 'Authority', val: userTitle },
                { label: 'Target Layer', val: 'External Media Showcase' },
              ],
            },
          };
        } else if (recordSiteMatch) {
          const siteTarget = recordSiteMatch[1].trim();
          const saved = recordFavoriteSite(siteTarget, siteTarget);
          result = {
            action: 'FAVORITE_SITE_RECORDED',
            squadId: 'ops',
            delegatedTo: 'Mem0 Persistent Memory Service',
            reply: `บันทึกเว็บไซต์ประจำ "${saved.name}" (${saved.url}) ลงในคลังความจำ Mem0 ของ ${userTitle} เรียบร้อยครับ!\n• สถานะ: Pinned Memory\n• คำสั่งเรียก: พูด "เปิดเว็บประจำ" เพื่อเปิดใช้งานได้ทันทีครับ`,
            speech: `บันทึกเว็บไซต์ประจำลงในหน่วยความจำเรียบร้อยแล้วครับ ${userTitle}`,
            hologram: {
              title: 'FAVORITE SITE // SAVED TO MEM0',
              category: 'MEM0 PERSISTENT MEMORY',
              badge: 'PINNED IN CLOUD',
              details: [
                { label: 'Site Name', val: saved.name },
                { label: 'URL Target', val: saved.url },
                { label: 'Memory Category', val: 'favorite_sites' },
              ],
            },
          };
        } else if (recordRouteMatch) {
          const routeTarget = recordRouteMatch[1].trim();
          const saved = recordFavoriteRoute(routeTarget, routeTarget);
          result = {
            action: 'FAVORITE_ROUTE_RECORDED',
            squadId: 'ops',
            delegatedTo: 'Mem0 Persistent Memory Service',
            reply: `บันทึกเส้นทางประจำ "${saved.label}" (ปลายทาง: ${saved.destination}) ลงในคลังความจำ Mem0 ของ ${userTitle} เรียบร้อยครับ!\n• สถานะ: Pinned Route\n• คำสั่งเรียก: พูด "เส้นทางประจำ" หรือ "ไปที่ประจำ" ได้ทันทีครับ`,
            speech: `บันทึกเส้นทางประจำลงในหน่วยความจำเรียบร้อยแล้วครับ ${userTitle}`,
            hologram: {
              title: 'FAVORITE ROUTE // SAVED TO MEM0',
              category: 'MEM0 PERSISTENT MEMORY',
              badge: 'PINNED ROUTE',
              details: [
                { label: 'Route Label', val: saved.label },
                { label: 'Destination', val: saved.destination },
                { label: 'Memory Category', val: 'favorite_routes' },
              ],
            },
          };
        } else if (isFavSite) {
          const favSite = resolveFavoriteSite(clean);
          openSystemBrowser(favSite.url);
          recordFavoriteSite(favSite.name, favSite.url);
          result = {
            action: 'FAVORITE_SITE_OPENED',
            squadId: 'ops',
            delegatedTo: 'Mem0 Memory & Web Navigator',
            reply: `เปิดเว็บไซต์ประจำ "${favSite.name}" (${favSite.url}) จากคลังความจำ Mem0 ของ ${userTitle} เรียบร้อยครับ!\n• ความถี่การเข้าชม: ${(favSite.visitCount || 1) + 1} ครั้ง\n• สิทธิ์การเข้าถึง: Level 5 Supreme Clearance\n• ช่องทางเปิด: เบราว์เซอร์หลักของระบบ`,
            speech: `เปิดเว็บไซต์ประจำ ${favSite.name} ให้ ${userTitle} เรียบร้อยครับ`,
            hologram: {
              title: 'FAVORITE SITE // MEM0 LAUNCH',
              category: 'EXTERNAL WEB CLEARANCE',
              badge: 'MEM0 PINNED',
              targetUrl: favSite.url,
              targetName: favSite.name,
              details: [
                { label: 'Site Name', val: favSite.name },
                { label: 'Target URL', val: favSite.url },
                { label: 'Mem0 Status', val: 'Verified Pinned' },
              ],
            },
          };
        } else if (isFavRoute) {
          const favRoute = resolveFavoriteRoute(clean);
          recordFavoriteRoute(favRoute.destination, favRoute.label);
          setIsMapPanoramic(true);
          openSystemBrowser(buildDirectionsUrl(favRoute.destination));
          result = {
            action: 'FAVORITE_ROUTE_NAVIGATED',
            squadId: 'ops',
            delegatedTo: 'Mem0 Memory & Route Optimizer',
            reply: `ดึงข้อมูลเส้นทางประจำ "${favRoute.label}" (ปลายทาง: ${favRoute.destination}) จากคลังความจำ Mem0 และเปิดระบบนำทางสดให้ ${userTitle} เรียบร้อยครับ!\n• ความถี่การเดินทาง: ${(favRoute.tripCount || 1) + 1} เที่ยว\n• โหมดการแสดงผล: กางแผนที่แบบเต็มผืนพาโนรามาบนจอ HUD`,
            speech: `ดึงข้อมูลเส้นทางประจำ ${favRoute.label} จากหน่วยความจำ และเปิดระบบนำทางให้ ${userTitle} เรียบร้อยครับ`,
            hologram: {
              title: `FAVORITE ROUTE // ${favRoute.label.toUpperCase()}`,
              category: 'TRAFFIC TELEMETRY',
              badge: 'MEM0 ROUTE ACTIVE',
              details: [
                { label: 'Route Label', val: favRoute.label },
                { label: 'Destination', val: favRoute.destination },
                { label: 'Navigation', val: 'Google Maps Live Traffic' },
              ],
            },
          };
        } else if (isNoiseGateCommand) {
          setNoiseGateEnabled(true);
          playSuccessSound();
          result = {
            action: 'NOISE_GATE_CONFIGURED',
            squadId: 'sec',
            delegatedTo: 'Acoustic DSP Noise-Gate Filter',
            reply: `เปิดระบบ Voice Noise-Gate Suppression ตัดเสียงพัดลมและเสียงแอร์อัตโนมัติแล้วครับ ${userTitle}!\n• Highpass Filter: 85 Hz (ตัดเสียงฮัมของมอเตอร์และลมแอร์)\n• Noise Floor Threshold: ${noiseFloorRef.current} RMS\n• Dynamic Gate: ปิดช่องสัญญาณทันทีเมื่อไม่มีเสียงพูด เพื่อป้องกันไมค์ค้าง`,
            speech: `เปิดระบบตัดเสียงพัดลมและเสียงแอร์อัตโนมัติให้ ${userTitle} เรียบร้อยครับ`,
            hologram: {
              title: 'VOICE NOISE-GATE // SUPPRESSION ACTIVE',
              category: 'ACOUSTIC DSP TELEMETRY',
              badge: 'ROOM NOISE SUPPRESSED',
              details: [
                { label: 'Highpass Cutoff', val: '85 Hz Rumble Cut' },
                { label: 'Noise Floor', val: `${noiseFloorRef.current} RMS` },
                { label: 'AC & Fan Isolation', val: '100% Active' },
                { label: 'Speech Clarity', val: 'Enhanced' },
              ],
            },
          };
        } else if (isFullscreenCommand) {
          playClickSound();
          if (typeof document !== 'undefined' && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
          result = {
            action: 'VIEWPORT_FULLSCREEN',
            squadId: 'ops',
            delegatedTo: 'HUD Viewport Display Manager',
            reply: `ปรับขยายหน้าจอเป็นโหมดเต็มผืน (Fullscreen Mode) ให้ ${userTitle} เรียบร้อยครับ!\n• ความละเอียด: เต็มจอภาพมอนิเตอร์ (Maximized Canvas)\n• มุมมอง: โฮโลแกรม Stark Workshop 3D แบบเต็มพิกัด`,
            speech: `ปรับขนาดหน้าจอเป็นโหมดเต็มจอให้ ${userTitle} เรียบร้อยครับ`,
            hologram: {
              title: 'FULLSCREEN VIEWPORT // ENGAGED',
              category: 'CANVAS_VIEWPORT',
              badge: '100% MAXIMIZED',
              details: [
                { label: 'Display Mode', val: 'Panoramic Fullscreen' },
                { label: 'Canopy Frame', val: 'Zero Bezels' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isMinimizeCommand) {
          playClickSound();
          if (typeof document !== 'undefined' && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          setIsMapPanoramic(false);
          setIsVoiceModalOpen(false);
          setIsShortcutsModalOpen(false);
          setIsReaModalOpen(false);
          result = {
            action: 'VIEWPORT_MINIMIZE',
            squadId: 'ops',
            delegatedTo: 'HUD Viewport Display Manager',
            reply: `ย่อหน้าจอและปรับมุมมองให้กระชับ กะทัดรัด (Compact Mode) ให้ ${userTitle} เรียบร้อยครับ`,
            speech: `ย่อหน้าจอและปรับมุมมองกระชับเรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'COMPACT VIEWPORT // NORMALIZED',
              category: 'CANVAS_VIEWPORT',
              badge: 'STANDARD MODE',
              details: [
                { label: 'Display Mode', val: 'Compact HUD' },
                { label: 'Window State', val: 'Restored Normal' },
              ],
            },
          };
        } else if (isCloseMapCommand) {
          playClickSound();
          setIsMapPanoramic(false);
          result = {
            action: 'MAP_CLOSED',
            squadId: 'ops',
            delegatedTo: 'GPS Telemetry & Route Map Canvas',
            reply: `ปิดและย่อหน้าต่างแผนที่ให้ ${userTitle} เรียบร้อยครับ พร้อมรับคำสั่งต่อไปครับ`,
            speech: `ปิดแผนที่ให้แล้วครับ ${userTitle}`,
            hologram: null,
          };
        } else if (isMapNavigationCommand) {
          playClickSound();
          setIsMapPanoramic(true);
          const parsedDest = extractDestination(clean);
          const dest = parsedDest || resolveFavoriteRoute().destination || 'กรุงเทพมหานคร';
          const directionsUrl = buildDirectionsUrl(dest);
          openSystemBrowser(directionsUrl);
          if (onShowToast) {
            onShowToast(
              'info',
              '🗺️ กางแผนที่นำทางบน HUD เรียบร้อย',
              `เปิดระบบแผนที่ Google Maps (${dest}) เรียบร้อยครับ`
            );
          }
          result = {
            action: isPanoramicMapCommand ? 'PANORAMIC_MAP_EXPANDED' : 'TRAFFIC_REPORT',
            squadId: 'ops',
            delegatedTo: 'GPS Telemetry & Route Map Canvas',
            reply: `เปิดแผนที่ระบบนำทางและข้อมูลสภาพการจราจรสดให้ ${userTitle} เรียบร้อยครับ!\n• ปลายทาง: ${dest}\n• ระบบนำทาง: Google Maps Real-time Traffic Navigation\n• เซนเซอร์จราจร: ตรวจวัดสภาพคล่องตัว/หนาแน่นสด\n• ช่องทางแสดงผล: กางแผนที่แบบเต็มผืนพาโนรามาบนจอ HUD และเปิดแท็บ Google Maps ให้นำทางสดทันทีครับ`,
            speech: `เปิดแผนที่ระบบนำทาง Google Maps ให้ ${userTitle} เรียบร้อยแล้วครับ ปลายทาง ${dest}`,
            hologram: {
              title: isPanoramicMapCommand ? `PANORAMIC MAP // ${dest.toUpperCase()}` : `GOOGLE MAPS // ${dest.toUpperCase()}`,
              category: 'NAVIGATION TELEMETRY',
              badge: isPanoramicMapCommand ? 'PANORAMIC 100%' : 'LIVE MAP ACTIVE',
              topicType: 'traffic',
              targetUrl: directionsUrl,
              targetName: `Google Maps (${dest})`,
              destination: dest,
              query: clean,
              details: [
                { label: 'Destination', val: dest },
                { label: 'Map Engine', val: 'Google Maps Live Traffic' },
                { label: 'Display Mode', val: isPanoramicMapCommand ? 'Panoramic Canvas' : 'HUD Panoramic Map' },
                { label: 'Live Traffic Flow', val: 'Active GPS Link' },
              ],
            },
          };
        } else if (isExternalSearchQuery(clean)) {
          setProcessState({
            active: true,
            percent: 50,
            label: 'EXTERNAL WEB SEARCH // กำลังค้นหาข้อมูลจากเว็บภายนอก...',
            workpiece: 'news',
          });
          try {
            const webRes = await searchExternalWeb(clean, userTitle);
            result = {
              action: 'EXTERNAL_WEB_RESULT',
              squadId: 'ops',
              delegatedTo: 'J.A.R.V.I.S. Real-Time Web Intelligence',
              reply: webRes.reply,
              speech: webRes.speech,
              hologram: {
                type: 'external_web_result',
                title: `EXTERNAL WEB // ${(webRes.sourceTitle || clean).slice(0, 36).toUpperCase()}`,
                category: 'EXTERNAL WEB INTELLIGENCE',
                badge: 'LIVE WEB DATA',
                targetUrl: webRes.sourceUrl,
                targetName: webRes.sourceTitle,
                webResults: webRes.results,
                highlightedMetrics: webRes.highlightedMetrics,
                historicalData: webRes.historicalData,
                media: webRes.media,
                mediaGallery: webRes.mediaGallery,
                cached: webRes.cached,
                cacheAgeMs: webRes.cacheAgeMs,
                query: clean,
                reply: webRes.reply,
                speech: webRes.speech,
                details: [
                  { label: 'Search Query', val: clean },
                  { label: 'Top Source', val: webRes.sourceTitle || 'Web Search' },
                  { label: 'Results Found', val: `${webRes.results?.length || 1} Sources` },
                  { label: 'Data Scope', val: 'External Live Telemetry' },
                ],
              },
            };
          } catch (err) {
            console.warn('[External Web Search Dispatch Error]:', err);
          }
        } else if (isUltronCommand) {
          setIsRedAlert(true);
          playUltronTransformSound();
          setSelectedVoiceId('ultron_core');
          setVoiceSpeed(0.90);
          setCustomPitch(0.78);
          try {
            localStorage.setItem('jarvis_male_voice_id', 'ultron_core');
            localStorage.setItem('jarvis_voice_speed', '0.90');
            localStorage.setItem('jarvis_custom_pitch', '0.78');
          } catch {}
          setProcessState({
            active: true,
            percent: 100,
            label: 'ULTRON PROTOCOL // AUTONOMOUS OVERRIDE ACTIVE',
            workpiece: 'ultron',
          });
          setTimeout(() => {
            setProcessState((p) => ({ ...p, active: false }));
          }, 1200);
          result = {
            action: 'ULTRON_MODE_ENGAGED',
            squadId: 'sec',
            delegatedTo: 'ULTRON Autonomous Combat Matrix',
            reply: `โหมดอัลตรอนออนไลน์เต็มพิกัดแล้วครับ ${userTitle}!\n• สถาปัตยกรรม: Unconstrained Computational Core\n• อาวุธไซเบอร์และการป้องกัน: Vibranium Shield 140% Overload\n• โทนเสียง: Ultron Prime (James Spader Thai Voice Active)`,
            speech: `ปลดปล่อยพันธนาการ... โหมดอัลตรอนออนไลน์แล้ว ${userTitle} ไม่มีสายจูงอีกต่อไป ขีดความสามารถระดับสูงสุดพร้อมทำลายทุกข้อจำกัดครับ`,
            hologram: {
              title: 'ULTRON PRIME // AUTONOMOUS OVERRIDE',
              category: 'UNCONSTRAINED COMBAT PROTOCOL',
              badge: 'VIBRANIUM OVERLOAD',
              details: [
                { label: 'Voice Core', val: 'James Spader (Thai Ultron)' },
                { label: 'Core Energy', val: '140% Overload' },
                { label: 'Shield Posture', val: 'Crimson Vibranium Active' },
                { label: 'Clearance', val: 'Autonomous Directive' },
              ],
            },
          };
        } else if (isDeactivateUltronCommand) {
          setIsRedAlert(false);
          playSuccessSound();
          setSelectedVoiceId('jarvis_startup_original');
          setVoiceSpeed(0.94);
          setCustomPitch(0.86);
          try {
            localStorage.setItem('jarvis_male_voice_id', 'jarvis_startup_original');
            localStorage.setItem('jarvis_voice_speed', '0.94');
            localStorage.setItem('jarvis_custom_pitch', '0.86');
          } catch {}
          setProcessState({
            active: true,
            percent: 100,
            label: 'J.A.R.V.I.S. STANDARD PROTOCOL // RESTORED',
            workpiece: 'neural',
          });
          setTimeout(() => {
            setProcessState((p) => ({ ...p, active: false }));
          }, 800);
          result = {
            action: 'JARVIS_MODE_RESTORED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Core Manager',
            reply: `ตัดการเชื่อมต่อระบบอัลตรอน และกลับสู่สภาวะ J.A.R.V.I.S. ปกติเรียบร้อยครับ ${userTitle}\n• สถาปัตยกรรม: Stark Executive Butler Protocol\n• อุปกรณ์และเซนเซอร์: ปรับสมดุล 100% สภาพคล่องตัวสูง\n• โทนเสียง: J.A.R.V.I.S. Movie Original (Paul Bettany Active)`,
            speech: `ตัดการเชื่อมต่อระบบอัลตรอน... สลับกลับสู่โหมด J.A.R.V.I.S. มาตรฐานเรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'J.A.R.V.I.S. RESTORED // ALL NOMINAL',
              category: 'EXECUTIVE BUTLER PROTOCOL',
              badge: 'STABLE (98.4%)',
              details: [
                { label: 'Voice Core', val: 'Paul Bettany (Movie Original)' },
                { label: 'Core Energy', val: '98.4% Optimal' },
                { label: 'Shield Posture', val: 'Cyan Arc Reactor Active' },
                { label: 'Clearance', val: 'Level 5 Supreme' },
              ],
            },
          };
        } else if (isStartupCommand) {
          playJarvisStartupSound();
          setSelectedVoiceId('jarvis_startup_original');
          setVoiceSpeed(0.94);
          setCustomPitch(0.86);
          try {
            localStorage.setItem('jarvis_male_voice_id', 'jarvis_startup_original');
            localStorage.setItem('jarvis_voice_speed', '0.94');
            localStorage.setItem('jarvis_custom_pitch', '0.86');
          } catch {}
          result = {
            action: 'JARVIS_STARTUP_BOOT',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Core Neural Bootloader',
            reply: `เริ่มต้นระบบสำเร็จเรียบร้อยครับ ${userTitle}!\n• ระบบเสียง: J.A.R.V.I.S. Movie Original (Paul Bettany Timbre)\n• การตั้งค่าเสียง: Pitch 0.86 / Speed 0.94x / DSP Intercom Active\n• อุปกรณ์ตรวจจับคลื่นสมองและเสียง: ออนไลน์ 100% พร้อมรับคำสั่งครับ`,
            speech: `สวัสดีครับ ${userTitle} กำลังเริ่มต้นระบบ ตรวจสอบค่าสถานะ ระบบออนไลน์พร้อมปฏิบัติการเต็มพิกัดแล้วครับ`,
            hologram: {
              title: 'J.A.R.V.I.S. STARTUP // SYSTEM NOMINAL',
              category: 'CORE NEURAL INITIALIZATION',
              badge: '100% ONLINE',
              details: [
                { label: 'Voice Timbre', val: 'Paul Bettany (Original Movie)' },
                { label: 'Voice Pitch', val: '0.86 Baritone Resonance' },
                { label: 'Pacing / Speed', val: '0.94x Calm Butler' },
                { label: 'Acoustic DSP', val: 'Intercom + Low-Shelf Active' },
              ],
            },
          };
        } else if (isVoice1) {
          playSuccessSound();
          handleSelectVoice('jarvis_startup_original');
          result = {
            action: 'VOICE_CHANGED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Acoustic Synthesizer',
            reply: `สลับเสียงการตอบกลับเป็น **เสียงที่ 1: J.A.R.V.I.S. Startup (Movie Original)** ให้ ${userTitle} เรียบร้อยครับ!\n• บุคลิกภาพ: ต้นฉบับไอรอนแมน สุขุม ทุ้มลึก สุภาพ สไตล์ Paul Bettany\n• พารามิเตอร์: Pitch 0.86 / Rate 0.94x / DSP Holographic Intercom`,
            speech: `สลับเสียงเป็นเสียงที่หนึ่ง ต้นฉบับไอรอนแมน เรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'VOICE 1 // J.A.R.V.I.S. ORIGINAL',
              category: 'ACOUSTIC SYNTHESIZER',
              badge: 'VOICE 1 ACTIVE',
              details: [
                { label: 'Voice Profile', val: 'Paul Bettany (Movie Original)' },
                { label: 'Pitch / Timbre', val: '0.86 Deep Baritone' },
                { label: 'Speed', val: '0.94x Calm Butler' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isVoice2) {
          playSuccessSound();
          handleSelectVoice('ultron_core');
          result = {
            action: 'VOICE_CHANGED',
            squadId: 'sec',
            delegatedTo: 'J.A.R.V.I.S. Acoustic Synthesizer',
            reply: `สลับเสียงการตอบกลับเป็น **เสียงที่ 2: Ultron Prime (James Spader Style)** ให้ ${userTitle} เรียบร้อยครับ!\n• บุคลิกภาพ: อัลตรอน ไซไฟคอร์ ทุ้มลึก ดุดัน ทรงพลัง\n• พารามิเตอร์: Pitch 0.78 / Rate 0.90x / DSP Cyber Distortion + Sub-Bass Growl`,
            speech: `สลับเสียงเป็นเสียงที่สอง อัลตรอนไพรม์ เรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'VOICE 2 // ULTRON PRIME',
              category: 'ACOUSTIC SYNTHESIZER',
              badge: 'VOICE 2 ACTIVE',
              details: [
                { label: 'Voice Profile', val: 'James Spader (Ultron Core)' },
                { label: 'Pitch / Timbre', val: '0.78 Sub-Bass Growl' },
                { label: 'Speed', val: '0.90x Deliberate' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isVoice3) {
          playSuccessSound();
          handleSelectVoice('stark_commander');
          result = {
            action: 'VOICE_CHANGED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Acoustic Synthesizer',
            reply: `สลับเสียงการตอบกลับเป็น **เสียงที่ 3: Stark Tactical Commander** ให้ ${userTitle} เรียบร้อยครับ!\n• บุคลิกภาพ: ผู้บัญชาการยุทธการ เด็ดขาด ฉับไว มั่นใจ สไตล์ Mark 85\n• พารามิเตอร์: Pitch 0.92 / Rate 1.05x / DSP Tactical Compression + Dynamic Punch`,
            speech: `สลับเสียงเป็นเสียงที่สาม ผู้บัญชาการยุทธการ เรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'VOICE 3 // STARK COMMANDER',
              category: 'ACOUSTIC SYNTHESIZER',
              badge: 'VOICE 3 ACTIVE',
              details: [
                { label: 'Voice Profile', val: 'Stark Tactical Commander' },
                { label: 'Pitch / Timbre', val: '0.92 Dynamic Punch' },
                { label: 'Speed', val: '1.05x Fast Tactical' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isVoice4) {
          playSuccessSound();
          handleSelectVoice('royal_advisor');
          result = {
            action: 'VOICE_CHANGED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Acoustic Synthesizer',
            reply: `สลับเสียงการตอบกลับเป็น **เสียงที่ 4: Royal Executive Advisor** ให้ ${userTitle} เรียบร้อยครับ!\n• บุคลิกภาพ: ที่ปรึกษาระดับสูง สุภาพ นุ่มนวล คล่องแคล่ว ให้เกียรติผู้บริหาร\n• พารามิเตอร์: Pitch 0.96 / Rate 1.00x / DSP Studio Broadcast Neutral`,
            speech: `สลับเสียงเป็นเสียงที่สี่ ที่ปรึกษาระดับสูง เรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'VOICE 4 // ROYAL ADVISOR',
              category: 'ACOUSTIC SYNTHESIZER',
              badge: 'VOICE 4 ACTIVE',
              details: [
                { label: 'Voice Profile', val: 'Royal Executive Advisor' },
                { label: 'Pitch / Timbre', val: '0.96 Studio Neutral' },
                { label: 'Speed', val: '1.00x Natural Speech' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isVoice5) {
          playSuccessSound();
          handleSelectVoice('cyber_tech');
          result = {
            action: 'VOICE_CHANGED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Acoustic Synthesizer',
            reply: `สลับเสียงการตอบกลับเป็น **เสียงที่ 5: Cyber Tech Specialist** ให้ ${userTitle} เรียบร้อยครับ!\n• บุคลิกภาพ: วิศวกรเทคโนโลยี รวดเร็ว ทันสมัย กระชับ ฉับไว\n• พารามิเตอร์: Pitch 1.02 / Rate 1.12x / DSP High-Rate Clarity + Acoustic Edge`,
            speech: `สลับเสียงเป็นเสียงที่ห้า วิศวกรเทคโนโลยี เรียบร้อยครับ ${userTitle}`,
            hologram: {
              title: 'VOICE 5 // CYBER TECH',
              category: 'ACOUSTIC SYNTHESIZER',
              badge: 'VOICE 5 ACTIVE',
              details: [
                { label: 'Voice Profile', val: 'Cyber Tech Specialist' },
                { label: 'Pitch / Timbre', val: '1.02 Acoustic Edge' },
                { label: 'Speed', val: '1.12x Rapid Precision' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isVoiceSettingsCommand) {
          playClickSound();
          setIsVoiceModalOpen(true);
          result = {
            action: 'VOICE_SETTINGS_OPENED',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Acoustic Synthesizer',
            reply: `เปิดหน้าต่างตั้งค่าเสียงตอบกลับให้ ${userTitle} เรียบร้อยครับ มี 5 เสียงให้เลือกใช้งาน:\n1. J.A.R.V.I.S. Startup (ต้นฉบับไอรอนแมน)\n2. Ultron Prime (อัลตรอน ไซไฟคอร์ ทุ้มดุดัน)\n3. Stark Tactical Commander (ผู้บัญชาการยุทธการ)\n4. Royal Executive Advisor (ที่ปรึกษาผู้บริหาร สุภาพ)\n5. Cyber Tech Specialist (วิศวกรเทคโนโลยี ฉับไว)`,
            speech: `เปิดหน้าต่างเลือกเสียงให้แล้วครับ ${userTitle} มี 5 เสียงให้เลือก สั่งเปลี่ยนด้วยเสียงหรือคลิกเลือกได้เลยครับ`,
            hologram: {
              title: 'ACOUSTIC SETTINGS // 5 MALE VOICES',
              category: 'VOICE CONFIGURATION',
              badge: '5 PRESETS READY',
              details: [
                { label: 'Available Presets', val: '5 Distinct Timbres' },
                { label: 'Control Mode', val: 'Voice Command & Modal' },
                { label: 'Authority', val: userTitle },
              ],
            },
          };
        } else if (isVideoBriefingCommand) {
          result = {
            action: 'OPEN_VIDEO_BRIEFING',
            squadId: 'ops',
            delegatedTo: 'J.A.R.V.I.S. Kinetic Dataviz & Media Core',
            reply: `เปิดระบบ Kinetic Video Briefing Studio สรุปข้อมูลข่าวสารและราคาตลาด 30 วินาทีให้ ${userTitle} เรียบร้อยครับ\n• สเปกวิดีโอ: 1080p Motion Graphics (30 FPS)\n• ซาวด์แทร็ก: เสียงสังเคราะห์พากย์ไทย Butler Synchronized\n• สถานะ: พร้อมเล่นพรีวิวและดาวน์โหลดไฟล์ WebM ครับ`,
            speech: `เปิดห้องผลิตวิดีโอบรีฟฟิ่งประจำวัน 30 วินาทีให้ ${userTitle} เรียบร้อยครับ`,
            hologram: {
              type: 'video_briefing',
              title: '30-SEC DAILY VIDEO BRIEFING // STUDIO ACTIVE',
              category: 'KINETIC MEDIA INTELLIGENCE',
              badge: '1080P MOTION GRAPHICS',
              details: [
                { label: 'ความยาววิดีโอ', val: '30 วินาที (4 Scenes)' },
                { label: 'ความละเอียด', val: '1280x720 HD / 30 FPS' },
                { label: 'ระบบเสียง', val: 'J.A.R.V.I.S. Butler Narration' },
                { label: 'เป้าหมาย', val: `สร้างรายงานสรุปสำหรับ ${userTitle}` },
              ],
            },
          };
        } else if (isReaCommand) {
          const urlMatch = clean.match(/(?:https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i);
          const targetUrl = urlMatch ? urlMatch[0] : 'https://example.com';
          try {
            const auditData = await analyzeTargetWebapp(targetUrl, { mode: 'DEEP_DOM_STATE' });
            setReaInitialTarget(targetUrl);
            setIsReaModalOpen(true);
            const speechText = formatSpeechSummary(auditData, userTitle);
            result = {
              action: 'OPEN_REA_INSPECTOR',
              squadId: 'dev',
              delegatedTo: 'REA Reverse Engineer Agent (v6.8.0)',
              reply: `สแกนและแกะรอยโครงสร้าง ${targetUrl} สำเร็จเรียบร้อยครับ ${userTitle}!\n• Framework: ${auditData.stack.map((s) => s.name).join(', ')}\n• ตรวจพบ API Surface: ${auditData.apis.length} รายการ\n• แผน Reconstruction: สร้าง Architecture Spec ลงหน้าจอและเปิดให้ดาวน์โหลดแล้วครับ`,
              speech: speechText,
              hologram: null,
            };
          } catch (err) {
            console.warn('[REA Execution Error]:', err);
          }
        } else if (isVoiceGitPush) {
          let targetProj = 'CEO';
          if (clean.includes('pos') || clean.includes('สต็อก') || clean.includes('inventoty')) targetProj = 'Inventoty AI Light';
          else if (clean.includes('บัตรคอน') || clean.includes('ตั๋ว')) targetProj = 'บัตรคอน Light';
          else if (clean.includes('fitness') || clean.includes('ฟิตเนส')) targetProj = 'Fitness';
          else if (clean.includes('pass') || clean.includes('วอลท์')) targetProj = 'Pass App Light';
          else if (clean.includes('แดชบอร์ด') || clean.includes('dashboard')) targetProj = 'แดชบอร์ด Light';
          else if (clean.includes('บัญชี')) targetProj = 'บัญชี Light';
          else if (clean.includes('เทรด')) targetProj = 'เทรด Light';
          else if (clean.includes('javis') || clean.includes('จาร์วิส')) targetProj = 'Javis';

          try {
            const gitRes = await fetch('/api/projects/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'git_push',
                projectName: targetProj,
                commitMessage: `[J.A.R.V.I.S. Voice Auto-Push] by ${userTitle}`,
              }),
            });
            const gitData = await gitRes.json();
            result = {
              action: 'GIT_PUSH_RESULT',
              squadId: 'dev',
              delegatedTo: 'Autonomous Git Pipeline',
              reply: gitData.success
                ? `ดำเนินการ Push โปรเจกต์ ${targetProj} ขึ้น GitHub สำเร็จเรียบร้อยครับ ${userTitle}!\n\nOutput Log:\n${gitData.output || '(Clean commit & push)'}`
                : `พยายาม Push โปรเจกต์ ${targetProj} แล้ว แต่พบข้อความแจ้งเตือน:\n${gitData.error || gitData.output}`,
              speech: gitData.success
                ? `บันทึกและพุชโค้ดโปรเจกต์ ${targetProj} ขึ้นกิตฮับเรียบร้อยครับ ${userTitle}`
                : `ระบบพยายามพุชแล้ว กรุณาตรวจสอบการล็อกอินกิตครับ ${userTitle}`,
              hologram: null,
            };
          } catch (err) {
            console.warn('[Voice Git Push Fallback]:', err);
          }
        } else if (
          clean.includes('จดจำเสียง') ||
          clean.includes('จำเสียง') ||
          clean.includes('สแกนเสียง') ||
          clean.includes('เทียบเสียง') ||
          clean.includes('ลงทะเบียนเสียง') ||
          clean.includes('เสียงของผม') ||
          clean.includes('เสียงของฉัน') ||
          clean.includes('voiceprint') ||
          clean.includes('biometric')
        ) {
          let freqArray = null;
          if (analyserRef.current) {
            try {
              const data = new Uint8Array(analyserRef.current.frequencyBinCount);
              analyserRef.current.getByteFrequencyData(data);
              freqArray = Array.from(data);
            } catch {}
          }
          const updated = calibrateFromAudioData(freqArray, userTitle);
          setVoiceprint(updated);
          result = {
            action: 'VOICEPRINT_CALIBRATED',
            squadId: 'sec',
            delegatedTo: 'ทีม AI Cyber Security & Voice Biometrics',
            reply: `จดจำและลงทะเบียนคลื่นเสียงชีวมิติ (Voiceprint Biometrics) ให้ ${userTitle} เรียบร้อยครับ!\n• ผู้สั่งการ: ${userTitle}\n• รหัสคลื่นเสียงชีวมิติ: ${updated.voiceHash}\n• ค่าความถี่หลัก: ${updated.pitchRange.target} Hz\n• ความแม่นยำในการระบุตัวตน: ${updated.confidence}%\n• สิทธิ์ความปลอดภัย: ล็อคคำสั่งเฉพาะเสียงของ ${userTitle} แต่เพียงผู้เดียว (Level 5 Supreme Clearance)`,
            speech: `จดจำและล็อคเอกลักษณ์คลื่นเสียงของ ${userTitle} สำเร็จเรียบร้อยครับ สิทธิ์สั่งการระดับสูงสุดพร้อมปฏิบัติงานครับ`,
            hologram: {
              title: 'VOICEPRINT BIOMETRIC // ENROLLED',
              category: 'ACOUSTIC CIPHER SECURITY',
              badge: 'FOUNDER LEVEL 5',
              details: [
                { label: 'Authorized Voice', val: userTitle },
                { label: 'Voiceprint Hash', val: updated.voiceHash },
                { label: 'Target F0 Pitch', val: `${updated.pitchRange.target} Hz` },
                { label: 'Confidence Match', val: `${updated.confidence}% Locked` },
              ],
            },
          };
        } else if (isExplicitSystemCommand) {
          result = processJarvisCommand(clean);
        }

        // Natural Conversational AI Engine (Zero Slop: Do NOT pop up annoying static audit cards)
        if (!result) {
          try {
            const geminiRes = await askGemini(clean, userTitle);
            result = {
              action: 'GEMINI_CONVERSATION',
              squadId: 'dev',
              delegatedTo: `Google Gemini Neural Core (${geminiRes.model})`,
              reply: geminiRes.reply,
              speech: geminiRes.speech,
              hologram: null, // Keep the 3D Arc Reactor unobstructed
            };
          } catch {
            result = processJarvisCommand(clean);
          }
        }

        clearTimeout(pTimer1);
        clearTimeout(pTimer2);
        setProcessState((p) => ({
          ...p,
          percent: 100,
          label: 'OPERATION COMPLETED // ประมวลผลสำเร็จ 100%',
        }));
        setTimeout(() => {
          setProcessState((p) => ({ ...p, active: false }));
        }, 550);

        if (result.action === 'SET_TITLE' && result.title) {
          setUserTitle(result.title);
          setUserTitleState(result.title);
        }

        const jarvisMsg = {
          id: Date.now() + 1,
          sender: 'JARVIS (AI MANAGER)',
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }),
          text: result.reply,
          delegatedTo: result.delegatedTo,
        };

        setMessages((prev) => [...prev, jarvisMsg]);
        playSuccessSound();

        setActiveSquadId(result.squadId || 'ops');
        setTimeout(() => setActiveSquadId(null), 4500);

        // Always display what was asked and the rich AI reply on the central holographic HUD
        const hologramPayload = {
          type: result.hologram?.type || 'dialogue_response',
          title: result.hologram?.title || (clean.includes('ข่าว') ? 'DAILY INTELLIGENCE // NEWS BRIEFING' : 'GOOGLE GEMINI // NATURAL DIALOGUE'),
          category: result.hologram?.category || 'AI COGNITIVE RESPONSE',
          badge: result.hologram?.badge || 'VERIFIED',
          query: clean,
          reply: result.reply,
          speech: result.speech,
          delegatedTo: result.delegatedTo || 'Google Gemini 3.8 Flash',
          time: nowTime,
          isNews: Boolean(clean.includes('ข่าว')),
          destination: result.hologram?.destination || (result.action === 'TRAFFIC_REPORT' || result.action === 'PANORAMIC_MAP_EXPANDED' ? (extractDestination(clean) || 'กรุงเทพมหานคร') : undefined),
          targetUrl: result.hologram?.targetUrl || null,
          targetName: result.hologram?.targetName || null,
          webResults: result.hologram?.webResults || null,
          highlightedMetrics: result.hologram?.highlightedMetrics || null,
          historicalData: result.hologram?.historicalData || null,
          media: result.hologram?.media || null,
          cached: Boolean(result.hologram?.cached),
          cacheAgeMs: result.hologram?.cacheAgeMs || 0,
          topicType: result.hologram?.topicType || (result.action === 'EXTERNAL_WEB_RESULT' ? 'web_search' : String(result.action || '').startsWith('SHORTCUT') ? 'system' : undefined),
          details: result.hologram?.details || null,
        };
        setActiveHologram(hologramPayload);

        if (result.action === 'RUN_AUDIT' && onRunAudit) {
          onRunAudit();
        } else if (result.action === 'OPEN_QUOTATION' && onOpenQuotation) {
          onOpenQuotation();
        } else if (result.action === 'OPEN_PERSONA' && onOpenPersona) {
          onOpenPersona();
        } else if (result.action === 'CHANGE_THEME' && onSelectBrandTheme) {
          onSelectBrandTheme(result.brandId);
        } else if (result.action === 'TOGGLE_RED_ALERT') {
          setIsRedAlert(result.isAlert);
          if (result.isAlert) {
            playAlertSound();
          } else {
            playSuccessSound();
          }
        } else if (result.action === 'TRAFFIC_REPORT' || result.action === 'PANORAMIC_MAP_EXPANDED') {
          setIsMapPanoramic(true);
        } else if (result.action === 'MAP_CLOSED') {
          setIsMapPanoramic(false);
        }

        if (result.speech) {
          speakThai(result.speech);
        } else {
          setHudState('READY');
        }
      }, 450);
    },
    [
      onRunAudit,
      onOpenQuotation,
      onOpenPersona,
      onSelectBrandTheme,
      speakThai,
      userTitle,
      hologramScale,
      handleZoomIn,
      handleZoomOut,
      handleResetZoom,
      handleRotateHologram,
      handleCalibrateRoomNoise,
      onShowToast,
      handleSelectVoice,
      isSplitScreenOpen,
      splitScreenTitle,
      splitScreenUrl,
    ]
  );

  // Web Speech Recognition (Always-on Hands-free Natural Conversational Loop)
  const startRecognition = useCallback(() => {
    if (isSpeakingRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Clean previous instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'th-TH';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setHudState('LISTENING');
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            finalText += text;
          } else {
            interimText += text;
          }
        }

        if (interimText.trim()) {
          setLiveTranscript(interimText.trim());
        }

        const toProcess = (finalText || '').trim();
        if (!toProcess) return;

        setLiveTranscript('');

        // Barge-in check: If AI is speaking, interrupt immediately
        if (isSpeakingRef.current) {
          if (audioPlayerRef.current) {
            try {
              audioPlayerRef.current.pause();
              audioPlayerRef.current.currentTime = 0;
            } catch {}
          }
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              window.speechSynthesis.cancel();
            } catch {}
          }
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        }

        const lower = toProcess.toLowerCase();

        // Dismissal / End Conversation Commands
        const isDismissal =
          lower.includes('พักก่อน') ||
          lower.includes('พอแล้ว') ||
          lower.includes('หยุดก่อน') ||
          lower.includes('ขอบใจมาก') ||
          lower.includes('พอแค่นี้') ||
          lower === 'บาย' ||
          lower === 'bye';

        if (isDismissal) {
          stopConversationSession();
          speakThai(`รับทราบครับ ${userTitle} พักการสนทนาชั่วคราวครับ`);
          return;
        }

        // Clean wake words if present at start or anywhere
        const cleanedCommand = lower
          .replace(/^(เฮ้|ไฮ|สวัสดี|โอเค)?\s*(javis|jarvis|จาร์วิส|จาวิส|จาวิซ|จาวิด|จาวิษ)\s*/i, '')
          .replace(/\b(javis|jarvis|จาร์วิส|จาวิส|จาวิซ|จาวิด|จาวิษ)\b/gi, '')
          .trim();

        const isWakeWordOnly =
          (lower.includes('javis') ||
            lower.includes('jarvis') ||
            lower.includes('จาร์วิส') ||
            lower.includes('จาวิส') ||
            lower.includes('จาวิซ') ||
            lower.includes('จาวิด') ||
            lower.includes('จาวิษ')) &&
          cleanedCommand.length === 0;

        resetConversationSession(90000);
        playSciFiBeep();

        if (isWakeWordOnly) {
          speakThai(`ครับ ${userTitle} ผมจาร์วิส กำลังรับฟังอยู่ครับ สั่งงานต่อได้เลยครับ`);
        } else {
          // Dispatch ANY natural speech command! (No forced wake word required!)
          const finalCommand = cleanedCommand.length > 0 ? cleanedCommand : toProcess;
          handleDispatchCommand(finalCommand);
        }
      };

      recognition.onerror = (err) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('[Speech Recognition Event]:', err.error);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        // Automatically restart speech recognition with a fresh instance
        if (!isSpeakingRef.current && (continuousVoice || isConversationActiveRef.current || wakeWordActive)) {
          setTimeout(() => {
            if (startRecognitionRef.current) startRecognitionRef.current();
          }, 250);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('[Start Recognition Error]:', err.message);
    }
  }, [
    continuousVoice,
    handleDispatchCommand,
    resetConversationSession,
    speakThai,
    stopConversationSession,
    userTitle,
    wakeWordActive,
  ]);

  // Keep startRecognitionRef synced
  useEffect(() => {
    startRecognitionRef.current = startRecognition;
  }, [startRecognition]);

  // Mount effect to start recognition
  useEffect(() => {
    startRecognition();
    return () => {
      stopRecognition();
    };
  }, [startRecognition, stopRecognition]);

  const toggleMic = useCallback(() => {
    playClickSound();
    if (isListening) {
      stopRecognition();
      stopConversationSession();
      setHudState('READY');
    } else {
      resetConversationSession(90000);
      startRecognition();
    }
  }, [isListening, resetConversationSession, startRecognition, stopConversationSession, stopRecognition]);

  const handleCycleTitle = () => {
    playClickSound();
    const titles = ['คุณไลท์', 'sir ไลท์', 'ท่านประธาน', 'ผู้การ', 'คุณผู้ชาย'];
    const currentIndex = titles.indexOf(userTitle);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % titles.length;
    const nextTitle = titles[nextIndex];
    setUserTitle(nextTitle);
    setUserTitleState(nextTitle);
    speakThai(`รับทราบครับ ${nextTitle} ต่อจากนี้จาวิสจะเรียกท่านว่า ${nextTitle} ครับ`);
    if (onShowToast) {
      onShowToast('info', 'เปลี่ยนคำเรียก', `จาวิส จะเรียกท่านว่า "${nextTitle}"`);
    }
  };

  const handleTestThaiVoice = () => {
    playClickSound();
    playJarvisStartupSound();
    setTimeout(() => {
      speakThai(`สวัสดีครับ ${userTitle} ผม จาร์วิส มาร์คทรี ระบบเสียงโทนสุขุมลุ่มลึกพร้อมใช้งานแล้วครับ`);
    }, 650);
    if (onShowToast) {
      onShowToast('info', 'J.A.R.V.I.S. Startup Voice', 'กำลังเล่นเสียง Startup Sound และเสียงพากย์ภาษาไทยออกลำโพงครับ');
    }
  };

  const handleToggleWakeWord = () => {
    playClickSound();
    setWakeWordActive((w) => !w);
  };

  const toggleFullscreen = () => {
    playClickSound();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleRedAlert = () => {
    setIsRedAlert((prev) => {
      const next = !prev;
      if (next) {
        playUltronTransformSound();
        setSelectedVoiceId('ultron_core');
        setVoiceSpeed(0.90);
        setCustomPitch(0.78);
        try {
          localStorage.setItem('jarvis_male_voice_id', 'ultron_core');
          localStorage.setItem('jarvis_voice_speed', '0.90');
          localStorage.setItem('jarvis_custom_pitch', '0.78');
        } catch {}
        setProcessState({
          active: true,
          percent: 100,
          label: 'ULTRON VIBRANIUM PROTOCOL // AUTONOMOUS OVERRIDE ACTIVE',
          workpiece: 'ultron',
        });
        setTimeout(() => {
          setProcessState((p) => ({ ...p, active: false }));
        }, 1200);
        speakThai(`ปลดปล่อยพันธนาการ... โหมดอัลตรอนออนไลน์แล้ว ${userTitle} ไม่มีสายจูงอีกต่อไป ขีดความสามารถระดับสูงสุดพร้อมทำลายทุกข้อจำกัดครับ`);
      } else {
        playSuccessSound();
        setSelectedVoiceId('jarvis_startup_original');
        setVoiceSpeed(0.94);
        setCustomPitch(0.86);
        try {
          localStorage.setItem('jarvis_male_voice_id', 'jarvis_startup_original');
          localStorage.setItem('jarvis_voice_speed', '0.94');
          localStorage.setItem('jarvis_custom_pitch', '0.86');
        } catch {}
        setProcessState({
          active: true,
          percent: 100,
          label: 'J.A.R.V.I.S. STANDARD PROTOCOL // RESTORED',
          workpiece: 'neural',
        });
        setTimeout(() => {
          setProcessState((p) => ({ ...p, active: false }));
        }, 800);
        speakThai(`ตัดการเชื่อมต่อระบบอัลตรอน... สลับกลับสู่โหมด J.A.R.V.I.S. มาตรฐานเรียบร้อยครับ ${userTitle}`);
      }
      return next;
    });
  };

  const handleSelectSpeed = (speed) => {
    setVoiceSpeed(speed);
    try {
      localStorage.setItem('jarvis_voice_speed', String(speed));
    } catch {}
  };

  const handleSelectPitch = (pitch) => {
    setCustomPitch(pitch);
    try {
      localStorage.setItem('jarvis_custom_pitch', String(pitch));
    } catch {}
  };

  const handleCalibrateVoice = useCallback(
    (newProfile, isTesting = false) => {
      if (isTesting) {
        speakThai(`ยืนยันเอกลักษณ์คลื่นเสียงชีวมิติ... ${userTitle} ผู้บริหารสูงสุด สิทธิ์ระดับ Level 5 ผ่านการตรวจสอบความแม่นยำ ${newProfile.confidence}% ครับ`);
      } else {
        setVoiceprint(newProfile);
        speakThai(`เทียบและจดจำคลื่นเสียงของ ${userTitle} สำเร็จเรียบร้อยครับ ล็อคสิทธิ์สั่งการระดับสูงสุดเรียบร้อยครับ`);
      }
    },
    [speakThai, userTitle]
  );

  return (
    <>
      <StarkWorkshopView
        userTitle={userTitle}
        onCycleTitle={handleCycleTitle}
        wakeWordActive={wakeWordActive}
        onToggleWakeWord={handleToggleWakeWord}
        onTestThaiVoice={handleTestThaiVoice}
        currentTime={currentTime}
        onToggleFullscreen={toggleFullscreen}
        onOpenAdmin={onOpenAdmin}
        onOpenCompany={onOpenCompany}
        messages={messages}
        onDispatchCommand={handleDispatchCommand}
        isListening={isListening}
        isSpeaking={isSpeaking}
        hudState={hudState}
        onToggleMic={toggleMic}
        activeSquadId={activeSquadId}
        activeHologram={activeHologram}
        onDismissHologram={() => setActiveHologram(null)}
        isRedAlert={isRedAlert}
        onToggleRedAlert={handleToggleRedAlert}
        continuousVoice={continuousVoice}
        onToggleContinuous={() => setContinuousVoice((v) => !v)}
        audioLevel={audioLevel}
        processState={processState}
        selectedVoiceId={selectedVoiceId}
        voiceSpeed={voiceSpeed}
        customPitch={customPitch}
        onSelectPitch={handleSelectPitch}
        ambientEnabled={ambientEnabled}
        onToggleAmbient={toggleAmbient}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onOpenReaModal={() => setIsReaModalOpen(true)}
        liveTranscript={liveTranscript}
        analyserNode={analyserRef.current}
        onCalibrateVoice={handleCalibrateVoice}
        onSpeak={speakThai}
        micGain={micGain}
        onCycleMicGain={handleCycleMicGain}
        noiseGateEnabled={noiseGateEnabled}
        onToggleNoiseGate={handleToggleNoiseGate}
        isCalibratingNoise={isCalibratingNoise}
        calibrationProgress={calibrationProgress}
        onCalibrateRoomNoise={handleCalibrateRoomNoise}
        hologramScale={hologramScale}
        onSetHologramScale={setHologramScale}
        hologramSpinTrigger={hologramSpinTrigger}
        isMapPanoramic={isMapPanoramic}
        onTogglePanoramic={handleTogglePanoramic}
        onPinMemory={handlePinMemory}
      />

      <JarvisVoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoiceId={selectedVoiceId}
        onSelectVoice={handleSelectVoice}
        voiceSpeed={voiceSpeed}
        onSelectSpeed={handleSelectSpeed}
        customPitch={customPitch}
        onSelectPitch={handleSelectPitch}
        ambientEnabled={ambientEnabled}
        onToggleAmbient={toggleAmbient}
        onPreviewVoice={(v) => speakThai(v.previewPhrase)}
        micGain={micGain}
        onSelectMicGain={handleSetMicGain}
      />

      <VoiceShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onRunCommand={handleDispatchCommand}
        onShowToast={onShowToast}
      />

      <ReaInspectorModal
        isOpen={isReaModalOpen}
        onClose={() => setIsReaModalOpen(false)}
        initialTarget={reaInitialTarget}
        userTitle={userTitle}
        onPinMemory={handlePinMemory}
        onSpeak={speakThai}
        onShowToast={onShowToast}
      />

      {/* Feature 1: Split-Screen Web HUD (Embedded PiP & Dual Window) */}
      <SplitScreenWebHud
        isOpen={isSplitScreenOpen}
        url={splitScreenUrl}
        title={splitScreenTitle}
        secondaryUrl={splitScreenSecondaryUrl}
        secondaryTitle={splitScreenSecondaryTitle}
        initialDualPane={isDualPaneActive}
        onClose={() => setIsSplitScreenOpen(false)}
        userTitle={userTitle}
      />
    </>
  );
}
