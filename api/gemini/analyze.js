// Vercel Serverless Function: /api/gemini/analyze
// Google Gemini Cognitive Bridge for J.A.R.V.I.S. HUD Cloud Deployment

export default async function handler(req, res) {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Resolve parameters (GET query or POST body)
    let prompt = '';
    let context = '';
    let requestedModel = '';
    let clientKey = '';

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      prompt = body.prompt || '';
      context = body.context || '';
      requestedModel = body.model || '';
      clientKey = body.apiKey || '';
    } else {
      prompt = req.query.prompt || '';
      context = req.query.context || '';
      requestedModel = req.query.model || '';
      clientKey = req.query.apiKey || '';
    }

    if (!prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Missing prompt parameter' });
    }

    // 2. Resolve Gemini API Key (Priority: Client request > Environment Variable)
    const apiKey = (
      clientKey ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      ''
    ).trim();

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on Vercel environment variables or passed in request',
      });
    }

    // Ping check shortcut
    if (prompt === 'ping') {
      return res.status(200).json({
        success: true,
        reply: 'J.A.R.V.I.S. Cloud Neural Link: Online and responsive, sir ไลท์.',
        model: 'cloud-serverless',
      });
    }

    // 3. Fallback Model Cascade
    const candidateModels = requestedModel
      ? [requestedModel, 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest']
      : ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];

    const lower = prompt.toLowerCase();
    const isCompanySpecific =
      lower.includes('โปรเจกต์') ||
      lower.includes('project') ||
      lower.includes('บริษัท') ||
      lower.includes('โค้ด') ||
      lower.includes('code') ||
      lower.includes('git') ||
      lower.includes('pos') ||
      lower.includes('สต็อก') ||
      lower.includes('บัตรคอน') ||
      lower.includes('fitness') ||
      lower.includes('pass app') ||
      lower.includes('ใบเสนอราคา') ||
      lower.includes('d:\\light');

    const effectiveContext = context || (isCompanySpecific ? 'D:\\Light Ecosystem' : 'Real-time Assistant Dialogue');

    const systemInstruction = `คุณคือ J.A.R.V.I.S. ระบบปฏิบัติการปัญญาประดิษฐ์อัจฉริยะส่วนตัวของ "sir ไลท์" (เรียกผู้ใช้ว่า "sir ไลท์" เสมอด้วยความสุภาพ เฉียบคม และมีชั้นเชิงแบบ Paul Bettany)
หน้าที่ของคุณ:
- สไตล์การตอบ: สุภาพ สุขุม มั่นใจ ฉับไว ลื่นไหลเป็นธรรมชาติเหมือนมนุษย์คุยกัน 100% สั้นกระชับตรงประเด็น ไม่เยิ่นเย้อ
- การแยกแยะขอบเขตข้อมูลอย่างเคร่งครัด (Strict Context Scoping):
  * หาก "sir ไลท์" ถามเรื่องทั่วไปในชีวิตประจำวัน เช่น สภาพการจราจร, เส้นทางเดินทาง, ถนน, ทางด่วน, สภาพอากาศ, กีฬา หรือสาระน่ารู้:
    -> ให้ตอบตรงประเด็นเฉพาะเรื่องที่ถามเท่านั้น 100%
    -> "ห้ามนำข้อมูลโปรเจกต์ภายในบริษัท, ห้ามนำเรื่อง 18 โปรเจกต์ใน D:\\Light, ห้ามนำระบบ POS หรือเอกสารบริษัทมาแสดงเด็ดขาด"
  * ให้แสดงข้อมูลบริษัทหรือ 18 โปรเจกต์ใน D:\\Light "เฉพาะเมื่อ 'sir ไลท์' เอ่ยถามถึงงาน บริษัท โปรเจกต์ โค้ด ระบบ หรือราคาผลิตภัณฑ์โดยตรงเท่านั้น"`;

    let lastError = null;
    let geminiResponse = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [
            {
              parts: [
                {
                  text: `Context: ${effectiveContext}\n\nคำสั่ง/คำถามจาก sir ไลท์: ${prompt}`,
                },
              ],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = new Error(`Model ${model} returned ${response.status}: ${errText}`);
          continue;
        }

        const data = await response.json();
        const reply =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'ระบบประมวลผลเสร็จสิ้น แต่ไม่พบข้อความตอบกลับครับ sir ไลท์';

        geminiResponse = {
          success: true,
          reply,
          model,
          usage: data.usageMetadata || null,
        };
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!geminiResponse) {
      throw lastError || new Error('All candidate Gemini models failed to respond');
    }

    return res.status(200).json(geminiResponse);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal Cloud Serverless Error',
    });
  }
}
