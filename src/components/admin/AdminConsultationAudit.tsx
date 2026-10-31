import React, { useEffect, useState } from "react";
import { Eye, MessageSquare, RefreshCw, Search, X } from "lucide-react";
import { auth } from "../../firebase";

interface AuditSession {
  id: string;
  userId?: string;
  consultantId?: string;
  consultantName?: string;
  oracleType?: string;
  status?: string;
  createdAt?: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  debitMinutes?: number;
  messages?: Array<{
    id?: string;
    senderName?: string;
    text?: string;
    timestamp?: string;
    createdAt?: string;
  }>;
}

export const AdminConsultationAudit: React.FC = () => {
  const [sessions, setSessions] = useState<AuditSession[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditSession | null>(null);
  const request = async (url: string, options: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) throw new Error("Sessão administrativa expirada.");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };
  const load = async (append = false) => {
    setLoading(true);
    try {
      const response = await request(
        `/api/admin/consultation-audit?search=${encodeURIComponent(search)}${append && nextCursor ? `&cursor=${encodeURIComponent(nextCursor)}` : ""}`,
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          body.error?.message || "Falha ao carregar atendimentos.",
        );
      setSessions((current) => append ? [...current, ...(body.data?.sessions || [])] : (body.data?.sessions || []));
      setNextCursor(body.data?.nextCursor || null);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Falha ao carregar auditoria.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const open = async (session: AuditSession) => {
    try {
      const response = await request(
        `/api/admin/consultation-audit/${encodeURIComponent(session.id)}/access`,
        { method: "POST" },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          body.error?.message || "Não foi possível abrir a conversa.",
        );
      setSelected(body.data.session);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Falha ao abrir conversa.",
      );
    }
  };
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-black text-amber-200 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Auditoria de atendimentos
        </h2>
        <p className="text-xs text-slate-400">
          Acesso direto do administrador ao registro original, somente para leitura.
        </p>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        className="flex gap-2"
      >
        <label className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-[#150F26] border border-purple-900/50">
          <Search className="w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cliente, profissional ou código da consulta"
            className="flex-1 bg-transparent text-white outline-none"
          />
        </label>
        <button className="px-4 rounded-xl bg-amber-400 text-black font-black">
          Buscar
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="p-3 rounded-xl bg-purple-500/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </form>
      {message && (
        <p className="p-3 rounded-xl bg-rose-500/10 text-rose-200">{message}</p>
      )}
      <div className="grid gap-3">
        {sessions.length === 0 ? (
          <p className="text-slate-400">Nenhum atendimento encontrado.</p>
        ) : (
          sessions.map((session) => (
            <article
              key={session.id}
              className="p-4 rounded-2xl bg-[#150F26] border border-purple-900/50 flex flex-col sm:flex-row justify-between gap-3"
            >
              <div>
                <strong className="text-white">
                  {session.consultantName ||
                    session.consultantId ||
                    "Profissional"}
                </strong>
                <p className="text-xs text-purple-200">
                  {session.oracleType || "Consulta"} •{" "}
                  {session.status || "sem status"}
                </p>
                <p className="text-xs text-slate-500">
                  Cliente: {session.userId} • Código: {session.id}
                </p>
              </div>
              <button
                onClick={() => void open(session)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-black font-black flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Ver atendimento
              </button>
            </article>
          ))
        )}
      </div>
      {nextCursor && <button type="button" disabled={loading} onClick={() => void load(true)} className="w-full rounded-xl border border-purple-700 bg-purple-500/10 p-3 font-bold text-purple-100 disabled:opacity-50">Carregar atendimentos anteriores</button>}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/85 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="audit-dialog-title">
          <div className="max-w-3xl w-full max-h-[92vh] overflow-y-auto bg-[#100b1b] border border-amber-400/40 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 id="audit-dialog-title" className="font-black text-amber-200">
                  Atendimento {selected.id}
                </h3>
                <p className="text-xs text-slate-400">
                  Registro original somente para leitura
                </p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Fechar atendimento">
                <X />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 text-xs text-purple-200">
              <span>Status: {selected.status}</span>
              <span>
                Profissional: {selected.consultantName || selected.consultantId}
              </span>
              <span>
                Consumo: {Number(selected.debitMinutes || 0).toFixed(2)} min
              </span>
            </div>
            <div className="space-y-2">
              {(selected.messages || []).length === 0 ? (
                <p className="text-slate-400">Nenhuma mensagem registrada.</p>
              ) : (
                (selected.messages || []).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3 rounded-xl bg-black/30"
                  >
                    <strong className="text-purple-200">
                      {item.senderName || "Participante"}
                    </strong>
                    <p className="text-slate-200 whitespace-pre-wrap">
                      {item.text}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {item.timestamp || item.createdAt}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
