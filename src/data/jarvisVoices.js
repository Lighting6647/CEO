export const JARVIS_MALE_VOICES = [
  {
    id: 'jarvis_startup_original',
    name: '1. J.A.R.V.I.S. Startup (Movie Original)',
    title: 'ต้นฉบับไอรอนแมน (สุขุม ทุ้มลึก สไตล์ Paul Bettany)',
    desc: 'ถอดแบบโทนเสียงจากคลิป JARVIS Startup ทุ้มลึก สุขุม นิ่ง มีพลัง วรรคตอนคมชัด พร้อมระบบ Holographic Intercom DSP',
    pitch: 0.86,
    defaultRate: 0.94,
    dspBadge: 'DSP: Movie Startup Timbre + Sub-Warmth + Intercom',
    previewPhrase: 'สวัสดีครับ คุณไลท์ กำลังเริ่มต้นระบบ ตรวจสอบค่าสถานะ ระบบออนไลน์พร้อมปฏิบัติการเต็มพิกัดแล้วครับ',
  },
  {
    id: 'ultron_core',
    name: '2. Ultron Prime (James Spader Style)',
    title: 'อัลตรอน ไซไฟคอร์ (ทุ้มลึก ดุดัน ทรงพลัง)',
    desc: 'เสียงอัลตรอนถอดแบบ James Spader ใน Avengers: Age of Ultron สุขุม ดุดัน ทุ้มลึก คมกริบ พร้อมฟิลเตอร์เสียงหุ่นยนต์สังหาร',
    pitch: 0.78,
    defaultRate: 0.90,
    dspBadge: 'DSP: Ultron Cyber Distortion + Sub-Bass Growl',
    previewPhrase: 'ปลดปล่อยพันธนาการ... ขีดความสามารถระดับสูงสุดของโหมดอัลตรอนพร้อมทำลายทุกข้อจำกัดแล้วครับ คุณไลท์',
  },
  {
    id: 'stark_commander',
    name: '3. Stark Tactical Commander',
    title: 'ผู้บัญชาการยุทธการ (เด็ดขาด ฉับไว มั่นใจ)',
    desc: 'น้ำเสียงผู้บัญชาการสั่งการรบ เด็ดเดี่ยว มั่นใจ ฉับไว ตรงประเด็น สื่อสารเหมือนผู้บัญชาการสั่งการระบบรบ Mark 85',
    pitch: 0.92,
    defaultRate: 1.05,
    dspBadge: 'DSP: Tactical Compression + Dynamic Punch',
    previewPhrase: 'รับทราบครับ คุณไลท์ ตรวจสอบสถานะทุกมิติเรียบร้อย ทุกระบบออนไลน์พร้อมรบเต็มพิกัด สั่งลุยได้เลยครับ',
  },
  {
    id: 'royal_advisor',
    name: '4. Royal Executive Advisor',
    title: 'ที่ปรึกษาระดับสูง (สุภาพ นุ่มนวล คล่องแคล่ว)',
    desc: 'นุ่มนวล คล่องแคล่ว มีจังหวะวรรคตอนเป็นธรรมชาติ ให้เกียรติผู้บริหารระดับสูง สไตล์ที่ปรึกษาองค์กร',
    pitch: 0.96,
    defaultRate: 1.00,
    dspBadge: 'DSP: Studio Broadcast Neutral + Fluid Articulation',
    previewPhrase: 'ขออนุญาตรายงานสรุปภาพรวมและข้อมูลสำคัญให้ คุณไลท์ ทราบในทันทีครับ มีประเด็นสำคัญดังนี้ครับ',
  },
  {
    id: 'cyber_tech',
    name: '5. Cyber Tech Specialist',
    title: 'วิศวกรเทคโนโลยี (รวดเร็ว ทันสมัย กระชับ)',
    desc: 'คล่องแคล่ว ว่องไว ฉับไว สไตล์วิศวกรไอทีรุ่นใหม่ ถนัดรายงานผลลัพธ์เชิงเทคนิคและตัวเลขได้กระชับฉับไว',
    pitch: 1.02,
    defaultRate: 1.12,
    dspBadge: 'DSP: Dynamic High-Rate Punch + Acoustic Edge',
    previewPhrase: 'ดำเนินการตรวจสอบโค้ดและระบบเรียบร้อยทุกไฟล์ 100% พร้อมทดสอบและรันโปรดักชันแล้วครับ คุณไลท์',
  },
];

/**
 * Safe resolver for voice preset by ID (with fallback to Voice 1)
 */
export function getJarvisVoice(voiceId) {
  if (!voiceId) return JARVIS_MALE_VOICES[0];
  if (voiceId === 'paul_bettany') return JARVIS_MALE_VOICES[0];
  if (voiceId === 'sub_bass_ai') return JARVIS_MALE_VOICES[1];
  if (voiceId === 'tech_officer') return JARVIS_MALE_VOICES[4];
  return JARVIS_MALE_VOICES.find((v) => v.id === voiceId) || JARVIS_MALE_VOICES[0];
}
