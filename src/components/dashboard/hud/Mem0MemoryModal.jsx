import { useState, useEffect } from 'react';
import {
  X,
  Brain,
  Trash2,
  Plus,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  Search,
} from 'lucide-react';
import { getStoredMemories, addMemory, deleteMemory, resetMemories } from '../../../services/mem0Service';
import {
  getMem0MediaGallery,
  deleteMediaFromMem0Gallery,
  clearMem0MediaGallery,
} from '../../../services/externalWebService';
import { openSystemBrowser } from '../../../services/browserLauncherService';
import { playClickSound, playSuccessSound, playAlertSound } from '../../../utils/soundEffects';

export function Mem0MemoryModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'gallery'
  const [memories, setMemories] = useState([]);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newCategory, setNewCategory] = useState('preference');
  const [mediaGallery, setMediaGallery] = useState([]);
  const [mediaSearch, setMediaSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMemories(getStoredMemories());
      setMediaGallery(getMem0MediaGallery());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    playSuccessSound();
    const created = addMemory(newMemoryText, newCategory);
    if (created) {
      setMemories(getStoredMemories());
      setNewMemoryText('');
    }
  };

  const handleDelete = (id) => {
    playAlertSound();
    const updated = deleteMemory(id);
    setMemories(updated);
  };

  const handleReset = () => {
    playClickSound();
    const reset = resetMemories();
    setMemories(reset);
  };

  const handleDeleteMedia = (idOrUrl) => {
    playAlertSound();
    deleteMediaFromMem0Gallery(idOrUrl);
    setMediaGallery(getMem0MediaGallery());
  };

  const handleClearMediaGallery = () => {
    playAlertSound();
    clearMem0MediaGallery();
    setMediaGallery([]);
  };

  const filteredMedia = mediaGallery.filter((m) => {
    if (!mediaSearch.trim()) return true;
    const s = mediaSearch.toLowerCase();
    return (
      (m.caption || '').toLowerCase().includes(s) ||
      (m.query || '').toLowerCase().includes(s) ||
      (m.source || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-cyan-500/40 bg-slate-950/95 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide text-white">
                  MEM0 // LONG-TERM ECOSYSTEM MEMORY
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PERSISTENT CONTEXT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบจัดเก็บประวัติ ความชอบ และสื่อภาพข่าวสารของ sir ไลท์ สำหรับใช้ในการสนทนาต่อเนื่องข้ามวัน
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-1 border-b border-slate-800 bg-slate-950/60 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('text');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>ความจำและบริบท ({memories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('gallery');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>อัลบั้มภาพสื่อ ({mediaGallery.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          
          {/* TAB 1: TEXT MEMORIES */}
          {activeTab === 'text' && (
            <>
              {/* Add New Memory Input */}
              <form onSubmit={handleAdd} className="p-3 rounded-xl border border-cyan-500/30 bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> เพิ่มความจำใหม่ให้ J.A.R.V.I.S. จดจำ
                  </span>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-black/60 border border-slate-700 text-slate-300 rounded px-2 py-0.5 text-[10px] font-mono cursor-pointer"
                  >
                    <option value="preference">Preference (ความชอบ)</option>
                    <option value="projects">Projects (งาน/โปรเจกต์)</option>
                    <option value="personality">Personality (บุคลิก)</option>
                    <option value="identity">Identity (ตัวตน/บทบาท)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder="เช่น 'sir ไลท์ กำลังเร่งปิดดีลระบบคลินิก IT ภายในเดือนนี้' หรือ 'ชอบกาแฟดำตอนเช้า'..."
                    className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMemoryText.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    บันทึก
                  </button>
                </div>
              </form>

              {/* Memories List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <span>ความจำที่จัดเก็บในระบบ ({memories.length} รายการ)</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                    title="รีเซ็ตความจำกลับเป็นค่าตั้งต้น"
                  >
                    <RefreshCw className="w-3 h-3" /> คืนค่าเริ่มต้น
                  </button>
                </div>

                {memories.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                          {m.category || 'general'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(m.created_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{m.memory}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="opacity-40 group-hover:opacity-100 p-1 rounded hover:bg-red-950 hover:text-red-400 text-slate-500 transition-all cursor-pointer"
                      title="ลบความจำนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 2: VISUAL MEDIA ALBUM EXPLORER */}
          {activeTab === 'gallery' && (
            <div className="space-y-3">
              {/* Search & Actions Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 rounded-xl border border-cyan-500/30 bg-slate-900/50">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="ค้นหาภาพตามหัวข้อ คำบรรยาย หรือแหล่งที่มา..."
                    className="w-full bg-black/60 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                {mediaGallery.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearMediaGallery}
                    className="text-[10px] font-mono text-slate-400 hover:text-red-400 px-2 py-1 rounded border border-slate-800 hover:border-red-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    title="ล้างภาพทั้งหมดในอัลบั้ม"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>ล้างทั้งหมด</span>
                  </button>
                )}
              </div>

              {/* Visual Media Grid */}
              {filteredMedia.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id || item.url}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 hover:border-cyan-500/40 transition-all overflow-hidden flex flex-col group shadow-lg"
                    >
                      {/* Image Thumbnail Stage */}
                      <div className="relative h-28 bg-black overflow-hidden flex items-center justify-center">
                        <img
                          src={item.url}
                          alt={item.caption || 'Saved Media'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          {item.query && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-950/90 border border-cyan-500/40 text-cyan-300">
                              #{item.query}
                            </span>
                          )}
                          {item.hotspots && item.hotspots.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300">
                              🎯 {item.hotspots.length} จุดชี้
                            </span>
                          )}
                        </div>

                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            openSystemBrowser(item.url);
                          }}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          title="เปิดดูภาพเต็มในเบราว์เซอร์"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Card Content & Meta */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-sans">
                          {item.caption || 'ภาพประกอบจากเว็บภายนอก'}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                          <span className="truncate max-w-[120px] text-cyan-400">{item.source || 'Web Source'}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span>{item.savedAt ? new Date(item.savedAt).toLocaleDateString('th-TH') : ''}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(item.id || item.url)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded cursor-pointer"
                              title="ลบภาพนี้ออกจาก Mem0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/30 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-300 font-mono">
                    {mediaSearch ? 'ไม่พบภาพที่ตรงกับคำค้นหา' : 'ยังไม่มีภาพที่บันทึกไว้ในอัลบั้ม Mem0'}
                  </h3>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {mediaSearch
                      ? 'ลองค้นหาด้วยคำอื่น หรือล้างช่องค้นหาเพื่อดูภาพทั้งหมด'
                      : 'sir ไลท์ สามารถกดปุ่ม "🖼️ บันทึกเข้าอัลบั้ม Mem0" บนหน้าจอโฮโลแกรม หรือสั่งเสียง "จาร์วิส บันทึกภาพ" เพื่อเก็บสื่อข่าวสารลงในอัลบั้มนี้ได้ครับ'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Active Memory & Visual Vault: Online
          </span>
          <span className="text-cyan-400 font-bold">MEM0 AI ENGINE v3.1</span>
        </div>
      </div>
    </div>
  );
}
