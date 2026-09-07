import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsultationProvider, useConsultation } from './context/ConsultationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ConsultantShowcase } from './components/showcase/ConsultantShowcase';
import { ConsultantProfileModal } from './components/ConsultantProfileModal';
import { MercadoPagoRechargeModal } from './components/MercadoPagoRechargeModal';

import { SEOHead } from './components/SEOHead';
import { Consultant, OracleType } from './types';
import { LegalDocType } from './components/LegalPage';
import { RouteAccessGuard } from './components/RouteAccessGuard';
import {
  canonicalPathForRoute,
  parseRouteLocation,
  resolveNavigationTarget,
  type ParsedRoute,
} from './routing/routes';

// Resilient lazy import with automatic retry on network or chunk updates
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.warn('Falha no carregamento do módulo dinâmico, tentando novamente...', error);
      try {
        return await factory();
      } catch (retryError) {
        const isChunkError =
          retryError instanceof Error &&
          (retryError.message.includes('Failed to fetch dynamically imported module') ||
            retryError.message.includes('Importing a module script failed'));

        if (isChunkError) {
          const reloadKey = 'oraculos_chunk_reload';
          if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, 'true');
            window.location.reload();
          }
        }
        throw retryError;
      }
    }
  });
}

// Lazy-loaded heavy views and dashboards
const ClientDashboard = lazyWithRetry(() => import('./components/client/ClientDashboard').then((m) => ({ default: m.ClientDashboard })));
const ConsultantDashboard = lazyWithRetry(() => import('./components/consultant/ConsultantDashboard').then((m) => ({ default: m.ConsultantDashboard })));
const AdminDashboard = lazyWithRetry(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const BlogSection = lazyWithRetry(() => import('./components/blog/BlogSection').then((m) => ({ default: m.BlogSection })));
const ConsultationRoom = lazyWithRetry(() => import('./components/ConsultationRoom').then((m) => ({ default: m.ConsultationRoom })));
const OraclesDirectory = lazyWithRetry(() => import('./components/OraclesDirectory').then((m) => ({ default: m.OraclesDirectory })));
const HowItWorks = lazyWithRetry(() => import('./components/HowItWorks').then((m) => ({ default: m.HowItWorks })));
const HelpAndPrivacy = lazyWithRetry(() => import('./components/showcase/HelpAndPrivacy').then((m) => ({ default: m.HelpAndPrivacy })));
const LegalPage = lazyWithRetry(() => import('./components/LegalPage').then((m) => ({ default: m.LegalPage })));
const OracleDetailPage = lazyWithRetry(() => import('./components/OracleDetailPage').then((m) => ({ default: m.OracleDetailPage })));
const SpecialistDetailPage = lazyWithRetry(() => import('./components/SpecialistDetailPage').then((m) => ({ default: m.SpecialistDetailPage })));
const ArticleDetailPage = lazyWithRetry(() => import('./components/blog/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })));
const NotFoundPage = lazyWithRetry(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const WorkWithUs = lazyWithRetry(() => import('./components/WorkWithUs').then((m) => ({ default: m.WorkWithUs })));

function parseLocation(): ParsedRoute {
  const fromLocation = parseRouteLocation(window.location.pathname, window.location.hash);
  if (fromLocation.view !== 'showcase') {
    return fromLocation;
  }
  try {
    const saved = sessionStorage.getItem('oraculos_last_route');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.view === 'string' && parsed.view !== 'showcase') {
        return parsed as ParsedRoute;
      }
    }
  } catch {}
  return fromLocation;
}

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const { isRechargeModalOpen, setIsRechargeModalOpen, startConsultation, consultants, activeSession } = useConsultation();

  const [currentRoute, setCurrentRoute] = useState<ParsedRoute>(parseLocation);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedOracle, setSelectedOracle] = useState<OracleType | null>(null);

  const navigateTo = (tabOrPath: string) => {
    const { path: targetPath, route: newRoute } = resolveNavigationTarget(tabOrPath);

    try {
      window.history.pushState(newRoute, '', targetPath);
    } catch {
      // Fallback
    }
    setCurrentRoute(newRoute);
  };

  useEffect(() => {
    try {
      sessionStorage.removeItem('oraculos_chunk_reload');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('oraculos_last_route', JSON.stringify(currentRoute));
    } catch {}
  }, [currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      const route = parseLocation();
      const canonicalPath = canonicalPathForRoute(route);
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

      if (route.view !== 'notFound' && currentPath !== canonicalPath) {
        window.history.replaceState(route, '', canonicalPath);
      }

      setCurrentRoute(route);
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStartConsultation = async (
  consultant: Consultant,
  oracle: OracleType,
  mode: 'chat' | 'video'
) => {
  const result = await startConsultation(consultant, oracle, mode);

  if (!result.success && result.message) {
    if (
      result.message.includes('Saldo insuficiente') ||
      result.message.includes('minutos')
    ) {
      setIsRechargeModalOpen(true);
      return;
    }

    window.alert(result.message);
  }
};

  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Top Header Navigation */}
      <Header currentTab={currentRoute.view} setCurrentTab={navigateTo} />

      {/* Main Container with Suspense Fallback */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8 overflow-x-hidden">
        <Suspense
          fallback={
            <div className="py-24 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400 font-mono">Carregando ambiente seguro...</p>
            </div>
          }
        >
          {currentRoute.view === 'showcase' && (
            <>
              <SEOHead
                title="Consultas de Tarot, Baralho Cigano, Búzios e Astrologia ao Vivo"
                description="Conecte-se com especialistas oraculares em tempo real. Leituras autênticas e acolhedoras de Tarot, Baralho Cigano, Astrologia, Búzios e mais com tarifação por minuto real."
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
            <>
              <SEOHead
                title="Os 10 Oráculos e Especialistas Online"
                description="Conheça Tarot, Baralho Cigano, Astrologia, Numerologia, Búzios, Ifá, Runas, I Ching, Cristais e Mesa Radiônica e escolha um especialista."
                canonicalPath="/oraculos"
              />
              <OraclesDirectory
                onSelectOracleCategory={(oracle) => {
                  navigateTo(`oraculos/${oracle}`);
                }}
              />
            </>
          )}

          {currentRoute.view === 'blog' && (
            <>
              <SEOHead
                title="Blog Místico — Tarot, Astrologia e Autoconhecimento"
                description="Conteúdo publicado sobre Tarot, Astrologia, Baralho Cigano, espiritualidade responsável e autoconhecimento."
                canonicalPath="/blog"
              />
              <BlogSection />
            </>
          )}

          {currentRoute.view === 'howItWorks' && (
            <>
              <SEOHead
                title="Como Funcionam as Consultas Online"
                description="Entenda como escolher um especialista, comprar minutos e realizar consultas sigilosas por chat ou vídeo no ORACULOS.TS."
                canonicalPath="/como-funciona"
              />
              <div className="space-y-12">
                <HowItWorks />
                <HelpAndPrivacy />
              </div>
            </>
          )}

          {currentRoute.view === 'helpAndPrivacy' && (
            <>
              <SEOHead
                title="Central de Ajuda, Privacidade e LGPD"
                description="Acesse suporte, orientações de segurança, privacidade e direitos previstos na LGPD para usuários do ORACULOS.TS."
                canonicalPath="/ajuda-e-privacidade"
              />
              <HelpAndPrivacy />
            </>
          )}

          {currentRoute.view === 'workWithUs' && (
            <>
              <SEOHead title="Trabalhe Conosco" description="Cadastre-se para atuar como profissional no ORACULOS.TS." canonicalPath="/trabalhe-conosco" />
              <WorkWithUs />
            </>
          )}

          {currentRoute.view === 'clientDashboard' && (
            <>
              <SEOHead
                title="Minha Conta"
                description="Área privada da conta ORACULOS.TS."
                canonicalPath="/painel"
                noIndex
              />
              <RouteAccessGuard
                allowedRoles={['user', 'client']}
                onGoHome={() => navigateTo('showcase')}
              >
                <ClientDashboard />
              </RouteAccessGuard>
            </>
          )}

          {currentRoute.view === 'consultantDashboard' && (
            <>
              <SEOHead
                title="Painel Profissional"
                description="Área privada de profissionais do ORACULOS.TS."
                canonicalPath="/painel/consultor"
                noIndex
              />
              <RouteAccessGuard
                allowedRoles={['employee', 'consultant']}
                onGoHome={() => navigateTo('showcase')}
              >
                <ConsultantDashboard />
              </RouteAccessGuard>
            </>
          )}

          {currentRoute.view === 'adminDashboard' && (
            <>
              <SEOHead
                title="Administração"
                description="Área administrativa privada do ORACULOS.TS."
                canonicalPath="/admin"
                noIndex
              />
              <RouteAccessGuard
                allowedRoles={['admin', 'superadmin']}
                onGoHome={() => navigateTo('showcase')}
              >
                <AdminDashboard />
              </RouteAccessGuard>
            </>
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
      {isRechargeModalOpen && (
        <MercadoPagoRechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => setIsRechargeModalOpen(false)}
        />
      )}

      {/* Active Consultation Room */}
      {activeSession && (
        <Suspense fallback={null}>
          <ConsultationRoom />
        </Suspense>
      )}

     
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
