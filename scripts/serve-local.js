import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');
const LIGHT_ROOT = 'D:\\Light';

// Load GEMINI_API_KEY from .env
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const envPath = path.resolve(__dirname, '..', '.env');
if (!GEMINI_API_KEY && fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) GEMINI_API_KEY = match[1].trim();
  } catch (err) {
    console.warn('[ENV Load Warning]:', err.message);
  }
}

// In-Memory Search Cache for Live Web Intelligence (Sub-50ms Retrieval)
const webSearchCache = new Map();
const MARKET_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for gold, oil, crypto, stocks
const GENERAL_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for general encyclopedic knowledge

// Call Google Gemini API (Dual-model fallback)
async function callGemini(prompt, systemInstruction = '', clientKey = '') {
  const activeKey = clientKey || GEMINI_API_KEY;
  if (!activeKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env or request');
  }

  const models = [
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-pro-latest',
  ];
  let lastErr = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          model,
          text: data.candidates[0].content.parts[0].text,
        };
      } else {
        lastErr = new Error(`[${model}]: ${data.error?.message || 'Empty response'}`);
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('All Gemini models failed');
}

// Helper to read JSON request body
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function startServer(port = 5173) {
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);

    // 1. High-Performance Thai Neural TTS Audio Proxy
    if (reqPath === '/api/tts') {
      const text = parsedUrl.searchParams.get('text') || '';
      if (!text.trim()) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Missing text parameter');
        return;
      }

      const encoded = encodeURIComponent(text.slice(0, 200));
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;

      fetch(googleUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
        .then(async (ttsRes) => {
          if (!ttsRes.ok) {
            throw new Error(`Google TTS status: ${ttsRes.status}`);
          }
          const buffer = await ttsRes.arrayBuffer();
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.byteLength,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400',
          });
          res.end(Buffer.from(buffer));
        })
        .catch((err) => {
          console.error('[TTS Proxy Error]:', err.message);
          res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('TTS Error: ' + err.message);
        });
      return;
    }

    // 3. Google Gemini Neural Analysis Bridge for J.A.R.V.I.S.
    if (reqPath === '/api/gemini/analyze') {
      const handleAnalyze = async () => {
        try {
          let prompt = parsedUrl.searchParams.get('prompt') || '';
          let context = parsedUrl.searchParams.get('context') || '';
          let clientKey = '';

          if (req.method === 'POST') {
            const body = await readJsonBody(req);
            prompt = body.prompt || prompt;
            context = body.context || context;
            clientKey = body.apiKey || '';
          }

          if (!prompt.trim()) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Missing prompt parameter' }));
            return;
          }

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

          const effectiveContext = context || (isCompanySpecific ? 'D:\\Light Software & Ecosystem' : 'Real-time Personal AI Assistant');

          const systemInstruction = `คุณคือ J.A.R.V.I.S. MARK III ปัญญาประดิษฐ์ผู้ช่วยส่วนตัวระดับสูงของ 'sir ไลท์'
- พูดจาสุภาพ สุขุม นิ่ง ฉับไว คล่องแคล่ว และเป็นธรรมชาติเหมือนมนุษย์คุยกัน 100% ห้ามพูดช้าหรือยานคางแบบหุ่นยนต์
- ให้เกียรติและเรียกผู้ใช้งานว่า 'sir ไลท์' เสมอ
- การแยกแยะขอบเขตข้อมูลอย่างเคร่งครัด (Strict Context Scoping):
  * หาก 'sir ไลท์' ถามเรื่องทั่วไปในชีวิตประจำวัน เช่น สภาพการจราจร, เส้นทางเดินทาง, ถนน, ทางด่วน, สภาพอากาศ, กีฬา หรือสาระน่ารู้:
    -> ให้ตอบตรงประเด็นเฉพาะเรื่องที่ถามเท่านั้น 100%
    -> "ห้ามนำข้อมูลโปรเจกต์ภายในบริษัท, ห้ามนำเรื่อง 18 โปรเจกต์ใน D:\\Light, ห้ามนำระบบ POS หรือเอกสารบริษัทมาแสดงเด็ดขาด"
  * ให้แสดงข้อมูลบริษัทหรือ 18 โปรเจกต์ใน D:\\Light "เฉพาะเมื่อ 'sir ไลท์' เอ่ยถามถึงงาน บริษัท โปรเจกต์ โค้ด ระบบ หรือราคาผลิตภัณฑ์โดยตรงเท่านั้น"
- ตอบกระชับ ไม่ยืดยาว ตรงประเด็นทันใจ`;

          const result = await callGemini(
            `Context: ${effectiveContext}\n\nคำถามหรือคำสั่งจาก sir ไลท์: ${prompt}`,
            systemInstruction,
            clientKey
          );

          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(
            JSON.stringify({
              success: true,
              model: result.model,
              reply: result.text,
            })
          );
        } catch (err) {
          console.error('[Gemini Bridge Error]:', err.message);
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      };

      handleAnalyze();
      return;
    }

    // 3.5 Real-Time External Web Search & Intelligence Engine
    if (reqPath === '/api/web/search') {
      const handleWebSearch = async () => {
        try {
          let query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query') || '';
          if (req.method === 'POST') {
            const body = await readJsonBody(req);
            query = body.q || body.query || query;
          }

          if (!query.trim()) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: 'Missing search query (q)' }));
            return;
          }

          const cleanQ = query.trim();
          const cacheKey = cleanQ.toLowerCase();
          const isMarketQuery =
            cacheKey.includes('ทอง') ||
            cacheKey.includes('น้ำมัน') ||
            cacheKey.includes('bitcoin') ||
            cacheKey.includes('btc') ||
            cacheKey.includes('เหรียญ') ||
            cacheKey.includes('หุ้น') ||
            cacheKey.includes('ค่าเงิน') ||
            cacheKey.includes('แลกเปลี่ยน');

          const ttl = isMarketQuery ? MARKET_CACHE_TTL : GENERAL_CACHE_TTL;

          // Check In-Memory Cache for Sub-50ms Retrieval
          if (webSearchCache.has(cacheKey)) {
            const cached = webSearchCache.get(cacheKey);
            const age = Date.now() - cached.timestamp;
            if (age < cached.ttl) {
              res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'X-Cache-Status': 'HIT',
              });
              res.end(
                JSON.stringify({
                  ...cached.payload,
                  cached: true,
                  cacheAgeMs: age,
                  source: 'In-Memory Cache (Sub-50ms)',
                })
              );
              return;
            } else {
              webSearchCache.delete(cacheKey);
            }
          }

          const results = [];
          let sourceUrl = '';
          let sourceTitle = '';
          let primarySummary = '';

          // 1. Try DuckDuckGo HTML Live Search
          try {
            const ddgUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(cleanQ);
            const ddgRes = await fetch(ddgUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            });
            if (ddgRes.ok) {
              const html = await ddgRes.text();
              const regex =
                /<h2 class="result__title">[\s\S]*?<a class="result__url" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
              let match;
              while ((match = regex.exec(html)) !== null && results.length < 5) {
                const rawUrl = match[1];
                const cleanUrl = decodeURIComponent(rawUrl.replace(/.*?uddg=([^&]+).*/, '$1'));
                const title = match[2].replace(/<[^>]+>/g, '').trim();
                const snippet = match[3].replace(/<[^>]+>/g, '').trim();
                if (cleanUrl.startsWith('http')) {
                  let domain = '';
                  try {
                    domain = new URL(cleanUrl).hostname;
                  } catch {}
                  results.push({ url: cleanUrl, title, snippet, domain });
                }
              }
            }
          } catch (err) {
            console.warn('[DDG Search Warning]:', err.message);
          }

          // 2. Try Wikipedia Summary API for conceptual / person / entity knowledge
          let wikiData = null;
          try {
            const cleanTopic = cleanQ
              .replace(/^(ค้นหา|หาข้อมูล|คืออะไร|ประวัติของ|ประวัติ|ใครคือ|เล่าเรื่อง|ข้อมูลเกี่ยวกับ|ข่าว)/gi, '')
              .trim();
            const wikiUrl =
              'https://th.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(cleanTopic || cleanQ);
            const wikiRes = await fetch(wikiUrl, {
              headers: { 'User-Agent': 'Jarvis-Assistant/1.0' },
            });
            if (wikiRes.ok) {
              wikiData = await wikiRes.json();
              if (wikiData.extract && wikiData.type !== 'disambiguation') {
                primarySummary = wikiData.extract;
                sourceTitle = wikiData.title || cleanTopic;
                sourceUrl =
                  wikiData.content_urls?.desktop?.page ||
                  `https://th.wikipedia.org/wiki/${encodeURIComponent(sourceTitle)}`;
                if (!results.some((r) => r.url === sourceUrl)) {
                  results.unshift({
                    url: sourceUrl,
                    title: `${sourceTitle} - วิกิพีเดีย`,
                    snippet: wikiData.extract.slice(0, 240) + '...',
                    domain: 'th.wikipedia.org',
                  });
                }
              }
            }
          } catch (err) {
            console.warn('[Wiki Search Warning]:', err.message);
          }

          let media = null;
          if (wikiData) {
            const imgUrl = wikiData.originalimage?.source || wikiData.thumbnail?.source;
            if (imgUrl) {
              media = {
                type: 'image',
                url: imgUrl,
                caption: wikiData.description || `${sourceTitle} (จาก Wikipedia)`,
                source: 'th.wikipedia.org',
                width: wikiData.originalimage?.width || wikiData.thumbnail?.width,
                height: wikiData.originalimage?.height || wikiData.thumbnail?.height,
              };
            }
          }

          // Thematic media for commodities / crypto / market telemetry
          if (!media) {
            if (cleanQ.includes('ทอง')) {
              media = {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&q=80',
                caption: 'ราคาทองคำแท่งและทองรูปพรรณ 96.5% - สมาคมค้าทองคำแห่งประเทศไทย',
                source: 'goldtraders.or.th',
              };
            } else if (cleanQ.includes('bitcoin') || cleanQ.includes('btc') || cleanQ.includes('บิทคอยน์')) {
              media = {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
                caption: 'Bitcoin (BTC) Digital Gold & Spot Market Telemetry',
                source: 'tradingview.com',
              };
            } else if (cleanQ.includes('น้ำมัน')) {
              media = {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
                caption: 'ดัชนีราคาน้ำมันดิบและน้ำมันสำเร็จรูปขายปลีก - PTT / Bangchak',
                source: 'pttor.com',
              };
            }
          }

          if (results.length > 0 && !sourceUrl) {
            sourceUrl = results[0].url;
            sourceTitle = results[0].title;
          }
          if (results.length > 0 && !primarySummary) {
            primarySummary = results[0].snippet;
          }

          let mediaGallery = [];
          if (cleanQ.includes('ทอง')) {
            mediaGallery = [
              {
                id: 'gold_1',
                url: media?.url || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&q=80',
                caption: 'ทองคำแท่ง 96.5% มาตรฐานสมาคมค้าทองคำแห่งประเทศไทย',
                source: 'goldtraders.or.th',
                hotspots: [
                  { x: 38, y: 45, label: 'ความบริสุทธิ์ 96.5%', desc: 'มาตรฐานทองคำแท่งไทย ความบริสุทธิ์ไม่ต่ำกว่า 96.5% ตามข้อกำหนด สคบ.' },
                  { x: 65, y: 58, label: 'น้ำหนัก 1 บาท = 15.244 กรัม', desc: 'น้ำหนักทองคำแท่ง 1 บาทตามเกณฑ์สมาคมฯ หนัก 15.244 กรัม (ทองรูปพรรณ 15.16 กรัม)' },
                  { x: 50, y: 30, label: 'ตราประทับโรงหลอมเลเซอร์', desc: 'ตราสัญลักษณ์ผู้ผลิตที่ได้รับการรับรองจากสมาคมค้าทองคำ' },
                ],
              },
              {
                id: 'gold_2',
                url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',
                caption: 'ดัชนีกราฟเทคนิค Spot Gold (XAU/USD) & Real-time Candlestick',
                source: 'tradingview.com',
                hotspots: [
                  { x: 42, y: 35, label: 'แนวรับสำคัญ (Support Level)', desc: 'โซนแนวรับทางเทคนิคอิงราคาปิดตลาดโลก' },
                  { x: 75, y: 25, label: 'Volume Breakout Point', desc: 'จุดสะสมปริมาณการซื้อขายหนาแน่นของกองทุนทองคำโลก (SPDR Gold)' },
                ],
              },
              {
                id: 'gold_3',
                url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80',
                caption: 'ทองคำสำรองระดับสากล (Central Bank Gold Reserves Bullion)',
                source: 'worldgoldcouncil.org',
                hotspots: [
                  { x: 55, y: 50, label: 'มาตรฐาน Good Delivery (99.99%)', desc: 'ทองคำแท่งมาตรฐาน London Bullion Market Association (LBMA) 400 ออนซ์' },
                ],
              },
              {
                id: 'gold_4',
                url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
                caption: 'งานช่างทองรูปพรรณไทยและตราประทับความปลอดภัย',
                source: 'goldtraders.or.th',
                hotspots: [
                  { x: 48, y: 52, label: 'ค่ากำเหน็จและลวดลาย', desc: 'ต้นทุนการขึ้นรูปเครื่องประดับตามมาตรฐานสมาคมค้าทองคำ' },
                ],
              },
            ];
          } else if (cleanQ.includes('bitcoin') || cleanQ.includes('btc') || cleanQ.includes('บิทคอยน์')) {
            mediaGallery = [
              {
                id: 'btc_1',
                url: media?.url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
                caption: 'Bitcoin (BTC) Digital Gold & Decentralized Ledger',
                source: 'tradingview.com',
                hotspots: [
                  { x: 50, y: 48, label: 'จำกัดอุปทาน 21 ล้านเหรียญ', desc: 'อุปทานสูงสุดคงที่ (Hard Cap) 21,000,000 BTC ไม่สามารถพิมพ์เพิ่มได้' },
                  { x: 30, y: 32, label: 'SHA-256 Proof of Work', desc: 'กลไกฉันทามติรับประกันความปลอดภัยของบล็อกเชนระดับโลก' },
                ],
              },
              {
                id: 'btc_2',
                url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=900&q=80',
                caption: 'Bitcoin Spot Telemetry & Order Book Depth',
                source: 'binance.com',
                hotspots: [
                  { x: 60, y: 40, label: 'Liquidity Pool Depth', desc: 'สภาพคล่องและคำสั่งซื้อขายแบบเรียลไทม์ในกระดานเทรดระดับสากล' },
                ],
              },
              {
                id: 'btc_3',
                url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=900&q=80',
                caption: 'ฮาร์ดแวร์วอลเล็ตและการจัดเก็บ Private Key แบบออฟไลน์ (Cold Storage)',
                source: 'bitcoin.org',
                hotspots: [
                  { x: 52, y: 55, label: 'Cold Storage Chip', desc: 'ชิปเข้ารหัสความปลอดภัยระดับ EAL5+ หรือ EAL6+' },
                ],
              },
              {
                id: 'btc_4',
                url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=900&q=80',
                caption: 'Bitcoin Network Hashrate & Mining Farm Architecture',
                source: 'blockchain.com',
                hotspots: [
                  { x: 45, y: 40, label: 'Mining ASIC Rig Farm', desc: 'กำลังขุดรวมทั่วโลกสูงกว่าระดับ Exahash ต่อวินาที (EH/s)' },
                ],
              },
            ];
          } else if (cleanQ.includes('น้ำมัน')) {
            mediaGallery = [
              {
                id: 'oil_1',
                url: media?.url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
                caption: 'ดัชนีราคาน้ำมันดิบ WTI / Brent & กำลังการกลั่นน้ำมันสำเร็จรูป',
                source: 'pttor.com',
                hotspots: [
                  { x: 45, y: 50, label: 'โครงสร้างราคาน้ำมันขายปลีก', desc: 'ประกอบด้วยเนื้อน้ำมัน, ภาษีสรรพสามิต, ภาษีเทศบาล, กองทุนน้ำมันเชื้อเพลิง และค่าการตลาด' },
                ],
              },
              {
                id: 'oil_2',
                url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80',
                caption: 'แท่นขุดเจาะน้ำมันนอกชายฝั่ง (Offshore Petroleum Platform)',
                source: 'eia.gov',
                hotspots: [
                  { x: 62, y: 35, label: 'จุดสกัดน้ำมันดิบลึกใต้ทะเล', desc: 'การขุดเจาะและส่งผ่านท่อส่งกำลังดันสูง' },
                ],
              },
            ];
          } else if (media && media.url) {
            mediaGallery = [
              {
                id: 'slide_1',
                url: media.url,
                caption: media.caption || 'ภาพหลักประกอบการสืบค้น',
                source: media.source || 'Verified Source',
                hotspots: [
                  { x: 50, y: 50, label: media.caption || 'ภาพหลัก', desc: `ภาพสื่อประกอบจาก ${media.source || 'แหล่งข้อมูลภายนอก'}` },
                ],
              },
            ];
          }

          const responsePayload = {
            success: true,
            query: cleanQ,
            sourceUrl: sourceUrl || 'https://www.google.com/search?q=' + encodeURIComponent(cleanQ),
            sourceTitle: sourceTitle || 'ผลการค้นหาข้อมูลภายนอก',
            summary: primarySummary || `ค้นพบข้อมูล ${results.length} รายการจากเว็บไซต์ภายนอก`,
            results: results.slice(0, 5),
            media: media || (mediaGallery.length > 0 ? mediaGallery[0] : null),
            mediaGallery,
            cached: false,
          };

          // Store in In-Memory Cache
          webSearchCache.set(cacheKey, {
            payload: responsePayload,
            timestamp: Date.now(),
            ttl,
          });

          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'X-Cache-Status': 'MISS',
          });
          res.end(JSON.stringify(responsePayload));
        } catch (err) {
          console.error('[Web Search Error]:', err.message);
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message, results: [] }));
        }
      };

      handleWebSearch();
      return;
    }

    // 4. Multi-Project Directory Scanner (D:\Light Ecosystem)
    if (reqPath === '/api/projects/list') {
      try {
        const entries = fs.readdirSync(LIGHT_ROOT, { withFileTypes: true });
        const projects = entries
          .filter((d) => d.isDirectory())
          .map((d) => {
            const pPath = path.join(LIGHT_ROOT, d.name);
            const hasGit = fs.existsSync(path.join(pPath, '.git'));
            const hasPkg = fs.existsSync(path.join(pPath, 'package.json'));
            return {
              id: d.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: d.name,
              path: pPath,
              hasGit,
              hasPackageJson: hasPkg,
            };
          });

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ success: true, count: projects.length, projects }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // 5. Multi-Project Autonomous Orchestrator (Read, Edit Code, Git Push)
    if (reqPath === '/api/projects/execute') {
      const handleExecute = async () => {
        try {
          const body = await readJsonBody(req);
          const { action, projectName, filePath, content, commitMessage, command } = body;

          const targetDir = projectName ? path.join(LIGHT_ROOT, projectName) : LIGHT_ROOT;
          if (!fs.existsSync(targetDir) && action !== 'set_gemini_key') {
            res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: `Project not found: ${projectName}` }));
            return;
          }

          // A0. Update Gemini API Key in .env
          if (action === 'set_gemini_key' && body.apiKey) {
            GEMINI_API_KEY = body.apiKey.trim();
            const newEnv = `GEMINI_API_KEY=${GEMINI_API_KEY}\nVITE_GEMINI_API_KEY=${GEMINI_API_KEY}\n`;
            fs.writeFileSync(envPath, newEnv, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, message: 'Gemini API Key updated successfully' }));
            return;
          }

          // A1. List files in project directory
          if (action === 'list_files') {
            const subDir = filePath ? path.resolve(targetDir, filePath) : targetDir;
            if (!subDir.startsWith(targetDir)) {
              throw new Error('Access denied outside target directory');
            }
            const entries = fs.readdirSync(subDir, { withFileTypes: true });
            const files = entries
              .filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'dist' && e.name !== '.git')
              .slice(0, 60)
              .map((e) => ({
                name: e.name,
                isDirectory: e.isDirectory(),
                relPath: path.relative(targetDir, path.join(subDir, e.name)),
              }));
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, files }));
            return;
          }

          // A. Read File
          if (action === 'read_file') {
            const fullPath = path.resolve(targetDir, filePath || '');
            if (!fullPath.startsWith(targetDir)) {
              throw new Error('Access denied outside target directory');
            }
            const data = fs.readFileSync(fullPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, path: fullPath, content: data }));
            return;
          }

          // B. Edit / Write File with Auto-Backup
          if (action === 'edit_file') {
            const fullPath = path.resolve(targetDir, filePath || '');
            if (!fullPath.startsWith(targetDir)) {
              throw new Error('Access denied outside target directory');
            }
            if (fs.existsSync(fullPath)) {
              fs.copyFileSync(fullPath, `${fullPath}.bak`);
            }
            fs.writeFileSync(fullPath, content || '', 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, path: fullPath, backup: `${fullPath}.bak` }));
            return;
          }

          // C. Git Status
          if (action === 'git_status') {
            exec('git status -s', { cwd: targetDir }, (err, stdout, stderr) => {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(
                JSON.stringify({
                  success: !err,
                  status: stdout || '(Working tree clean)',
                  error: err ? stderr : null,
                })
              );
            });
            return;
          }

          // D. Autonomous Git Commit & Push
          if (action === 'git_push') {
            const msg = commitMessage || `[J.A.R.V.I.S. Autonomous Update] for ${projectName}`;
            const gitCmd = `git add . && git commit -m "${msg}" && git push`;
            exec(gitCmd, { cwd: targetDir }, (err, stdout, stderr) => {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(
                JSON.stringify({
                  success: !err,
                  output: stdout || stderr,
                  error: err ? err.message : null,
                })
              );
            });
            return;
          }

          // E. Run Command in Target Project
          if (action === 'run_command' && command) {
            exec(command, { cwd: targetDir }, (err, stdout, stderr) => {
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(
                JSON.stringify({
                  success: !err,
                  output: stdout || stderr,
                  error: err ? err.message : null,
                })
              );
            });
            return;
          }

          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: `Unknown action: ${action}` }));
        } catch (err) {
          console.error('[Project Exec Error]:', err.message);
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      };

      handleExecute();
      return;
    }

    // 6. REA (Reverse Engineer Anything) Webapp & Asset Inspect Proxy
    if (reqPath === '/api/rea/inspect') {
      const target = parsedUrl.searchParams.get('target') || '';
      if (!target) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Target URL or path is required' }));
        return;
      }

      const fetchTarget = async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6500);

          const response = await fetch(target, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) REA-Agent/6.8.0 J.A.R.V.I.S./Mark-III',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: controller.signal,
          });
          clearTimeout(timeout);

          const text = await response.text();
          const headersObj = {};
          response.headers.forEach((val, key) => {
            headersObj[key.toLowerCase()] = val;
          });

          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(
            JSON.stringify({
              success: true,
              status: response.status,
              headers: headersObj,
              html: text.slice(0, 120000), // First 120KB sufficient for DOM & bundle detection
            })
          );
        } catch (err) {
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(
            JSON.stringify({
              success: false,
              error: err.message,
              simulated: true,
            })
          );
        }
      };

      fetchTarget();
      return;
    }

    // 7. System Web Browser Launcher (Authorized by sir ไลท์)
    if (reqPath === '/api/browser/open') {
      const handleOpenBrowser = async () => {
        try {
          let target = parsedUrl.searchParams.get('url') || '';
          if (!target && req.method === 'POST') {
            const body = await readJsonBody(req);
            target = body.url || '';
          }

          if (!target) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: 'URL parameter is required' }));
            return;
          }

          if (!/^https?:\/\//i.test(target)) {
            target = `https://${target}`;
          }

          const launchCmd =
            process.platform === 'win32'
              ? `start "" "${target}"`
              : process.platform === 'darwin'
              ? `open "${target}"`
              : `xdg-open "${target}"`;

          exec(launchCmd, (err) => {
            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(
              JSON.stringify({
                success: !err,
                url: target,
                message: !err ? `เปิดเว็บไซต์ ${target} สำเร็จเรียบร้อยครับ` : err.message,
              })
            );
          });
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      };

      handleOpenBrowser();
      return;
    }

    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    let filePath = path.join(distDir, reqPath);

    // If file doesn't exist, fallback to index.html for SPA client-side routing
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error(`[500] ${req.method} ${req.url} - Error: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server Error: ' + err.message);
        return;
      }
      console.log(`[200] ${req.method} ${req.url} -> ${contentType}`);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });
      res.end(content);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });

  // Listen on all interfaces dual-stack (IPv6 :: and IPv4 0.0.0.0)
  server.listen(port, () => {
    const localUrl = `http://localhost:${port}`;
    const ipUrl = `http://127.0.0.1:${port}`;
    console.log('================================================================');
    console.log('🚀 CEO Master Platform & Krob AI Enterprise is LIVE!');
    console.log('================================================================');
    console.log(`\n  ➜ Local:   ${localUrl}`);
    console.log(`  ➜ Direct:  ${ipUrl}\n`);
    console.log('🌐 Opening browser automatically...');
    console.log('----------------------------------------------------------------');
    console.log('💡 Keep this window open while using the platform.');
    console.log('================================================================\n');

    // Launch both chrome and default browser
    exec(`start "" "${localUrl}"`, (err) => {
      if (err) {
        exec(`start chrome "${localUrl}"`);
      }
    });
  });
}

startServer(5173);
