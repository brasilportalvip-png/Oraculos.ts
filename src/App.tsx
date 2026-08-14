import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsultationProvider, useConsultation } from './context/ConsultationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ConsultantShowcase } from './components/showcase/ConsultantShowcase';
import { ConsultantProfileModal } from './components/ConsultantProfileModal';
import { ConsultationRoom } from './components/ConsultationRoom';
import { MercadoPagoRechargeModal } from './components/MercadoPagoRechargeModal';
import { ClientDashboard } from './components/client/ClientDashboard';
import { ConsultantDashboard } from './components/consultant/ConsultantDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BlogSection } from './components/blog/BlogSection';
import { OraclesDirectory } from './components/OraclesDirectory';
import { HowItWorks } from './components/HowItWorks';
import { HelpAndPrivacy } from './components/showcase/HelpAndPrivacy';
import { FloatingSupport } from './components/FloatingSupport';
import { Consultant, OracleType } from './types';

function MainAppContent() {
  const { user } = useAuth();
  const { isRechargeModalOpen, setIsRechargeModalOpen, startConsultation } = useConsultation();

  const getInitialTab = (): string => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (path.includes('especialistas') || hash.includes('especialistas') || hash.includes('oracles')) return 'oracles';
    if (path.includes('blog') || hash.includes('blog')) return 'blog';
    if (path.includes('como-funciona') || hash.includes('howitworks')) return 'howItWorks';
    if (path.includes('ajuda') || path.includes('privacidade') || path.includes('termos') || path.includes('lgpd') || hash.includes('helpandprivacy') || hash.includes('privacidade')) return 'helpAndPrivacy';
    if (path.includes('painel/consultor') || hash.includes('consultantdashboard')) return 'consultantDashboard';
    if (path.includes('painel') || path.includes('carteira') || hash.includes('clientdashboard')) return 'clientDashboard';
    if (path.includes('admin') || hash.includes('admindashboard')) return 'adminDashboard';
    return 'showcase';
  };

  const [currentTab, setCurrentTabState] = useState<string>(getInitialTab);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedOracle, setSelectedOracle] = useState<OracleType | null>(null);

  const setCurrentTab = (tab: string) => {
    setCurrentTabState(tab);
    try {
      const urlMap: Record<string, string> = {
        showcase: '/',
        oracles: '/especialistas',
        blog: '/blog',
        howItWorks: '/como-funciona',
        helpAndPrivacy: '/ajuda-e-privacidade',
        clientDashboard: '/painel',
        consultantDashboard: '/painel/consultor',
        adminDashboard: '/admin',
      };
      const newPath = urlMap[tab] || `/${tab}`;
      window.history.pushState({ tab }, '', newPath);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentTabState(getInitialTab());
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
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'showcase' && (
          <ConsultantShowcase
            selectedOracleCategory={selectedOracle}
            onSelectOracleCategory={(oracle) => setSelectedOracle(oracle as OracleType | null)}
            onSelectConsultant={(c) => setSelectedConsultant(c)}
            onStartConsultation={handleStartConsultation}
          />
        )}

        {currentTab === 'oracles' && (
          <OraclesDirectory
            onSelectOracleCategory={(oracle) => {
              setSelectedOracle(oracle as OracleType);
              setCurrentTab('showcase');
            }}
          />
        )}

        {currentTab === 'blog' && <BlogSection />}

        {currentTab === 'howItWorks' && (
          <div className="space-y-12">
            <HowItWorks />
            <HelpAndPrivacy />
          </div>
        )}

        {currentTab === 'helpAndPrivacy' && <HelpAndPrivacy />}

        {currentTab === 'clientDashboard' && <ClientDashboard />}

        {currentTab === 'consultantDashboard' && <ConsultantDashboard />}

        {currentTab === 'adminDashboard' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer onNavigate={setCurrentTab} />

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
      <MercadoPagoRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
      />

      {/* Active Consultation Room (Renders Fullscreen Overlay when active) */}
      <ConsultationRoom />

      {/* Global Floating Support Button (WhatsApp & Telegram) */}
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
