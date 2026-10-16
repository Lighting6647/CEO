export const INITIAL_VAULT_ITEMS = [
  {
    id: 'vault-prd-01',
    agentId: 'product_architect',
    agentName: 'Product Architect & UX Strategist',
    title: 'PRD v1.0: CloudSaaS Automation & Prompt Studio',
    thaiTitle: 'เอกสารข้อกำหนดผลิตภัณฑ์ (PRD) ระบบ CloudSaaS Studio',
    category: 'Product Specs',
    version: '1.2.0',
    status: 'Production Ready',
    createdAt: '2026-10-15 14:30',
    tags: ['PRD', 'MVP', 'MoSCoW', 'Architecture'],
    summary: 'พิมพ์เขียวสเปกผลิตภัณฑ์ฉบับสมบูรณ์ ประกอบด้วย User Persona, User Journey 3 ขั้นตอน, MoSCoW Feature Matrix, และ API Architecture Blueprint',
    content: `# Product Requirement Document (PRD) v1.2
## ผลิตภัณฑ์: CloudSaaS Automation & Prompt Studio

### 1. บทสรุปโครงการ (Executive Summary)
แพลตฟอร์ม CloudSaaS Studio พัฒนาขึ้นเพื่อแก้ปัญหาผู้ประกอบการดิจิทัลและเอเจนซี่ที่ต้องเสียเวลาจัดการ Prompt และ Workflow ซ้ำซ้อน โดยรวบรวมระบบจัดการคำสั่ง AI, การประมวลผลอัตโนมัติ และระบบรายงานผลแบบ All-in-One

### 2. กลุ่มผู้ใช้งานหลัก (Target Personas)
* **Digital Agency Owner:** ต้องการส่งมอบงานเร็วขึ้น 3 เท่าโดยรักษาคุณภาพสม่ำเสมอ
* **Content Creator & Marketer:** ต้องการลดเวลาทำ Content Production รายสัปดาห์
* **Software Developer:** ต้องการ API เชื่อมต่อ Prompt Engine เข้ากับระบบเดิม

### 3. MoSCoW Feature Prioritization
* **Must Have (เปิดตัวใน MVP):**
  - Authentication (OAuth 2.0 / Google + Email)
  - Visual Prompt Template Builder (ระบบลากวาง & ทดสอบคำสั่งทันที)
  - Variable Injection (แทนที่ตัวแปร {customer_name}, {product_type} แบบไดนามิก)
  - Export ผลลัพธ์ในรูปแบบ JSON, Markdown และ Plain Text
* **Should Have (เปิดตัว Phase 2):**
  - Team Workspace & Role-based Access Control (RBAC)
  - Webhook Trigger เชื่อมโยงกับ Zapier / Make
* **Could Have:**
  - AI Output Quality Scoring Auto-Evaluator
* **Won't Have (สำหรับเวอร์ชันแรก):**
  - On-premise self-hosted deployment

### 4. สถาปัตยกรรมระบบ (Tech Architecture)
* **Frontend:** React 19 + Tailwind CSS + Vite
* **Backend:** Netlify Functions + Edge Middleware
* **Database:** PostgreSQL via Netlify Database (Serverless)
* **Security:** JWT Auth, CSRF Token, Encrypted API Key Storage`,
  },
  {
    id: 'vault-legal-02',
    agentId: 'doc_operations_manager',
    agentName: 'Operations & Document Architect',
    title: 'Terms of Service & PDPA Compliance Master Pack',
    thaiTitle: 'สัญญาการใช้บริการ (Terms) และนโยบาย PDPA ฉบับรัดกุม',
    category: 'Legal & Compliance',
    version: '2.0.1',
    status: 'Production Ready',
    createdAt: '2026-10-15 16:15',
    tags: ['PDPA', 'Terms of Service', 'Privacy', 'Compliance'],
    summary: 'ข้อกำหนดและเงื่อนไขการใช้บริการ พร้อมนโยบายคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 และแบบฟอร์มยินยอม Consent Form',
    content: `# สัญญาข้อกำหนดการให้บริการและนโยบายความเป็นส่วนตัว (PDPA)
## สำหรับผลิตภัณฑ์และบริการดิจิทัล

### ข้อที่ 1: วัตถุประสงค์และการยินยอม
ข้อกำหนดและเงื่อนไขนี้ ("สัญญา") จัดทำขึ้นระหว่าง บริษัทผู้ให้บริการ ("บริษัท") และ ผู้ขอใช้บริการ ("ผู้ใช้งาน") โดยเมื่อผู้ใช้งานได้ลงทะเบียนหรือเข้าสู่ระบบ ให้ถือว่าผู้ใช้งานได้รับทราบและตกลงผูกพันตามสัญญานี้ทุกประการ

### ข้อที่ 2: นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA Notice)
เพื่อให้เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 บริษัทจะทำการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของผู้ใช้งานดังนี้:
1. **ข้อมูลที่จัดเก็บ:** ชื่อ-นามสกุล, ที่อยู่อีเมล, บันทึกการใช้งาน (Log Data), ข้อมูลการชำระเงินผ่าน Payment Gateway
2. **วัตถุประสงค์:** เพื่อการยืนยันตัวตน, การส่งมอบบริการ, การออกใบเสร็จรับเงิน และการติดต่อสื่อสารแจ้งอัปเดตระบบ
3. **ระยะเวลาการเก็บรักษา:** ตลอดระยะเวลาที่บัญชีผู้ใช้งานยังเปิดใช้งาน และต่อไปอีกไม่เกิน 10 ปีตามที่กฎหมายการบัญชีและภาษีกำหนด
4. **สิทธิของเจ้าของข้อมูล:** ผู้ใช้งานมีสิทธิขอเข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลส่วนบุคคลของตนได้ตลอดเวลาผ่านศูนย์ช่วยเหลือ

### ข้อที่ 3: สิทธิในทรัพย์สินทางปัญญา
เนื้อหา ซอร์สโค้ด และอัลกอริทึมของระบบถือเป็นกรรมสิทธิ์ของบริษัทแต่เพียงผู้เดียว ส่วนผลลัพธ์ (Output) ที่ระบบประมวลผลให้แก่ผู้ใช้งาน ถือเป็นสิทธิของผู้ใช้งานโดยสมบูรณ์

### ข้อที่ 4: การจำกัดความรับผิด (Limitation of Liability)
บริษัทมุ่งมั่นให้บริการด้วยมาตรฐานความพร้อมใช้งาน (Uptime) ไม่น้อยกว่า 99.5% อย่างไรก็ตาม บริษัทจะไม่รับผิดชอบต่อความเสียหายทางอ้อมที่อยู่นอกเหนือการควบคุมอันสมเหตุสมผล`,
  },
  {
    id: 'vault-growth-03',
    agentId: 'brand_growth_hacker',
    agentName: 'Brand Awareness & Growth Hacker',
    title: '30-Day Content Matrix & Viral Growth Loop Playbook',
    thaiTitle: 'กลยุทธ์คอนเทนต์ 30 วัน & แผนสร้างการรับรู้แบรนด์แบบไวรัล',
    category: 'Growth & Marketing',
    version: '1.0.0',
    status: 'Reviewed',
    createdAt: '2026-10-16 09:20',
    tags: ['UVP', 'Growth Loop', 'Content Matrix', 'Lead Magnet'],
    summary: 'แผนเปิดตัวสินค้าและดึงดูดกลุ่มเป้าหมายออร์แกนิก 30 วัน พร้อมสเปก Lead Magnet แจกฟรี และวงจรการบอกต่อ (Referral Loop)',
    content: `# แผนกลยุทธ์การเติบโต 30 วัน (30-Day Growth Playbook)
## สำหรับเปิดตัวเครื่องมือซอฟต์แวร์ดิจิทัล

### 1. สโลแกนระบุตำแหน่งแบรนด์ (Unique Value Proposition)
> **"เปลี่ยนงานทำระบบที่เคยใช้เวลา 3 วัน ให้เสร็จสมบูรณ์พร้อมส่งมอบใน 15 นาที ด้วยระบบผู้บริหาร AI ส่วนตัว"**

### 2. ฟรี Lead Magnet ดึงดูดรายชื่อลูกค้า (High-Converting Freebie)
* **ชื่อสื่อ:** "คัมภีร์ 50 Prompt ลับ + แม่แบบ SOP บริหารดิจิทัลโปรดักต์ระดับล้าน"
* **รูปแบบ:** Interactive Notion Template + PDF Cheat Sheet
* **Hook:** สมัครรับฟรีทันที ไม่ต้องกรอกบัตรเครดิต ดาวน์โหลดได้ใน 30 วินาที

### 3. ตาราง Content Matrix 4 สัปดาห์ (30-Day Pillars)
* **สัปดาห์ที่ 1 (Pain Awareness):** ชี้ให้เห็นต้นทุนเวลาที่สูญเสียจากการทำงานแบบเดิม คลิปเปรียบเทียบ Before vs After
* **สัปดาห์ที่ 2 (Solution Tease):** สาธิตการทำงานจริงของเครื่องมือ (Live Demo 60 วินาที) เน้นฟังก์ชันที่ว้าวที่สุด
* **สัปดาห์ที่ 3 (Social Proof & Case Studies):** รีวิวจากผู้ใช้กลุ่ม Early Adopter แสดงตัวเลขผลลัพธ์ที่จับต้องได้
* **สัปดาห์ที่ 4 (Launch & Limited Time Offer):** ประกาศเปิดตัวรอบพิเศษ Early-Bird พร้อมโบนัสของแถมเฉพาะ 50 ท่านแรก

### 4. Viral Referral Loop
ผู้ใช้งานที่ชวนเพื่อนมาสมัครใช้งานสำเร็จ รับสิทธิ์ใช้งาน Pro เพิ่มฟรี 30 วัน ทั้งผู้ชวนและเพื่อน`,
  },
  {
    id: 'vault-sales-04',
    agentId: 'sales_conversion_copywriter',
    agentName: 'Sales Funnel & Conversion Copywriter',
    title: 'High-Converting Direct-Response Sale Page Master Copy',
    thaiTitle: 'ชุดข้อความขายหน้า Sale Page อัตราปิดการขายสูง & โมเดลราคา 3 ระดับ',
    category: 'Sales & Copywriting',
    version: '1.5.0',
    status: 'Production Ready',
    createdAt: '2026-10-16 11:00',
    tags: ['Sale Page', 'Pricing', 'VSL Script', 'Direct Response'],
    summary: 'ข้อความขายฉบับเต็มตั้งแต่พาดหัวเปิดใจ, ปัญหาแทงใจดำ, ข้อเสนอพิเศษ, ตารางราคา 3 ระดับ (Starter / Pro / Lifetime), และการรับประกันความเสี่ยงเป็นศูนย์',
    content: `# ชุดข้อความหน้าปิดการขาย (Direct-Response Sale Page Copy)

### ส่วนที่ 1: พาดหัวหลัก (Hero Section)
* **Pre-headline:** สำหรับผู้ประกอบการดิจิทัลและฟรีแลนซ์ที่ไม่อยากเสียเวลากับงานเอกสารซ้ำซาก
* **Main Headline:** "หยุดจมปลักกับงานบริหารหลังบ้าน! พลิกไอเดียให้กลายเป็นระบบธุรกิจดิจิทัลที่ทำงานแทนคุณตลอด 24 ชม."
* **Sub-headline:** ติดตั้ง 5 ผู้บริหาร AI ช่วยวางระบบสเปกสินค้า, ร่างสัญญาและ SOP, วางแผนการตลาด และปิดการขายให้จบในแพลตฟอร์มเดียว

### ส่วนที่ 2: ตารางราคา 3 ระดับ (3-Tier Pricing Model)
1. **Starter Tier (฿990 / เดือน หรือ ฿1,990 ซื้อขาดรายปี)**
   - ใช้งาน AI 2 ตัวหลัก (Product Architect + Doc Operations)
   - Export เอกสารไม่จำกัด
   - เหมาะสำหรับผู้เริ่มต้นทำสินค้าตัวแรก
2. **Professional Tier (฿2,490 / เดือน - แนะนำยอดนิยม ★★★)**
   - ใช้งานครบทั้ง 5 AI Executive Squad เต็มศักยภาพ
   - ระบบ Pipeline Orchestrator ทำงานอัตโนมัติแบบครบวงจร
   - เข้าถึง Knowledge Vault และ Template ระดับโปร
   - โบนัส: Private Mastermind Group
3. **Enterprise & Agency Tier (฿6,900 / เดือน)**
   - Unlimited Workspace & บัญชีลูกทีม 5 ท่าน
   - Priority High-Speed Engine & VIP Support สายตรง

### ส่วนที่ 3: รับประกันความพอใจ 100% ไร้ความเสี่ยง (Zero-Risk Guarantee)
"ทดลองใช้งานเต็มรูปแบบ 14 วัน หากไม่สามารถช่วยประหยัดเวลาการทำงานได้อย่างน้อย 10 ชั่วโมงต่อสัปดาห์ ยินดีคืนเงินเต็มจำนวน 100% โดยไม่ต้องตอบคำถามใดๆ ทั้งสิ้น"`,
  },
  {
    id: 'vault-retention-05',
    agentId: 'customer_retention_specialist',
    agentName: 'Customer Experience & Retention Specialist',
    title: '5-Step Onboarding Architecture & 5-Day Welcome Sequence',
    thaiTitle: 'สถาปัตยกรรม Onboarding 5 ขั้นตอน & ซีรีส์อีเมลต้อนรับ 5 วัน',
    category: 'Customer Success',
    version: '1.1.0',
    status: 'Production Ready',
    createdAt: '2026-10-16 13:45',
    tags: ['Onboarding', 'Welcome Email', 'Churn Prevention', 'Aha Moment'],
    summary: 'โครงสร้างกระบวนการต้อนรับลูกค้าใหม่ให้เกิดผลลัพธ์แรกภายใน 5 นาทีแรก พร้อมสคริปต์อีเมล 5 ฉบับเพื่อกระตุ้นการใช้งานและป้องกันลูกค้ายกเลิก',
    content: `# แผนงานดูแลลูกค้าและป้องกันลูกค้ายกเลิก (Retention & Onboarding Playbook)

### 1. ระบบ Onboarding 5 ขั้นตอนสู่ Aha! Moment ภายใน 5 นาที
* **นาทีที่ 0:** หน้าขอบคุณและยืนยันการชำระเงิน พร้อมปุ่ม "เข้าใช้งานพื้นที่ทำงานของคุณทันที"
* **นาทีที่ 1:** ป๊อปอัปตั้งค่าชื่อโปรเจกต์และเลือกประเภท Digital Product เพียง 1 คลิก
* **นาทีที่ 3:** ระบบรันเทมเพลตตัวอย่างจริงให้เห็นผลลัพธ์ทันที (Instant Gratification)
* **นาทีที่ 5:** ผู้ใช้ดาวน์โหลดหรือส่งออกไฟล์ผลงานแรกสำเร็จ (Aha! Moment บรรลุผล)

### 2. ซีรีส์อีเมลต้อนรับ 5 วัน (5-Day Nurture Sequence)
* **Day 0 (ทันทีหลังชำระเงิน):** ข้อมูลการเข้าสู่ระบบ + วิดีโอแนะนำการใช้งาน 2 นาที
* **Day 1 (Quick Win):** "วิธีสร้างเอกสารชิ้นแรกของคุณใน 3 คลิก" ชี้เป้าทางลัด
* **Day 2 (Secret Hack):** แนะนำฟังก์ชันลับที่ช่วยประหยัดเวลาเพิ่มขึ้นอีกเท่าตัว
* **Day 3 (Customer Story):** เรื่องราวความสำเร็จของลูกค้าท่านอื่นที่ประยุกต์ใช้งาน
* **Day 5 (Check-in & Offer):** สอบถามความพึงพอใจ และชวนเข้าร่วมกลุ่มแลกเปลี่ยนประสบการณ์

### 3. มาตรการรับมือเมื่อลูกค้าไม่ล็อกอินเกิน 7 วัน (Re-engagement Trigger)
หากระบบตรวจพบว่าผู้ใช้ไม่มีการล็อกอินเกิน 7 วัน ระบบส่งอีเมลแจ้งเตือนพร้อมฟีเจอร์อัปเดตใหม่ และเสนอให้ทีม Support ช่วยเหลือแบบส่วนตัว`,
  },
];
