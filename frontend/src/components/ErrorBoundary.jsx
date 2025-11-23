import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-text-primary p-4">
          <div className="glass-panel p-8 max-w-md w-full text-center border border-danger/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-danger/50"></div>
            
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6 border border-danger/20">
              <AlertOctagon size={32} className="text-danger" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary font-display mb-2 tracking-wide">SYSTEM CRITICAL</h1>
            <p className="text-text-secondary mb-8 font-mono text-sm">
              An unrecoverable error has occurred in the main interface.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 rounded-lg transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-wider text-sm group"
            >
              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
              Reboot System
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-slate-900 rounded border border-slate-800 text-left">
                <p className="text-xs font-mono text-danger mb-2">ERROR_LOG:</p>
                <pre className="text-[10px] font-mono text-slate-400 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;