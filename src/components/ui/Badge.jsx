export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/60',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
    indigo: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
