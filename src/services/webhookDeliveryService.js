/**
 * J.A.R.V.I.S. Webhook & Instant Delivery Service
 * Connects Telegram Bot API, LINE Messaging API, and Custom Webhooks
 * to push 30-sec Daily Video Briefings and Executive Summaries directly to sir ไลท์'s smartphone.
 */

export const WEBHOOK_CONFIG_STORAGE_KEY = 'jarvis_webhook_delivery_config_v1';

export const DEFAULT_WEBHOOK_CONFIG = {
  telegramEnabled: true,
  telegramBotToken: '',
  telegramChatId: '',
  lineEnabled: false,
  lineChannelAccessToken: '',
  lineUserId: '',
  customWebhookUrl: '',
  customWebhookEnabled: false,
  autoSendMorningBriefing: true,
};

let inMemoryConfig = { ...DEFAULT_WEBHOOK_CONFIG };

/**
 * Retrieve current webhook and delivery configuration
 */
export function getWebhookConfig() {
  if (typeof window === 'undefined') return inMemoryConfig;
  try {
    const raw = localStorage.getItem(WEBHOOK_CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WEBHOOK_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_WEBHOOK_CONFIG));
      return DEFAULT_WEBHOOK_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_WEBHOOK_CONFIG, ...parsed };
  } catch {
    return inMemoryConfig;
  }
}

/**
 * Save webhook and delivery configuration
 */
export function saveWebhookConfig(config) {
  const merged = { ...getWebhookConfig(), ...config };
  inMemoryConfig = merged;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WEBHOOK_CONFIG_STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  }
  return merged;
}

/**
 * Send an executive message and summary via Telegram Bot API
 */
export async function sendTelegramBriefing({
  text,
  botToken,
  chatId,
  parseMode = 'Markdown',
  mockDeliver = false,
}) {
  const cleanToken = (botToken || '').trim();
  const cleanChatId = (chatId || '').trim();

  if (!cleanToken || !cleanChatId || mockDeliver) {
    // Simulated sandbox response when credentials are blank or test mode
    return {
      success: true,
      channel: 'telegram',
      simulated: true,
      message: `[จำลองการส่ง Telegram] ส่งข้อความสรุปและวิดีโอบรีฟฟิ่งไปยัง Chat ID: ${cleanChatId || 'Not Configured'} สำเร็จ`,
      timestamp: new Date().toISOString(),
    };
  }

  const endpoint = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: parseMode,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.description || `Telegram API Error (${res.status})`);
    }
    return {
      success: true,
      channel: 'telegram',
      simulated: false,
      messageId: data.result?.message_id,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      channel: 'telegram',
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Send an executive message via LINE Messaging API Push
 */
export async function sendLineBriefing({
  text,
  accessToken,
  userId,
  mockDeliver = false,
}) {
  const cleanToken = (accessToken || '').trim();
  const cleanUserId = (userId || '').trim();

  if (!cleanToken || !cleanUserId || mockDeliver) {
    return {
      success: true,
      channel: 'line',
      simulated: true,
      message: `[จำลองการส่ง LINE] ส่งข้อความสรุปและลิงก์วิดีโอไปยัง LINE User ID: ${cleanUserId || 'Not Configured'} สำเร็จ`,
      timestamp: new Date().toISOString(),
    };
  }

  const endpoint = 'https://api.line.me/v2/bot/message/push';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanToken}`,
      },
      body: JSON.stringify({
        to: cleanUserId,
        messages: [{ type: 'text', text }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`LINE API Error (${res.status}): ${errText}`);
    }

    return {
      success: true,
      channel: 'line',
      simulated: false,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      channel: 'line',
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Send briefing payload to a Custom Webhook (Discord, Slack, n8n, Zapier)
 */
export async function sendCustomWebhook({
  url,
  payload,
  mockDeliver = false,
}) {
  const cleanUrl = (url || '').trim();

  if (!cleanUrl || mockDeliver) {
    return {
      success: true,
      channel: 'custom_webhook',
      simulated: true,
      message: `[จำลองการส่ง Custom Webhook] ยิง Webhook ไปยัง ${cleanUrl || 'Not Configured'} เรียบร้อย`,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return {
      success: res.ok,
      status: res.status,
      channel: 'custom_webhook',
      simulated: false,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      channel: 'custom_webhook',
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Dispatch executive briefing across all configured channels
 */
export async function dispatchExecutiveBriefing({
  notificationText,
  briefingData = null,
  overrideConfig = null,
  forceMock = false,
}) {
  const config = overrideConfig || getWebhookConfig();
  const results = [];

  const textToSend =
    notificationText ||
    `⚡ J.A.R.V.I.S. Executive Daily Briefing\nรายงานสถานะพร้อมทำงาน 100% สำหรับ sir ไลท์`;

  // 1. Telegram
  if (config.telegramEnabled) {
    const res = await sendTelegramBriefing({
      text: textToSend,
      botToken: config.telegramBotToken,
      chatId: config.telegramChatId,
      mockDeliver: forceMock || !config.telegramBotToken,
    });
    results.push(res);
  }

  // 2. LINE
  if (config.lineEnabled) {
    const res = await sendLineBriefing({
      text: textToSend,
      accessToken: config.lineChannelAccessToken,
      userId: config.lineUserId,
      mockDeliver: forceMock || !config.lineChannelAccessToken,
    });
    results.push(res);
  }

  // 3. Custom Webhook
  if (config.customWebhookEnabled && config.customWebhookUrl) {
    const res = await sendCustomWebhook({
      url: config.customWebhookUrl,
      payload: {
        event: 'jarvis.daily_briefing',
        recipient: 'sir ไลท์',
        timestamp: new Date().toISOString(),
        notificationText: textToSend,
        scenesCount: briefingData?.scenes?.length || 4,
      },
      mockDeliver: forceMock,
    });
    results.push(res);
  }

  const overallSuccess = results.length > 0 && results.some((r) => r.success);
  return {
    success: overallSuccess,
    deliveredCount: results.filter((r) => r.success).length,
    results,
    timestamp: new Date().toISOString(),
  };
}
