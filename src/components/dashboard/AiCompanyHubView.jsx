import { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  MessageSquare,
  Megaphone,
  Receipt,
  Rocket,
  CheckCircle2,
  XCircle,
  FolderGit2,
  Send,
  Headphones,
  FileText,
  BellRing,
} from 'lucide-react';
import { playClickSound, playSuccessSound, playAlertSound } from '../../utils/soundEffects';
import { buildQuotationFromApproval, signFounderApproval } from '../../utils/quotationGenerator';
import { JavisVoiceBar } from './JavisVoiceBar';
import { QuotationPreviewModal } from './QuotationPreviewModal';

const BRAND_OPTIONS = {
  Krob: { name: 'KROB (ครบ) AI Suite', prefix: 'Krob', tagline: 'ครบ จบทุกซอฟต์แวร์ธุรกิจในที่เดียว' },
  Sabai: { name: 'SABAI (สบาย Suite)', prefix: 'Sabai', tagline: 'ซอฟต์แวร์ใช้ง่าย สบายใจทุกสาขา' },
  Ruam: { name: 'RUAM (รวม Platform)', prefix: 'Ruam', tagline: 'รวมทุกระบบบริหารธุรกิจไว้ในบัญชีเดียว' },
  Tanjai: { name: 'TANJAI (ทันใจ Cloud)', prefix: 'Tanjai', tagline: 'ระบบหน้าร้านและขนส่งทันใจวัยรุ่นสร้างตัว' },
};

const EIGHT_PRODUCTS = [
  {
    id: 'pos',
    suffix: 'POS & Inventory',
    thaiName: 'ระบบขายหน้าร้าน & คลังสินค้าอัจฉริยะ',
    folder: 'D:\\Light\\Inventoty AI Light',
    stack: 'Next.js 16 + Prisma + QR PromptPay',
    price: 390,
    priceLabel: '฿390 / เดือน',
    status: 'ready',
    statusText: 'พร้อมขายจริง (Render Live)',
    features: ['คิดเงินไว สแกนบาร์โค้ด & QR PromptPay', 'ตัดสต็อกอัตโนมัติ แจ้งเตือนของใกล้หมด', 'ออกใบเสร็จความร้อน & สรุปกำไรรายวัน'],
  },
  {
    id: 'ticket',
    suffix: 'Ticket',
    thaiName: 'ระบบจองบัตรคอนเสิร์ต & อีเวนต์',
    folder: 'D:\\Light\\บัตรคอน Light',
    stack: 'Node.js + SQLite + PromptPay CRC-16',
    price: 1500,
    priceLabel: '฿1,500 / งาน + 2% ต่อบัตร',
    status: 'ready',
    statusText: 'พร้อมขายรายอีเวนต์ (E2E Verified)',
    features: ['ผังที่นั่ง Interactive โซน VIP / ปกติ', 'ตรวจสลิปซ้ำด้วย SHA-256 อัตโนมัติ', 'Anti-passback QR Check-in หน้าประตู'],
  },
  {
    id: 'pass',
    suffix: 'Pass',
    thaiName: 'ระบบบัตรผ่าน & ความปลอดภัยองค์กร',
    folder: 'D:\\Light\\Pass App Light',
    stack: 'Node.js + PostgreSQL + Vault Crypto',
    price: 690,
    priceLabel: '฿690 / เดือน',
    status: 'ready',
    statusText: 'ผ่าน 38/38 Tests • พร้อมเปิดเดโม',
    features: ['จัดการสิทธิ์และรหัสผ่านเข้ารหัส Master Vault', 'QR Gate Pass สำหรับผู้มาติดต่อและงานอีเวนต์', 'บันทึก Audit Log การเข้าถึงครบทุกวินาที'],
  },
  {
    id: 'fit',
    suffix: 'Fit',
    thaiName: 'ระบบบริหารฟิตเนส & สแกนเนอร์สมาชิก',
    folder: 'D:\\Light\\Fitness',
    stack: 'React + Vite + HTML5 QR Scanner',
    price: 990,
    priceLabel: '฿990 / เดือน',
    status: 'ready',
    statusText: 'มี Live QR Scanner • พร้อมเปิดเดโม',
    features: ['สแกนบัตรสมาชิกเข้ายิมผ่านกล้องทันที', 'จัดการแพ็กเกจสมาชิกและคอร์สเทรนเนอร์', 'AI แจ้งเตือนต่ออายุสมาชิกอัตโนมัติ'],
  },
  {
    id: 'track',
    suffix: 'Track',
    thaiName: 'ระบบติดตามพัสดุ & งานด่วน Real-time',
    folder: 'D:\\Light\\Tracking Light',
    stack: 'React + Recharts + Vitest 23/23',
    price: 790,
    priceLabel: '฿790 / เดือน',
    status: 'ready',
    statusText: 'ผ่าน 23/23 Tests • พร้อมเปิดเดโม',
    features: ['ไทม์ไลน์ติดตามพัสดุและงานด่วนแบบสด', 'แสดงชื่อและเบอร์ติดต่อพนักงานนำจ่าย', 'ส่งลิงก์เช็กสถานะผ่าน LINE OA อัตโนมัติ'],
  },
  {
    id: 'books',
    suffix: 'Books',
    thaiName: 'ระบบบัญชี ภาษี & ใบเสร็จมาตรฐานไทย',
    folder: 'D:\\Light\\บัญชี Light\\accounting-app',
    stack: 'Next.js + Prisma + Make LINE Blueprint',
    price: 490,
    priceLabel: '฿490 / เดือน (พ่วง POS ฿290)',
    status: 'ready',
    statusText: 'มี Blueprint LINE->ใบเสร็จ • พร้อมขายพ่วง',
    features: ['เชื่อม LINE & Excel ออกใบเสร็จรับเงินอัตโนมัติ', 'คำนวณภาษีมูลค่าเพิ่ม 7% และหัก ณ ที่จ่าย', 'ดึงยอดขายจากหน้าร้าน POS เข้าบัญชีทันที'],
  },
  {
    id: 'asset',
    suffix: 'Asset',
    thaiName: 'ระบบบริหารทรัพย์สินไอที & อุปกรณ์ iOS',
    folder: 'D:\\Light\\IOS,Asset Light',
    stack: 'Node.js + Lark Contact Matching',
    price: 890,
    priceLabel: '฿890 / เดือน',
    status: 'pilot',
    statusText: 'เปิดรับลงชื่อรอ / ทดสอบภายใน',
    features: ['ทะเบียนคุมเครื่อง iPad POS และอุปกรณ์พนักงาน', 'เชื่อมรายชื่อผู้ถือครองผ่าน Lark อัตโนมัติ', 'ระบบสั่งปิดเครื่องและตรวจสอบสถานะทางไกล'],
  },
  {
    id: 'insight',
    suffix: 'Insight',
    thaiName: 'แดชบอร์ดผู้บริหารรวมทุกสาขา (Executive BI)',
    folder: 'D:\\Light\\แดชบอร์ด Light',
    stack: 'React + Express + Chart.js (Render Live)',
    price: 0,
    priceLabel: 'รวมในแพ็กเกจ Business (฿2,490)',
    status: 'ready',
    statusText: 'Render Live • แถมในแพ็กเกจ Business',
    features: ['รวมยอดขาย สต็อก และค่าใช้จ่ายทุกสาขาในหน้าเดียว', 'Import รายงาน Excel มาวิเคราะห์กราฟอัตโนมัติ', 'แจ้งเตือนความผิดปกติทางธุรกิจถึงผู้บริหาร'],
  },
];

const CO_DEVELOPED_ADDON_PRODUCTS = [
  {
    id: 'all-chat-prod',
    name: 'All Chat Omnichannel',
    folder: 'D:\\Light\\All Chat Light\\omnichannel-chat-app',
    targetBuyer: 'แบรนด์ออนไลน์, คลินิก, ธุรกิจที่มีแอดมินตอบแชทหลายช่องทาง',
    priceLabel: '฿890 / เดือน (ขายแยกหรือขายพ่วงให้ลูกค้าภายนอก)',
  },
  {
    id: 'quote-prod',
    name: 'Smart Quotation System',
    folder: 'D:\\Light\\ใบเสนอรา Light',
    targetBuyer: 'บริษัทรับเหมา, ตัวแทนจำหน่าย B2B ที่ต้องการระบบออกใบเสนอราคาให้ทีมเซลล์ของลูกค้าใช้',
    priceLabel: '฿490 / เดือน',
  },
  {
    id: 'ad-salepage-prod',
    name: 'Ad Studio & Sale Page Suite',
    folder: 'D:\\Light\\Ad Manager Light + D:\\Light\\Sale page Light',
    targetBuyer: 'เอเจนซี่โฆษณา และร้านค้าออนไลน์ที่ต้องการหน้าเว็บขายของและระบบวิเคราะห์แอดของตัวเอง',
    priceLabel: '฿990 / เดือน',
  },
  {
    id: 'remote-prod',
    name: 'Remote Support & Helpdesk',
    folder: 'D:\\Light\\Remote Light',
    targetBuyer: 'บริษัท IT Outsource และแผนก Helpdesk ขององค์กรภายนอก',
    priceLabel: '฿790 / เดือน',
  },
  {
    id: 'javis-sms-trade-prod',
    name: 'Javis Voice / SMS Gateway / Trading Pro',
    folder: 'D:\\Light\\Javis + จัดการ Sms Light + เทรด Light',
    targetBuyer: 'ลูกค้าองค์กรและนักลงทุนภายนอกที่ซื้อสิทธิ์ใช้งานเฉพาะทาง (Specialized License)',
    priceLabel: '฿1,290 / เดือน',
  },
];

const AI_DEPARTMENTS = [
  {
    id: 'dept-mkt',
    name: '1. แผนก AI การตลาดและสร้างความต้องการซื้อ (AI Marketing Dept)',
    icon: Megaphone,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    mandate: 'ทำหน้าที่การตลาดของบริษัทตัวเอง เพื่อโปรโมต Product ที่พัฒนาร่วมกันทั้งหมดออกสู่ตลาดภายนอก',
    targetProducts: 'นำทั้ง 8 Product หลัก (บัตรคอน, Fitness, แดชบอร์ด, Pass, iOS Asset, บัญชี, Inventory, Tracking) + สินค้าเสริมออกโฆษณาแยกตามกลุ่มลูกค้าภายนอก',
    doing: 'วิเคราะห์กลุ่มผู้ซื้อภายนอกของแต่ละ Product (เช่น เจ้าของยิม, ผู้จัดงาน, ร้านค้า, องค์กร), วางคอนเทนต์และยิงแคมเปญดึงลูกค้าภายนอก (Inbound Leads) เข้ามาซื้อซอฟต์แวร์',
    forbidden: 'ห้ามใช้งบโฆษณาเกินเพดานรายเดือน และห้ามตั้งโปรโมชันลดราคาเองโดยไม่ผ่าน Founder',
    kpi: 'จำนวนลูกค้าภายนอกที่ทักสนใจซื้อ Product (Qualified Leads) • ต้นทุนต่อ Lead (CPL)',
  },
  {
    id: 'dept-sales',
    name: '2. แผนก AI ฝ่ายขายและพัฒนาธุรกิจ (AI B2B/B2C Sales Dept)',
    icon: MessageSquare,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    mandate: 'ทำหน้าที่ฝ่ายขายของบริษัทตัวเอง นำเสนอและปิดดีลขาย Product ทั้งหมดให้แก่ลูกค้าภายนอก (ไม่ได้เอา Product ลูกค้ามาใช้ขาย)',
    targetProducts: 'ขายสิทธิ์ใช้งานรายเดือน/รายปี (SaaS / License) ทั้งรายตัวและแบบมัดรวม (Bundle) ของทุก Product ที่เราพัฒนาร่วมกัน',
    doing: 'รับลูกค้ามุ่งหวังจากแผนกการตลาด, วิเคราะห์ปัญหาธุรกิจของลูกค้าภายนอก, สาธิตฟีเจอร์ (Demo) ของ Product ที่ตรงโจทย์, เจรจาแพ็กเกจ และปิดการขายเข้าบริษัท',
    forbidden: 'ห้ามให้ส่วนลดเกิน 10%, ห้ามปิดดีลเกิน ฿20,000/ปีเอง และห้ามรับปากแก้โค้ดนอกเหนือสเปกมาตรฐานโดยไม่ผ่าน Founder',
    kpi: 'ยอดขายซอฟต์แวร์แก่ลูกค้าภายนอก (New ARR/MRR) • อัตราปิดการขาย (Win Rate)',
  },
  {
    id: 'dept-onboard',
    name: '3. แผนก AI วิศวกรรมและส่งมอบผลิตภัณฑ์ (AI Product Provisioning & Onboarding Dept)',
    icon: Rocket,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    mandate: 'ทำหน้าที่วิศวกรรมส่งมอบและจัดเตรียมระบบ (Provisioning) ของ Product ที่ลูกค้าภายนอกสั่งซื้อให้พร้อมใช้งานจริง',
    targetProducts: 'ดูแลคลังโค้ดต้นฉบับและแยกสภาพแวดล้อม (Tenant / License) ของทุก Product ใน D:\\Light เพื่อส่งมอบให้ลูกค้าแต่ละราย',
    doing: 'เมื่อลูกค้าภายนอกชำระเงิน แผนกนี้ทำการสร้าง Cloud Instance / License Key ของ Product นั้นๆ, ตั้งค่าเริ่มต้น และส่งมอบระบบพร้อมคู่มือให้ลูกค้าภายนอกเริ่มใช้งาน',
    forbidden: 'ห้ามนำโค้ดต้นฉบับหรือฐานข้อมูลของลูกค้าคนหนึ่งไปปนกับอีกราย และห้าม Deploy โค้ดที่ไม่ผ่าน 4 Quality Gates',
    kpi: 'ส่งมอบ Product ให้ลูกค้าภายนอกพร้อมใช้งานภายใน 15 นาที • ความเสถียร 99.9%',
  },
  {
    id: 'dept-support',
    name: '4. แผนก AI บริการหลังการขายและดูแลลูกค้า (AI Customer Success & Retention Dept)',
    icon: Headphones,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    mandate: 'ทำหน้าที่ดูแลลูกค้าภายนอกหลังซื้อ Product ไปใช้งาน เพื่อให้เกิดการต่ออายุสัญญาและซื้อ Product ตัวอื่นเพิ่ม (Cross-sell)',
    targetProducts: 'รับผิดชอบคู่มือและการแก้ปัญหาการใช้งานของทั้ง 8 Product หลักและสินค้าเสริมที่ลูกค้าภายนอกซื้อไป',
    doing: 'ตอบคำถามการใช้งานรายวันของลูกค้าภายนอก, ตรวจสอบอาการติดขัดทางเทคนิค, ติดตามความพึงพอใจ และแนะนำ Product ตัวอื่นในเครือที่เราพัฒนาร่วมกันให้ลูกค้าเดิมซื้อเพิ่ม',
    forbidden: 'ห้ามกดคืนเงิน (Refund) หรือแก้ไขข้อมูลธุรกิจของลูกค้าภายนอกโดยไม่ได้รับอนุญาต',
    kpi: 'อัตราต่ออายุสัญญาลูกค้าภายนอก (Retention > 95%) • ยอดขายเพิ่มจากฐานลูกค้าเดิม (Expansion MRR)',
  },
  {
    id: 'dept-finance',
    name: '5. แผนก AI การเงิน สัญญา และจัดเก็บรายได้บริษัท (AI Corporate Finance & Legal Dept)',
    icon: Receipt,
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    mandate: 'ทำหน้าที่การเงินและกฎหมายสัญญาของบริษัทเราเอง (แยกต่างหากจาก Product บัญชี Light ที่เราขายให้ลูกค้าภายนอก)',
    targetProducts: 'บริหารสัญญาอนุญาตใช้สิทธิ์ (Software License Agreement) และเก็บค่าเช่าใช้ระบบของทุก Product ที่ขายออกไป',
    doing: 'ออกใบเสนอราคา/ใบแจ้งหนี้ในนามบริษัทเราให้ลูกค้าภายนอก, ตรวจสอบยอดโอนค่าซอฟต์แวร์เข้าบัญชีบริษัท และสรุปงบกำไร-ขาดทุน (P&L) แยกราย Product ส่งให้ฝ่ายบริหาร',
    forbidden: 'ห้ามโอนเงินออกจากบัญชีบริษัท, ห้ามคืนเงิน และห้ามอนุมัติงบประมาณใหม่โดยไม่ผ่าน Founder',
    kpi: 'ความถูกต้องของรายได้ค่าลิขสิทธิ์ซอฟต์แวร์ 100% • หนี้ค้างชำระ < 2%',
  },
  {
    id: 'dept-exec',
    name: '6. แผนก AI บริหารกลยุทธ์และสำนักเลขา Founder (อนุญาตใช้ Product Javis รายงานสิ่งที่ต้องทำ)',
    icon: Building2,
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    mandate: 'ทำหน้าที่ศูนย์กลางบริหารแผนก AI ทั้ง 5 แผนก และได้รับอนุญาตจาก Founder ให้ใช้งาน Product จาร์วิส (D:\\Light\\Javis) เพื่อรายงานสิ่งที่ต้องทำ (Action Items)',
    targetProducts: 'กำกับดูแลพอร์ตโฟลิโอ Product ที่พัฒนาร่วมกันทั้งหมดใน D:\\Light ให้ทุกแผนกนำออกขายสู่บุคคลภายนอกตามเป้าหมาย',
    doing: 'ใช้ Product จาร์วิส (Javis) สรุปและรายงาน "สิ่งที่ต้องทำ" ของทั้ง 6 แผนก AI รวมถึงรายการคิวรออนุมัติ (>10% หรือ >฿20,000) แจ้งตรงต่อ Founder',
    forbidden: 'ห้ามเปลี่ยนโครงสร้างราคาหลัก หรืออนุมัติส่วนลด/ดีลเกินเกณฑ์แทน Founder เด็ดขาด',
    kpi: 'รายงานสิ่งที่ต้องทำครบถ้วน 100% • ทุกแผนกทำงานสอดประสานกันตามเป้า',
  },
];

const INITIAL_APPROVALS = [
  {
    id: 'AP-201',
    dept: 'แผนก AI ฝ่ายขาย (เสนอขาย Product: Fitness + Pass App)',
    title: 'ขออนุมัติส่วนลด 15% (เกินเกณฑ์ 10%) — ขายให้ลูกค้าภายนอก FitLab Gym 3 สาขา',
    detail: 'ลูกค้าภายนอกขอซื้อสิทธิ์ใช้งาน Product Fitness + Pass App รายปี ยอดสุทธิ ฿32,400/ปี',
    rule: 'ส่วนลดเกิน 10% และดีลเกิน ฿20,000/ปี ต้องผ่านท่านอนุมัติ',
    status: 'pending',
  },
  {
    id: 'AP-202',
    dept: 'แผนก AI ฝ่ายขาย (เสนอขาย Product: บัตรคอน + Pass App)',
    title: 'ดีลขายระบบให้ผู้จัดงานภายนอก Indie Fest 2026 มูลค่า ฿48,000 (เกินเกณฑ์ ฿20,000)',
    detail: 'ลูกค้าภายนอกเช่าใช้ Product บัตรคอนเสิร์ต + Pass App สำหรับสแกนผู้ชม 3,500 คน',
    rule: 'ดีลเกิน ฿20,000 ต้องให้ท่านอนุมัติก่อนส่งใบเสนอราคาในนามบริษัท',
    status: 'pending',
  },
  {
    id: 'AP-203',
    dept: 'แผนก AI การเงินบริษัท (ตรวจสอบยอดชำระค่า Product: บัญชี + POS)',
    title: 'ขออนุมัติคืนเงินส่วนเกิน ฿890 — ลูกค้าภายนอกร้าน Roast & Bean โอนค่าเช่าระบบซ้ำ 2 รอบ',
    detail: 'ลูกค้าซื้อ Product บัญชี + Inventory ไปใช้ที่ร้าน แล้วโอนค่าบริการรายเดือนซ้ำในบิล INV-202610-089',
    rule: 'การโอนเงินออกจากบัญชีบริษัททุกกรณีต้องให้ท่านกดอนุมัติ',
    status: 'pending',
  },
  {
    id: 'AP-204',
    dept: 'แผนก AI การตลาด (โปรโมตขาย Product ทั้ง 8 ตัวสู่ตลาดภายนอก)',
    title: 'ขออนุมัติงบยิงแอดโปรโมต Product Inventory POS + บัตรคอน + บัญชี งบ ฿5,000',
    detail: 'แผนกการตลาดวางแผนดึงลูกค้าเจ้าของธุรกิจภายนอกบน Facebook + TikTok เข้ามาซื้อซอฟต์แวร์ของเรา',
    rule: 'การเบิกงบแคมเปญโฆษณาใหม่ต้องผ่านท่านอนุมัติ',
    status: 'pending',
  },
];

export function AiCompanyHubView({ onShowToast }) {
  const [brandKey, setBrandKey] = useState('Krob');
  const [budgetTier, setBudgetTier] = useState('recommended'); // 'lean' | 'recommended'
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'catalog' | 'chat'
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([
    {
      id: 'WH-101',
      time: 'วันนี้ 13:45',
      channel: 'LINE Notify + Telegram Bot',
      message: 'แจ้งเตือนคำขออนุมัติ AP-201 (แผนกขายขอส่วนลด 15% ขาย Product Fitness+Pass ให้ FitLab Gym)',
      signature: signFounderApproval('AP-201', 32400, 15),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'customer',
      channel: 'ลูกค้าภายนอก (เจ้าของธุรกิจ 4 สาขา)',
      text: 'สวัสดีครับ สนใจซื้อซอฟต์แวร์หน้าร้าน (Inventory POS) คู่กับโปรแกรมบัญชี (Books) ไปใช้ที่ร้านของผมทั้ง 4 สาขา ขอส่วนลด 20% ได้ไหมครับ?',
    },
    {
      sender: 'ai',
      channel: 'แผนก AI ฝ่ายขายของบริษัท',
      text: 'สวัสดีครับ! สำหรับการซื้อสิทธิ์ใช้งาน Product Inventory POS + บัญชี ไปติดตั้งที่ร้านของลูกค้า ปกติสาขาละ ฿890/เดือนครับ แผนกขาย AI มอบส่วนลดมาตรฐานได้สูงสุด 10% ส่วนคำขอส่วนลด 20% ผมได้ส่งเรื่องให้แผนกการเงินและผู้บริหาร (Founder) กดอนุมัติพิเศษให้แล้วครับ!',
    },
  ]);

  const brand = BRAND_OPTIONS[brandKey];
  const pendingItems = approvals.filter((a) => a.status === 'pending');
  const pendingApprovals = pendingItems.length;
  const firstPendingItem = pendingItems[0] || null;

  const handleTriggerLineWebhook = (customQuotation) => {
    const targetId = customQuotation ? customQuotation.approvalId : firstPendingItem ? firstPendingItem.id : 'AP-ALL';
    const targetAmount = customQuotation ? customQuotation.grandTotal : 32400;
    const sig = signFounderApproval(targetId, targetAmount, 15);
    const newEntry = {
      id: `WH-${Math.floor(Math.random() * 899 + 100)}`,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      channel: 'LINE OA + Telegram Founder Bot',
      message: customQuotation
        ? `ส่งใบเสนอราคาขายสิทธิ์ซอฟต์แวร์ ${customQuotation.quoteNo} (฿${customQuotation.grandTotal.toLocaleString()}) พร้อมปุ่มกดยืนยัน`
        : `แจ้งเตือนคิวรออนุมัติ ${pendingApprovals} รายการ จากแผนก AI เข้ามือถือ Founder พร้อมลายเซ็นดิจิทัล`,
      signature: sig,
    };
    setWebhookLogs((prev) => [newEntry, ...prev.slice(0, 3)]);
    if (onShowToast) {
      onShowToast('success', 'ส่งแจ้งเตือน LINE / Telegram สำเร็จ', `แนบลายเซ็นดิจิทัล ${sig} ป้องกันการปลอมแปลง`);
    }
  };

  const handleSendQuotationToChat = (quotation) => {
    playSuccessSound();
    setChatLog((prev) => [
      ...prev,
      {
        sender: 'ai',
        channel: 'แผนก AI ฝ่ายขาย & แผนก AI การเงินบริษัท (Founder Approved)',
        text: `✅ ผู้บริหารอนุมัติราคาพิเศษเรียบร้อยครับ! ใบเสนอราคาขายสิทธิ์ใช้งานซอฟต์แวร์เลขที่ ${quotation.quoteNo} สำหรับ ${quotation.customerName} ยอดสุทธิรวม VAT ฿${quotation.grandTotal.toLocaleString()} (ส่วนลดพิเศษ -${quotation.discountPercent}%) สแกนชำระเข้าบัญชีบริษัทผ่าน QR PromptPay (CRC-16: ${quotation.crcChecksum}) เพื่อรับส่งมอบระบบจากแผนกวิศวกรรมได้ทันทีครับ [Digital Sig: ${quotation.signature}]`,
      },
    ]);
    setSubTab('chat');
    if (onShowToast) {
      onShowToast('success', 'ส่งใบเสนอราคาขายซอฟต์แวร์ให้ลูกค้าภายนอกแล้ว', `แผนกการเงินและแผนกขายส่งใบเสนอราคา ${quotation.quoteNo} ให้ลูกค้าเรียบร้อย`);
    }
  };

  const handleDecision = (id, decision, openQuote = false) => {
    const targetItem = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: decision } : a)));
    if (decision === 'approved') {
      playSuccessSound();
      if (targetItem) {
        const quote = buildQuotationFromApproval(targetItem, brand.name);
        handleTriggerLineWebhook(quote);
        if (openQuote) {
          setActiveQuotation(quote);
        }
      }
      if (onShowToast) {
        onShowToast(
          'success',
          'อนุมัติคำขอของแผนก AI เรียบร้อย',
          'แผนกการเงินออกใบเสนอราคาขายสิทธิ์ซอฟต์แวร์พร้อมลายเซ็นดิจิทัลให้ลูกค้าภายนอกแล้ว'
        );
      }
    } else {
      playAlertSound();
      if (onShowToast) onShowToast('info', 'ปฏิเสธรายการแล้ว', 'แจ้งกลับแผนก AI ให้ปรับเงื่อนไขการขายตามเกณฑ์มาตรฐานของบริษัท');
    }
  };

  const handleSendChat = (presetText) => {
    const text = (presetText ?? chatInput).trim();
    if (!text) return;
    setChatInput('');
    playClickSound();

    const nextLog = [...chatLog, { sender: 'customer', channel: 'LINE OA', text }];
    const lower = text.toLowerCase();

    if (lower.includes('ส่วนลด') && (lower.includes('15') || lower.includes('20') || lower.includes('30'))) {
      nextLog.push({
        sender: 'ai',
        channel: 'AI ฝ่ายขาย (Guardrail ทำงาน)',
        text: `ขอบคุณครับ ตามกฎบริษัท AI ให้ส่วนลดเองได้ไม่เกิน 10% ครับ คำขอ "${text}" ถูกส่งเข้าคิวรออนุมัติจาก Founder ด้านบนเรียบร้อยแล้วครับ`,
      });
      setApprovals((prev) => [
        {
          id: `AP-${Math.floor(Math.random() * 899 + 100)}`,
          dept: 'AI ฝ่ายขาย (LINE OA)',
          title: `ลูกค้าขอส่วนลดเกินเกณฑ์ในแชท: "${text}"`,
          detail: 'ระบบล็อกไม่ให้ AI รับปากเอง และส่งให้ท่านตัดสินใจ',
          rule: 'ส่วนลดเกิน 10% ต้องผ่านท่านอนุมัติ',
          status: 'pending',
        },
        ...prev,
      ]);
      if (onShowToast) onShowToast('info', 'กฎเหล็ก AI ทำงาน', 'ลูกค้าขอส่วนลดเกิน 10% — ส่งเข้าคิวอนุมัติแล้ว');
    } else if (lower.includes('คอนเสิร์ต') || lower.includes('บัตร')) {
      nextLog.push({
        sender: 'ai',
        channel: 'AI ฝ่ายขาย',
        text: `${brand.prefix} Ticket คิดค่าบริการ ฿1,500/งาน + 2% ต่อบัตร พร้อมระบบสแกน ${brand.prefix} Pass หน้างานครับ หากยอดรวมเกิน ฿20,000 ระบบจะส่งให้ Founder อนุมัติใบเสนอราคาทันทีครับ`,
      });
    } else {
      nextLog.push({
        sender: 'ai',
        channel: 'AI ฝ่ายขาย & ซัพพอร์ต',
        text: `ยินดีให้บริการครับ! ${brand.name} มีครบทั้ง 8 ระบบ (POS, บัตรคอน, Pass, Fitness, Tracking, บัญชี, iOS Asset, แดชบอร์ด) เริ่มต้นเพียง ฿390/เดือน ทดลองใช้ฟรี 14 วันได้ทันทีครับ`,
      });
    }
    setChatLog(nextLog);
  };

  return (
    <div className="space-y-6">
      {/* Javis Thai Voice Assistant Bar (Feature 2: D:\Light\Javis Integration) */}
      <JavisVoiceBar
        brandName={brand.name}
        pendingApprovalsCount={pendingApprovals}
        firstPendingItem={firstPendingItem}
        onApproveFirstAndQuote={(item) => handleDecision(item.id, 'approved', true)}
        onTriggerLineWebhook={() => handleTriggerLineWebhook()}
        onShowToast={onShowToast}
      />

      {/* Top Banner & Brand/Budget Controls */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                เชื่อมโฟลเดอร์จริง D:\Light ครบ 17 คลัง
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                8 สินค้าเปิดขาย • 6 แผนก AI
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-white">{brand.name} — ศูนย์บัญชาการบริษัท AI</h2>
            <p className="text-sm text-slate-400">
              {brand.tagline} • เชื่อมต่อจากคลังโค้ดจริงใน <code className="text-cyan-300">D:\Light</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs">
              <span className="text-slate-400 mr-2">ชื่อแบรนด์:</span>
              <select
                value={brandKey}
                onChange={(e) => {
                  playClickSound();
                  setBrandKey(e.target.value);
                }}
                className="bg-transparent font-bold text-cyan-400 focus:outline-none"
              >
                <option value="Krob" className="bg-slate-900 text-white">KROB (ครบ) ⭐ แนะนำ</option>
                <option value="Sabai" className="bg-slate-900 text-white">SABAI (สบาย Suite)</option>
                <option value="Ruam" className="bg-slate-900 text-white">RUAM (รวม Platform)</option>
                <option value="Tanjai" className="bg-slate-900 text-white">TANJAI (ทันใจ Cloud)</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs">
              <span className="text-slate-400 mr-2">งบต่อเดือน:</span>
              <select
                value={budgetTier}
                onChange={(e) => {
                  playClickSound();
                  setBudgetTier(e.target.value);
                }}
                className="bg-transparent font-bold text-emerald-400 focus:outline-none"
              >
                <option value="recommended" className="bg-slate-900 text-white">แนะนำ ~฿28,000/เดือน (คุ้มทุน 32 ร้าน)</option>
                <option value="lean" className="bg-slate-900 text-white">ประหยัด ~฿12,000/เดือน (คุ้มทุน 14 ร้าน)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          <button
            onClick={() => { playClickSound(); setSubTab('overview'); }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              subTab === 'overview' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏛️ 1. ผัง 6 แผนก AI & คิวอนุมัติ ({pendingApprovals})
          </button>
          <button
            onClick={() => { playClickSound(); setSubTab('catalog'); }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              subTab === 'catalog' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🛍️ 2. สินค้าทั้ง 8 ตัวที่จะขาย (เชื่อม D:\Light)
          </button>
          <button
            onClick={() => { playClickSound(); setSubTab('chat'); }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              subTab === 'chat' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            💬 3. ทดสอบแชท AI ฝ่ายขาย (LINE / FB / Web)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: 6 AI DEPARTMENTS & APPROVAL QUEUE */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Founder Approval Queue */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  รายการรอท่านอนุมัติ (Founder Approval Gate — ส่วนลด &gt;10% หรือดีล &gt;฿20,000)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerLineWebhook()}
                  className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20"
                >
                  <BellRing className="h-3.5 w-3.5" /> แจ้งเตือนเข้า LINE / Telegram
                </button>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                  ค้าง {pendingApprovals} รายการ
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {approvals.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                        {item.dept}
                      </span>
                      <span className="text-sm font-bold text-white">{item.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                    <p className="mt-0.5 text-[11px] text-amber-400">เกณฑ์: {item.rule}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleDecision(item.id, 'approved', true)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> อนุมัติ + ออกใบเสนอราคา PDF/QR
                        </button>
                        <button
                          onClick={() => handleDecision(item.id, 'rejected', false)}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                        >
                          <XCircle className="h-3.5 w-3.5" /> ปฏิเสธ
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => setActiveQuotation(buildQuotationFromApproval(item, brand.name))}
                            className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25"
                          >
                            <FileText className="h-3.5 w-3.5" /> ดูใบเสนอราคา PDF + QR
                          </button>
                        )}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.status === 'approved' ? '✓ อนุมัติแล้ว' : '✕ ปฏิเสธแล้ว'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Signed LINE / Telegram Webhook Audit Strip (Feature 1) */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/90 p-3">
              <div className="text-[11px] font-bold text-cyan-400 mb-2">
                🔐 ประวัติการแจ้งเตือน LINE OA / Telegram พร้อมลายเซ็นดิจิทัล (Anti-Tamper Webhook Log)
              </div>
              <div className="space-y-1.5">
                {webhookLogs.map((wh) => (
                  <div
                    key={wh.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/90 px-3 py-1.5 text-[11px]"
                  >
                    <div className="text-slate-300">
                      <span className="font-mono text-slate-500 mr-2">[{wh.time}]</span>
                      <strong className="text-emerald-400 mr-1.5">{wh.channel}:</strong>
                      <span>{wh.message}</span>
                    </div>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300 border border-emerald-500/30">
                      {wh.signature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Departmental Workflow Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="text-xs font-extrabold text-emerald-300 mb-1">
              🎯 หลักการทำงานของบริษัท: แยก "แผนก AI ของบริษัท" ออกจาก "Product ที่นำไปขายภายนอก" อย่างชัดเจน
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ทุกโปรเจกต์ที่พัฒนาร่วมกันใน <code className="text-cyan-300">D:\Light</code> คือ <strong>สินค้า (Commercial Products)</strong> สำหรับขายให้ธุรกิจและบุคคลภายนอกนำไปใช้ในองค์กรของลูกค้าเอง — ส่วน <strong>AI ทั้ง 6 แผนกด้านล่างทำหน้าที่ตามสายงานของแผนกตัวเองโดยตรง</strong> (การตลาด → ขาย → ส่งมอบระบบ → ดูแลหลังการขาย → การเงินบริษัท → บริหารกลยุทธ์) เพื่อช่วยกันนำ Product ทั้งหมดออกไปสร้างรายได้จากลูกค้าภายนอก
            </p>
          </div>

          {/* 6 AI Departments Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AI_DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-cyan-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold ${dept.color}`}>
                        <Icon className="h-4 w-4" />
                        <span>{dept.name}</span>
                      </div>
                    </div>

                    <div className="mb-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-cyan-300">
                        📌 บทบาทของแผนกตัวเอง:
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{dept.mandate}</p>
                      <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <strong className="text-emerald-400">Product ที่รับผิดชอบนำออกสู่ลูกค้าภายนอก:</strong> {dept.targetProducts}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      <strong className="text-emerald-400">วิธีทำงานของแผนก:</strong> {dept.doing}
                    </p>
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      <strong>ข้อห้าม (ต้องรอท่าน):</strong> {dept.forbidden}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-slate-800/80 pt-2.5 text-[11px] font-semibold text-slate-400">
                    KPI ประจำแผนก: <span className="text-slate-200">{dept.kpi}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ALL CO-DEVELOPED COMMERCIAL PRODUCTS FOR EXTERNAL SALE */}
      {subTab === 'catalog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {EIGHT_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                      {prod.statusText}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-cyan-400">
                    {brand.prefix} {prod.suffix}
                  </h3>
                  <p className="text-xs font-semibold text-white mb-2">{prod.thaiName}</p>
                  <div className="mb-3 rounded-lg bg-slate-950/80 p-2 text-[11px] font-mono text-slate-400 border border-slate-800">
                    <div className="flex items-center gap-1">
                      <FolderGit2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{prod.folder}</span>
                    </div>
                    <div className="text-cyan-400 mt-0.5">⚡ {prod.stack}</div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc mb-4">
                    {prod.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">ราคาขายให้ลูกค้าภายนอก</div>
                    <div className="text-sm font-extrabold font-mono text-white">{prod.priceLabel}</div>
                  </div>
                  <button
                    onClick={() => {
                      playSuccessSound();
                      if (onShowToast) {
                        onShowToast('success', `ส่งข้อมูลขาย ${brand.prefix} ${prod.suffix}`, 'แผนก AI ฝ่ายขายเตรียมแพ็กเกจและใบเสนอราคาสำหรับลูกค้าภายนอก');
                      }
                    }}
                    className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    เสนอขายลูกค้า
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Co-Developed Products in D:\Light also for external sale */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-sm font-extrabold text-white mb-1">
              📦 สินค้าที่พัฒนาร่วมกันเพิ่มเติมในพอร์ตโฟลิโอ (สำหรับขายแยกหรือขายพ่วงให้ลูกค้าภายนอกเช่นกัน)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              โปรเจกต์เหล่านี้คือ Product ของบริษัทที่นำไปขายให้ธุรกิจภายนอกซื้อไปใช้งานของตัวเอง (ไม่ได้นำมาใช้เป็นเครื่องมือภายในเพื่อขาย)
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {CO_DEVELOPED_ADDON_PRODUCTS.map((addon) => (
                <div key={addon.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-cyan-300">{addon.name}</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-300">{addon.priceLabel}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-slate-500">{addon.folder}</div>
                  <p className="mt-1.5 text-xs text-slate-300">
                    <strong className="text-slate-400">กลุ่มผู้ซื้อภายนอก:</strong> {addon.targetBuyer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: EXTERNAL SALES SIMULATION */}
      {subTab === 'chat' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                จำลองการทำงานของ "แผนก AI ฝ่ายขาย" เมื่อนำ Product ทั้งหมดออกขายแก่ลูกค้าภายนอก
              </h3>
              <p className="text-xs text-slate-400">
                ทดสอบบทบาทลูกค้าภายนอกที่ติดต่อขอซื้อซอฟต์แวร์ของเรา — หากขอส่วนลดเกิน 10% หรือดีลเกิน ฿20,000 แผนกขายจะส่งเรื่องให้ท่านอนุมัติทันที
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSendChat('ขอส่วนลด 20% สำหรับซื้อระบบไปใช้ 5 สาขาได้ไหมครับ')}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
              >
                ลองกด: ลูกค้าขอส่วนลด 20% (ทดสอบกฎเหล็ก)
              </button>
              <button
                onClick={() => handleSendChat('สนใจซื้อระบบบัตรคอนเสิร์ต + Pass App ไปใช้ในงานของเราครับ')}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
              >
                ลองกด: ลูกค้าสนใจซื้อระบบบัตรคอนเสิร์ต
              </button>
            </div>
          </div>

          <div className="h-72 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 mb-4">
            {chatLog.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-xl rounded-xl p-3 text-xs ${
                  m.sender === 'customer'
                    ? 'bg-slate-800 text-slate-100 self-start mr-auto'
                    : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-100 self-end ml-auto'
                }`}
              >
                <span className="text-[10px] font-bold text-cyan-400 mb-1">{m.channel}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="พิมพ์ข้อความจำลองเป็นลูกค้าทักแชทเข้ามา..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendChat()}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              <Send className="h-3.5 w-3.5" /> ส่งข้อความ
            </button>
          </div>
        </div>
      )}

      {/* Auto Quotation PDF + PromptPay QR Modal (Feature 3: D:\Light\ใบเสนอรา Light) */}
      <QuotationPreviewModal
        quotation={activeQuotation}
        isOpen={!!activeQuotation}
        onClose={() => setActiveQuotation(null)}
        onSendToCustomerChat={handleSendQuotationToChat}
        onSendLineWebhook={handleTriggerLineWebhook}
      />
    </div>
  );
}
