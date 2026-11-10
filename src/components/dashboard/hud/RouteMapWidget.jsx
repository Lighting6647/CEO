import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Maximize2, Minimize2, X } from 'lucide-react';
import { buildMapEmbedUrl, buildDirectionsUrl } from '../../../utils/routeIntel';

/**
 * Interactive Route Map Widget
 * Embedded Google Maps preview of the destination + one-click live navigation
 * (Google Maps directions show real-time traffic colours green / orange / red).
 * Supports standard compact HUD card and high-tech panoramic canvas mode.
 */
export function RouteMapWidget({
  destination,
  panoramic = false,
  onTogglePanoramic = null,
  onClose = null,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`mt-2 rounded-xl border border-emerald-500/40 bg-slate-950/95 overflow-hidden shadow-2xl transition-all duration-300 ${
        panoramic ? 'w-full ring-2 ring-emerald-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono border-b border-emerald-500/30 bg-emerald-950/30">
        <span className="flex items-center gap-1.5 text-emerald-300 font-bold truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span className="truncate">
            {panoramic ? '🗺️ แผนที่แบบเต็มผืน PANORAMIC HUD // ' : ''}ปลายทาง: {destination || 'กรุงเทพมหานคร'}
          </span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {onTogglePanoramic && (
            <button
              type="button"
              onClick={onTogglePanoramic}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-950 transition-colors text-[9px] font-mono cursor-pointer"
              title={panoramic ? 'ย่อมุมมองแผนที่' : 'ขยายแผนที่แบบเต็มผืน'}
            >
              {panoramic ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              <span>{panoramic ? 'ย่อแผนที่' : 'เต็มผืน'}</span>
            </button>
          )}
          <a
            href={buildDirectionsUrl(destination)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-2.5 py-1 font-bold text-slate-950 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            title="เปิดนำทางพร้อมสภาพจราจรเรียลไทม์ใน Google Maps (เปิดแท็บใหม่)"
          >
            <Navigation className="w-3 h-3" />
            <span>นำทางในแท็บใหม่</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="ปิดแผนที่"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {panoramic && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/60 border-b border-emerald-500/20 text-[10px] text-emerald-300 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>โหมดพาโนรามา 100% // สภาพการจราจรแบบสดจาก Google Maps</span>
          </span>
          <span className="text-slate-400 text-[9px]">
            กด [ESC] หรือกดปุ่ม (X) ด้านบนขวาเพื่อย่อ/ปิดแผนที่
          </span>
        </div>
      )}

      <div className={`relative w-full ${panoramic ? 'h-96 md:h-[480px]' : 'h-36'}`}>
        {!loaded && !failed && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" aria-hidden="true" />
        )}
        {failed ? (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 px-3 text-center">
            โหลดแผนที่ไม่สำเร็จ (ออฟไลน์?) — กด “นำทางสด” เพื่อเปิดใน Google Maps แทนครับ
          </div>
        ) : (
          <iframe
            title={`แผนที่ไป ${destination || 'กรุงเทพมหานคร'}`}
            src={buildMapEmbedUrl(destination)}
            className="absolute inset-0 h-full w-full border-0 grayscale-[20%] contrast-110"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>

      <div className="flex items-center gap-3 px-3 py-1.5 text-[9px] font-mono text-slate-400 border-t border-emerald-500/20 bg-slate-950/80">
        <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-emerald-400" />คล่องตัว</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-amber-400" />หนาแน่น</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-red-500" />ติดขัด</span>
        <span className="ml-auto text-emerald-400/80 font-bold">LIVE GPS TELEMETRY // REAL-TIME TRAFFIC</span>
      </div>
    </div>
  );
}
