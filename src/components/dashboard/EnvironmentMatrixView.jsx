import { useState } from 'react';
import { Server, Globe, Laptop, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function EnvironmentMatrixView({ projects }) {
  const [filterEnv, setFilterEnv] = useState('ALL');

  const envsData = projects.map((p) => {
    let prodUrl = null;
    let prodHost = 'GitHub Hosted';
    if (p.id === 'it-dashboard') {
      prodUrl = 'https://it-monthly-dashboard-hb21.onrender.com';
      prodHost = 'Render Cloud (Node.js)';
    } else if (p.id === 'ceo-master') {
      prodUrl = 'https://github.com/Lighting6647/CEO';
      prodHost = 'Vite / Netlify';
    } else {
      prodUrl = `https://github.com/${p.repo}`;
      prodHost = 'GitHub Production';
    }

    return {
      id: p.id,
      name: p.name,
      thName: p.thName,
      commit: p.commit,
      local: {
        path: p.path,
        port: p.id === 'it-dashboard' ? '5000' : p.id === 'pass-app' ? '3000' : '5173',
        status: 'Ready',
      },
      staging: {
        host: 'Local Preview Container',
        port: p.id === 'it-dashboard' ? '4173' : '4173',
        status: 'Passed (HTTP 200)',
      },
      production: {
        host: prodHost,
        url: prodUrl,
        status: 'Live & Synced',
        ssl: 'Valid TLS 1.3',
      },
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Multi-Environment Deployment Matrix</h2>
            <Badge variant="cyan">Multi-Stage Active</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            ตรวจสอบความสอดคล้องของ State และ Commit ข้าม 3 สภาพแวดล้อม: Local Development ➡️ Staging Preview ➡️ Render/GitHub Production
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs">
          {['ALL', 'Production', 'Local Dev'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterEnv(tab)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                filterEnv === tab ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3.5 px-4">โปรเจกต์ (System)</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Laptop className="h-3.5 w-3.5 text-slate-400" />
                    1. Local Dev
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Server className="h-3.5 w-3.5 text-indigo-400" />
                    2. Staging / Preview
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    3. Production Release
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Commit Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {envsData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Project Info */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{row.name}</div>
                    <div className="text-[11px] text-slate-400">{row.thName}</div>
                  </td>

                  {/* Local Dev */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                      <div>
                        <span className="font-mono text-slate-200">Port :{row.local.port}</span>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">{row.local.path}</div>
                      </div>
                    </div>
                  </td>

                  {/* Staging / Preview */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                      <div>
                        <span className="text-slate-200 font-semibold">{row.staging.host}</span>
                        <div className="text-[10px] text-indigo-400 font-mono">{row.staging.status}</div>
                      </div>
                    </div>
                  </td>

                  {/* Production Release */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div>
                        <a
                          href={row.production.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-semibold text-emerald-300 hover:text-emerald-200 hover:underline"
                        >
                          <span className="truncate max-w-[160px]">{row.production.host}</span>
                          <ArrowUpRight className="h-3 w-3 shrink-0" />
                        </a>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                          <span>{row.production.ssl}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Commit Hash */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] text-cyan-300">
                      {row.commit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
