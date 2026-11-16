// Vercel Serverless Function: AI Account & Provider Diagnostics
// Ported from D:\AI\Light\Javis (server/accountMonitor.ts + server/diagnostics.ts)
// Never exposes secret keys; reports readiness, configured models, and runtime diagnostics safely.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const startedAt = Date.now();

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

  const providers = [
    {
      id: 'gemini',
      name: 'Google Gemini API',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      configured: Boolean(geminiKey),
      status: geminiKey ? 'ready' : 'missing_key',
      envVar: 'GEMINI_API_KEY',
      purpose: 'Meeting Summary, Voice Intelligence & Multimodal Analysis',
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude API',
      model: process.env.CLAUDE_MODEL || 'claude-3-7-sonnet',
      configured: Boolean(anthropicKey),
      status: anthropicKey ? 'ready' : 'standby',
      envVar: 'ANTHROPIC_API_KEY',
      purpose: 'Deep Coding Reasoning & Architecture Review',
    },
    {
      id: 'openai',
      name: 'OpenAI / Compatible API',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      configured: Boolean(openaiKey),
      status: openaiKey ? 'ready' : 'standby',
      envVar: 'OPENAI_API_KEY',
      purpose: 'Realtime Speech Transcription & Chat Fallback',
    },
    {
      id: 'line-relay',
      name: 'LINE Messaging Relay',
      model: 'api.line.me/v2/bot',
      configured: Boolean(lineToken),
      status: lineToken ? 'ready' : 'relay_mode',
      envVar: 'LINE_CHANNEL_ACCESS_TOKEN',
      purpose: 'Executive Alert & Slip/Order Notification Relay',
    },
  ];

  const readyCount = providers.filter((p) => p.configured).length;

  return res.status(200).json({
    ok: true,
    service: 'ceo-ai-diagnostics',
    nodeVersion: process.version,
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
    latencyMs: Date.now() - startedAt,
    checkedAt: new Date().toISOString(),
    summary: {
      totalProviders: providers.length,
      configuredCount: readyCount,
      fallbackAvailable: true,
    },
    providers,
  });
}
