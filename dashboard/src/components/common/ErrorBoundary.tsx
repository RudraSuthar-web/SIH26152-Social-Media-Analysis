import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  requestId: string;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    requestId: `req-err-${Math.random().toString(36).substring(2, 9)}`,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      requestId: `req-err-${Math.random().toString(36).substring(2, 9)}`,
      copied: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleCopy = () => {
    navigator.clipboard.writeText(this.state.requestId);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 glass-panel border border-rose-500/30 rounded-2xl bg-rose-950/10 space-y-4 max-w-2xl mx-auto my-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">Application Exception Encountered</h3>
              <p className="text-xs text-slate-400">An unexpected render error occurred in this view section.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-rose-300">
            {this.state.error?.message || 'Unknown runtime error'}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Request ID:</span>
              <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {this.state.requestId}
              </code>
              <button
                onClick={this.handleCopy}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy Request ID"
              >
                {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={this.handleReset}
              className="btn-primary text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Component
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
