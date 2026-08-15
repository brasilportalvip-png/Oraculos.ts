import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  FileText,
  Sliders,
  Sparkles,
  Bot,
  Lock,
  RefreshCw,
  Gift,
  AlertTriangle,
  Send,
  SlidersHorizontal,
  Terminal,
} from 'lucide-react';
import { useConsultation } from '../../context/ConsultationContext';
import { auth } from '../../firebase';
import { SecurityProtectionCenter } from './SecurityProtectionCenter';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export const AdminDashboard: React.FC = () => {
  const { consultants, transactions, pastSessions } = useConsultation();
  const [activeTab, setActiveTab] = useState<'overview' | 'securityCenter' | 'aiCentral' | 'securityLogs' | 'coupons'>('securityCenter');
  const [platformFee, setPlatformFee] = useState('30');

  // AI Feature Toggles
  const [aiToggles, setAiToggles] = useState({
    interpretation: true,
    blogSeo: true,
    moderation: true,
    supportAssistant: true,
    adminReports: true,
  });

  // AI Executive Report State
  const [reportLoading, setReportLoading] = useState(false);
  const [aiReportText, setAiReportText] = useState<string | null>(null);

  // Security Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');

  // Coupon Creation State
  const [coupons, setCoupons] = useState([
    { code: 'ORACULO10', bonus: 10, uses: 0, active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponBonus, setNewCouponBonus] = useState('10');

  // Dynamic Revenue Calculation by Day of Week
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const revenueData = daysOfWeek.map((day, dayIndex) => {
    const dayTx = transactions.filter((t) => {
      if (t.type !== 'recharge' || t.status !== 'completed') return false;
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d.getDay() === dayIndex;
    });
    const receita = dayTx.reduce((sum, t) => sum + t.amount, 0);
    const comissao = Number((receita * (parseFloat(platformFee) / 100)).toFixed(2));
    return { day, receita, comissao };
  });

  // Dynamic Oracle Share Calculation from Real Sessions
  const oracleColorMap: Record<string, string> = {
    tarot: '#D4AF37',
    cigano: '#E11D48',
    'baralho-cigano': '#E11D48',
    astrologia: '#8B5CF6',
    numerologia: '#3B82F6',
    buzios: '#F59E0B',
    ifa: '#D97706',
    runas: '#10B981',
    'i-ching': '#6366F1',
    cristais: '#EC4899',
    'mesa-radionica': '#14B8A6',
  };

  const oracleCounts: Record<string, number> = {};
  pastSessions.forEach((s) => {
    const oracleKey = s.oracle || 'tarot';
    oracleCounts[oracleKey] = (oracleCounts[oracleKey] || 0) + 1;
  });

  const totalOracleSessions = Object.values(oracleCounts).reduce((a, b) => a + b, 0);
  const oracleShareData = totalOracleSessions > 0
    ? Object.entries(oracleCounts).map(([name, count]) => ({
        name: name.toUpperCase(),
        value: Math.round((count / totalOracleSessions) * 100),
        color: oracleColorMap[name.toLowerCase()] || '#D4AF37',
      }))
    : [
        { name: 'TAROT', value: 40, color: '#D4AF37' },
        { name: 'CIGANO', value: 30, color: '#E11D48' },
        { name: 'ASTROLOGIA', value: 30, color: '#8B5CF6' },
      ];

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLogsLoading(true);

    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.error('Usuário não autenticado para consultar os logs.');
        setAuditLogs([]);
        return;
      }

      const idToken = await firebaseUser.getIdToken(true);

      const res = await fetch('/api/security/audit-logs', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error?.message ||
            'Não foi possível carregar os logs de auditoria.',
        );
      }

      setAuditLogs(data.logs || []);
    } catch (e) {
      console.error('Erro ao buscar logs:', e);
      setAuditLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Generate AI Executive Report
  const handleGenerateAiReport = async () => {
    setReportLoading(true);

    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        setAiReportText(
          'Sua sessão expirou. Entre novamente para gerar o relatório.',
        );
        return;
      }

      const idToken = await firebaseUser.getIdToken(true);

      const res = await fetch('/api/ai/admin-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          stats: {
            totalRevenue: totalGrossRevenue,
            adminCommissionTotal: totalAdminCommission,
            completedSessionsTotal: pastSessions.length,
            totalConsultants: consultants.length,
            totalClients: new Set(pastSessions.map(s => s.clientId).concat(transactions.map(t => t.userId))).size || 1,
          },
          period: 'Julho 2026',
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error?.message ||
            'Não foi possível gerar o relatório administrativo.',
        );
      }

      if (data.report) {
        setAiReportText(data.report);
      } else {
        setAiReportText(
          'Não foi possível gerar o relatório. Verifique se a GEMINI_API_KEY está configurada.',
        );
      }
    } catch (err) {
      setAiReportText(
        err instanceof Error
          ? err.message
          : 'Erro ao comunicar com o servidor Gemini AI.',
      );
    } finally {
      setReportLoading(false);
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    setCoupons([
      ...coupons,
      {
        code: newCouponCode.toUpperCase().trim(),
        bonus: Number(newCouponBonus) || 10,
        uses: 0,
        active: true,
      },
    ]);
    setNewCouponCode('');
  };

  const totalGrossRevenue = transactions
    .filter((t) => t.type === 'recharge' && t.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalAdminCommission = Number(
    (totalGrossRevenue * (parseFloat(platformFee) / 100)).toFixed(2)
  );

  const totalCompletedSessions = pastSessions.length;

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.status === logFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-white">
              Painel de Controle Operacional
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-[#d4af37]/20 gold-accent border border-[#d4af37]/40 text-xs font-bold font-mono">
              ORACULOS.TS Admin
            </span>
          </div>
          <p className="text-xs text-gray-400 font-light mt-1">
            Gestão de inteligência artificial Gemini, auditoria de segurança RBAC, relatórios e controle financeiro.
          </p>
        </div>

        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Servidor Backend Express Online (Porta 3000)</span>
        </div>
      </div>

      {/* Admin Tab Buttons */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('securityCenter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'securityCenter'
              ? 'bg-[#d4af37] text-black shadow-md'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Central de Proteção WAF
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#d4af37] text-black shadow-md'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Métricas & Financeiro
        </button>

        <button
          onClick={() => setActiveTab('aiCentral')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'aiCentral'
              ? 'bg-[#d4af37] text-black shadow-md'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          Central de Inteligência IA
        </button>

        <button
          onClick={() => setActiveTab('securityLogs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'securityLogs'
              ? 'bg-[#d4af37] text-black shadow-md'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Logs & Auditoria RBAC
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-[#d4af37] text-black shadow-md'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          Cupons & Promoções
        </button>
      </div>

      {/* TAB 0: SECURITY & PROTECTION CENTER */}
      {activeTab === 'securityCenter' && <SecurityProtectionCenter />}

      {/* TAB 1: OVERVIEW & FINANCE */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Admin Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 glass-card border-l-4 border-l-[#d4af37] rounded-2xl space-y-2 shadow-xl">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Faturamento Bruto</span>
              <p className="text-3xl font-black text-white font-mono">
                R$ {totalGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                <span>{transactions.length > 0 ? `${transactions.length} transações registradas` : 'Sem transações no período'}</span>
              </div>
            </div>

            <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-2 shadow-xl">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                Comissão da Plataforma ({platformFee}%)
              </span>
              <p className="text-3xl font-black gold-accent font-mono">
                R$ {totalAdminCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-gray-500">Calculado sobre transações confirmadas</p>
            </div>

            <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-2 shadow-xl">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Consultores Cadastrados</span>
              <p className="text-3xl font-black text-white font-mono">{consultants.length}</p>
              <p className="text-[11px] text-gray-400">{consultants.filter(c => c.status === 'online').length} ativos agora</p>
            </div>

            <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-2 shadow-xl">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Consultas Realizadas</span>
              <p className="text-3xl font-black text-white font-mono">{totalCompletedSessions}</p>
              <p className="text-[11px] text-gray-400">{totalCompletedSessions > 0 ? 'Sessões registradas' : 'Sem histórico registrado'}</p>
            </div>
          </div>

          {/* Analytics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 glass-card border border-white/10 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-light text-white">Volume Diário de Receita (R$)</h2>
                <span className="text-xs text-gray-400">Últimos 7 dias</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#050508', borderColor: '#D4AF37', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="receita" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRec)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <h2 className="font-serif text-xl font-light text-white">Distribuição por Oráculo</h2>

              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={oracleShareData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {oracleShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#050508', borderColor: '#8B5CF6', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                {oracleShareData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Consultants Management Table */}
          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-light text-white">Gestão de Consultores e Repasses</h2>
              <span className="text-xs text-gray-400">{consultants.length} profissionais ativos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Consultor</th>
                    <th className="py-3 px-4">Especialidades</th>
                    <th className="py-3 px-4">
  Consumo/min
</th>
                    <th className="py-3 px-4">Atendimentos</th>
                    <th className="py-3 px-4">Ganhos Acumulados</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {consultants.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#d4af37]"
                        />
                        <div>
                          <span className="block text-white font-medium">{c.name}</span>
                          <span className="text-[10px] gold-accent">{c.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{c.specialties.join(', ')}</td>
                      
<td className="py-3 px-4 font-mono font-bold gold-accent">
  {c.pricePerMinute.toFixed(2)} min do saldo
</td>

<td className="py-3 px-4">{c.totalConsultations}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                        R$ {(c.totalEarned || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="px-3 py-1 bg-white/10 hover:bg-[#d4af37] hover:text-black text-white font-bold rounded-lg text-[11px] cursor-pointer">
                          Aprovação
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI CENTRAL MODULE */}
      {activeTab === 'aiCentral' && (
        <div className="space-y-6">
          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-light text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 gold-accent" />
                  Módulo de Inteligência Artificial (Gemini 3.6 Flash)
                </h2>
                <p className="text-xs text-gray-400 font-light">
                  Controle central de ativação dos serviços da IA no backend para SEO, moderação, relatório e consulta.
                </p>
              </div>

              <button
                onClick={handleGenerateAiReport}
                disabled={reportLoading}
                className="px-4 py-2 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                {reportLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando Relatório...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Gerar Relatório Executivo com IA
                  </>
                )}
              </button>
            </div>

            {/* AI Switches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">1. Interpretação Oracular por IA</span>
                  <input
                    type="checkbox"
                    checked={aiToggles.interpretation}
                    onChange={(e) => setAiToggles({ ...aiToggles, interpretation: e.target.checked })}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Auxilia o oraculista durante o atendimento no chat com interpretações simbólicas automáticas.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">2. Gerador de Blog & Otimizador SEO</span>
                  <input
                    type="checkbox"
                    checked={aiToggles.blogSeo}
                    onChange={(e) => setAiToggles({ ...aiToggles, blogSeo: e.target.checked })}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Gera artigos completos com metadados SEO (meta title, description, keywords e Schema.org).
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">3. Moderação & Filtro Antispam</span>
                  <input
                    type="checkbox"
                    checked={aiToggles.moderation}
                    onChange={(e) => setAiToggles({ ...aiToggles, moderation: e.target.checked })}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Analisa mensagens das salas de atendimento detectando agressividade, comportamentos abusivos e spam.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">4. Respostas Rápidas de Suporte</span>
                  <input
                    type="checkbox"
                    checked={aiToggles.supportAssistant}
                    onChange={(e) => setAiToggles({ ...aiToggles, supportAssistant: e.target.checked })}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Assistente virtual para responder dúvidas frequentes sobre cobrança por minuto e saldo Mercado Pago.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">5. Análise Executiva e Insights</span>
                  <input
                    type="checkbox"
                    checked={aiToggles.adminReports}
                    onChange={(e) => setAiToggles({ ...aiToggles, adminReports: e.target.checked })}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Processa relatórios estratégicos de faturamento, retenção de usuários e sugestões de cupons.
                </p>
              </div>
            </div>
          </div>

          {/* AI Executive Report Output Display */}
          {aiReportText && (
            <div className="p-6 glass-card border border-[#d4af37]/40 rounded-2xl space-y-4 bg-[#050508]/95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif text-xl font-light gold-accent flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Relatório de Inteligência Estratégica (Gerado por Gemini AI)
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">Modelo: gemini-3.6-flash</span>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed space-y-3 whitespace-pre-wrap font-light">
                {aiReportText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY & AUDIT LOGS */}
      {activeTab === 'securityLogs' && (
        <div className="space-y-6">
          <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 gold-accent" />
                  Trilha de Auditoria & Registro de Segurança (RBAC Audit)
                </h2>
                <p className="text-xs text-gray-400 font-light">
                  Todos os eventos críticos (login, transação financeira, alteração administrativa e acessos) são registrados via backend.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAuditLogs}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                  title="Atualizar Logs"
                >
                  <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} />
                </button>

                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="SUCCESS">Sucessos</option>
                  <option value="WARNING">Alertas / Avisos</option>
                  <option value="ERROR">Erros</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Data/Hora</th>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Ação</th>
                    <th className="py-3 px-4">Detalhes do Evento</th>
                    <th className="py-3 px-4">IP</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px] text-gray-300">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {log.userName} ({log.userRole})
                      </td>
                      <td className="py-3 px-4 gold-accent font-bold">{log.action}</td>
                      <td className="py-3 px-4 text-gray-300 font-sans text-xs">{log.details}</td>
                      <td className="py-3 px-4 text-gray-500">{log.ip}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS & PROMOTIONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Coupon Form */}
            <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-serif text-xl font-light text-white flex items-center gap-2">
                <Gift className="w-5 h-5 gold-accent" />
                Criar Novo Cupom Bônus
              </h3>
              <p className="text-xs text-gray-400 font-light">
                Gere códigos promocionais que concedem créditos bônus nas recargas efetuadas pelos clientes.
              </p>

              <form onSubmit={handleAddCoupon} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">Código do Cupom</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="Ex: PROMO2026"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold">
                    Valor do Crédito Bônus (R$)
                  </label>
                  <input
                    type="number"
                    value={newCouponBonus}
                    onChange={(e) => setNewCouponBonus(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Ativar Cupom na Plataforma
                </button>
              </form>
            </div>

            {/* Coupons List */}
            <div className="lg:col-span-2 p-6 glass-card border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-serif text-xl font-light text-white">Cupons Ativos na Plataforma</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Bônus Concedido</th>
                      <th className="py-3 px-4">Resgates Efetuados</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-gray-200">
                    {coupons.map((c) => (
                      <tr key={c.code} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-bold text-white gold-accent">{c.code}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">+ R$ {c.bonus},00</td>
                        <td className="py-3 px-4">{c.uses} utilizações</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                            Ativo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};