// Vercel Serverless Function: Meeting Audio Transcriber
// Accepts recorded audio (webm/mp4/ogg/wav base64) from MeetingNotesModal
// and transcribes Thai/English speech using Gemini Multimodal API.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64.trim() : '';
    const mimeType = typeof body.mimeType === 'string' && body.mimeType.startsWith('audio/')
      ? body.mimeType.split(';')[0]
      : 'audio/webm';

    if (!audioBase64) {
      return res.status(400).json({ ok: false, error: 'ไม่พบข้อมูลไฟล์เสียงสำหรับถอดความ' });
    }

    if (audioBase64.length > 5_500_000) {
      return res.status(413).json({
        ok: false,
        error: 'ไฟล์เสียงใหญ่เกินขีดจำกัดต่อรอบ (แนะนำอัดช่วงละไม่เกิน 3-5 นาที หรือใช้ Web Speech Live Caption)',
      });
    }

    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!geminiKey) {
      return res.status(200).json({
        ok: false,
        code: 'missing_api_key',
        error: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์ (ยังสามารถใช้ Live Speech Caption, พิมพ์จด และดาวน์โหลดไฟล์เสียงได้ปกติ)',
      });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(25_000),
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: 'ถอดเสียงพูดจากการประชุมนี้เป็นข้อความภาษาไทย (หรืออังกฤษตามที่พูดจริง) แยกเป็นบรรทัดละ 1 ประโยคที่อ่านเข้าใจง่าย ไม่ต้องใส่คำอธิบายเพิ่ม ถ้าไม่มีเสียงพูดให้ตอบว่า "(ไม่มีเสียงพูดในคลิป)"',
                },
                {
                  inlineData: {
                    mimeType,
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      return res.status(200).json({
        ok: false,
        error: `Gemini Audio API HTTP ${response.status}`,
      });
    }

    const data = await response.json();
    const transcript = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return res.status(200).json({
      ok: Boolean(transcript),
      transcript,
      model,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'ไม่สามารถถอดเสียงได้',
    });
  }
}
