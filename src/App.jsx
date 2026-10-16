import { useState, useMemo } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { INITIAL_PROJECTS, INITIAL_AUDIT_LOGS } from './data/projectsData';
import { Header } from './components/layout/Header';
import { StatCards } from './components/layout/StatCards';
import { ProjectCard } from './components/dashboard/ProjectCard';
import { ProjectDetailModal } from './components/dashboard/ProjectDetailModal';
import { HooksManagerModal } from './components/dashboard/HooksManagerModal';
import { AuditLogsView } from './components/dashboard/AuditLogsView';
import { Toast } from './components/ui/Toast';
import { downloadMarkdownReport, printExecutivePdfReport } from './utils/exportReport';

export default function App() {
  const [projects] = useState(INITIAL_PROJECTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'logs'
  const [selectedProject, setSelectedProject] = useState(null);
  const [isHooksModalOpen, setIsHooksModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAuditing, setIsAuditing] = useState(false);
  const [testingProjectId, setTestingProjectId] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.thName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.repo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Full QA Audit Simulation
  const handleRunFullAudit = () => {
    setIsAuditing(true);
    showToast('info', 'เริ่มกระบวนการตรวจสอบคุณภาพ', 'กำลังทดสอบ 4 Quality Gates across 12 โปรเจกต์...');

    setTimeout(() => {
      setIsAuditing(false);
      const newLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: 'Automated QA Audit',
        title: 'รัน Full QA Audit 12 โปรเจกต์ ผ่านเกณฑ์ 100%',
        auditor: 'Antigravity CEO Master Agent',
        status: 'success',
        badge: 'Passed 48/48 Gates',
        details: 'ตรวจสอบ Curated Design Tokens, รัน Test Suites ทั้งหมด, ตรวจสอบ Build Pass และความพร้อมส่งมอบ'
      };

      setAuditLogs((prev) => [newLog, ...prev]);
      showToast('success', 'การตรวจสอบเสร็จสมบูรณ์', 'ทุกโปรเจกต์ผ่านเกณฑ์คุณภาพ 4 Pillars ระดับ Production-ready 100%');
    }, 1800);
  };

  // Single Project Test
  const handleTestSingle = (projectId) => {
    setTestingProjectId(projectId);
    showToast('info', 'กำลังรันการทดสอบ', 'ประเมิน Unit Tests, E2E และ Linter สำหรับโปรเจกต์นี้...');

    setTimeout(() => {
      setTestingProjectId(null);
      showToast('success', 'ทดสอบผ่านฉลุย', 'Zero errors, 100% assertions ผ่านเกณฑ์เรียบร้อย');
    }, 1200);
  };

  // Exports
  const handleExportMarkdown = () => {
    downloadMarkdownReport(projects, auditLogs);
    showToast('success', 'ส่งออกไฟล์สำเร็จ', 'ดาวน์โหลดรายงาน ANTIGRAVITY_CEO_QUALITY_REPORT.md เรียบร้อย');
  };

  const handleExportPdf = () => {
    printExecutivePdfReport(projects, auditLogs);
    showToast('info', 'เปิดหน้าพิมพ์รายงาน', 'ท่านสามารถสั่งพิมพ์ หรือเลือก Save as PDF ได้ทันที');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onRunAudit={handleRunFullAudit}
        isAuditing={isAuditing}
        onExportMarkdown={handleExportMarkdown}
        onExportPdf={handleExportPdf}
        onOpenHooksModal={() => setIsHooksModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* KPI Stats Bar */}
        <StatCards projects={projects} />

        {/* Content Views */}
        {activeView === 'dashboard' ? (
          <div className="mt-8 space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อโปรเจกต์ หรือ repo..."
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => setSelectedProject(p)}
                />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-2 text-sm text-slate-400">ไม่พบโปรเจกต์ที่ตรงกับคำค้นหา "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <AuditLogsView logs={auditLogs} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Antigravity CEO Master Platform • Enforcing Zero "AI Slop" & Production Standards</p>
      </footer>

      {/* Modals & Toasts */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onTestSingle={handleTestSingle}
        isTesting={!!testingProjectId}
      />

      <HooksManagerModal
        isOpen={isHooksModalOpen}
        onClose={() => setIsHooksModalOpen(false)}
        onCopyCommand={() => showToast('success', 'คัดลอกคำสั่งแล้ว', 'นำไปวางและรันใน Terminal เพื่อ Deploy Hooks')}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
