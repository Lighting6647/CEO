import { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

export function PwaInstallPrompt({ onShowToast }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    playClickSound();
    if (!deferredPrompt) {
      if (onShowToast) {
        onShowToast(
          'info',
          'วิธีติดตั้งแอป',
          'บนคอมพิวเตอร์: คลิกไอคอน Install App (รูปจอคอมฯ) ที่มุมขวาของแถบ Address Bar ใน Chrome'
        );
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      playSuccessSound();
      if (onShowToast) {
        onShowToast('success', 'ติดตั้งสำเร็จ', 'ติดตั้ง CEO Master Platform เป็นแอปพลิเคชัน Standalone แล้ว');
      }
    }
    setDeferredPrompt(null);
  };

  if (isDismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
      <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md">
        <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-400">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-white">ติดตั้ง CEO Master Platform</p>
          <p className="text-[11px] text-slate-400">เปิดใช้งานเสมือนแอป Desktop / Mobile รวดเร็ว ไม่ต้องพิมพ์ URL</p>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Download className="h-3.5 w-3.5" />
          ติดตั้ง
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          title="ปิด"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
