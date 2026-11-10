const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const models = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-pro-latest'];

async function test() {
  for (const m of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'สวัสดี JARVIS ตอบสั้นๆ ไม่เกิน 15 คำ' }] }]
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[SUCCESS] ${m}:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
        break;
      } else {
        console.log(`[FAIL] ${m}:`, data.error?.message);
      }
    } catch (e) {
      console.log(`[ERR] ${m}:`, e.message);
    }
  }
}

test();
