import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Globe,
  Ban,
  Terminal,
  FileText,
  Search,
  Filter,
  Layers,
  Cpu,
  Key,
  Database,
  ArrowUpRight
} from 'lucide-react';

interface SecurityConfig {
  wafEnabled: boolean;
  rateLimiterEnabled: boolean;
  promptInjectionGuard: boolean;
  financialProtection: boolean;
  sanitizerEnabled: boolean;
  strictHeaders: boolean;
  maxRequestsPerMinute: number;
  maxAiRequestsPerMinute: number;
}

interface SecurityMetrics {
  totalRequestsChecked: number;
  blockedAttacks: number;
  rateLimitHits: number;
  promptInjectionsBlocked: number;
  sanitizedInputs: number;
  lastScanTime: string;
  threatScore: string;
  uptimeFormatted: string;
  blockedIPsCount: number;
  whitelistedIPsCount: number;
}

interface ScanResult {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  detail: string;
}

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

export const SecurityProtectionCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [blacklistedIPs, setBlacklistedIPs] = useState<string[]>([]);
  const [whitelistedIPs, setWhitelistedIPs] = useState<string[]>([]);
  
  // Scan State
  const [scanLoading, setScanLoading] = useState(false);
  const [scanScore, setScanScore] = useState<number | null>(null);
  const [scanHealth, setScanHealth] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

  // IP Add Form State
  const [ipInput, setIpInput] = useState('');
  const [ipListTarget, setIpListTarget] = useState<'blacklist' | 'whitelist'>('blacklist');

  // Logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const getAuthorizationHeader = async (): Promise<Record<string, string>> => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error(
        'Sua sessão expirou. Saia e entre novamente para acessar o painel administrativo.',
      );
    }

    const idToken = await firebaseUser.getIdToken(true);

    return {
      Authorization: `Bearer ${idToken}`,
    };
  };

  const fetchSecurityStatus = async () => {
    try {
      const authorizationHeader = await getAuthorizationHeader();
      const res = await fetch('/api/security/status', {
        headers: authorizationHeader,
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setMetrics(data.metrics);
        setBlacklistedIPs(data.blacklistedIPs || []);
        setWhitelistedIPs(data.whitelistedIPs || []);
      }
    } catch (e) {
      console.error('Erro ao carregar status de segurança:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const authorizationHeader = await getAuthorizationHeader();
      const res = await fetch('/api/security/audit-logs', {
        headers: authorizationHeader,
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Erro ao buscar logs:', e);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
    fetchAuditLogs();
    // Auto-run security scan on load
    runSecurityScan();
  }, []);

  const handleToggleSetting = async (settingKey: string, currentValue: boolean) => {
    try {
      const res = await fetch('/api/security/toggle-setting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthorizationHeader()),
        },
        body: JSON.stringify({ setting: settingKey, enabled: !currentValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        fetchSecurityStatus();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Erro ao alterar configuração:', err);
    }
  };

  const runSecurityScan = async () => {
    setScanLoading(true);
    try {
      const authorizationHeader = await getAuthorizationHeader();
      const res = await fetch('/api/security/run-scan', {
        method: 'POST',
        headers: authorizationHeader,
      });
      if (res.ok) {
        const data = await res.json();
        setScanScore(data.securityScore);
        setScanHealth(data.overallHealth);
        setScanResults(data.scanResults || []);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Erro ao executar varredura:', err);
    } finally {
      setScanLoading(false);
    }
  };

  const handleManageIP = async (ip: string, action: 'add' | 'remove', list: 'blacklist' | 'whitelist') => {
    try {
      const res = await fetch('/api/security/manage-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthorizationHeader()),
        },
        body: JSON.stringify({ ip, action, list }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlacklistedIPs(data.blacklistedIPs || []);
        setWhitelistedIPs(data.whitelistedIPs || []);
        setIpInput('');
        fetchSecurityStatus();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Erro ao gerenciar IP:', err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = logFilter === 'ALL' || log.status === logFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 font-mono flex items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin gold-accent" />
        Carregando Central de Segurança e Proteção WAF...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Shield Status */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0a0f1d] to-[#050508] border border-emerald-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl text-white font-light">
                    Sistema de Proteção de Alto Desempenho
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    SISTEMA ATIVO
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-light mt-0.5">
                  Proteção em camadas: WAF Layer 7, Anti-DDoS, Prompt Guard para Gemini AI, Integridade Mercado Pago e Firestore Rules.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runSecurityScan}
              disabled={scanLoading}
              className="px-5 py-3 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-[#d4af37]/20 cursor-pointer flex items-center gap-2"
            >
              {scanLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Varrendo Vulnerabilidades...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Executar Varredura Completa
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Requisicões Analisadas</span>
            <span className="text-lg font-black text-white font-mono">{metrics?.totalRequestsChecked.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 bg-black/40 border border-emerald-500/30 rounded-2xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Ataques Bloqueados</span>
            <span className="text-lg font-black text-emerald-300 font-mono">{metrics?.blockedAttacks}</span>
          </div>

          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Prompts Injetados Bloqueados</span>
            <span className="text-lg font-black gold-accent font-mono">{metrics?.promptInjectionsBlocked}</span>
          </div>

          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Entradas Sanitizadas</span>
            <span className="text-lg font-black text-indigo-400 font-mono">{metrics?.sanitizedInputs}</span>
          </div>

          <div className="p-3 bg-black/40 border border-rose-500/30 rounded-2xl">
            <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider block">IPs em Lista Negra</span>
            <span className="text-lg font-black text-rose-300 font-mono">{metrics?.blockedIPsCount}</span>
          </div>

          <div className="p-3 bg-black/40 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Tempo de Atividade</span>
            <span className="text-xs font-bold text-emerald-400 font-mono block mt-1">{metrics?.uptimeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Security Score Scan Diagnosis Card */}
      {scanScore !== null && (
        <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-6 shadow-xl bg-[#050508]/90">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black font-mono text-2xl border-2 ${
                scanScore >= 90 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
              }`}>
                {scanScore}%
              </div>
              <div>
                <h2 className="font-serif text-xl text-white font-light">Diagnóstico de Segurança do Servidor</h2>
                <p className="text-xs text-gray-400">
                  Status Geral: <strong className="text-emerald-400 font-mono">{scanHealth}</strong> • Última varredura: {new Date(metrics?.lastScanTime || '').toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs font-mono rounded-xl">
              10 de 10 Vetores Auditados
            </span>
          </div>

          {/* Scan Results Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scanResults.map((item, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
                {item.status === 'PASS' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      item.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-light mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Security Toggles & IP Firewall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Protection Modules Switches (2 cols wide) */}
        <div className="lg:col-span-2 p-6 glass-card border border-white/10 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-light text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 gold-accent" />
              Módulos e Camadas Ativas de Proteção
            </h2>
            <span className="text-xs text-gray-400">Gerenciamento dinâmico no servidor</span>
          </div>

          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    1. WAF Layer 7 (Firewall)
                  </span>
                  <input
                    type="checkbox"
                    checked={config.wafEnabled}
                    onChange={() => handleToggleSetting('wafEnabled', config.wafEnabled)}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Filtra requisições maliciosas em tempo real prevenindo acessos de robôs, scrapers e payloads maliciosos.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    2. Anti-DDoS & Rate Limiting
                  </span>
                  <input
                    type="checkbox"
                    checked={config.rateLimiterEnabled}
                    onChange={() => handleToggleSetting('rateLimiterEnabled', config.rateLimiterEnabled)}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Limita requisições a {config.maxRequestsPerMinute} req/min para APIs normais e {config.maxAiRequestsPerMinute} req/min para IA.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 gold-accent" />
                    3. Escudo Prompt Guard (Gemini AI)
                  </span>
                  <input
                    type="checkbox"
                    checked={config.promptInjectionGuard}
                    onChange={() => handleToggleSetting('promptInjectionGuard', config.promptInjectionGuard)}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Bloqueia tentativas de injeção de prompt que visam contornar instruções do sistema ou expor chaves da API.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    4. Trava Financeira & Idempotência
                  </span>
                  <input
                    type="checkbox"
                    checked={config.financialProtection}
                    onChange={() => handleToggleSetting('financialProtection', config.financialProtection)}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Evita duplo crédito de recargas via chaves de idempotência e valida rigorosamente os valores no backend.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    5. Sanitizador Anti-XSS/SQLi
                  </span>
                  <input
                    type="checkbox"
                    checked={config.sanitizerEnabled}
                    onChange={() => handleToggleSetting('sanitizerEnabled', config.sanitizerEnabled)}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Remove automaticamente tags de script, código HTML perigoso e palavras reservadas SQL de requisições POST.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-400" />
                    6. Cabeçalhos HTTP de Segurança
                  </span>
                  <input
                    type="checkbox"
                    checked={config.strictHeaders}
                    onChange={() => handleToggleSetting('strictHeaders', config.strictHeaders)}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Aplica cabeçalhos HSTS, X-Frame-Options SAMEORIGIN, nosniff e CSP em todas as rotas servidas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: IP Firewall Manager */}
        <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-6">
          <div>
            <h2 className="font-serif text-xl font-light text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Gestão de Firewall IP
            </h2>
            <p className="text-xs text-gray-400 font-light mt-1">
              Controle manual de listas de permissão e bloqueio de endereços IP.
            </p>
          </div>

          {/* Add IP Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (ipInput) handleManageIP(ipInput.trim(), 'add', ipListTarget);
            }}
            className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-xl"
          >
            <div>
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">Endereço IP</label>
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="Ex: 203.0.113.195"
                className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={ipListTarget}
                onChange={(e) => setIpListTarget(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white"
              >
                <option value="blacklist">Lista Negra (Bloquear)</option>
                <option value="whitelist">Lista Branca (Permitir)</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </form>

          {/* Blacklisted IPs List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
              IPs Bloqueados ({blacklistedIPs.length})
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
              {blacklistedIPs.map((ip) => (
                <div key={ip} className="flex items-center justify-between p-2 bg-rose-950/20 border border-rose-500/30 rounded-lg text-rose-300">
                  <span>{ip}</span>
                  <button
                    onClick={() => handleManageIP(ip, 'remove', 'blacklist')}
                    className="text-[10px] text-rose-400 hover:text-white underline cursor-pointer"
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Whitelisted IPs List */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              IPs Confiáveis ({whitelistedIPs.length})
            </span>
            <div className="max-h-32 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
              {whitelistedIPs.map((ip) => (
                <div key={ip} className="flex items-center justify-between p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-emerald-300">
                  <span>{ip}</span>
                  <button
                    onClick={() => handleManageIP(ip, 'remove', 'whitelist')}
                    className="text-[10px] text-emerald-400 hover:text-white underline cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit & Event Log Table */}
      <div className="p-6 glass-card border border-white/10 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-white font-light flex items-center gap-2">
              <FileText className="w-5 h-5 gold-accent" />
              Stream de Eventos de Segurança & Trilhas RBAC
            </h2>
            <p className="text-xs text-gray-400 font-light">
              Registros imutáveis de ataques bloqueados, logins, alterações e auditorias do sistema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por IP, ação, usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-black border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="px-3 py-1.5 bg-black border border-white/10 rounded-xl text-xs text-white"
            >
              <option value="ALL">Todos os Status</option>
              <option value="SUCCESS">Sucessos</option>
              <option value="WARNING">Alertas</option>
              <option value="ERROR">Erros / Bloqueios</option>
            </select>

            <button
              onClick={fetchAuditLogs}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              title="Atualizar Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Usuário / Origem</th>
                <th className="py-3 px-4">Ação / Evento</th>
                <th className="py-3 px-4">Detalhes Técnicos</th>
                <th className="py-3 px-4">Endereço IP</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px] text-gray-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum evento registrado com o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {log.userName} <span className="text-[10px] text-gray-500 font-normal">({log.userRole})</span>
                    </td>
                    <td className="py-3 px-4 gold-accent font-bold">{log.action}</td>
                    <td className="py-3 px-4 text-gray-300 font-sans text-xs">{log.details}</td>
                    <td className="py-3 px-4 text-gray-500">{log.ip}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : log.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};