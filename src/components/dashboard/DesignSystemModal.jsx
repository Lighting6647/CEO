import { useState, useMemo } from 'react';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  Layout,
  Type,
  ShieldCheck,
  CheckCircle2,
  Folder,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
  ALL_PROJECT_DESIGN_TOKENS,
  generateTailwindConfigForProject,
} from '../../data/designTokensData';

export function DesignSystemModal({
  isOpen,
  onClose,
  onShowToast,
  activeBrandTheme = 'ceo-master',
  onSelectBrandTheme,
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('ceo-master');
  const [copiedKey, setCopiedKey] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL'); // 'ALL' | 'Operate' | 'Persuade' | 'Experience'

  const filteredProjects = useMemo(() => {
    if (modeFilter === 'ALL') return ALL_PROJECT_DESIGN_TOKENS;
    return ALL_PROJECT_DESIGN_TOKENS.filter((p) => p.mode === modeFilter);
  }, [modeFilter]);

  const currentProject = useMemo(() => {
    return (
      ALL_PROJECT_DESIGN_TOKENS.find((p) => p.id === selectedProjectId) ||
      ALL_PROJECT_DESIGN_TOKENS[0]
    );
  }, [selectedProjectId]);

  const handleCopy = (text, key, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast?.('success', 'คัดลอกสำเร็จ', `คัดลอก "${label}" เรียบร้อยแล้ว`);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleCopyTailwind = () => {
    const config = generateTailwindConfigForProject(currentProject);
    handleCopy(config, 'tailwind', `Tailwind Config (${currentProject.name})`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎨 ระบบออกแบบและกำกับมาตรฐานดีไซน์ 17 โปรเจกต์ (Impeccable Design System)"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">
                  Impeccable Craft Floor & Zero "AI Slop"
                </h4>
                <Badge variant="success" size="sm">
                  100/100 Standards
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                กำกับคู่สีเฉพาะตัว (Brand Identity) • ฟอนต์อ่านง่ายระดับพรีเมียม • ปราศจาก Gradient ม่วง/ครามซ้ำซาก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'Operate', 'Persuade', 'Experience'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModeFilter(m)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  modeFilter === m
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {m === 'ALL' ? 'ทั้งหมด (17)' : m}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Layout: Project Selector & Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Project List */}
          <div className="md:col-span-5 space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredProjects.map((proj) => {
              const isSelected = proj.id === currentProject.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-cyan-500/80 bg-cyan-950/40 text-white shadow-md'
                      : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: proj.palette.primary }}
                      />
                      <span className="font-bold text-xs truncate">{proj.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      {proj.theme}
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/60">
                    {proj.mode}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Project Details & Live Token Swatches */}
          <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-5">
            {/* Header of Active Project */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base">{currentProject.name}</h3>
                  <Badge variant="cyan" size="sm">
                    {currentProject.mode} Mode
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                  <Folder className="h-3.5 w-3.5 text-slate-500" />
                  {currentProject.folder}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectBrandTheme?.(currentProject.id);
                    onShowToast?.(
                      'success',
                      'เปิดใช้ธีมแบรนด์สดบนแดชบอร์ด',
                      `นำพาเลทสีและบรรยากาศของ "${currentProject.name}" มาใช้บน CEO Portal เรียบร้อย`
                    );
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 ${
                    activeBrandTheme === currentProject.id
                      ? 'bg-emerald-500 text-slate-950 font-extrabold ring-2 ring-emerald-400/50'
                      : 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {activeBrandTheme === currentProject.id
                    ? '✓ ธีมนี้กำลังแสดงผลบนแดชบอร์ด'
                    : 'พรีวิวธีมสดบนแดชบอร์ด'}
                </button>

                <button
                  type="button"
                  onClick={handleCopyTailwind}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                >
                  {copiedKey === 'tailwind' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  คัดลอก Tailwind Config
                </button>
              </div>
            </div>

            {/* Curated Color Swatches */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Palette className="h-4 w-4 text-cyan-400" />
                ชุดสีเฉพาะทาง (Curated Palette & Neutrals)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Primary Brand', val: currentProject.palette.primary },
                  { label: 'Brand Accent', val: currentProject.palette.accent },
                  { label: 'Card Surface', val: currentProject.palette.cardSurface },
                  { label: 'Neutral Canvas', val: currentProject.palette.background },
                ].map((c, i) => (
                  <div
                    key={i}
                    onClick={() => handleCopy(c.val, `color-${i}`, c.label)}
                    className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-900 p-2 text-center hover:border-slate-700 transition-all active:scale-95"
                  >
                    <div
                      className="h-8 w-full rounded-lg border border-white/10 shadow-inner mb-1.5 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: c.val }}
                    />
                    <div className="text-[10px] text-slate-400 font-medium truncate">{c.label}</div>
                    <div className="text-[11px] font-mono font-bold text-white uppercase mt-0.5">
                      {c.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Stack */}
            <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Type className="h-4 w-4 text-teal-400" />
                ระบบตัวอักษรระดับพรีเมียม (Typography Stack)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block">Display / หัวข้อ</span>
                  <strong className="text-white text-sm">{currentProject.typography.display}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Body / เนื้อหา & ตัวเลข</span>
                  <span className="text-white text-sm">{currentProject.typography.body}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                ฟังก์ชันตัวเลข: {currentProject.typography.features}
              </div>
            </div>

            {/* Elevation & Rules Floor */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                มาตรฐานมิติ (Elevation) & กฎป้องกัน AI Slop
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 space-y-1.5 text-emerald-200">
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ระบบมิติ: {currentProject.elevation}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentProject.antiPatternsBanned.map((rule, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-emerald-900/40 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300"
                    >
                      ✓ {rule}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Micro-interaction Live Test Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5 text-slate-500" />
                ทดสอบสัมผัสปุ่ม:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  style={{ backgroundColor: currentProject.palette.primary }}
                  className="rounded-xl px-3.5 py-1.5 font-bold text-slate-950 shadow hover:brightness-110 active:scale-95 transition-all"
                  onClick={() =>
                    onShowToast?.('success', 'Tactile Feedback', `คลิกปุ่มหลักของ ${currentProject.name}`)
                  }
                >
                  ปุ่มหลัก (Primary)
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: currentProject.palette.cardSurface,
                    borderColor: currentProject.palette.border,
                  }}
                  className="rounded-xl border px-3.5 py-1.5 font-semibold text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
                  onClick={() =>
                    onShowToast?.('info', 'Secondary Feedback', `คลิกปุ่มรองของ ${currentProject.name}`)
                  }
                >
                  ปุ่มรอง (Secondary)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
