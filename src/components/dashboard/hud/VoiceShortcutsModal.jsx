import { useEffect, useState } from 'react';
import { X, Zap, Trash2, Plus } from 'lucide-react';
import { playClickSound, playSuccessSound } from '../../../utils/soundEffects';
import { getShortcuts, addShortcut, removeShortcut } from '../../../services/voiceShortcutService';

/**
 * Voice Command Shortcut Manager
 * Lists personal shortcuts, and allows adding / deleting without voice.
 */
export function VoiceShortcutsModal({ isOpen, onClose, onRunCommand, onShowToast }) {
  const [list, setList] = useState([]);
  const [trigger, setTrigger] = useState('');
  const [command, setCommand] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setList(getShortcuts());
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    const res = addShortcut(trigger, command);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    playSuccessSound();
    setList(getShortcuts());
    setTrigger('');
    setCommand('');
    setError('');
    onShowToast?.(`⚡ บันทึกคำสั่งลัด “${res.shortcut.trigger}” แล้ว`);
  };

  const handleRemove = (key, label) => {
    playClickSound();
    removeShortcut(key);
    setList(getShortcuts());
    onShowToast?.(`ลบคำสั่งลัด “${label}” แล้ว`);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-shortcuts-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-cyan-500/50 bg-[#020b22] p-5 shadow-[0_0_50px_rgba(0,240,255,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
          <h2 id="voice-shortcuts-title" className="flex items-center gap-2 text-sm font-bold text-cyan-100 font-mono tracking-wide">
            <Zap className="h-4 w-4 text-amber-300" />
            คำสั่งลัดด้วยเสียง (Voice Shortcuts)
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="rounded-lg border border-slate-700 bg-slate-900 p-1 text-slate-400 hover:text-white hover:border-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="space-y-2 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2">
            <input className={inputCls} value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="พูดสั้น ๆ เช่น ไปออฟฟิศ" maxLength={40} aria-label="คำสั่งลัด" />
            <input className={inputCls} value={command} onChange={(e) => setCommand(e.target.value)} placeholder="คำสั่งเต็ม เช่น สภาพจราจรไปสาทรตอนนี้" maxLength={200} aria-label="คำสั่งเต็ม" />
          </div>
          {error && <p className="text-[11px] text-red-400" role="alert">{error}</p>}
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-cyan-400 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> เพิ่มคำสั่งลัด
          </button>
          <p className="text-[10px] text-slate-500">
            หรือพูดว่า “จำคำสั่ง ไปออฟฟิศ ให้หมายถึง สภาพจราจรไปสาทรตอนนี้” · “ลบคำสั่งลัด ไปออฟฟิศ” · “ดูคำสั่งลัด”
          </p>
        </form>

        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {list.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">ยังไม่มีคำสั่งลัดครับ</p>
          ) : (
            list.map((s) => (
              <div key={s.key} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 hover:border-cyan-500/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-amber-300 truncate">“{s.trigger}”</div>
                  <div className="text-[11px] text-slate-300 truncate">→ {s.command}</div>
                </div>
                <span className="text-[9px] font-mono text-slate-500 shrink-0">ใช้ {s.uses || 0} ครั้ง</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onRunCommand?.(s.command);
                    onClose?.();
                  }}
                  className="rounded-md border border-cyan-500/40 px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 cursor-pointer"
                >
                  รัน
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(s.key, s.trigger)}
                  aria-label={`ลบคำสั่งลัด ${s.trigger}`}
                  className="rounded-md border border-slate-700 p-1 text-slate-400 hover:text-red-400 hover:border-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
