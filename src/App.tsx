import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsultationProvider, useConsultation } from './context/ConsultationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ConsultantShowcase } from './components/showcase/ConsultantShowcase';
import { ConsultantProfileModal } from './components/ConsultantProfileModal';
import { FloatingSupport } from './components/FloatingSupport';
import { SEOHead } from './components/SEOHead';
import { Consultant, OracleType } from './types';
import { LegalDocType } from './components/LegalPage';

// Lazy-loaded heavy views and dashboards
const ClientDashboard = lazy(() => import('./components/client/ClientDashboard').then((m) => ({ default: m.ClientDashboard })));
const ConsultantDashboard = lazy(() => import('./components/consultant/ConsultantDashboard').then((m) => ({ default: m.ConsultantDashboard })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const BlogSection = lazy(() => import('./components/blog/BlogSection').then((m) => ({ default: m.BlogSection })));
const ConsultationRoom = lazy(() => import('./components/ConsultationRoom').then((m) => ({ default: m.ConsultationRoom })));
const MercadoPagoRechargeModal = lazy(() => import('./components/MercadoPagoRechargeModal').then((m) => ({ default: m.MercadoPagoRechargeModal })));
const OraclesDirectory = lazy(() => import('./components/OraclesDirectory').then((m) => ({ default: m.OraclesDirectory })));
const HowItWorks = lazy(() => import('./components/HowItWorks').then((m) => ({ default: m.HowItWorks })));
const HelpAndPrivacy = lazy(() => import('./components/showcase/HelpAndPrivacy').then((m) => ({ default: m.HelpAndPrivacy })));
const LegalPage = lazy(() => import('./components/LegalPage').then((m) => ({ default: m.LegalPage })));
const OracleDetailPage = lazy(() => import('./components/OracleDetailPage').then((m) => ({ default: m.OracleDetailPage })));
const SpecialistDetailPage = lazy(() => import('./components/SpecialistDetailPage').then((m) => ({ default: m.SpecialistDetailPage })));
const ArticleDetailPage = lazy(() => import('./components/blog/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

interface ParsedRoute {
  view: string;
  param?: string;
}

function parseLocation(): ParsedRoute {
  const rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.toLowerCase().replace('#', '');

  if (rawPath.startsWith('/oraculos/')) {
    const oracleId = rawPath.replace('/oraculos/', '');
    return { view: 'oracleDetail', param: oracleId };
  }
  if (rawPath === '/oraculos') {
    return { view: 'oracles' };
  }

  if (rawPath.startsWith('/especialistas/')) {
    const consultantId = rawPath.replace('/especialistas/', '');
    return { view: 'specialistDetail', param: consultantId };
  }
  if (rawPath === '/especialistas') {
    return { view: 'oracles' };
  }

  if (rawPath.startsWith('/blog/')) {
    const slug = rawPath.replace('/blog/', '');
    return { view: 'articleDetail', param: slug };
  }
  if (rawPath.startsWith('/artigos/')) {
    const slug = rawPath.replace('/artigos/', '');
    return { view: 'articleDetail', param: slug };
  }
  if (rawPath === '/blog' || rawPath === '/artigos') {
    return { view: 'blog' };
  }

  if (rawPath === '/termos' || hash === 'termos') {
    return { view: 'legal', param: 'termos' };
  }
  if (rawPath === '/privacidade' || rawPath === '/lgpd' || hash === 'privacidade' || hash === 'lgpd') {
    return { view: 'legal', param: 'privacidade' };
  }
  if (rawPath === '/cookies' || hash === 'cookies') {
    return { view: 'legal', param: 'cookies' };
  }
  if (rawPath === '/reembolso' || rawPath === '/estorno' || hash === 'reembolso' || hash === 'estorno') {
    return { view: 'legal', param: 'reembolso' };
  }

  if (rawPath === '/como-funciona' || hash === 'como-funciona' || hash === 'howitworks') {
    return { view: 'howItWorks' };
  }
  if (rawPath === '/ajuda' || rawPath === '/suporte' || rawPath === '/ajuda-e-privacidade' || hash === 'ajuda' || hash === 'suporte') {
    return { view: 'helpAndPrivacy' };
  }
  if (rawPath === '/painel/consultor' || hash === 'consultantdashboard') {
    return { view: 'consultantDashboard' };
  }
  if (rawPath === '/painel' || rawPath === '/carteira' || hash === 'clientdashboard') {
    return { view: 'clientDashboard' };
  }
  if (rawPath === '/admin' || hash === 'admindashboard') {
    return { view: 'adminDashboard' };
  }
  if (rawPath === '/' || hash === '' || hash === 'showcase') {
    return { view: 'showcase' };
  }

  return { view: 'notFound' };
}

function MainAppContent() {
  const { user } = useAuth();
  const { isRechargeModalOpen, setIsRechargeModalOpen, startConsultation, consultants } = useConsultation();

  const [currentRoute, setCurrentRoute] = useState<ParsedRoute>(parseLocation);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedOracle, setSelectedOracle] = useState<OracleType | null>(null);

  const navigateTo = (tabOrPath: string) => {
    let targetPath = '/';
    let newRoute: ParsedRoute = { view: 'showcase' };

    if (tabOrPath.startsWith('oraculos/')) {
      const oracleId = tabOrPath.replace('oraculos/', '');
      targetPath = `/oraculos/${oracleId}`;
      newRoute = { view: 'oracleDetail', param: oracleId };
    } else if (tabOrPath.startsWith('especialistas/')) {
      const specId = tabOrPath.replace('especialistas/', '');
      targetPath = `/especialistas/${specId}`;
      newRoute = { view: 'specialistDetail', param: specId };
    } else if (tabOrPath.startsWith('blog/')) {
      const slug = tabOrPath.replace('blog/', '');
      targetPath = `/blog/${slug}`;
      newRoute = { view: 'articleDetail', param: slug };
    } else if (tabOrPath.startsWith('artigos/')) {
      const slug = tabOrPath.replace('artigos/', '');
      targetPath = `/blog/${slug}`;
      newRoute = { view: 'articleDetail', param: slug };
    } else if (['termos', 'privacidade', 'cookies', 'reembolso'].includes(tabOrPath)) {
      targetPath = `/${tabOrPath}`;
      newRoute = { view: 'legal', param: tabOrPath };
    } else {
      const map: Record<string, { path: string; route: ParsedRoute }> = {
        showcase: { path: '/', route: { view: 'showcase' } },
        oracles: { path: '/especialistas', route: { view: 'oracles' } },
        especialistas: { path: '/especialistas', route: { view: 'oracles' } },
        blog: { path: '/blog', route: { view: 'blog' } },
        howItWorks: { path: '/como-funciona', route: { view: 'howItWorks' } },
        helpAndPrivacy: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
        ajuda: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
        suporte: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
        clientDashboard: { path: '/painel', route: { view: 'clientDashboard' } },
        consultantDashboard: { path: '/painel/consultor', route: { view: 'consultantDashboard' } },
        adminDashboard: { path: '/admin', route: { view: 'adminDashboard' } },
      };
      if (map[tabOrPath]) {
        targetPath = map[tabOrPath].path;
        newRoute = map[tabOrPath].route;
      }
    }

    try {
      window.history.pushState(newRoute, '', targetPath);
    } catch {
      // Fallback
    }
    setCurrentRoute(newRoute);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

          {currentRoute.view === 'clientDashboard' && <ClientDashboard />}

          {currentRoute.view === 'consultantDashboard' && <ConsultantDashboard />}

          {currentRoute.view === 'adminDashboard' && <AdminDashboard />}

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
