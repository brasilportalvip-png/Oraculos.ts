import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsultationProvider, useConsultation } from './context/ConsultationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ConsultantShowcase } from './components/showcase/ConsultantShowcase';
import { ConsultantProfileModal } from './components/ConsultantProfileModal';
import { MercadoPagoRechargeModal } from './components/MercadoPagoRechargeModal';

import { SEOHead } from './components/SEOHead';
import { SEO_PAGINAS, breadcrumbJsonLd } from './seo/yoast';
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

/**
 * A rota vem sempre do endereço real. Antes, ao abrir "/" o site restaurava a
 * última página da sessão — quem clicava no logo ou voltava ao início via outra
 * página com o endereço "/" (ruim para o cliente e para o Google).
 */
function parseLocation(): ParsedRoute {
  return parseRouteLocation(window.location.pathname, window.location.hash);
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
                title={SEO_PAGINAS.inicio.titulo}
                description={SEO_PAGINAS.inicio.descricao}
                keywords={SEO_PAGINAS.inicio.palavraChave}
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
                title={SEO_PAGINAS.oraculos.titulo}
                description={SEO_PAGINAS.oraculos.descricao}
                keywords={SEO_PAGINAS.oraculos.palavraChave}
                canonicalPath="/oraculos"
                jsonLd={breadcrumbJsonLd([{ nome: 'Oráculos', caminho: '/oraculos' }])}
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
                title={SEO_PAGINAS.blog.titulo}
                description={SEO_PAGINAS.blog.descricao}
                keywords={SEO_PAGINAS.blog.palavraChave}
                canonicalPath="/blog"
                jsonLd={breadcrumbJsonLd([{ nome: 'Blog', caminho: '/blog' }])}
              />
              <BlogSection />
            </>
          )}

          {currentRoute.view === 'howItWorks' && (
            <>
              <SEOHead
                title={SEO_PAGINAS.comoFunciona.titulo}
                description={SEO_PAGINAS.comoFunciona.descricao}
                keywords={SEO_PAGINAS.comoFunciona.palavraChave}
                canonicalPath="/como-funciona"
                jsonLd={breadcrumbJsonLd([{ nome: 'Como funciona', caminho: '/como-funciona' }])}
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
                title={SEO_PAGINAS.ajuda.titulo}
                description={SEO_PAGINAS.ajuda.descricao}
                keywords={SEO_PAGINAS.ajuda.palavraChave}
                canonicalPath="/ajuda-e-privacidade"
                jsonLd={breadcrumbJsonLd([{ nome: 'Ajuda e privacidade', caminho: '/ajuda-e-privacidade' }])}
              />
              <HelpAndPrivacy />
            </>
          )}

          {currentRoute.view === 'workWithUs' && (
            <>
              <SEOHead
                title={SEO_PAGINAS.trabalheConosco.titulo}
                description={SEO_PAGINAS.trabalheConosco.descricao}
                keywords={SEO_PAGINAS.trabalheConosco.palavraChave}
                canonicalPath="/trabalhe-conosco"
                jsonLd={breadcrumbJsonLd([{ nome: 'Trabalhe conosco', caminho: '/trabalhe-conosco' }])}
              />
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
