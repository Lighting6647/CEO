import { ExternalLink, CheckCircle2, ChevronRight, GitFork } from 'lucide-react';


export function ProjectCard({ project, onSelect }) {
  const getScoreColor = (score) => {
    if (score === 'A+') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (score === 'A') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-900 hover:shadow-cyan-950/30 cursor-pointer"
    >
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{project.category}</span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400">commit {project.commit}</span>
            </div>
            <h3 className="mt-1 text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {project.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{project.thName}</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`rounded-xl border px-2.5 py-1 text-xs font-black tracking-wide ${getScoreColor(project.score)}`}>
              {project.score}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">{project.health}%</span>
          </div>
        </div>

        {/* Summary note */}
        <p className="mt-3 text-xs leading-relaxed text-slate-300 line-clamp-2">
          {project.summary}
        </p>

        {/* 4 Gates Chips */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2 py-1 text-slate-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">G1: UI/UX Tokens</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2 py-1 text-slate-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">G2: Testing QA</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2 py-1 text-slate-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">G3: Deployment</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2 py-1 text-slate-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">G4: Recommender</span>
          </div>
        </div>
      </div>

      {/* Footer / Meta info */}
      <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
        <a
          href={`https://github.com/${project.repo}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <GitFork className="h-3 w-3" />
          {project.repo.split('/')[1] || project.repo}
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </a>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
          <span>ดูรายละเอียด</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
