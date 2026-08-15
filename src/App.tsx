import React, { lazy, Suspense, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ConsultationProvider, useConsultation } from './context/ConsultationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ConsultantShowcase } from './components/showcase/ConsultantShowcase';
import { ConsultantProfileModal } from './components/ConsultantProfileModal';
import { FloatingSupport } from './components/FloatingSupport';
import { SEOHead } from './components/SEOHead';
import { RouteAccessGuard } from './components/RouteAccessGuard';
import { Consultant, OracleType } from './types';
import { LegalDocType } from './components/LegalPage';
import {
  canonicalPathForRoute,
  parseRouteLocation,
  ParsedRoute,
  resolveNavigationTarget,
} from './routing/routes';

// Lazy-loaded heavy views and dashboards
const ClientDashboard = lazy(() =>
  import('./components/client/ClientDashboard').then((m) => ({ default: m.ClientDashboard }))
);
const ConsultantDashboard = lazy(() =>
  import('./components/consultant/ConsultantDashboard').then((m) => ({ default: m.ConsultantDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const BlogSection = lazy(() =>
  import('./components/blog/BlogSection').then((m) => ({ default: m.BlogSection }))
);
const ConsultationRoom = lazy(() =>
  import('./components/ConsultationRoom').then((m) => ({ default: m.ConsultationRoom }))
);
const MercadoPagoRechargeModal = lazy(() =>
  import('./components/MercadoPagoRechargeModal').then((m) => ({ default: m.MercadoPagoRechargeModal }))
);
const OraclesDirectory = lazy(() =>
  import('./components/OraclesDirectory').then((m) => ({ default: m.OraclesDirectory }))
);
const HowItWorks = lazy(() =>
  import('./components/HowItWorks').then((m) => ({ default: m.HowItWorks }))
);
const HelpAndPrivacy = lazy(() =>
  import('./components/showcase/HelpAndPrivacy').then((m) => ({ default: m.HelpAndPrivacy }))
);
const LegalPage = lazy(() =>
  import('./components/LegalPage').then((m) => ({ default: m.LegalPage }))
);
const OracleDetailPage = lazy(() =>
  import('./components/OracleDetailPage').then((m) => ({ default: m.OracleDetailPage }))
);
const SpecialistDetailPage = lazy(() =>
  import('./components/SpecialistDetailPage').then((m) => ({ default: m.SpecialistDetailPage }))
);
const ArticleDetailPage = lazy(() =>
  import('./components/blog/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage }))
);
const NotFoundPage = lazy(() =>
  import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

function getCurrentBrowserRoute(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'showcase' };
  }
  return parseRouteLocation(window.location.pathname, window.location.hash);
}

function MainAppContent() {
  const { isRechargeModalOpen, setIsRechargeModalOpen, startConsultation, consultants } =
    useConsultation();

  const [currentRoute, setCurrentRoute] = useState<ParsedRoute>(getCurrentBrowserRoute);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedOracle, setSelectedOracle] = useState<OracleType | null>(null);

  const navigateTo = (tabOrPath: string) => {
    const { path, route } = resolveNavigationTarget(tabOrPath);

    try {
      if (window.location.pathname !== path) {
        window.history.pushState(route, '', path);
      }
    } catch {
      // Fallback if pushState fails in iframe/sandbox
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getCurrentBrowserRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Register service worker in production
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('[ORACULOS.TS] Service worker registration:', err));
    }
  }, []);

  const handleStartConsultation = (
    consultant: Consultant,
    oracle: OracleType,
    mode: 'chat' | 'video'
  ) => {
    startConsultation(consultant, oracle, mode);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Top Header Navigation */}
      <Header currentTab={currentRoute.view} setCurrentTab={navigateTo} />

      {/* Main Container with Suspense Fallback */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Suspense
          fallback={
            <div className="py-24 text-center space-y-4" role="status" aria-live="polite">
              <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400 font-mono">Carregando ambiente seguro...</p>
            </div>
          }
        >
          {currentRoute.view === 'showcase' && (
            <>
              <SEOHead
                title="Consultas de Tarot, Baralho Cigano, Búzios e Astrologia ao Vivo"
                description="Conecte-se com especialistas e atendentes virtuais em tempo real. Leituras autênticas de Tarot, Baralho Cigano, Astrologia, Búzios e mais com tarifação por minuto real."
                canonicalPath="/"
              />
              <ConsultantShowcase
                selectedOracleCategory={selectedOracle}
                onSelectOracleCategory={(oracle) => {
                  if (oracle) {
                    navigateTo(`oraculos/${oracle}`);
                  } else {
                    setSelectedOracle(null);
                  }
                }}
                onSelectConsultant={(c) => {
                  navigateTo(`especialistas/${c.id}`);
                }}
                onStartConsultation={handleStartConsultation}
              />
            </>
          )}

          {currentRoute.view === 'oracleDetail' && (
            <OracleDetailPage
              oracleId={currentRoute.param || 'tarot'}
              consultants={consultants}
              onBack={() => navigateTo('showcase')}
              onSelectConsultant={(c) => navigateTo(`especialistas/${c.id}`)}
              onStartConsultation={handleStartConsultation}
            />
          )}

          {currentRoute.view === 'specialistDetail' && (
            <SpecialistDetailPage
              consultantId={currentRoute.param || ''}
              consultants={consultants}
              onBack={() => navigateTo('oracles')}
              onStartConsultation={handleStartConsultation}
            />
          )}

          {currentRoute.view === 'articleDetail' && (
            <ArticleDetailPage
              slug={currentRoute.param || ''}
              onBack={() => navigateTo('blog')}
              onSelectArticle={(slug) => navigateTo(`blog/${slug}`)}
            />
          )}

          {currentRoute.view === 'legal' && (
            <LegalPage
              type={(currentRoute.param as LegalDocType) || 'termos'}
              onBack={() => navigateTo('showcase')}
              onNavigateDoc={(doc) => navigateTo(doc)}
            />
          )}

          {currentRoute.view === 'oracles' && (
            <OraclesDirectory
              onSelectOracleCategory={(oracle) => {
                navigateTo(`oraculos/${oracle}`);
              }}
            />
          )}

          {currentRoute.view === 'blog' && <BlogSection />}

          {currentRoute.view === 'howItWorks' && (
            <div className="space-y-12">
              <HowItWorks />
              <HelpAndPrivacy />
            </div>
          )}

          {currentRoute.view === 'helpAndPrivacy' && <HelpAndPrivacy />}

          {currentRoute.view === 'clientDashboard' && (
            <RouteAccessGuard
              allowedRoles={['user', 'client'] as const}
              onGoHome={() => navigateTo('showcase')}
            >
              <SEOHead
                title="Minha Carteira & Consultas"
                description="Painel do Consulente — Gerenciamento de saldo de minutos e histórico de consultas."
                canonicalPath="/painel"
                noIndex
              />
              <ClientDashboard />
            </RouteAccessGuard>
          )}

          {currentRoute.view === 'consultantDashboard' && (
            <RouteAccessGuard
              allowedRoles={['employee', 'consultant'] as const}
              onGoHome={() => navigateTo('showcase')}
            >
              <SEOHead
                title="Painel do Consultor"
                description="Gestão de atendimentos, histórico de sessões e comissões."
                canonicalPath="/painel/consultor"
                noIndex
              />
              <ConsultantDashboard />
            </RouteAccessGuard>
          )}

          {currentRoute.view === 'adminDashboard' && (
            <RouteAccessGuard
              allowedRoles={['admin', 'superadmin'] as const}
              onGoHome={() => navigateTo('showcase')}
            >
              <SEOHead
                title="Painel Administrativo"
                description="Administração geral da plataforma ORACULOS.TS."
                canonicalPath="/admin"
                noIndex
              />
              <AdminDashboard />
            </RouteAccessGuard>
          )}

          {currentRoute.view === 'notFound' && (
            <NotFoundPage onGoHome={() => navigateTo('showcase')} />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Consultant Profile Detail Modal */}
      {selectedConsultant && (
        <ConsultantProfileModal
          consultant={selectedConsultant}
          initialOracle={selectedOracle}
          onClose={() => setSelectedConsultant(null)}
          onStartConsultation={handleStartConsultation}
        />
      )}

      {/* Mercado Pago Recharge Modal */}
      <Suspense fallback={null}>
        <MercadoPagoRechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => setIsRechargeModalOpen(false)}
        />
      </Suspense>

      {/* Active Consultation Room */}
      <Suspense fallback={null}>
        <ConsultationRoom />
      </Suspense>

      {/* Global Floating Support Button */}
      <FloatingSupport />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConsultationProvider>
        <MainAppContent />
      </ConsultationProvider>
    </AuthProvider>
  );
}
