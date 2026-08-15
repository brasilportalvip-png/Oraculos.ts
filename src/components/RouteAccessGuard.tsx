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
  role: UserRole,
  allowedRoles: readonly UserRole[]
): boolean {
  return isAuthenticated && allowedRoles.includes(role);
}

export const RouteAccessGuard: React.FC<RouteAccessGuardProps> = ({
  allowedRoles,
  onGoHome,
  children,
}) => {
  const { authLoading, isAuthenticated, user } = useAuth();

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

  if (!hasRouteAccess(isAuthenticated, user.role, allowedRoles)) {
    return (
      <section className="min-h-[45vh] max-w-xl mx-auto grid place-items-center text-center py-16">
        <div className="space-y-5 p-8 rounded-3xl bg-[#150F26] border border-purple-800/40 shadow-2xl">
          <LockKeyhole className="w-12 h-12 mx-auto text-amber-400" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-white">Acesso restrito</h1>
            <p className="text-sm leading-relaxed text-gray-300">
              {!isAuthenticated
                ? 'Entre na sua conta para acessar esta área privada.'
                : 'Sua conta não possui permissão para acessar este painel.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar à página inicial
          </button>
        </div>
      </section>
    );
  }

  return <>{children}</>;
};
