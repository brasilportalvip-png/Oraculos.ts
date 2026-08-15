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
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

interface ParsedRoute {
  view: string;
  param?: string;
}

function parseLocation(): ParsedRoute {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace('#', '');

  if (path.startsWith('/oraculos/')) {
    const oracleId = path.replace('/oraculos/', '').replace(/\/$/, '');
    return { view: 'oracleDetail', param: oracleId };
  }

  if (path.includes('termos') || hash.includes('termos')) {
    return { view: 'legal', param: 'termos' };
  }
  if (path.includes('privacidade') || hash.includes('privacidade') || path.includes('lgpd')) {
    return { view: 'legal', param: 'privacidade' };
  }
  if (path.includes('cookies') || hash.includes('cookies')) {
    return { view: 'legal', param: 'cookies' };
  }
  if (path.includes('reembolso') || hash.includes('reembolso') || path.includes('estorno')) {
    return { view: 'legal', param: 'reembolso' };
  }

  if (path.includes('especialistas') || hash.includes('especialistas') || hash.includes('oracles')) {
    return { view: 'oracles' };
  }
  if (path.includes('blog') || hash.includes('blog')) {
    return { view: 'blog' };
  }
  if (path.includes('como-funciona') || hash.includes('howitworks')) {
    return { view: 'howItWorks' };
  }
  if (path.includes('ajuda') || hash.includes('helpandprivacy')) {
    return { view: 'helpAndPrivacy' };
  }
  if (path.includes('painel/consultor') || hash.includes('consultantdashboard')) {
    return { view: 'consultantDashboard' };
  }
  if (path.includes('painel') || path.includes('carteira') || hash.includes('clientdashboard')) {
    return { view: 'clientDashboard' };
  }
  if (path.includes('admin') || hash.includes('admindashboard')) {
    return { view: 'adminDashboard' };
  }
  if (path === '/' || path === '' || hash === '' || hash === 'showcase') {
    return { view: 'showcase' };
  }

  return { view: 'showcase' };
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
    } else if (['termos', 'privacidade', 'cookies', 'reembolso'].includes(tabOrPath)) {
      targetPath = `/${tabOrPath}`;
      newRoute = { view: 'legal', param: tabOrPath };
    } else {
      const map: Record<string, { path: string; route: ParsedRoute }> = {
        showcase: { path: '/', route: { view: 'showcase' } },
        oracles: { path: '/especialistas', route: { view: 'oracles' } },
        blog: { path: '/blog', route: { view: 'blog' } },
        howItWorks: { path: '/como-funciona', route: { view: 'howItWorks' } },
        helpAndPrivacy: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
        ajuda: { path: '/ajuda-e-privacidade', route: { view: 'helpAndPrivacy' } },
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
                onSelectConsultant={(c) => setSelectedConsultant(c)}
                onStartConsultation={handleStartConsultation}
              />
            </>
          )}

          {currentRoute.view === 'oracleDetail' && (
            <OracleDetailPage
              oracleId={currentRoute.param || 'tarot'}
              consultants={consultants}
              onBack={() => navigateTo('showcase')}
              onSelectConsultant={(c) => setSelectedConsultant(c)}
              onStartConsultation={handleStartConsultation}
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
