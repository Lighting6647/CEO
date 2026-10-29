import { X, Printer, Send, ShieldCheck, QrCode, BellRing } from 'lucide-react';
import { printOfficialQuotationPdf } from '../../utils/quotationGenerator';

export function QuotationPreviewModal({
  quotation,
  isOpen,
  onClose,
  onSendToCustomerChat,
  onSendLineWebhook,
}) {
  if (!isOpen || !quotation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                ✓ อนุมัติโดย Founder เรียบร้อย
              </span>
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-mono text-cyan-300 border border-cyan-500/30">
                {quotation.sourceFolder}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-extrabold text-white">
              ใบเสนอราคาอัตโนมัติ #{quotation.quoteNo} + QR PromptPay
            </h3>
            <p className="text-xs text-slate-400">
              สร้างข้ามแผนกอัตโนมัติ: <code className="text-cyan-300">CEO</code> →{' '}
              <code className="text-emerald-300">ใบเสนอรา Light</code> →{' '}
              <code className="text-amber-300">All Chat Light</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quotation Breakdown */}
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
              <div>
                <span className="text-slate-400">ลูกค้า: </span>
                <strong className="text-white">{quotation.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400">วันที่ออกเอกสาร: </span>
                <span className="text-slate-200">{quotation.issuedAt}</span>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="font-bold text-cyan-300">{quotation.packageTitle}</div>
              <div className="text-slate-400">{quotation.packageDetail}</div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-900 p-2.5">
                  <div className="text-[10px] text-slate-400">ราคาปกติ</div>
                  <div className="text-sm font-bold text-slate-200">
                    ฿{quotation.fullAmount.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2.5">
                  <div className="text-[10px] text-rose-400">ส่วนลดอนุมัติพิเศษ</div>
                  <div className="text-sm font-bold text-rose-300">
                    -{quotation.discountPercent}% (฿{quotation.discountBaht.toLocaleString()})
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2.5">
                  <div className="text-[10px] text-slate-400">VAT 7%</div>
                  <div className="text-sm font-bold text-slate-200">
                    ฿{quotation.vatAmount.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5">
                  <div className="text-[10px] text-emerald-300">ยอดชำระสุทธิรวม VAT</div>
                  <div className="text-sm font-extrabold text-emerald-400">
                    ฿{quotation.grandTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PromptPay EMVCo QR + Digital Signature */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-slate-950/90 p-3.5">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-white p-1.5 text-slate-950 shadow">
                <QrCode className="h-10 w-10 text-slate-900" />
                <span className="text-[8px] font-extrabold tracking-tighter text-cyan-800">PROMPTPAY</span>
              </div>
              <div className="min-w-0 text-xs">
                <div className="font-bold text-cyan-300">
                  QR PromptPay มาตรฐาน EMVCo
                </div>
                <div className="text-[11px] text-slate-300 truncate">{quotation.promptPayId}</div>
                <div className="mt-1 font-mono text-[10px] text-emerald-400">
                  CRC-16 Checksum: {quotation.crcChecksum}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-emerald-500/30 bg-slate-950/90 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                ลายเซ็นดิจิทัล Founder (Anti-Tamper)
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-200">{quotation.signature}</div>
              <div className="mt-1 text-[10px] text-slate-400">
                ยืนยันคำสั่งอนุมัติจริง ป้องกัน AI ออกส่วนลดเกินสิทธิ์โดยพลการ
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => printOfficialQuotationPdf(quotation)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25"
          >
            <Printer className="h-3.5 w-3.5" />
            พิมพ์ / บันทึก PDF ใบเสนอราคา
          </button>

          <button
            type="button"
            onClick={() => onSendLineWebhook(quotation)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
          >
            <BellRing className="h-3.5 w-3.5" />
            ส่งแจ้งเตือนเข้า LINE / Telegram
          </button>

          <button
            type="button"
            onClick={() => {
              onSendToCustomerChat(quotation);
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-950/50"
          >
            <Send className="h-3.5 w-3.5" />
            ส่งใบเสนอราคา + QR เข้าแชทลูกค้าทันที
          </button>
        </div>
      </div>
    </div>
  );
}
