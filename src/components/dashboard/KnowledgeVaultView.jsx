import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  Eye,
  Trash2,
  Plus,
  Shield,
  FileCheck,
  FolderLock,
  Layers,
  FileText,
  Megaphone,
  TrendingUp,
  HeartHandshake,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { INITIAL_VAULT_ITEMS } from '../../data/agentInitialVault';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

const AGENT_ICON_MAP = {
  product_architect: Layers,
  doc_operations_manager: FileText,
  brand_growth_hacker: Megaphone,
  sales_conversion_copywriter: TrendingUp,
  customer_retention_specialist: HeartHandshake,
};

const AGENT_COLOR_MAP = {
  product_architect: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
  doc_operations_manager: 'border-blue-500/30 text-blue-400 bg-blue-950/20',
  brand_growth_hacker: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
  sales_conversion_copywriter: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
  customer_retention_specialist: 'border-purple-500/30 text-purple-400 bg-purple-950/20',
};

const STORAGE_KEY = 'antigravity_agent_vault_items';

export function KnowledgeVaultView({ onShowToast }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_VAULT_ITEMS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('ALL');
  const [previewItem, setPreviewItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form state
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemAgent, setNewItemAgent] = useState('product_architect');
  const [newItemCategory, setNewItemCategory] = useState('Product Specs');
  const [newItemContent, setNewItemContent] = useState('');

  // Persist items
  const persistItems = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // storage quota or private browsing
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchAgent = selectedAgentFilter === 'ALL' || item.agentId === selectedAgentFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        item.title.toLowerCase().includes(q) ||
        (item.thaiTitle && item.thaiTitle.toLowerCase().includes(q)) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
      return matchAgent && matchQuery;
    });
  }, [items, selectedAgentFilter, searchQuery]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playClickSound();
    if (onShowToast) onShowToast('success', 'คัดลอกเอกสารแล้ว', 'นำเนื้อหาไปใช้งานหรือส่งต่อให้ทีมได้ทันที');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadMarkdown = (item) => {
    playClickSound();
    const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}-${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('success', 'ดาวน์โหลดไฟล์สำเร็จ', `ส่งออก ${item.title}.md เรียบร้อย`);
  };

  const handleExportAllVault = () => {
    playSuccessSound();
    const fullMarkdown = items
      .map(
        (it) =>
          `# ${it.title} (${it.version})\n**ผู้สร้าง:** ${it.agentName} | **สถานะ:** ${it.status}\n**วันที่:** ${it.createdAt}\n\n${it.content}\n\n---\n`
      )
      .join('\n');

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CEO_KNOWLEDGE_VAULT_BUNDLE_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('success', 'ส่งออกเอกสารทั้งหมด', `ส่งออกคลังเอกสาร ${items.length} ฉบับรวมเป็นไฟล์เดียวสำเร็จ`);
  };

  const handleDeleteItem = (id) => {
    playClickSound();
    const next = items.filter((it) => it.id !== id);
    persistItems(next);
    if (onShowToast) onShowToast('info', 'ลบเอกสารแล้ว', 'เอกสารถูกนำออกจากคลังเรียบร้อย');
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !newItemContent.trim()) {
      if (onShowToast) onShowToast('error', 'กรุณากรอกข้อมูล', 'ต้องมีหัวข้อและเนื้อหาเอกสาร');
      return;
    }

    const created = {
      id: `vault-custom-${Date.now()}`,
      agentId: newItemAgent,
      agentName:
        newItemAgent === 'product_architect'
          ? 'Product Architect & UX Strategist'
          : newItemAgent === 'doc_operations_manager'
          ? 'Operations & Document Architect'
          : newItemAgent === 'brand_growth_hacker'
          ? 'Brand Awareness & Growth Hacker'
          : newItemAgent === 'sales_conversion_copywriter'
          ? 'Sales Funnel & Conversion Copywriter'
          : 'Customer Experience & Retention Specialist',
      title: newItemTitle,
      thaiTitle: newItemTitle,
      category: newItemCategory,
      version: '1.0.0',
      status: 'Custom Vault Entry',
      createdAt: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      tags: ['Custom', newItemCategory],
      summary: newItemContent.slice(0, 160) + '...',
      content: newItemContent,
    };

    persistItems([created, ...items]);
    setIsAddModalOpen(false);
    setNewItemTitle('');
    setNewItemContent('');
    playSuccessSound();
    if (onShowToast) onShowToast('success', 'บันทึกเอกสารใหม่สำเร็จ', 'เพิ่มเอกสารลงใน Knowledge Vault เรียบร้อย');
  };

  return (
    <div className="space-y-6">
      {/* Vault Header Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <FolderLock className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-white">Digital Product Knowledge Vault</h2>
              <Badge variant="cyan" text={`${items.length} เอกสาร`} />
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                <Shield className="h-3 w-3" />
                Persistent Storage
              </span>
            </div>
            <p className="text-sm text-slate-400">
              คลังศูนย์กลางจัดเก็บพิมพ์เขียวสเปกสินค้า (PRD), สัญญาและข้อกฎหมาย (PDPA), แผนการตลาด และสคริปต์ปิดการขายที่ AI สร้างขึ้น
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { playClickSound(); setIsAddModalOpen(true); }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>เพิ่มเอกสารใหม่</span>
            </button>
            <button
              onClick={handleExportAllVault}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>ส่งออกไฟล์รวมทั้งหมด (.md)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Agent Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => { playClickSound(); setSelectedAgentFilter('ALL'); }}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
              selectedAgentFilter === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            ทั้งหมด ({items.length})
          </button>
          <button
            onClick={() => { playClickSound(); setSelectedAgentFilter('product_architect'); }}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
              selectedAgentFilter === 'product_architect'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Product Specs
          </button>
          <button
            onClick={() => { playClickSound(); setSelectedAgentFilter('doc_operations_manager'); }}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
              selectedAgentFilter === 'doc_operations_manager'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Legal & SOP
          </button>
          <button
            onClick={() => { playClickSound(); setSelectedAgentFilter('brand_growth_hacker'); }}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
              selectedAgentFilter === 'brand_growth_hacker'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Marketing
          </button>
          <button
            onClick={() => { playClickSound(); setSelectedAgentFilter('sales_conversion_copywriter'); }}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
              selectedAgentFilter === 'sales_conversion_copywriter'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Sales Page
          </button>
          <button
            onClick={() => { playClickSound(); setSelectedAgentFilter('customer_retention_specialist'); }}
            className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
              selectedAgentFilter === 'customer_retention_specialist'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Retention
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาในคลังเอกสาร..."
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Vault Items Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const IconComponent = AGENT_ICON_MAP[item.agentId] || FileCheck;
          const colorClass = AGENT_COLOR_MAP[item.agentId] || 'border-slate-700 text-slate-400';
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all backdrop-blur-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${colorClass}`}>
                    <IconComponent className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.category}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                      v{item.version}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {item.thaiTitle || item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.title}</p>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">{item.createdAt}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { playClickSound(); setPreviewItem(item); }}
                    title="ดูเอกสารฉบับเต็ม"
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:border-cyan-500 hover:text-white transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    title="คัดลอกเนื้อหา"
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:border-cyan-500 hover:text-white transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadMarkdown(item)}
                    title="ดาวน์โหลด .md"
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:border-cyan-500 hover:text-white transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    title="ลบเอกสาร"
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <FolderLock className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">ไม่พบเอกสารที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      )}

      {/* Preview Full Document Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem.thaiTitle || previewItem.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-slate-700">
                  เวอร์ชัน {previewItem.version}
                </span>
                <span className="text-xs text-slate-400">
                  สร้างโดย: <strong className="text-slate-200">{previewItem.agentName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(`modal-${previewItem.id}`, previewItem.content)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500 hover:text-white transition-all"
                >
                  {copiedId === `modal-${previewItem.id}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>คัดลอกทั้งหมด</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownloadMarkdown(previewItem)}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-900/60 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ดาวน์โหลด .md</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 font-mono text-xs text-slate-200 leading-relaxed max-h-[55vh] overflow-y-auto whitespace-pre-wrap select-all">
              {previewItem.content}
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Custom Artifact Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="บันทึกเอกสารใหม่ลง Knowledge Vault"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleAddNewItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ชื่อเอกสาร (Document Title)
              </label>
              <input
                type="text"
                required
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="เช่น: คู่มือติดตั้ง API สำหรับลูกค้า Enterprise"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  AI Agent ผู้รับผิดชอบ
                </label>
                <select
                  value={newItemAgent}
                  onChange={(e) => setNewItemAgent(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="product_architect">01: Product Architect</option>
                  <option value="doc_operations_manager">02: Operations & Doc</option>
                  <option value="brand_growth_hacker">03: Brand Growth</option>
                  <option value="sales_conversion_copywriter">04: Sales Copywriter</option>
                  <option value="customer_retention_specialist">05: Customer Retention</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  หมวดหมู่ (Category)
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Product Specs">Product Specs</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                  <option value="Growth & Marketing">Growth & Marketing</option>
                  <option value="Sales & Copywriting">Sales & Copywriting</option>
                  <option value="Customer Success">Customer Success</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                เนื้อหาเอกสาร (Markdown Supported)
              </label>
              <textarea
                required
                rows={8}
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
                placeholder="# หัวข้อเอกสาร&#10;&#10;รายละเอียดและขั้นตอนการทำงาน..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-xl border border-cyan-500/50 bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-all shadow-md shadow-cyan-950/40"
              >
                บันทึกลงคลังเอกสาร
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
