import React, { useState } from 'react';
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

  const [currentTab, setCurrentTab] = useState<string>('showcase');
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedOracle, setSelectedOracle] = useState<string | null>(null);

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
            onSelectOracleCategory={(oracle) => setSelectedOracle(oracle)}
            onSelectConsultant={(c) => setSelectedConsultant(c)}
            onStartConsultation={handleStartConsultation}
          />
        )}

        {currentTab === 'oracles' && (
          <OraclesDirectory
            onSelectOracleCategory={(oracle) => {
              setSelectedOracle(oracle);
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
      <Footer />

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
