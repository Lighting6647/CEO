import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ceo_brand_theme');
      localStorage.removeItem('antigravity_theme');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-red-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  ตรวจพบข้อผิดพลาดในการโหลดหน้าเว็บ
                </h1>
                <p className="text-xs text-slate-400">
                  CEO Master Platform Runtime Exception Guard
                </p>
              </div>
            </div>

            <div className="my-5 rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs text-red-300 overflow-x-auto">
              <p className="font-semibold">{this.state.error?.toString() || 'Unknown Runtime Error'}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[10px] text-slate-500 leading-relaxed max-h-40 overflow-y-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw className="h-4 w-4" />
                รีเฟรชหน้าเว็บ (Reload)
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                ล้างแคชธีมและรีเซ็ตค่าเริ่มต้น
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
