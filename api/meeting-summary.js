// Vercel Serverless Function: Meeting Summarizer
// Ported from D:\AI\Light\Javis (server/meeting.ts)
// Uses Gemini API when GEMINI_API_KEY is configured, with deterministic Thai summary fallback.

import { summarizeMeetingLocally, MAX_TRANSCRIPT_LENGTH } from '../src/utils/meetingEngine.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : '';
    const minutes = Number(body.minutes || 0);

    if (!transcript) {
      return res.status(400).json({ ok: false, error: 'กรุณาระบุบันทึกคำพูดก่อนสรุปการประชุม' });
    }

    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return res.status(413).json({ ok: false, error: 'บันทึกการประชุมยาวเกินขีดจำกัด 80,000 ตัวอักษร' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(200).json({
        ok: true,
        source: 'local-fallback',
        summary: summarizeMeetingLocally(transcript, minutes),
      });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const prompt = [
      'คุณคือ J.A.R.V.I.S. ผู้ช่วยผู้บริหาร จงสรุปบันทึกการประชุมภาษาไทยต่อไปนี้ให้สั้น กระชับ ชัดเจน',
      'แบ่งหัวข้อเป็น: 1) ประเด็นสำคัญ 2) ข้อตกลง/การตัดสินใจ 3) Action Items (ผู้รับผิดชอบ/สิ่งที่จะทำต่อ)',
      '',
      transcript,
    ].join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      return res.status(200).json({
        ok: true,
        source: 'local-fallback',
        warning: `Gemini API HTTP ${response.status}`,
        summary: summarizeMeetingLocally(transcript, minutes),
      });
    }

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return res.status(200).json({
      ok: true,
      source: aiText ? 'gemini-api' : 'local-fallback',
      summary: aiText || summarizeMeetingLocally(transcript, minutes),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'ไม่สามารถสรุปการประชุมได้',
    });
  }
}
