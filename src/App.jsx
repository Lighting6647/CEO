import { useState, useMemo, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { INITIAL_PROJECTS, INITIAL_AUDIT_LOGS } from './data/projectsData';
import { Header } from './components/layout/Header';
import { StatCards } from './components/layout/StatCards';
import { ProjectCard } from './components/dashboard/ProjectCard';
import { ProjectDetailModal } from './components/dashboard/ProjectDetailModal';
import { HooksManagerModal } from './components/dashboard/HooksManagerModal';
import { NotificationModal } from './components/dashboard/NotificationModal';
import { EnvVaultModal } from './components/dashboard/EnvVaultModal';
import { VulnerabilityModal } from './components/dashboard/VulnerabilityModal';
import { BackupManagerModal } from './components/dashboard/BackupManagerModal';
import { CommandPalette } from './components/dashboard/CommandPalette';
import { EnvironmentMatrixView } from './components/dashboard/EnvironmentMatrixView';
import { AgentsSquadView } from './components/dashboard/AgentsSquadView';
import { UptimeMonitorView } from './components/dashboard/UptimeMonitorView';
import { AuditLogsView } from './components/dashboard/AuditLogsView';
import { Toast } from './components/ui/Toast';
import { downloadMarkdownReport, printExecutivePdfReport } from './utils/exportReport';
import { exportProjectsToCsv, exportProjectsToJson } from './utils/csvExport';
import { isSoundEnabled, setSoundEnabled, playSuccessSound, playClickSound, playAlertSound } from './utils/soundEffects';

export default function App() {
  const [projects] = useState(INITIAL_PROJECTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'environments' | 'uptime' | 'logs'
  const [selectedProject, setSelectedProject] = useState(null);
  const [isHooksModalOpen, setIsHooksModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEnvVaultModalOpen, setIsEnvVaultModalOpen] = useState(false);
  const [isVulnModalOpen, setIsVulnModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAuditing, setIsAuditing] = useState(false);
  const [testingProjectId, setTestingProjectId] = useState(null);

  // Sound state
  const [isSoundActive, setIsSoundActive] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    setIsSoundActive((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      if (next) playClickSound();
      return next;
    });
  };

  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('antigravity_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('antigravity_theme', theme);
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        playClickSound();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    playClickSound();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    if (type === 'success') {
      playSuccessSound();
    } else if (type === 'error') {
      playAlertSound();
    } else {
      playClickSound();
    }
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
    playClickSound();
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
          minute: '2-digit',
        }),
        type: 'Automated QA Audit',
        title: 'รัน Full QA Audit 12 โปรเจกต์ ผ่านเกณฑ์ 100%',
        auditor: 'Antigravity CEO Master Agent',
        status: 'success',
        badge: 'Passed 48/48 Gates',
        details: 'ตรวจสอบ Curated Design Tokens, รัน Test Suites ทั้งหมด, ตรวจสอบ Build Pass และความพร้อมส่งมอบ',
      };

      setAuditLogs((prev) => [newLog, ...prev]);
      showToast('success', 'การตรวจสอบเสร็จสมบูรณ์', 'ทุกโปรเจกต์ผ่านเกณฑ์คุณภาพ 4 Pillars ระดับ Production-ready 100%');
    }, 1800);
  };

  // Single Project Test
  const handleTestSingle = (projectId) => {
    setTestingProjectId(projectId);
    playClickSound();
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

  const handleExportCsv = () => {
    exportProjectsToCsv(projects);
    showToast('success', 'ส่งออก CSV สำเร็จ', 'ไฟล์ UTF-8 CSV รองรับ Excel และ Google Sheets พร้อมใช้งาน');
  };

  const handleExportJson = () => {
    exportProjectsToJson(projects, auditLogs);
    showToast('success', 'ส่งออก JSON สำเร็จ', 'สำรองข้อมูลภาพรวมโปรเจกต์และ Audit Logs ครบถ้วน');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Header */}
      <Header
        activeView={activeView}
        setActiveView={(v) => { playClickSound(); setActiveView(v); }}
        onRunAudit={handleRunFullAudit}
        isAuditing={isAuditing}
        onExportMarkdown={handleExportMarkdown}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onOpenHooksModal={() => { playClickSound(); setIsHooksModalOpen(true); }}
        onOpenNotificationModal={() => { playClickSound(); setIsNotificationModalOpen(true); }}
        onOpenEnvVaultModal={() => { playClickSound(); setIsEnvVaultModalOpen(true); }}
        onOpenVulnModal={() => { playClickSound(); setIsVulnModalOpen(true); }}
        onOpenBackupModal={() => { playClickSound(); setIsBackupModalOpen(true); }}
        onOpenCommandPalette={() => { playClickSound(); setIsCommandPaletteOpen(true); }}
        theme={theme}
        onToggleTheme={toggleTheme}
        isSoundActive={isSoundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* KPI Stats Bar */}
        <StatCards projects={projects} />

        {/* Content Views */}
        {activeView === 'dashboard' && (
          <div className="mt-8 space-y-6">
            {/* Filter and Search Bar */}
            <div className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-sm'}`}>
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { playClickSound(); setSelectedCategory(cat); }}
                    className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/40 shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input with Cmd+K hint */}
              <div className="relative w-full sm:w-80 flex items-center">
                <Search className={`absolute left-3 top-2.5 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาโปรเจกต์ หรือ repo..."
                  className={`w-full rounded-xl border py-2 pl-9 pr-14 text-xs focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                    isDark
                      ? 'border-slate-700/80 bg-slate-950/60 text-slate-100 placeholder-slate-500'
                      : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => { playClickSound(); setIsCommandPaletteOpen(true); }}
                  className="absolute right-2 rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700/60 hover:text-white"
                >
                  ⌘K
                </button>
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => { playClickSound(); setSelectedProject(p); }}
                />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className={`rounded-2xl border p-12 text-center ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
                <AlertCircle className="mx-auto h-8 w-8 text-slate-500" />
                <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>ไม่พบโปรเจกต์ที่ตรงกับคำค้นหา "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'environments' && (
          <div className="mt-8">
            <EnvironmentMatrixView projects={projects} />
          </div>
        )}

        {activeView === 'uptime' && (
          <div className="mt-8">
            <UptimeMonitorView onShowToast={showToast} />
          </div>
        )}

        {activeView === 'logs' && (
          <div className="mt-8">
            <AuditLogsView logs={auditLogs} />
          </div>
        )}

        {activeView === 'agents' && (
          <div className="mt-8">
            <AgentsSquadView
              onShowToast={showToast}
              onCopyPrompt={() => {
                if (isSoundActive) playClickSound();
                showToast('success', 'คัดลอก Prompt แล้ว', 'นำไปสั่งการ AI Agent เพื่อพัฒนาธุรกิจได้ทันที');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${isDark ? 'border-slate-800/80 bg-slate-950/60 text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
        <p>© 2026 Antigravity CEO Master Platform • Enforcing Zero "AI Slop" & Production Standards</p>
      </footer>

      {/* Modals & Command Palette */}
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

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onShowToast={showToast}
      />

      <EnvVaultModal
        isOpen={isEnvVaultModalOpen}
        onClose={() => setIsEnvVaultModalOpen(false)}
        onShowToast={showToast}
      />

      <VulnerabilityModal
        isOpen={isVulnModalOpen}
        onClose={() => setIsVulnModalOpen(false)}
        onShowToast={showToast}
      />

      <BackupManagerModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        projects={projects}
        auditLogs={auditLogs}
        onShowToast={showToast}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        projects={projects}
        onSelectProject={(p) => setSelectedProject(p)}
        onRunAudit={handleRunFullAudit}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
        onExportMarkdown={handleExportMarkdown}
        onToggleTheme={toggleTheme}
        theme={theme}
        onOpenHooks={() => setIsHooksModalOpen(true)}
        onOpenNotify={() => setIsNotificationModalOpen(true)}
        onOpenEnvVault={() => setIsEnvVaultModalOpen(true)}
        onOpenVuln={() => setIsVulnModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onSelectView={(v) => { playClickSound(); setActiveView(v); }}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
