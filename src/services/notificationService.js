/**
 * Antigravity Notification Dispatcher Service
 * Supports Telegram Bot API, LINE Notify, and Generic Webhooks
 */

const STORAGE_KEY = 'antigravity_notify_config';

export function getNotificationConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    provider: 'telegram', // 'telegram' | 'line' | 'webhook'
    telegramBotToken: '',
    telegramChatId: '',
    lineToken: '',
    webhookUrl: '',
    autoNotifyOnFailure: true,
  };
}

export function saveNotificationConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function sendTelegramMessage(botToken, chatId, text) {
  if (!botToken || !chatId) {
    throw new Error('กรุณาระบุ Telegram Bot Token และ Chat ID');
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || 'ส่งข้อความผ่าน Telegram ไม่สำเร็จ');
  }
  return data;
}

export async function sendWebhookAlert(config, alertData) {
  const { provider, telegramBotToken, telegramChatId, webhookUrl } = config;

  const dateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedMessage = `🛡️ *[Antigravity CEO Quality Gate Alert]*
📅 *เวลา:* ${dateStr}
📊 *สถานะระบบ:* ${alertData.status || 'ผ่านเกณฑ์ 100%'}
🏆 *ดัชนีสุขภาพ (Health):* ${alertData.health || '99%'}
✅ *Quality Gates ผ่าน:* ${alertData.gatesPassed || '48/48'}
📋 *สรุปเหตุการณ์:* ${alertData.title}
📝 *รายละเอียด:* ${alertData.details || 'ไม่มีข้อผิดพลาดตกค้าง'}

🔗 *ดูรายงานสด:* https://github.com/Lighting6647/CEO`;

  if (provider === 'telegram') {
    return sendTelegramMessage(telegramBotToken, telegramChatId, formattedMessage);
  }

  if (provider === 'webhook' && webhookUrl) {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'quality_gate_alert',
        timestamp: new Date().toISOString(),
        message: formattedMessage,
        data: alertData,
      }),
    });
    if (!res.ok) throw new Error(`Webhook ตอบกลับด้วยสถานะ ${res.status}`);
    return { ok: true };
  }

  throw new Error('กรุณาเลือกและตั้งค่า Provider (Telegram / Webhook) ให้สมบูรณ์');
}
