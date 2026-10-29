import os
import sys
import subprocess
from gtts import gTTS
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
OUTPUT_DIR = r"D:\Light\CEO\video_assets"
FINAL_VIDEO = r"D:\Light\CEO\enterprise_presentation.mp4"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. SCENE DATA: CONCISE, FAST-PACED, HIGH-IMPACT THAI FEMALE SCRIPTS
SCENES = [
    {
        "id": "scene_1",
        "chapter": "01/07 • ภาพรวมปัญหาและความท้าทาย",
        "title": "จบปัญหาความยุ่งยากในองค์กร\nด้วยชุดซอฟต์แวร์บริหารงาน 5 ระบบ",
        "subtitle": "รวมระบบแดชบอร์ดไอที รหัสผ่าน ตรวจนับทรัพย์สิน บัญชีสรรพากร และคลังสินค้า",
        "steps": [
            ("1. รหัสผ่านรั่วไหล", "ส่งผ่านแชตกลุ่ม เสี่ยงถูกแฮกและขโมยข้อมูลสำคัญ"),
            ("2. อุปกรณ์สูญหาย", "คอมพิวเตอร์หาย ไม่รู้ใครถือครอง ไร้การติดตาม"),
            ("3. ใบเสร็จหาย-ภาษีผิด", "ไม่มีใบเสร็จรายจ่าย เสี่ยงถูกสรรพากรเรียกปรับ"),
            ("4. สต็อกสินค้าไม่ตรง", "ขายหน้าร้านแต่สต็อกหลังบ้านเพี้ยน ขาดการเชื่อมโยง")
        ],
        "script": "เบื่อไหมคะกับปัญหารหัสผ่านรั่วไหล อุปกรณ์ไอทีสูญหาย ใบเสร็จหายจนภาษีผิด และสต็อกสินค้าไม่ตรง วันนี้เราขอแนะนำชุดซอฟต์แวร์ 5 ระบบครบวงจร ที่ช่วยให้คุณบริหารงานทุกอย่างได้ง่าย รวดเร็ว และปลอดภัยค่ะ",
        "theme_color": (56, 189, 248),
        "app_title": "Enterprise Security & Operations Matrix",
        "app_badge": "[!] 4 จุดรั่วไหลสำคัญที่พบในองค์กร",
    },
    {
        "id": "scene_2",
        "chapter": "02/07 • พอร์ทัลและแดชบอร์ดงานไอที (IT PORTAL)",
        "title": "IT Service Portal & Operations\nเข้าลิงก์ตามสิทธิ์ แจ้งซ่อม เบิก-คืน และดูความคืบหน้า",
        "subtitle": "ผู้แจ้งเข้าใช้งานผ่านเว็บ แจ้ง Ticket เบิก-คืนอุปกรณ์ และติดตามสถานะงาน IT ได้ Real-time",
        "screenshot": "app1_it_dashboard.png",
        "steps": [
            ("ขั้นตอนที่ 1: เข้าลิงก์ตามสิทธิ์ผู้ใช้งาน", "ผู้แจ้งล็อกอิน Website Portal ตามระดับสิทธิ์ที่ได้รับ (พนักงาน / ช่างไอที / ผู้บริหาร)"),
            ("ขั้นตอนที่ 2: แจ้งซ่อม (เปิด Ticket) สะดวก", "คลิก 'แจ้ง Ticket' ระบุปัญหาคอมฯ หรือระบบขัดข้อง ช่างรับเรื่องได้ทันที"),
            ("ขั้นตอนที่ 3: ขอเบิกอุปกรณ์ & ทำเรื่องคืน", "กด 'ขอเบิก' หรือ 'คืนอุปกรณ์' บันทึกประวัติการเบิกใช้อย่างถูกต้อง"),
            ("ขั้นตอนที่ 4: ดูสถานะความคืบหน้างานไอที", "ติดตามสถานะงานซ่อม การตรวจเช็ค iOS และงาน IT ต่างๆ ได้แบบเรียลไทม์")
        ],
        "script": "แอพแรก IT Portal ผู้แจ้งเข้าลิงก์ตามสิทธิ์ เพื่อแจ้งซ่อมเปิด Ticket, ขอเบิกหรือคืนอุปกรณ์ได้ทันที พร้อมติดตามสถานะความคืบหน้างานต่างๆ ในฝ่ายไอทีได้แบบเรียลไทม์ และส่งออกรายงาน Excel ในคลิกเดียวค่ะ",
        "theme_color": (56, 189, 248),
        "app_title": "หน้าหลักระบบ: IT Operations & Service Portal",
        "app_badge": "[IT SERVICE PORTAL]",
        "pills": [
            ("[เข้าลิงก์ตามสิทธิ์]", "ล็อกอินเข้า Website พอร์ทัลตามสิทธิ์ผู้ใช้งาน"),
            ("[แจ้งซ่อม / เบิก-คืน]", "ปุ่มลัด: แจ้ง Ticket • ขอเบิกอุปกรณ์ • คืนอุปกรณ์"),
            ("[ติดตามความคืบหน้า]", "มอนิเตอร์สถานะงานซ่อม และความคืบหน้างานไอที Real-time")
        ]
    },
    {
        "id": "scene_3",
        "chapter": "03/07 • ระบบรหัสผ่านองค์กร (PASSLY VAULT)",
        "title": "Passly Enterprise Vault (รหัสผ่านองค์กร)\nจัดเก็บ Zero-Knowledge และขอรหัสปลอดภัย",
        "subtitle": "เข้ารหัสความปลอดภัยสูงสุด ตรวจจับรหัสผ่านอ่อน และจัดการสิทธิ์แบบ Collections",
        "screenshot": "app2_passly.png",
        "steps": [
            ("ขั้นตอนที่ 1: บันทึกรหัสใหม่ (+ รายการใหม่)", "กด '+ รายการใหม่' เพื่อบันทึก Login หรือใช้ตัวสร้างรหัสความปลอดภัยสูง"),
            ("ขั้นตอนที่ 2: จัดหมวดหมู่ Collections", "แยกสิทธิ์การเข้าถึงรหัสผ่านตามแผนก เช่น บัญชี การตลาด หรือฝ่ายไอที"),
            ("ขั้นตอนที่ 3: ตรวจสุขภาพ Vault (100/100)", "เช็คคะแนนความแข็งแรงรหัสผ่าน และแก้รหัสที่อ่อน ซ้ำ หรือเก่าเกิน 90 วัน"),
            ("ขั้นตอนที่ 4: ขอรหัส & ดู Activity Log", "รองรับการส่งคำขอ Password พร้อม Activity Log ตรวจสอบย้อนหลังโปร่งใส")
        ],
        "script": "แอพที่สอง Passly Vault จัดเก็บรหัสผ่านแบบ Zero-Knowledge ปลอดภัยสูงสุด กดสร้างรายการใหม่ แบ่งกลุ่มตามแผนก พร้อมระบบขอรหัสผ่านและส่งลิงก์ทำลายตัวเองอัตโนมัติ ป้องกันข้อมูลรั่วไหลร้อยเปอร์เซ็นต์ค่ะ",
        "theme_color": (168, 85, 247),
        "app_title": "หน้าหลักระบบ: Passly Enterprise Security Workspace",
        "app_badge": "[ENCRYPTED VAULT]",
        "pills": [
            ("[+ รายการใหม่]", "สร้างรหัสผ่านความปลอดภัยสูง และจัดเก็บแบบ Zero-Knowledge AES-256"),
            ("[สุขภาพ Vault]", "สรุปคะแนนความแข็งแรง 100/100 • ตรวจจับรหัสอ่อนและรหัสซ้ำ"),
            ("[Security Center]", "ตรวจเช็คความเสี่ยงรหัสหมดอายุ 90 วัน พร้อมระบบ Activity Log")
        ]
    },
    {
        "id": "scene_4",
        "chapter": "04/07 • ตรวจนับอุปกรณ์และทรัพย์สิน (IOS & ASSET)",
        "title": "ระบบตรวจนับอุปกรณ์ IT และทรัพย์สิน\nครบ 2 โหมด: ตรวจออนไลน์ 15 วัน & สแกน QR",
        "subtitle": "เห็นพิกัดอุปกรณ์บนแผนที่ พร้อมปุ่มสแกนด่วนบนมือถือ และส่งออกไฟล์ Excel",
        "screenshot": "app3_asset_audit.png",
        "steps": [
            ("โหมด 1: ตรวจ IT ออนไลน์ 15 วัน", "พนักงานกดลิงก์ยืนยันตัวตน มีรอบตรวจเช็คทุก 15 วัน อัปเดตพิกัดและสถานะ Active"),
            ("โหมด 2: ทรัพย์สิน & ออก QR Code", "บันทึกข้อมูล โต๊ะ เก้าอี้ แอร์ เฟอร์นิเจอร์ ระบบสร้าง QR Code ให้อัตโนมัติ"),
            ("สแกนตรวจนับด้วยมือถือทันที", "แตะเมนูลัด 'สแกน QR / Barcode' ใช้กล้องมือถือสแกนตรวจนับได้อย่างแม่นยำ"),
            ("สรุปรายงาน & ส่งออก Excel", "ตรวจสอบพิกัดอุปกรณ์ล่าสุดบนแผนที่ และกด 'นำออก Excel' สรุปผลตรวจนับ")
        ],
        "script": "แอพที่สาม ระบบตรวจนับอุปกรณ์และทรัพย์สิน มี 2 โหมดชัดเจน โหมดแรก ตรวจอุปกรณ์ไอทีออนไลน์ผ่านลิงก์ทุก 15 วัน เช็คพิกัดและสถานะทันที โหมดที่สอง ลงทะเบียนโต๊ะ เก้าอี้ แอร์ ออก QR Code พิมพ์ติด แล้วใช้มือถือสแกนตรวจนับและส่งออก Excel ได้ทันทีค่ะ",
        "theme_color": (34, 197, 94),
        "app_title": "หน้าหลักระบบ: ระบบตรวจนับอุปกรณ์ IT & ทรัพย์สินบริษัท (2 โหมด)",
        "app_badge": "[AUDIT & SCANNER]",
        "pills": [
            ("[โหมด 1: 15 วัน]", "ตรวจอุปกรณ์ IT ผ่านลิงก์ยืนยันตัวตน • มอนิเตอร์สถานะ Active 100%"),
            ("[โหมด 2: QR Code]", "ลงทะเบียนโต๊ะ เก้าอี้ แอร์ • ออก QR Code สแกนผ่านมือถือได้ทันที"),
            ("[Quick Control]", "ปุ่มสแกน QR ด่วน • พิกัดบนแผนที่ • นำออกข้อมูลเป็น Excel ทันที")
        ]
    },
    {
        "id": "scene_5",
        "chapter": "05/07 • ระบบบัญชีและภาษีสรรพากร (THAI ACCOUNTING)",
        "title": "ระบบบัญชีและภาษีไทย (Thai Accounting)\nลงบัญชี 5 หมวด ออกใบกำกับ และคำนวณภาษี",
        "subtitle": "ถูกต้องตามมาตรฐานสรรพากร พร้อมกราฟวิเคราะห์รายได้-ค่าใช้จ่าย 6 เดือน",
        "screenshot": "app4_accounting.png",
        "steps": [
            ("ขั้นตอนที่ 1: ออกใบแจ้งหนี้ & ใบเสร็จ", "เข้าเมนู 'รายรับ & สต๊อก' ออกเอกสารขาย ตัดสต๊อก และคำนวณ VAT 7%"),
            ("ขั้นตอนที่ 2: บันทึกรายจ่าย & หัก ณ ที่จ่าย", "เข้าเมนู 'รายจ่าย' บันทึกค่าใช้จ่าย แนบสลิป และคำนวณหัก WHT 3%/1%"),
            ("ขั้นตอนที่ 3: ภาษี ภ.ง.ด.3, 53 & ภ.พ.30", "สรุปยอดภาษีพร้อมส่งสรรพากรได้ถูกต้องตามระเบียบและปิดงบได้ทุกวัน"),
            ("ขั้นตอนที่ 4: Dashboard กำไรสุทธิ 6 เดือน", "ติดตามกราฟเปรียบเทียบรายได้-ค่าใช้จ่าย และกำไรสุทธิแบบ Real-time")
        ],
        "script": "แอพที่สี่ Thai Accounting ระบบบัญชีและภาษีไทย ออกใบแจ้งหนี้ ใบเสร็จรับเงิน ตัดสต็อกอัตโนมัติ บันทึกค่าใช้จ่ายและคำนวณหัก ณ ที่จ่าย ภ.ง.ด.3, 53 และ ภ.พ.30 พร้อมดูกราฟสรุปกำไรสุทธิย้อนหลัง 6 เดือนได้ทันทีค่ะ",
        "theme_color": (245, 158, 11),
        "app_title": "หน้าหลักระบบ: Thai Accounting System (ระบบบัญชีและภาษี บ.ช.๑)",
        "app_badge": "[TAX & ACCOUNTING]",
        "pills": [
            ("[รายรับ & สต๊อก]", "ออกใบแจ้งหนี้ • ใบเสร็จรับเงิน • ตัดสต็อกสินค้าคงคลังอัตโนมัติ"),
            ("[รายจ่าย & WHT]", "บันทึกค่าใช้จ่าย • หัก ณ ที่จ่าย 3%/1% • ภาษีซื้อ-ขาย VAT"),
            ("[Dashboard 6 เดือน]", "กราฟรายได้-ค่าใช้จ่าย 6 เดือนล่าสุด • สรุปกำไรสุทธิแบบ Real-time")
        ]
    },
    {
        "id": "scene_6",
        "chapter": "06/07 • คลังสินค้าและขายหน้าร้าน (INVENTORY & POS)",
        "title": "DPOS — คลังสินค้าและขายหน้าร้าน\nงานขาย POS บันทึกจัดซื้อ และคุมสต็อกสินค้า",
        "subtitle": "ศูนย์รวมข้อมูลหน้าร้านในจอเดียว (Single Screen) ขายเร็ว สต็อกตรง 100%",
        "screenshot": "app5_dpos.png",
        "steps": [
            ("ขั้นตอนที่ 1: ขายหน้าร้าน POS (5 วินาที)", "แตะจอ ยิงบาร์โค้ด คิดเงิน สแกน PromptPay QR และออกใบเสร็จรวดเร็ว"),
            ("ขั้นตอนที่ 2: บริหารสต็อกสินค้า & เติมของ", "บันทึกข้อมูลสินค้า ราคาขาย ต้นทุน และเปิดบิลสั่งซื้อ PO เมื่อของขาด"),
            ("ขั้นตอนที่ 3: จัดการลูกค้า & คุมค่าใช้จ่าย", "ดูแลฐานข้อมูลลูกค้า คู่ค้าซัพพลายเออร์ และบันทึกค่าใช้จ่ายประจำวัน"),
            ("ขั้นตอนที่ 4: มอนิเตอร์ Single Screen", "ดูยอดขายวันนี้ ยอดรับชำระ และสินค้าใหม่ล่าสุดครบจบในหน้าจอเดียว")
        ],
        "script": "แอพที่ห้า ระบบดีพอส รวมคลังสินค้าและการขายหน้าร้านแบบ Single Screen สแกนบาร์โค้ดคิดเงินออกใบเสร็จใน 5 วินาที ตัดสต็อกเรียลไทม์ เตือนสั่งซื้อของไม่ขาดมือ และเช็คยอดขายรายวันได้ครบจบในหน้าเดียวค่ะ",
        "theme_color": (99, 102, 241),
        "app_title": "หน้าหลักระบบ: DPOS คลังสินค้าและขายหน้าร้าน (Single Screen)",
        "app_badge": "[POS & INVENTORY]",
        "pills": [
            ("[งานขาย & POS]", "ขายหน้าร้าน • ยิงบาร์โค้ด • สแกน PromptPay QR รวดเร็ว"),
            ("[สินค้า & จัดซื้อ]", "จัดการทะเบียนสินค้า • ควบคุมสต็อก • เปิดบิลสั่งซื้อ PO"),
            ("[Single Screen]", "มอนิเตอร์ยอดขายวันนี้ • ยอดรับชำระ • กราฟยอดขายประจำเดือน")
        ]
    },
    {
        "id": "scene_7",
        "chapter": "07/07 • สรุปความคุ้มค่าและข้อเสนอพิเศษ",
        "title": "ยกระดับธุรกิจด้วย 5 ซอฟต์แวร์องค์กร\nประหยัดงบ ปลอดภัย พร้อมใช้งานทันที",
        "subtitle": "เป็นเจ้าของระบบเอง ข้อมูลอยู่ในการดูแลของคุณ 100%",
        "steps": [
            ("ประหยัดงบกว่า 70%", "ลดค่าใช้จ่าย Subscription ซอฟต์แวร์ต่างชาติหลายระบบต่อปี"),
            ("ความปลอดภัยระดับ Enterprise", "Zero-Knowledge Encryption รหัสผ่านและข้อมูลไม่รั่วไหล"),
            ("ติดตั้งและเทรนนิ่งฟรี", "มีทีมงานติดตั้งและสอนการใช้งานจนพนักงานทุกคนใช้งานเป็น"),
            ("ทดลองใช้งานฟรี 3 เดือน", "ติดต่อเราวันนี้เพื่อรับสิทธิ์ทดสอบระบบจริงเต็มรูปแบบ 3 เดือน")
        ],
        "script": "ยกระดับองค์กรด้วย 5 ซอฟต์แวร์คุณภาพ ประหยัดงบกว่า 70 เปอร์เซ็นต์ ได้เป็นเจ้าของระบบเอง ข้อมูลปลอดภัยสูงสุด พิเศษวันนี้ รับสิทธิ์ทดลองใช้งานฟรีเต็มระบบนาน 3 เดือน ติดต่อคุณโอม โทร 095-465-4698 ได้ทันทีค่ะ ขอบคุณค่ะ",
        "theme_color": (16, 185, 129),
        "app_title": "Enterprise Suite Unified Ecosystem Architecture",
        "app_badge": "ทดลองใช้ฟรี 3 เดือน • ติดต่อ: 0954654698 คุณโอม",
    }
]

# 2. AUDIO GENERATION: GEN Z GIRL VOICE (Higher Pitch + Fast Tempo)
print("=== 1. Generating Thai Female Voiceover (Gen Z Girl: Pitch+15%, Tempo 1.28x) ===")
audio_files = []
for idx, scene in enumerate(SCENES, 1):
    raw_audio = os.path.join(OUTPUT_DIR, f"{scene['id']}_raw.mp3")
    final_audio = os.path.join(OUTPUT_DIR, f"{scene['id']}.mp3")
    
    if not os.path.exists(final_audio):
        print(f"Generating Gen Z voice for Scene {idx}...")
        tts = gTTS(text=scene["script"], lang="th", slow=False)
        tts.save(raw_audio)

        # Step 1: Pitch shift up 15% for younger voice
        pitched_audio = os.path.join(OUTPUT_DIR, f"{scene['id']}_pitched.mp3")
        cmd_pitch = [
            FFMPEG_EXE, "-y",
            "-i", raw_audio,
            "-filter:a", "asetrate=24000*1.15,aresample=24000",
            pitched_audio
        ]
        subprocess.run(cmd_pitch, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Step 2: Speed up + EQ brightness + volume
        cmd_audio = [
            FFMPEG_EXE, "-y",
            "-i", pitched_audio,
            "-filter:a", "atempo=1.28,equalizer=f=3200:width_type=h:width=900:g=3,equalizer=f=6000:width_type=h:width=1200:g=1.5,volume=1.15",
            final_audio
        ]
        subprocess.run(cmd_audio, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        print(f"Scene {idx} audio ready.")
    audio_files.append(final_audio)

# 3. FONT LOADER
def get_font(size, bold=False):
    font_name = "tahomabd.ttf" if bold else "tahoma.ttf"
    font_path = os.path.join("C:/Windows/Fonts", font_name)
    if not os.path.exists(font_path):
        font_name = "leelawdb.ttf" if bold else "leelawad.ttf"
        font_path = os.path.join("C:/Windows/Fonts", font_name)
    return ImageFont.truetype(font_path, size)

# 4. RENDER REALISTIC MAIN APP SCREEN UI FOR EACH SCENE
def draw_app_main_ui(canvas, draw, scene, rx, ry, rw, rh, theme):
    scene_id = scene["id"]
    
    # Outer App Window Shell
    draw.rounded_rectangle([rx, ry, rx + rw, ry + rh], radius=14, fill=(12, 18, 32), outline=(40, 55, 85), width=2)
    
    # Titlebar (macOS / Modern Web Style)
    draw.rounded_rectangle([rx, ry, rx + rw, ry + 44], radius=14, fill=(18, 26, 46))
    draw.rectangle([rx, ry + 30, rx + rw, ry + 44], fill=(18, 26, 46))
    draw.line([rx, ry + 44, rx + rw, ry + 44], fill=(40, 55, 85), width=1)
    
    # Window Action Dots
    draw.ellipse([rx + 16, ry + 16, rx + 28, ry + 28], fill=(239, 68, 68))
    draw.ellipse([rx + 36, ry + 16, rx + 48, ry + 28], fill=(245, 158, 11))
    draw.ellipse([rx + 56, ry + 16, rx + 68, ry + 28], fill=(34, 197, 94))

    # App Window Title & Status Badge
    f_bar_title = get_font(15, bold=True)
    f_bar_badge = get_font(12, bold=True)
    draw.text((rx + 80, ry + 12), scene["app_title"], fill=(226, 232, 240), font=f_bar_title)
    
    draw.rounded_rectangle([rx + rw - 150, ry + 10, rx + rw - 15, ry + 34], radius=6, fill=(theme[0]//4, theme[1]//4, theme[2]//4), outline=theme)
    draw.text((rx + rw - 140, ry + 13), scene["app_badge"], fill=theme, font=f_bar_badge)

    # If scene has a real screenshot image
    if "screenshot" in scene:
        screenshot_path = os.path.join(OUTPUT_DIR, scene["screenshot"])
        if os.path.exists(screenshot_path):
            im_screen = Image.open(screenshot_path)
            target_w = rw - 24
            target_h = int(target_w * (im_screen.size[1] / im_screen.size[0]))
            im_resized = im_screen.resize((target_w, target_h), Image.Resampling.LANCZOS)
            
            img_x = rx + 12
            img_y = ry + 52
            if im_resized.mode == "RGBA":
                canvas.paste(im_resized, (img_x, img_y), im_resized)
            else:
                canvas.paste(im_resized, (img_x, img_y))
                
            draw.rectangle([img_x, img_y, img_x + target_w, img_y + target_h], outline=(50, 70, 110), width=1)
            
            # Guide Header Banner
            gy = img_y + target_h + 12
            draw.rounded_rectangle([rx + 12, gy, rx + rw - 12, gy + 32], radius=6, fill=(20, 32, 56), outline=(40, 60, 95))
            draw.text((rx + 24, gy + 6), ">> คำแนะนำและจุดสำคัญบนหน้าจอ (Quick Control Guide):", fill=theme, font=get_font(14, bold=True))
            
            # 3 Guide Pills
            pill_y = gy + 40
            for p_tag, p_desc in scene.get("pills", []):
                draw.rounded_rectangle([rx + 12, pill_y, rx + rw - 12, pill_y + 44], radius=8, fill=(16, 24, 42), outline=(32, 45, 72))
                draw.rounded_rectangle([rx + 20, pill_y + 8, rx + 175, pill_y + 36], radius=6, fill=(theme[0]//4, theme[1]//4, theme[2]//4), outline=theme)
                draw.text((rx + 28, pill_y + 11), p_tag, fill=theme, font=get_font(12, bold=True))
                draw.text((rx + 190, pill_y + 11), p_desc, fill=(226, 232, 240), font=get_font(13))
                pill_y += 50
            return

    # Specific Fallback / Custom Layout for Scene 1 & Scene 7
    if scene_id == "scene_1":
        # === SCENE 1: ENTERPRISE AUDIT MATRIX ===
        issues = [
            ("● ความเสี่ยงด้านรหัสผ่าน", "ส่งรหัสผ่านในไลน์ ไม่มีเข้ารหัส เสี่ยงโดนแฮกและขโมยข้อมูล", "ความเสี่ยงระดับวิกฤต", (239, 68, 68)),
            ("▲ อุปกรณ์และทรัพย์สินสูญหาย", "อุปกรณ์ IT 76 เครื่องและเฟอร์นิเจอร์ ไม่มีการตรวจเช็คสม่ำเสมอ", "ความเสียหายหลักแสน", (245, 158, 11)),
            ("✕ ปัญหาภาษีและใบเสร็จหาย", "จ่ายค่าจ้างฟรีแลนซ์ไม่มีบิล เสี่ยงถูกสรรพากรเรียกปรับ", "เสี่ยงผิดกฎหมายภาษี", (239, 68, 68)),
            ("▼ สต็อกสินค้าไม่ตรงกับ POS", "สต็อกหน้าร้านกับหลังบ้านไม่เชื่อมกัน ขายของทิพย์ สินค้าขาดสต็อก", "สูญเสียโอกาสขาย", (245, 158, 11))
        ]
        for idx, (title, desc, tag, col) in enumerate(issues):
            iy = ry + 60 + idx * 88
            draw.rounded_rectangle([rx + 20, iy, rx + rw - 20, iy + 76], radius=10, fill=(20, 30, 52), outline=col, width=1)
            draw.text((rx + 36, iy + 14), title, fill=(255, 255, 255), font=get_font(16, bold=True))
            draw.text((rx + 36, iy + 42), desc, fill=(180, 195, 215), font=get_font(13))
            draw.rounded_rectangle([rx + rw - 190, iy + 12, rx + rw - 35, iy + 40], radius=14, fill=(col[0]//5, col[1]//5, col[2]//5), outline=col)
            draw.text((rx + rw - 180, iy + 17), tag, fill=col, font=get_font(12, bold=True))

        draw.rounded_rectangle([rx + 20, ry + 440, rx + rw - 20, ry + 490], radius=10, fill=(56, 189, 248))
        draw.text((rx + 180, ry + 452), ">> แก้ไขได้ทันทีด้วย 5 ซอฟต์แวร์ระดับองค์กรในระบบเดียว", fill=(0, 0, 0), font=get_font(16, bold=True))

    elif scene_id == "scene_7":
        # === SCENE 7: ENTERPRISE ECOSYSTEM MAP & SPECIAL OFFER ===
        draw.rounded_rectangle([rx + 20, ry + 60, rx + rw - 20, ry + 155], radius=12, fill=(20, 32, 58), outline=(16, 185, 129), width=2)
        draw.text((rx + 36, ry + 75), "● ข้อเสนอพิเศษสำหรับองค์กร: ทดลองใช้งานฟรี 3 เดือน", fill=(16, 185, 129), font=get_font(18, bold=True))
        draw.text((rx + 36, ry + 112), "ทดลองใช้งาน 3 เดือนเต็ม • ติดตั้งและอบรมพนักงานฟรี • ได้รับสิทธิ์ใช้งานเต็มรูปแบบ 100%", fill=(226, 232, 240), font=get_font(13))

        pillars = [
            ("ประหยัดงบกว่า 70%", "ลดค่าใช้จ่ายบริการรายเดือน ไม่ต้องจ่ายค่า License ต่างประเทศซ้ำซ้อน"),
            ("ความปลอดภัยระดับ Enterprise", "Zero-Knowledge Encryption ฐานข้อมูลอยู่ในเซิร์ฟเวอร์ของคุณ"),
            ("ทดลองใช้ฟรี 3 เดือนเต็ม", "เปิดให้ทดสอบระบบจริงกับงานจริงในองค์กร พร้อมทีมงานซัพพอร์ตใกล้ชิด")
        ]
        for idx, (p_title, p_desc) in enumerate(pillars):
            iy = ry + 172 + idx * 78
            draw.rounded_rectangle([rx + 20, iy, rx + rw - 20, iy + 66], radius=10, fill=(18, 28, 48), outline=(45, 60, 95))
            draw.text((rx + 36, iy + 12), f"● {p_title}", fill=(255, 255, 255), font=get_font(15, bold=True))
            draw.text((rx + 36, iy + 36), p_desc, fill=(148, 163, 184), font=get_font(13))

        # Prominent Contact CTA Box
        draw.rounded_rectangle([rx + 20, ry + 425, rx + rw - 20, ry + 500], radius=14, fill=(16, 185, 129), outline=(52, 211, 153), width=2)
        draw.text((rx + 36, ry + 438), "ติดต่อสอบถาม / ขอรับสิทธิ์ทดลองใช้งาน 3 เดือน:", fill=(0, 0, 0), font=get_font(14, bold=True))
        draw.text((rx + 36, ry + 462), "ติดต่อ: 095-465-4698  คุณ โอม", fill=(0, 0, 0), font=get_font(23, bold=True))
        draw.rounded_rectangle([rx + rw - 210, ry + 440, rx + rw - 35, ry + 485], radius=10, fill=(10, 25, 45))
        draw.text((rx + rw - 198, ry + 452), "พร้อมเริ่มติดตั้งทันที", fill=(52, 211, 153), font=get_font(13, bold=True))


# 5. GENERATE FULL HD SLIDE IMAGES (1920x1080)
print("\n=== 2. Rendering High-Definition Slide Graphics with Real App Screens (1920x1080) ===")
slide_images = []
for idx, scene in enumerate(SCENES, 1):
    img = Image.new("RGB", (1920, 1080), (6, 10, 20))
    draw = ImageDraw.Draw(img)

    theme = scene["theme_color"]

    # Subtle radial lighting
    for r in range(400, 0, -20):
        draw.ellipse([960 - r, 300 - r, 960 + r, 300 + r], fill=(theme[0]//8, theme[1]//8, theme[2]//8))

    # Top Header Bar
    draw.rectangle([0, 0, 1920, 70], fill=(10, 16, 30))
    draw.line([0, 70, 1920, 70], fill=(40, 50, 75), width=2)
    
    font_top = get_font(24, bold=True)
    draw.text((60, 20), "ENTERPRISE SOFTWARE SUITE", fill=(148, 163, 184), font=font_top)
    draw.text((1450, 20), "ALL-IN-ONE BUSINESS SOLUTION", fill=theme, font=font_top)

    # Chapter Badge
    font_badge = get_font(22, bold=True)
    draw.rounded_rectangle([60, 95, 680, 138], radius=8, fill=(theme[0]//5, theme[1]//5, theme[2]//5), outline=theme, width=2)
    draw.text((75, 103), scene["chapter"], fill=theme, font=font_badge)

    # Main Title & Subtitle (Wrapped cleanly)
    font_title = get_font(30, bold=True)
    draw.text((60, 155), scene["title"], fill=(255, 255, 255), font=font_title, spacing=6)
    
    font_sub = get_font(20, bold=False)
    draw.text((60, 255), scene["subtitle"], fill=(148, 163, 184), font=font_sub)

    # Step-by-Step Cards (Left Column: 4 Cards)
    card_w = 830
    card_h = 120
    y_start = 300
    gap = 20

    font_step_title = get_font(21, bold=True)
    font_step_desc = get_font(18, bold=False)

    for s_idx, (stitle, sdesc) in enumerate(scene["steps"]):
        cy = y_start + s_idx * (card_h + gap)
        draw.rounded_rectangle([60, cy, 60 + card_w, cy + card_h], radius=14, fill=(15, 23, 42), outline=(35, 45, 65), width=2)
        
        # Step Number Badge
        draw.rounded_rectangle([78, cy + 22, 78 + 38, cy + 22 + 38], radius=19, fill=theme)
        font_num = get_font(20, bold=True)
        draw.text((91, cy + 28), str(s_idx + 1), fill=(0, 0, 0), font=font_num)

        # Step Text
        draw.text((130, cy + 20), stitle, fill=(241, 245, 249), font=font_step_title)
        draw.text((130, cy + 62), sdesc, fill=(148, 163, 184), font=font_step_desc)

    # Right Column: APP SCREENSHOT WITH USAGE GUIDE
    rx = 920
    ry = 180
    rw = 940
    rh = 730
    draw_app_main_ui(img, draw, scene, rx, ry, rw, rh, theme)

    # Bottom Voiceover Subtitle Bar
    draw.rectangle([0, 930, 1920, 1080], fill=(2, 6, 14))
    draw.line([0, 930, 1920, 930], fill=(theme[0]//3, theme[1]//3, theme[2]//3), width=2)
    
    # Subtitle Indicator
    draw.rounded_rectangle([60, 950, 260, 990], radius=6, fill=(theme[0]//4, theme[1]//4, theme[2]//4), outline=theme, width=1)
    font_sub_tag = get_font(18, bold=True)
    draw.text((72, 958), "เสียงบรรยายไทย (หญิง)", fill=theme, font=font_sub_tag)

    # Subtitle Text with clean wrapping
    font_sub_script = get_font(20, bold=False)
    sub_text = scene["script"]
    if len(sub_text) > 105:
        split_idx = sub_text.rfind(" ", 0, 105)
        if split_idx == -1:
            split_idx = 105
        sub_text_p1 = sub_text[:split_idx]
        sub_text_p2 = sub_text[split_idx:].strip()
        draw.text((280, 952), sub_text_p1, fill=(255, 255, 255), font=font_sub_script)
        draw.text((280, 986), sub_text_p2, fill=(203, 213, 225), font=font_sub_script)
    else:
        draw.text((280, 958), sub_text, fill=(255, 255, 255), font=font_sub_script)

    slide_path = os.path.join(OUTPUT_DIR, f"{scene['id']}.png")
    img.save(slide_path, quality=95)
    slide_images.append(slide_path)
    print(f"Rendered Slide {idx}: {slide_path}")

# 6. ENCODE FINAL FULL HD MP4 VIDEO
print("\n=== 3. Encoding Full HD MP4 Video with Exact Scene Durations ===")
scene_clips = []
concat_list_file = os.path.join(OUTPUT_DIR, "concat_list.txt")

with open(concat_list_file, "w", encoding="utf-8") as f_concat:
    for idx, (slide_img, audio_track) in enumerate(zip(slide_images, audio_files), 1):
        clip_mp4 = os.path.join(OUTPUT_DIR, f"clip_{idx}.mp4")
        
        # Get audio duration
        cmd_probe = [
            FFMPEG_EXE, "-i", audio_track
        ]
        res = subprocess.run(cmd_probe, stderr=subprocess.PIPE, text=True, errors="replace")
        dur = 15.0
        for line in res.stderr.splitlines():
            if "Duration:" in line:
                parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
                dur = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
                break

        dur += 1.0
        print(f"Rendering Clip {idx} (Duration: {dur:.2f}s)...")

        cmd_clip = [
            FFMPEG_EXE, "-y",
            "-loop", "1", "-i", slide_img,
            "-i", audio_track,
            "-c:v", "libx264", "-tune", "stillimage", "-preset", "fast", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k", "-pix_fmt", "yuv420p",
            "-t", f"{dur:.2f}",
            clip_mp4
        ]
        subprocess.run(cmd_clip, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        f_concat.write(f"file '{clip_mp4.replace(os.sep, '/')}'\n")

print(f"\nConcatenating clips into final video: {FINAL_VIDEO}...")
cmd_concat = [
    FFMPEG_EXE, "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_list_file,
    "-c:v", "copy",
    "-c:a", "copy",
    FINAL_VIDEO
]
subprocess.run(cmd_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if os.path.exists(FINAL_VIDEO):
    size_mb = os.path.getsize(FINAL_VIDEO) / (1024 * 1024)
    print(f"\nSUCCESS! Generated {FINAL_VIDEO} ({size_mb:.2f} MB)")
else:
    print("\nError generating video")
