import * as React from 'react';
import { useState, ReactNode } from 'react';
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

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ORACULOS.TS] Uncaught React UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-gray-200 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-card border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
              <span className="text-2xl text-[#d4af37]">✨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">ORACULOS.TS</h2>
              <p className="text-sm text-gray-400">
                Ocorreu uma oscilação temporária na conexão visual da aplicação.
              </p>
            </div>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full py-3 px-6 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainAppContent() {
  const { user } = useAuth();
  const { isRechargeModalOpen, setIsRechargeModalOpen, startConsultation } = useConsultation();

  const [currentTab, setCurrentTab] = useState<string>('showcase');
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

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
            onSelectConsultant={(c) => setSelectedConsultant(c)}
            onStartConsultation={handleStartConsultation}
          />
        )}

        {currentTab === 'oracles' && (
          <OraclesDirectory
            onSelectOracleCategory={() => {
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
    <ErrorBoundary>
      <AuthProvider>
        <ConsultationProvider>
          <MainAppContent />
        </ConsultationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

