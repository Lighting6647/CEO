// Utility for Cross-Department Quotation + PromptPay EMVCo CRC-16 + Founder Digital Signature
// Connects D:\Light\CEO <-> D:\Light\ใบเสนอรา Light <-> D:\Light\All Chat Light

export function calculateCrc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePromptPayPayload(promptPayId = '0899998877', amount = 0) {
  const sanitizedId = promptPayId.replace(/[^0-9]/g, '');
  const formattedTarget =
    sanitizedId.length === 10 ? `0066${sanitizedId.slice(1)}` : sanitizedId.padStart(13, '0');
  const targetTag = sanitizedId.length === 10 ? '0113' : '0213';
  const merchantInfo = `0016A000000677010111${targetTag}${formattedTarget}`;
  const merchantField = `29${merchantInfo.length.toString().padStart(2, '0')}${merchantInfo}`;

  const amountStr = Number(amount || 0).toFixed(2);
  const amountField = amount > 0 ? `54${amountStr.length.toString().padStart(2, '0')}${amountStr}` : '';

  const rawPayload = `000201010212${merchantField}5802TH5303764${amountField}6304`;
  const crc = calculateCrc16(rawPayload);
  return `${rawPayload}${crc}`;
}

export function signFounderApproval(approvalId, dealAmount, discountPercent = 0) {
  const seed = `${approvalId}|${dealAmount}|${discountPercent}|D:\\Light\\CEO|FOUNDER-KEY-2026`;
  let hash1 = 0x811c9dc5;
  let hash2 = 0xcbf29ce4;
  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ code, 0x01000193) >>> 0;
    hash2 = Math.imul(hash2 ^ (code + i), 0x01000193) >>> 0;
  }
  const hex = `${hash1.toString(16).padStart(8, '0')}${hash2.toString(16).padStart(8, '0')}`.toUpperCase();
  return `KROB-SIG-${hex}`;
}

export function buildQuotationFromApproval(item, brandName = 'KROB (ครบ) AI Suite') {
  const amountMatch = `${item.title} ${item.detail}`.match(/฿([0-9,]+)/);
  const discountMatch = `${item.title} ${item.detail}`.match(/([0-9]+)%/);

  const netAmount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 24900;
  const discountPercent = discountMatch ? Number(discountMatch[1]) : 15;
  const fullAmount = Math.round(netAmount / (1 - discountPercent / 100));
  const discountBaht = fullAmount - netAmount;
  const vatAmount = Math.round(netAmount * 0.07 * 100) / 100;
  const grandTotal = Math.round((netAmount + vatAmount) * 100) / 100;

  const quoteNo = `QT-202610-${item.id.replace(/[^0-9]/g, '') || '889'}`;
  const promptPayPayload = generatePromptPayPayload('0899998877', grandTotal);
  const signature = signFounderApproval(item.id, grandTotal, discountPercent);

  return {
    quoteNo,
    approvalId: item.id,
    brandName,
    customerName: item.title.includes('—') ? item.title.split('—')[1].trim() : 'ลูกค้าองค์กร (VIP Enterprise)',
    packageTitle: item.title,
    packageDetail: item.detail,
    sourceFolder: 'D:\\Light\\ใบเสนอรา Light',
    accountingFolder: 'D:\\Light\\บัญชี Light\\accounting-app',
    chatFolder: 'D:\\Light\\All Chat Light\\omnichannel-chat-app',
    issuedAt: new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    fullAmount,
    discountPercent,
    discountBaht,
    netAmount,
    vatAmount,
    grandTotal,
    promptPayId: '089-999-8877 (บจก. ครบ เอไอ เอ็นเตอร์ไพรส์)',
    promptPayPayload,
    crcChecksum: promptPayPayload.slice(-4),
    signature,
  };
}

export function printOfficialQuotationPdf(quotation) {
  if (typeof window === 'undefined') return;
  const win = window.open('', '_blank', 'width=920,height=860');
  if (!win) return;

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>ใบเสนอราคา ${quotation.quoteNo} - ${quotation.brandName}</title>
  <style>
    body { font-family: 'Satoshi', 'Prompt', sans-serif; color: #0f172a; margin: 32px; }
    .box { border: 2px solid #0f172a; border-radius: 16px; padding: 28px; max-width: 780px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
    .badge { background: #ecfeff; color: #0e7490; border: 1px solid #06b6d4; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; text-align: left; font-size: 14px; }
    th { background: #f8fafc; font-weight: 700; }
    .right { text-align: right; }
    .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 2px dashed #cbd5e1; }
    .sig { font-family: monospace; font-size: 12px; color: #047857; background: #ecfdf5; padding: 6px 10px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">
      <div>
        <span class="badge">ออกโดยระบบอัตโนมัติ ${quotation.sourceFolder}</span>
        <h1 style="margin:8px 0 4px;font-size:22px;">${quotation.brandName}</h1>
        <p style="margin:0;font-size:13px;color:#475569;">ใบเสนอราคา / ใบแจ้งหนี้รับชำระผ่าน QR PromptPay มาตรฐาน EMVCo</p>
      </div>
      <div class="right">
        <div style="font-size:18px;font-weight:800;">เลขที่: ${quotation.quoteNo}</div>
        <div style="font-size:12px;color:#64748b;">วันที่ออก: ${quotation.issuedAt}</div>
        <div style="font-size:12px;color:#0f766e;font-weight:700;">ลูกค้า: ${quotation.customerName}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>รายการแพ็กเกจซอฟต์แวร์ (SaaS)</th>
          <th class="right">ราคาปกติ</th>
          <th class="right">ส่วนลดพิเศษ</th>
          <th class="right">ยอดสุทธิก่อน VAT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${quotation.packageTitle}</strong><br/>
            <span style="font-size:12px;color:#64748b;">${quotation.packageDetail}</span>
          </td>
          <td class="right">฿${quotation.fullAmount.toLocaleString()}</td>
          <td class="right" style="color:#e11d48;">-${quotation.discountPercent}% (฿${quotation.discountBaht.toLocaleString()})</td>
          <td class="right"><strong>฿${quotation.netAmount.toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top:16px;text-align:right;font-size:14px;">
      <div>ภาษีมูลค่าเพิ่ม (VAT 7%): <strong>฿${quotation.vatAmount.toLocaleString()}</strong></div>
      <div style="font-size:20px;font-weight:800;color:#0e7490;margin-top:6px;">
        ยอดชำระสุทธิทั้งสิ้น: ฿${quotation.grandTotal.toLocaleString()} บาท
      </div>
    </div>
    <div class="footer">
      <div>
        <div style="font-weight:700;font-size:13px;">พร้อมเพย์ (PromptPay EMVCo CRC-16: ${quotation.crcChecksum})</div>
        <div style="font-size:12px;color:#475569;">บัญชี: ${quotation.promptPayId}</div>
        <div style="font-family:monospace;font-size:11px;color:#64748b;margin-top:4px;">Payload: ${quotation.promptPayPayload}</div>
      </div>
      <div class="right">
        <div class="sig">✓ อนุมัติโดย Founder: ${quotation.signature}</div>
      </div>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
