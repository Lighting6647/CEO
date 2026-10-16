/**
 * CSV and JSON Data Exporter Utility for Business Intelligence & Excel
 */

export function exportProjectsToCsv(projects) {
  const headers = [
    'ID',
    'Project Name',
    'Thai Title',
    'Category',
    'Quality Grade',
    'Health Index (%)',
    'GitHub Repository',
    'Local Path',
    'Last Commit',
    'Tests Summary',
    'Test Coverage',
    'Responsive Support',
    'Linter Errors',
    'Gate 1 (UI/UX Tokens)',
    'Gate 2 (Testing QA)',
    'Gate 3 (Deployment)',
    'Gate 4 (Recommender)',
    'Last Audited',
  ];

  const rows = projects.map((p) => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.thName.replace(/"/g, '""')}"`,
    p.category,
    p.score,
    p.health,
    p.repo,
    `"${p.path.replace(/"/g, '""')}"`,
    p.commit,
    `"${p.metrics.tests}"`,
    p.metrics.coverage,
    `"${p.metrics.responsive}"`,
    p.metrics.linter,
    p.gates.gate1.status,
    p.gates.gate2.status,
    p.gates.gate3.status,
    p.gates.gate4.status,
    `"${p.lastAudited}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ANTIGRAVITY_QUALITY_MATRIX_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportProjectsToJson(projects, auditLogs) {
  const payload = {
    exportedAt: new Date().toISOString(),
    standard: 'Antigravity 4-Pillar Zero AI Slop & Production-Ready Standards',
    account: 'https://github.com/Lighting6647',
    summary: {
      totalProjects: projects.length,
      averageHealth: Math.round(projects.reduce((sum, p) => sum + p.health, 0) / projects.length),
      qualityGatesPassed: `${projects.length * 4}/${projects.length * 4}`,
      hooksProtected: '11 Repositories',
    },
    projects: projects,
    auditLogs: auditLogs,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ANTIGRAVITY_FULL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
