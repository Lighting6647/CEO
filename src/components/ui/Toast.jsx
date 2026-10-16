import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-cyan-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
    error: 'border-rose-500/30 bg-rose-950/80 text-rose-100',
    info: 'border-cyan-500/30 bg-cyan-950/80 text-cyan-100'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5">
      <div className={`flex items-center gap-3 rounded-xl border p-2.5 ${borders[toast.type || 'info']}`}>
        {icons[toast.type || 'info']}
        <div className="text-sm">
          <p className="font-semibold">{toast.title}</p>
          {toast.message && <p className="text-xs opacity-80">{toast.message}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
