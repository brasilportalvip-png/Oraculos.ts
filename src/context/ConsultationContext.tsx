import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Consultant, ConsultationSession, ChatMessage, OracleType, FinancialTransaction } from '../types';
import { useAuth } from './AuthContext';
import { INITIAL_CONSULTANTS, INITIAL_TRANSACTIONS } from '../data/mockData';
import { auth } from '../firebase';
import { drawSymbolForOracle } from '../data/oracleDrawData';

interface ConsultationContextType {
  activeSession: ConsultationSession | null;
  consultants: Consultant[];
  pastSessions: ConsultationSession[];
  transactions: FinancialTransaction[];
  isRechargeModalOpen: boolean;
  setIsRechargeModalOpen: (open: boolean) => void;


  startConsultation: (
  consultant: Consultant,
  oracle: OracleType,
  mode: 'chat' | 'video',
) => Promise<{
  success: boolean;
  message?: string;
}>;


sendMessage: (text: string) => void;
  drawOracleCard: () => void;
  endConsultation: (
  rating?: number,
  reviewText?: string,
) => Promise<{
  success: boolean;
  message?: string;
}>;
  addTransaction: (tx: FinancialTransaction) => void;
  updateConsultantStatus: (consultantId: string, status: 'online' | 'busy' | 'offline') => void;
  updateConsultantPrice: (consultantId: string, newPrice: number) => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

interface PersistedWalletTransaction {
  id?: string;
  userId?: string;
  type?: FinancialTransaction['type'];
  minutes?: number;
  amount?: number;
  status?: FinancialTransaction['status'];
  createdAt?: string;
  reason?: string;
}

interface PersistedConsultationSession {
  id?: string;
  userId?: string;
  consultantId?: string;
  consultantName?: string;
  oracleType?: OracleType;
  mode?: 'chat' | 'video';
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  pricePerMinute?: number;
  debitMinutes?: number;
  ratingGiven?: number;
  reviewText?: string;
}

// Sample Tarot Cards for live draws in chat
const TAROT_CARDS = [
  { name: 'O Sol', meaning: 'Alegria, clareza, sucesso e vitalidade iluminando seus caminhos.', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=200' },
  { name: 'A Estrela', meaning: 'Esperança, inspiração divina, cura espiritual e momentos de serenidade.', imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=200' },
  { name: 'O Imperador', meaning: 'Estrutura, liderança, solidez financeira e tomada de controle consciente.', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200' },
  { name: 'A Sacerdotisa', meaning: 'Intuição aguçada, mistérios revelados, reflexão e sabedoria interior.', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=200' },
  { name: 'A Roda da Fortuna', meaning: 'Mudanças benéficas, virada de ciclo, sorte e novos rumos inevitáveis.', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=200' },
  { name: 'Os Enamorados', meaning: 'Escolhas do coração, união harmônica, paixão e alinhamento de valores.', imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=200' },
];

export const ConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
  user,
  isAuthenticated,
  syncMinuteBalance,
} = useAuth();
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('oraculos_active_session') || localStorage.getItem('oraculos_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.status === 'active') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  // Preserve active consultation session across orientation changes and page refreshes
  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      try {
        sessionStorage.setItem('oraculos_active_session', JSON.stringify(activeSession));
        localStorage.setItem('oraculos_active_session', JSON.stringify(activeSession));
      } catch {}
    } else if (activeSession === null) {
      try {
        sessionStorage.removeItem('oraculos_active_session');
        localStorage.removeItem('oraculos_active_session');
      } catch {}
    }
  }, [activeSession]);

  const [consultants, setConsultants] = useState<Consultant[]>(() => {
    // Read initial prices from localStorage if any
    try {
      const stored = localStorage.getItem('oraculos_consultant_prices');
      if (stored) {
        const overrides = JSON.parse(stored);
        return INITIAL_CONSULTANTS.map((c) => ({
          ...c,
          pricePerMinute: overrides[c.id] !== undefined ? Number(overrides[c.id]) : c.pricePerMinute,
        }));
      }
    } catch {}
    return INITIAL_CONSULTANTS;
  });
  const [pastSessions, setPastSessions] = useState<ConsultationSession[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;
    const isVirtual = activeSession.consultantId.startsWith('ai_') || activeSession.consultantId.startsWith('c_ai_');
    if (isVirtual) return;
    let cancelled = false;
    const refreshMessages = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const response = await fetch(`/api/consultations/${encodeURIComponent(activeSession.id)}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || cancelled || !Array.isArray(body.data?.messages)) return;
        setActiveSession((current) => current && current.id === activeSession.id
          ? { ...current, messages: body.data.messages as ChatMessage[] }
          : current);
      } catch (error) {
        console.warn('[ORACULOS.TS] Falha temporária ao sincronizar conversa:', error);
      }
    };
    void refreshMessages();
    const interval = window.setInterval(() => { void refreshMessages(); }, 2500);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [activeSession?.id, activeSession?.status, activeSession?.consultantId]);

  useEffect(() => {
    let cancelled = false;
    const loadPublicConsultants = async () => {
      try {
        // Read local overrides saved by admin
        let localPricingOverrides: Record<string, number> = {};
        try {
          const raw = localStorage.getItem('oraculos_consultant_prices');
          if (raw) localPricingOverrides = JSON.parse(raw);
        } catch {}

        const response = await fetch('/api/consultants/public');
        const body = await response.json().catch(() => ({}));
        if (cancelled) return;

        const settings = response.ok && body.data?.settings && typeof body.data.settings === 'object'
          ? body.data.settings as Record<string, { pricePerMinute?: number; active?: boolean }>
          : {};
        const approved = response.ok && Array.isArray(body.data?.approved)
          ? body.data.approved as Consultant[]
          : [];

        setConsultants(() => {
  const normalizeProfileName = (
  value: unknown,
) =>
  typeof value === 'string'
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
    : '';

const seenProfileNames = new Set(
  INITIAL_CONSULTANTS
    .map((item) =>
      normalizeProfileName(item.name),
    )
    .filter(Boolean),
);

const uniqueApproved = approved.filter(
  (profile) => {
    const profileId =
      typeof profile?.id === 'string'
        ? profile.id.trim()
        : '';

    const profileName =
      normalizeProfileName(
        profile?.name,
      );

    if (
      !profileId ||
      !profileName ||
      seenProfileNames.has(
        profileName,
      )
    ) {
      return false;
    }

    seenProfileNames.add(
      profileName,
    );

    return true;
  },
);
  const merged = [
    ...INITIAL_CONSULTANTS,
    ...uniqueApproved,
  ];

  return merged
            .filter((profile) => settings[profile.id]?.active !== false)
            .map((profile) => {
              const localOverride = localPricingOverrides[profile.id];
              const remoteSetting = settings[profile.id]?.pricePerMinute;
              const finalPrice = typeof localOverride === 'number' && localOverride > 0
                ? localOverride
                : (remoteSetting !== undefined ? Number(remoteSetting) : profile.pricePerMinute);
              return {
                ...profile,
                pricePerMinute: Number(finalPrice),
              };
            });
        });
      } catch (error) {
        console.error('[ORACULOS.TS] Falha ao carregar profissionais publicados:', error);
      }
    };
    void loadPublicConsultants();
    const refresh = () => { void loadPublicConsultants(); };
    window.addEventListener('oraculos:consultants-updated', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('oraculos:consultants-updated', refresh);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) {
      setPastSessions([]);
      setTransactions([]);
      return;
    }

    let cancelled = false;

    const loadPersistedHistory = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();

        if (!idToken) return;

        const headers = {
          Authorization: `Bearer ${idToken}`,
        };

        const [walletResponse, sessionsResponse] =
          await Promise.all([
            fetch('/api/finance/wallet-history', { headers }),
            fetch('/api/consultations/history', { headers }),
          ]);

        if (!walletResponse.ok || !sessionsResponse.ok) {
          throw new Error('Falha ao carregar histórico persistido.');
        }

        const walletBody = await walletResponse.json();
        const sessionsBody = await sessionsResponse.json();

        if (cancelled) return;

        const walletHistory = Array.isArray(
          walletBody.data?.history,
        )
          ? (walletBody.data.history as PersistedWalletTransaction[])
          : [];

        setTransactions(
          walletHistory.map((transaction) => ({
            id: String(transaction.id || ''),
            userId: String(transaction.userId || user.id),
            userName: user.name,
            type: transaction.type || 'admin_adjustment',
            amount: Number(
              transaction.minutes ?? transaction.amount ?? 0,
            ),
            method: 'wallet_balance',
            status: transaction.status || 'completed',
            date: new Date(
              transaction.createdAt || Date.now(),
            ).toLocaleString('pt-BR'),
            description:
              transaction.reason || 'Movimentação da carteira',
          })),
        );

        const sessionHistory = Array.isArray(
          sessionsBody.data?.history,
        )
          ? (sessionsBody.data.history as PersistedConsultationSession[])
          : [];

        setPastSessions(
          sessionHistory.map((session) => {
            const consultant = INITIAL_CONSULTANTS.find(
              (item) => item.id === session.consultantId,
            );
            const durationMinutes = Math.max(
              1,
              Number(session.durationMinutes || 1),
            );

            return {
              id: String(session.id || ''),
              clientId: String(session.userId || user.id),
              clientName: user.name,
              consultantId: String(session.consultantId || ''),
              consultantName:
                session.consultantName || consultant?.name || 'Consultor',
              consultantAvatar: consultant?.avatar || '',
              oracleType: session.oracleType || 'tarot',
              mode: session.mode || 'chat',
              status: 'completed',
              startTime: new Date(
                session.startedAt || Date.now(),
              ).toLocaleTimeString('pt-BR'),
              endTime: new Date(
                session.endedAt || Date.now(),
              ).toLocaleTimeString('pt-BR'),
              durationSeconds: durationMinutes * 60,
              pricePerMinute: Number(session.pricePerMinute || 0),
              totalCost: Number(session.debitMinutes || 0),
              adminCommission: Number(session.debitMinutes || 0) * 0.3,
              consultantEarnings: Number(session.debitMinutes || 0) * 0.7,
              ratingGiven: session.ratingGiven,
              reviewText: session.reviewText,
              messages: [],
            };
          }),
        );
      } catch (error) {
        console.error(
          '[ORACULOS.TS] Não foi possível sincronizar os históricos:',
          error,
        );
      }
    };

    void loadPersistedHistory();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user.id, user.name]);



/*
 * Impede múltiplas chamadas Gemini
 * durante a entrega gradual da resposta.
 */
const isAutoReplyInProgressRef =
  useRef(false);


  /*
   * Timer exclusivamente visual.
   *
   * A duração e a cobrança definitivas
   * são calculadas pelo servidor no
   * encerramento da consulta.
   */
  useEffect(() => {
    if (
      !activeSession ||
      activeSession.status !== 'active'
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setActiveSession(
          (previousSession) => {
            if (
              !previousSession ||
              previousSession.status !==
                'active'
            ) {
              return previousSession;
            }

            const newDuration =
              previousSession
                .durationSeconds + 1;

            const currentMinutes =
              Math.max(
                1,
                Math.ceil(
                  newDuration / 60,
                ),
              );

            const estimatedCost =
              Number(
                (
                  currentMinutes *
                  previousSession
                    .pricePerMinute
                ).toFixed(2),
              );

            return {
              ...previousSession,

              durationSeconds:
                newDuration,

              /*
               * Apenas estimativa visual.
               * Não é usada para cobrar.
               */
              totalCost:
                estimatedCost,
            };
          },
        );
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    activeSession?.id,
    activeSession?.status,
  ]);

  // Simulated automated or Gemini AI responses from the Consultant during chat
  


const handleAutoReply = async (
  userMsg: string,
) => {
  if (!activeSession) {
    return;
  }

  if (
    isAutoReplyInProgressRef.current
  ) {
    console.warn(
      '[ORACULOS.TS] Mensagem ignorada: o especialista ainda está respondendo.',
    );

    return;
  }

  isAutoReplyInProgressRef.current =
    true;

  const isVirtualAttendant = activeSession.consultantId.startsWith('ai_') || activeSession.consultantId.startsWith('c_ai_');

    if (isVirtualAttendant) {
      try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
          throw new Error(
            'Sua sessão expirou. Saia da conta e entre novamente.',
          );
        }

        const idToken = await firebaseUser.getIdToken(true);

        const res = await fetch('/api/ai/virtual-attendant-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            attendantId: activeSession.consultantId,
            userMessage: userMsg,
            chatHistory: activeSession.messages,
            



userProfile: {
  name:
    user.name,

  birthFullName:
    user.birthFullName ||
    user.name,

  birthDate:
    user.birthDate ||
    null,

  birthTime:
    user.doesNotKnowBirthTime
      ? null
      : user.birthTime || null,

  doesNotKnowBirthTime:
    Boolean(
      user.doesNotKnowBirthTime,
    ),

  birthDataConsent:
    Boolean(
      user.birthDataConsent,
    ),
},






            oracleType: activeSession.oracleType,
          }),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            result.error?.message ||
              'Não foi possível consultar a assistente virtual.',
          );
        }










if (
  result.success &&
  result.data?.responseMessage
) {
  const sleep = (
    milliseconds: number,
  ) =>
    new Promise<void>((resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    });

  const receivedChunks =
    Array.isArray(
      result.data.responseChunks,
    )
      ? result.data.responseChunks
          .map(
            (
              chunk: {
                index?: number;
                text?: string;
              },
            ) => ({
              index:
                Number(
                  chunk.index,
                ) || 0,

              text:
                String(
                  chunk.text || '',
                ).trim(),
            }),
          )
          .filter(
            (
              chunk: {
                index: number;
                text: string;
              },
            ) =>
              Boolean(
                chunk.text,
              ),
          )
          .sort(
            (
              firstChunk: {
                index: number;
              },
              secondChunk: {
                index: number;
              },
            ) =>
              firstChunk.index -
              secondChunk.index,
          )
      : [];

  const responseChunks =
    receivedChunks.length > 0
      ? receivedChunks
      : [
          {
            index: 0,
            text: String(
              result.data
                .responseMessage,
            ).trim(),
          },
        ];

  const sessionConsultantId =
    activeSession.consultantId;

  const sessionConsultantName =
    activeSession.consultantName;

  for (
  let chunkIndex = 0;
  chunkIndex <
  responseChunks.length;
  chunkIndex += 1
) {

const chunk =
      responseChunks[
        chunkIndex
      ];

    const typingMessageId =
      `typing_${Date.now()}_${chunkIndex}`;

    const typingMessage:
  ChatMessage = {
  id:
    typingMessageId,

  senderId:
    sessionConsultantId,

  senderName:
    sessionConsultantName,

  text:
    'Digitando.',

  timestamp:
    new Date()
      .toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
};

    setActiveSession(
  (previousSession) => {
    if (
      !previousSession ||
      previousSession.status !==
        'active'
    ) {
      return previousSession;
    }

    return {
      ...previousSession,

      messages: [
        ...previousSession
          .messages,

        typingMessage,
      ],
    };
  },
);

/*
 * Alterna visualmente:
 * Digitando.
 * Digitando..
 * Digitando...
 */
let typingDotStep = 1;

const typingAnimationInterval =
  window.setInterval(() => {
    typingDotStep =
      typingDotStep >= 3
        ? 1
        : typingDotStep + 1;

    const animatedTypingText =
      `Digitando${'.'.repeat(
        typingDotStep,
      )}`;

    setActiveSession(
      (previousSession) => {
        if (
          !previousSession ||
          previousSession.status !==
            'active'
        ) {
          return previousSession;
        }

        return {
          ...previousSession,

          messages:
            previousSession.messages.map(
              (message) =>
                message.id ===
                typingMessageId
                  ? {
                      ...message,

                      text:
                        animatedTypingText,
                    }
                  : message,
            ),
        };
      },
    );
  }, 450);

/*
 * Tempo proporcional ao tamanho do
 * trecho, com pequena variação para
 * não parecer um relógio mecânico.
 */
const baseTypingTime =
  chunk.text.length * 32;

const randomVariation =
  Math.floor(
    Math.random() * 700,
  );

const typingDelay =
  Math.min(
    6500,
    Math.max(
      1800,
      baseTypingTime +
        randomVariation,
    ),
  );

await sleep(
  typingDelay,
);

window.clearInterval(
  typingAnimationInterval,
);
    const consultantReply:
      ChatMessage = {
      id:
        `msg_${Date.now()}_${chunkIndex}`,

      senderId:
        sessionConsultantId,

      senderName:
        sessionConsultantName,

      text:
        chunk.text,

      timestamp:
        new Date()
          .toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),
    };

    setActiveSession(
      (previousSession) => {
        if (
          !previousSession
        ) {
          return null;
        }

        /*
         * Remove “Digitando...” e insere
         * o trecho real no mesmo momento.
         */
        const messagesWithoutTyping =
          previousSession.messages
            .filter(
              (message) =>
                message.id !==
                typingMessageId,
            );

        if (
          previousSession.status !==
          'active'
        ) {
          return {
            ...previousSession,

            messages:
              messagesWithoutTyping,
          };
        }

        return {
          ...previousSession,

          messages: [
            ...messagesWithoutTyping,

            consultantReply,
          ],
        };
      },
    );

    /*
     * Pequena pausa natural antes do
     * próximo “Digitando...”.
     */
    if (
  chunkIndex <
  responseChunks.length - 1
) {
  await sleep(
    500 +
      Math.floor(
        Math.random() * 500,
      ),
  );
}
}

isAutoReplyInProgressRef.current =
  false;

return;
}


    } catch (err) {
      isAutoReplyInProgressRef.current = false;
      console.warn('Erro na resposta do atendente virtual IA:', err);
    }
  } else {
    // For Human Specialists: Record user message and wait for human operator in real-time
    isAutoReplyInProgressRef.current = false;
  }
  };

  const startConsultation = async (
    consultant: Consultant,
    oracle: OracleType,
    mode: 'chat' | 'video',
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    // If not authenticated or guest, open auth modal immediately
    if (!isAuthenticated || !user || user.id === 'guest') {
      try {
        sessionStorage.setItem(
          'oraculos_pending_consultation',
          JSON.stringify({ consultantId: consultant.id, oracle, mode })
        );
      } catch {}
      window.dispatchEvent(new CustomEvent('oraculos:open-auth'));
      return {
        success: false,
        message: 'Entre na sua conta para iniciar a consulta.',
      };
    }

    const effectivePrice = Number(consultant.pricePerMinute || 3.5);
    const balance = Number(user.minuteBalance ?? 0);

    if (balance < effectivePrice && balance <= 0) {
      setIsRechargeModalOpen(true);
      return {
        success: false,
        message: 'Saldo insuficiente. Recarregue minutos para conversar com este especialista.',
      };
    }

    const firebaseUser = auth.currentUser;
const consultationId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
let serverPricePerMinute = effectivePrice;
let serverStartedAt = new Date().toISOString();

if (!firebaseUser) {
  return {
    success: false,
    message: 'Sua sessão expirou. Entre novamente para iniciar a consulta.',
  };
}

try {
  const idToken = await firebaseUser.getIdToken(true);

  const response = await fetch('/api/finance/start-consultation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      consultationId,
      consultantId: consultant.id,
      oracleType: oracle,
      mode,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.success) {
    if (body.error?.code === 'INSUFFICIENT_FUNDS') {
      setIsRechargeModalOpen(true);
    }

    return {
      success: false,
      message:
        body.error?.message ||
        'Não foi possível iniciar a consulta com segurança.',
    };
  }

  const officialPrice = Number(body.data?.pricePerMinute);

  if (Number.isFinite(officialPrice) && officialPrice > 0) {
    serverPricePerMinute = officialPrice;
  }

  if (
    typeof body.data?.startedAt === 'string' &&
    body.data.startedAt
  ) {
    serverStartedAt = body.data.startedAt;
  }
} catch (error) {
  console.error(
    '[ORACULOS.TS] Falha ao registrar consulta no servidor:',
    error,
  );

  return {
    success: false,
    message:
      'Não foi possível conectar ao servidor para iniciar a consulta. Tente novamente.',
  };
}

const initialMessage: ChatMessage = {


      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'ORACULOS.TS',
      

text: `Conexão espiritual iniciada com ${consultant.name}. Atendimento por ${mode === 'chat' ? 'Chat ao Vivo' : 'Chamada de Vídeo'}. Consumo: ${serverPricePerMinute.toFixed(2)} min do saldo por minuto de atendimento.`,


timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };

    const welcomeConsultantMsg: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      senderId: consultant.id,
      senderName: consultant.name,
      text: `Olá ${user.name}, seja muito bem-vindo(a)! Estou concentrada(o) nas energias do ${oracle.toUpperCase()}. Como posso te guiar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newSession: ConsultationSession = {
  id: consultationId,
      clientId: user.id,
      clientName: user.name,
      consultantId: consultant.id,
      consultantName: consultant.name,
      consultantAvatar: consultant.avatar,
      oracleType: oracle,
      mode,
      status: 'active',
      startTime:
  new Date(
    serverStartedAt,
  ).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  ),
      durationSeconds: 0,
      pricePerMinute:
  serverPricePerMinute,
      totalCost: 0,
      adminCommission: 0,
      consultantEarnings: 0,
      messages: [initialMessage, welcomeConsultantMsg],
    };

    setActiveSession(newSession);

    // Update consultant status to 'busy'
    setConsultants((prev) =>
      prev.map((c) => (c.id === consultant.id ? { ...c, status: 'busy' } : c))
    );

    return { success: true };
  };

  



const sendMessage = (text: string) => {
  const cleanText =
    text.trim();

  if (
    !activeSession ||
    !cleanText
  ) {
    return;
  }

  /*
   * Enquanto o especialista estiver
   * digitando, nenhuma nova mensagem
   * entra no histórico nem gera chamada.
   */
  if (
    isAutoReplyInProgressRef.current
  ) {
    console.warn(
      '[ORACULOS.TS] Aguarde o especialista concluir a resposta.',
    );

    return;
  }

  const userMessage:
    ChatMessage = {
    id:
      `msg_${Date.now()}`,

    senderId:
      user.id,

    senderName:
      user.name,

    text:
      cleanText,

    timestamp:
      new Date()
        .toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
  };

  const isVirtual = activeSession.consultantId.startsWith('ai_') || activeSession.consultantId.startsWith('c_ai_');
  if (!isVirtual) {
    const sessionId = activeSession.id;
    void (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error('Sessão expirada. Entre novamente.');
        const response = await fetch(`/api/consultations/${encodeURIComponent(sessionId)}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text: cleanText }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error?.message || 'Não foi possível enviar a mensagem.');
        const persisted = body.data?.message as ChatMessage;
        setActiveSession((current) => current && current.id === sessionId
          ? { ...current, messages: [...current.messages.filter((item) => item.id !== persisted.id), persisted] }
          : current);
      } catch (error) {
        console.error('[ORACULOS.TS] Falha ao enviar mensagem:', error);
      }
    })();
    return;
  }

  setActiveSession(
    (previousSession) => {
      if (!previousSession) {
        return null;
      }

      return {
        ...previousSession,

        messages: [
          ...previousSession
            .messages,

          userMessage,
        ],
      };
    },
  );

  handleAutoReply(
    cleanText,
  );
};






  const drawOracleCard = () => {
    if (!activeSession) return;

    const drawnItem = drawSymbolForOracle(activeSession.oracleType);
    const cardData = {
      name: drawnItem.name,
      meaning: drawnItem.meaning,
      imageUrl: drawnItem.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
    };

    const systemMsg: ChatMessage = {
      id: `msg_card_${Date.now()}`,
      senderId: 'system',
      senderName: 'ORACULOS.TS',
      text: `Um símbolo sagrado (${drawnItem.name} — ${drawnItem.category}) foi revelado pelo Oráculo para a consulta de ${user.name}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      cardDrawn: cardData,
    };

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, systemMsg],
      };
    });
  };





const endConsultation = async (
  rating?: number,
  reviewText?: string,
): Promise<{
  success: boolean;
  message?: string;
}> => {
  if (!activeSession) {
    return {
      success: false,
      message:
        'Nenhuma consulta ativa foi encontrada.',
    };
  }

  const sessionToFinish =
    activeSession;

  try {
    const firebaseUser =
      auth.currentUser;

    if (!firebaseUser) {
      return {
        success: false,
        message:
          'Sua sessão expirou. Entre novamente para encerrar a consulta com segurança.',
      };
    }

    const idToken =
      await firebaseUser
        .getIdToken(true);

    /*
     * O frontend envia somente a
     * identidade da consulta.
     *
     * Não envia preço, duração
     * nem valor a cobrar.
     */
    const response =
      await fetch(
        '/api/finance/debit-consultation',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${idToken}`,
          },

          body: JSON.stringify({
            consultantId:
              sessionToFinish
                .consultantId,

            consultationId:
              sessionToFinish.id,
            rating,
            reviewText,
          }),
        },
      );

    const body =
      await response
        .json()
        .catch(() => ({}));

    if (
      !response.ok ||
      !body.success
    ) {
      return {
        success: false,

        message:
          body.error?.message ||
          'Não foi possível encerrar a consulta com segurança.',
      };
    }

    /*
     * Todos os valores financeiros
     * abaixo vêm do servidor.
     */
    const serverDebitMinutes =
      Number(
        body.data?.debitMinutes,
      );

    const serverDurationMinutes =
      Number(
        body.data?.durationMinutes,
      );

    const serverPricePerMinute =
      Number(
        body.data?.pricePerMinute,
      );

    const serverBalance =
      Number(
        body.data?.balanceAfter,
      );

    const transactionId =
      typeof body.data
        ?.transactionId ===
        'string'
        ? body.data
            .transactionId
            .trim()
        : '';

    if (
      !Number.isFinite(
        serverDebitMinutes,
      ) ||
      serverDebitMinutes < 0 ||

      !Number.isFinite(
        serverDurationMinutes,
      ) ||
      serverDurationMinutes < 1 ||

      !Number.isFinite(
        serverPricePerMinute,
      ) ||
      serverPricePerMinute <= 0 ||

      !Number.isFinite(
        serverBalance,
      ) ||
      serverBalance < 0 ||

      !transactionId
    ) {
      console.error(
        '[ORACULOS.TS] Resposta financeira inválida do servidor:',
        body.data,
      );

      return {
        success: false,

        message:
          'O servidor retornou dados financeiros inválidos. A tela foi mantida aberta para evitar inconsistência.',
      };
    }

    const processedAtValue =
      typeof body.data
        ?.processedAt ===
        'string'
        ? body.data
            .processedAt
        : '';

    const processedAtDate =
      new Date(
        processedAtValue,
      );

    const safeProcessedAtDate =
      Number.isFinite(
        processedAtDate.getTime(),
      )
        ? processedAtDate
        : new Date();

    const cappedByBalance =
      body.data?.cappedByBalance ===
      true;

    /*
     * Sincroniza imediatamente
     * a carteira local com o
     * saldo confirmado no servidor.
     */
    syncMinuteBalance(
      serverBalance,
    );

    /*
     * Comissão exibida no frontend.
     * A base financeira usada aqui
     * é exclusivamente o débito
     * confirmado pelo servidor.
     */
    const currentConsultant =
      consultants.find(
        (consultant) =>
          consultant.id ===
          sessionToFinish
            .consultantId,
      );

    const configuredConsultantShare =
      Number(
        currentConsultant
          ?.commissionRate ??
          0.70,
      );

    const consultantShareRate =
      Number.isFinite(
        configuredConsultantShare,
      ) &&
      configuredConsultantShare > 0 &&
      configuredConsultantShare <= 1
        ? configuredConsultantShare
        : 0.70;

    const adminShareRate =
      1 -
      consultantShareRate;

    const adminCommission =
      Number(
        (
          serverDebitMinutes *
          adminShareRate
        ).toFixed(2),
      );

    const consultantEarnings =
      Number(
        (
          serverDebitMinutes *
          consultantShareRate
        ).toFixed(2),
      );

    const completedSession:
      ConsultationSession = {
      ...sessionToFinish,

      status:
        'completed',

      endTime:
        safeProcessedAtDate
          .toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),

      /*
       * Converte os minutos oficiais
       * para a representação local
       * utilizada pela interface.
       */
      durationSeconds:
        serverDurationMinutes *
        60,

      pricePerMinute:
        serverPricePerMinute,

      totalCost:
        serverDebitMinutes,

      adminCommission,

      consultantEarnings,

      ratingGiven:
        rating,

      reviewText,
    };

    const debitTx:
      FinancialTransaction = {
      id:
        transactionId,

      userId:
        user.id,

      userName:
        user.name,

      type:
        'consultation_debit',

      amount:
        serverDebitMinutes,

      method:
        'wallet_balance',

      status:
        'completed',

      date:
        safeProcessedAtDate
          .toLocaleString(),

      description:
        cappedByBalance
          ? `Atendimento (${serverDurationMinutes} min) com ${sessionToFinish.consultantName} — cobrança limitada ao saldo disponível`
          : `Atendimento (${serverDurationMinutes} min) com ${sessionToFinish.consultantName}`,
    };

    const creditTx:
      FinancialTransaction = {
      id:
        `tx_cred_${transactionId}`,

      userId:
        sessionToFinish
          .consultantId,

      userName:
        sessionToFinish
          .consultantName,

      type:
        'consultation_credit',

      amount:
        consultantEarnings,

      method:
        'wallet_balance',

      status:
        'completed',

      date:
        safeProcessedAtDate
          .toLocaleString(),

      description:
        `Comissão (${(
          consultantShareRate *
          100
        ).toFixed(0)}%) consulta ${sessionToFinish.clientName}`,
    };

    setTransactions(
      (previous) => [
        debitTx,
        creditTx,
        ...previous,
      ],
    );

    setPastSessions(
      (previous) => [
        completedSession,
        ...previous,
      ],
    );

    setConsultants(
      (previous) =>
        previous.map(
          (consultant) => {
            if (
              consultant.id !==
              sessionToFinish
                .consultantId
            ) {
              return consultant;
            }

            const newReviews =
              rating &&
              reviewText
                ? [
                    {
                      id:
                        `rev_${Date.now()}`,

                      clientName:
                        user.name,

                      rating,

                      comment:
                        reviewText,

                      date:
                        safeProcessedAtDate
                          .toLocaleDateString(
                            'pt-BR',
                          ),

                      oracleUsed:
                        sessionToFinish
                          .oracleType,
                    },

                    ...consultant
                      .reviews,
                  ]
                : consultant.reviews;

            return {
              ...consultant,

              status:
                'online',

              totalConsultations:
                consultant
                  .totalConsultations +
                1,

              totalEarned:
                (
                  consultant
                    .totalEarned ||
                  0
                ) +
                consultantEarnings,

              reviews:
                newReviews,
            };
          },
        ),
    );

    setActiveSession(null);

    /*
     * Se a cobrança precisou ser
     * limitada ao saldo disponível,
     * oferece recarga somente após
     * encerrar a sessão corretamente.
     */
    if (cappedByBalance) {
      setIsRechargeModalOpen(
        true,
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      '[ORACULOS.TS] Falha ao finalizar consulta:',
      error,
    );

    return {
      success: false,

      message:
        'Falha de conexão ao registrar o encerramento. A consulta continua aberta para permitir nova tentativa segura.',
    };
  }
};




  const addTransaction = (
  tx: FinancialTransaction,
) => {
  setTransactions((prev) => [
    tx,
    ...prev,
  ]);
};

  const updateConsultantStatus = (consultantId: string, status: 'online' | 'busy' | 'offline') => {
    setConsultants((prev) =>
      prev.map((c) => (c.id === consultantId ? { ...c, status } : c))
    );
  };

  const updateConsultantPrice = (consultantId: string, newPrice: number) => {
    setConsultants((prev) =>
      prev.map((c) => (c.id === consultantId ? { ...c, pricePerMinute: newPrice } : c))
    );
  };

  return (
    <ConsultationContext.Provider
      value={{
        activeSession,
        consultants,
        pastSessions,
        transactions,
        isRechargeModalOpen,
        setIsRechargeModalOpen,
        startConsultation,
        sendMessage,
        drawOracleCard,
        endConsultation,
        addTransaction,
        updateConsultantStatus,
        updateConsultantPrice,
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
