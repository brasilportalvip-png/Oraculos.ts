import React from 'react';
import { ArrowLeft, LoaderCircle, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RouteAccessGuardProps {
  allowedRoles: readonly UserRole[];
  onGoHome: () => void;
  children: React.ReactNode;
}

export function hasRouteAccess(
  isAuthenticated: boolean,
  role: string,
  allowedRoles: readonly (UserRole | string)[],
  userEmail?: string
): boolean {
  if (!isAuthenticated) return false;
  if (role === 'superadmin') return true;
  if (allowedRoles.includes(role as UserRole)) return true;
  if (allowedRoles.includes('consultant') || allowedRoles.includes('employee')) {
    if (role === 'admin' || role === 'superadmin' || role === 'consultant' || role === 'employee') return true;
    try {
      const stored = localStorage.getItem('oraculos_user') || sessionStorage.getItem('oraculos_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (['consultant', 'employee', 'admin', 'superadmin'].includes(parsed.role)) return true;
      }
    } catch {}
  }
  return false;
}

export const RouteAccessGuard: React.FC<RouteAccessGuardProps> = ({
  allowedRoles,
  onGoHome,
  children,
}) => {
  const { authLoading, isAuthenticated, user, switchRole } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[45vh] grid place-items-center" role="status" aria-live="polite">
        <div className="flex items-center gap-3 text-sm text-purple-200">
          <LoaderCircle className="w-5 h-5 animate-spin text-amber-400" aria-hidden="true" />
          Validando sua sessão segura...
        </div>
      </div>
    );
  }

  if (!hasRouteAccess(isAuthenticated, user.role, allowedRoles, user.email)) {
    const isConsultantRoute = allowedRoles.includes('consultant') || allowedRoles.includes('employee');
    const isAdminRoute = allowedRoles.includes('admin') || allowedRoles.includes('superadmin');

    return (
      <section className="min-h-[45vh] max-w-xl mx-auto grid place-items-center text-center py-16 px-4">
        <div className="space-y-5 p-6 sm:p-8 rounded-3xl bg-[#150F26] border border-purple-800/40 shadow-2xl w-full">
          <LockKeyhole className="w-12 h-12 mx-auto text-amber-400" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-white">Acesso restrito</h1>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-300">
              {!isAuthenticated
                ? 'Entre na sua conta ou use o acesso de teste para entrar neste painel.'
                : 'Sua conta não possui permissão de acesso para este painel.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('oraculos:open-auth'))}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-amber-400 transition-colors"
              >
                Entrar com E-mail / Senha
              </button>
            ) : null}

            {isAdminRoute && (
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Acessar como Admin Demo
              </button>
            )}

            {isConsultantRoute && (
              <button
                type="button"
                onClick={() => switchRole('consultant')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer"
              >
                Acessar como Atendente Demo
              </button>
            )}

            <button
              type="button"
              onClick={onGoHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Página inicial
            </button>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
};
