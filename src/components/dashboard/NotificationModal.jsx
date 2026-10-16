import { useState, useEffect } from 'react';
import { Send, Bell } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getNotificationConfig, saveNotificationConfig, sendWebhookAlert } from '../../services/notificationService';

export function NotificationModal({ isOpen, onClose, onShowToast }) {
  const [config, setConfig] = useState(getNotificationConfig());
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getNotificationConfig());
    }
  }, [isOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    saveNotificationConfig(config);
    onShowToast('success', 'บันทึกการตั้งค่าแล้ว', 'การตั้งค่าระบบแจ้งเตือนถูกบันทึกสำเร็จ');
    onClose();
  };

  const handleSendTest = async () => {
    setIsSending(true);
    try {
      await sendWebhookAlert(config, {
        title: 'ทดสอบการส่งแจ้งเตือนระบบ Antigravity Quality Gate',
        status: '🟢 ผ่านเกณฑ์ 100% (Production-Ready)',
        health: '99.4%',
        gatesPassed: '48/48 Gates',
        details: 'ระบบแจ้งเตือน Telegram / Webhook เชื่อมต่อสมบูรณ์ พร้อมส่งการแจ้งเตือนแบบเรียลไทม์',
      });
      onShowToast('success', 'ส่งแจ้งเตือนสำเร็จ!', 'ข้อความทดสอบถูกส่งไปยัง Telegram / Webhook เรียบร้อยแล้ว');
    } catch (err) {
      onShowToast('error', 'ส่งแจ้งเตือนล้มเหลว', err.message || 'โปรดตรวจสอบ Token และ Chat ID');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔔 ตั้งค่าระบบแจ้งเตือนอัตโนมัติ (Real-time Alert Bot)" maxWidth="max-w-xl">
      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Info Box */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-3.5 text-cyan-200">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Bell className="h-4 w-4" />
            เชื่อมต่อ Telegram Bot หรือ Webhook สำหรับผู้บริหาร
          </div>
          <p className="mt-1 leading-relaxed text-cyan-200/80">
            ระบบจะส่งสรุปคะแนนคุณภาพ ผลการตรวจสอบ 4 Gates และรายงานข้อผิดพลาดเข้ามือถือผู้บริหารทันทีที่มีการ Deploy หรือเมื่อบิลด์ล้มเหลว
          </p>
        </div>

        {/* Provider Select */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1.5">ช่องทางการแจ้งเตือน (Provider)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfig({ ...config, provider: 'telegram' })}
              className={`rounded-xl border p-2.5 font-bold transition-all ${
                config.provider === 'telegram'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              ✈️ Telegram Bot API
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, provider: 'webhook' })}
              className={`rounded-xl border p-2.5 font-bold transition-all ${
                config.provider === 'webhook'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              🌐 Custom Webhook / Discord
            </button>
          </div>
        </div>

        {/* Telegram Form */}
        {config.provider === 'telegram' ? (
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Telegram Bot Token</label>
              <input
                type="password"
                placeholder="เช่น 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={config.telegramBotToken}
                onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Telegram Chat ID / Group ID</label>
              <input
                type="text"
                placeholder="เช่น -1001234567890 หรือ 987654321"
                value={config.telegramChatId}
                onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <label className="block font-semibold text-slate-300 mb-1">Webhook URL Endpoint</label>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/... หรือ https://hooks.slack.com/..."
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* Options */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoNotify"
            checked={config.autoNotifyOnFailure}
            onChange={(e) => setConfig({ ...config, autoNotifyOnFailure: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
          />
          <label htmlFor="autoNotify" className="text-slate-300 cursor-pointer">
            ส่งแจ้งเตือนอัตโนมัติทันทีหากมี Quality Gate หรือ Service ล้มเหลว
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSending}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5 text-cyan-400" />
            {isSending ? 'กำลังยิงข้อความ...' : 'ทดสอบยิง Alert'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-slate-400 hover:text-white transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-500 transition-all shadow-sm"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
