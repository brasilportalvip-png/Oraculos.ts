import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;

  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ORACULOS.TS UI ErrorBoundary]:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    try {
      localStorage.removeItem('oraculos_user');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#0e0e18] border border-[#d4af37]/40 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-[#d4af37]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-serif gold-accent">
                ORACULOS.TS
              </h1>
              <p className="text-sm text-gray-300">
                Ocorreu uma instabilidade inesperada na visualização.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-left overflow-auto max-h-32 text-xs font-mono text-rose-300">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Aplicação
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium text-xs uppercase tracking-wider hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Ir para Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
